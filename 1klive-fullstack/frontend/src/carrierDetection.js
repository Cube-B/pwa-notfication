// ╔════════════════════════════════════════════════════════════════╗
// ║                                                                ║
// ║    📡 Carrier Detection Module v1.4.0                         ║
// ║                                                                ║
// ╚════════════════════════════════════════════════════════════════╝

// ========================================
// 🔍 Device Detection
// ========================================

export function detectDevice() {
  const ua = navigator.userAgent;
  
  if (/iPad|iPhone|iPod/.test(ua)) {
    return 'iOS';
  } else if (/Android/.test(ua)) {
    return 'Android';
  } else {
    return 'Unknown';
  }
}

// ========================================
// 📱 iOS SIM Card API Detection
// ========================================

export async function trySimCardAPI() {
  try {
    console.log('📱 Trying SIM Card API (iOS)...');
    
    // iOS Network Information API
    const connection = navigator.connection || 
                       navigator.mozConnection || 
                       navigator.webkitConnection;
    
    if (!connection) {
      console.log('❌ SIM Card API not supported');
      return null;
    }
    
    // Get network info
    const networkType = connection.effectiveType; // '4g', '3g', '2g'
    const downlink = connection.downlink; // Mbps
    
    console.log('📡 Network type:', networkType);
    console.log('📊 Downlink:', downlink, 'Mbps');
    
    // Note: SIM Card API doesn't give carrier name directly
    // We still need IP Geolocation as fallback
    
    return {
      method: 'sim_api',
      networkType: networkType,
      downlink: downlink,
      carrier: null // SIM API doesn't provide carrier name
    };
    
  } catch (error) {
    console.error('❌ SIM Card API error:', error);
    return null;
  }
}

// ========================================
// 🌐 IP Geolocation Detection
// ========================================

export async function tryIPGeolocation() {
  try {
    console.log('🌐 Trying IP Geolocation...');
    
    // Using ipapi.co (free 1,000 requests/day)
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('📍 IP Geo data:', data);
    
    return {
      method: 'ip_geo',
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      org: data.org,
      asn: data.asn,
      raw: data
    };
    
  } catch (error) {
    console.error('❌ IP Geolocation error:', error);
    return null;
  }
}

// ========================================
// 🔍 Parse Carrier from Org String
// ========================================

export function parseCarrier(orgString) {
  if (!orgString) return 'Unknown';
  
  const carriers = {
    'AIS': /AIS|Advanced Info Service|Advanced Wireless/i,
    'DTAC': /DTAC|Total Access|TA Orange/i,
    'True': /True|Triple T|TrueMove|True Internet|True Online/i,
    'NT': /NT|CAT Telecom|CAT-IDC/i,
    '3BB': /3BB|Triple B|Triple Broadband/i,
    'TOT': /TOT|Telephone Organization/i,
    'My': /My by CAT/i
  };
  
  for (const [name, pattern] of Object.entries(carriers)) {
    if (pattern.test(orgString)) {
      console.log('✅ Detected carrier:', name);
      return name;
    }
  }
  
  console.log('⚠️ Unknown carrier:', orgString);
  return 'Unknown';
}

// ========================================
// 🔍 Detect if Mobile Network (not WiFi)
// ========================================

export function isMobileNetwork(data) {
  if (!data) return false;
  
  const org = data.org || '';
  const asn = data.asn || '';
  
  // Known mobile carriers
  const mobilePatterns = [
    /AIS/i,
    /DTAC/i,
    /True/i,
    /TrueMove/i,
    /Advanced Info/i,
    /Total Access/i,
    /Mobile/i,
    /Cellular/i
  ];
  
  // Known WiFi/ISP (not mobile)
  const wifiPatterns = [
    /3BB/i,
    /Triple B/i,
    /TOT/i,
    /Fiber/i,
    /Broadband/i,
    /Home/i,
    /ADSL/i,
    /Cable/i
  ];
  
  // Check if WiFi first
  for (const pattern of wifiPatterns) {
    if (pattern.test(org)) {
      console.log('📶 Detected WiFi/ISP:', org);
      return false;
    }
  }
  
  // Check if mobile
  for (const pattern of mobilePatterns) {
    if (pattern.test(org)) {
      console.log('📱 Detected Mobile Network:', org);
      return true;
    }
  }
  
  // If unknown, check network type from connection API
  const connection = navigator.connection || 
                     navigator.mozConnection || 
                     navigator.webkitConnection;
  
  if (connection && connection.effectiveType) {
    const type = connection.effectiveType;
    // If 3g or 4g, likely mobile
    if (type === '3g' || type === '4g') {
      console.log('📱 Detected mobile by network type:', type);
      return true;
    }
  }
  
  console.log('⚠️ Cannot determine if mobile, assuming WiFi');
  return false;
}

// ========================================
// 🎯 Main Carrier Detection Function
// ========================================

export async function detectCarrierInfo() {
  console.log('🎯 Starting carrier detection...');
  
  const deviceType = detectDevice();
  console.log('📱 Device type:', deviceType);
  
  let carrierData = null;
  let detectionMethod = null;
  
  // iOS: Try SIM Card API first, then IP Geo
  if (deviceType === 'iOS') {
    console.log('📱 iOS detected, trying SIM Card API first...');
    
    const simData = await trySimCardAPI();
    
    if (simData && simData.carrier) {
      carrierData = simData;
      detectionMethod = 'sim_api';
      console.log('✅ Got carrier from SIM API');
    } else {
      console.log('⚠️ SIM API failed or no carrier, trying IP Geo...');
      carrierData = await tryIPGeolocation();
      detectionMethod = 'ip_geo';
    }
  }
  // Android: Use IP Geo directly
  else if (deviceType === 'Android') {
    console.log('📱 Android detected, using IP Geo...');
    carrierData = await tryIPGeolocation();
    detectionMethod = 'ip_geo';
  }
  // Unknown device: Use IP Geo
  else {
    console.log('📱 Unknown device, using IP Geo...');
    carrierData = await tryIPGeolocation();
    detectionMethod = 'ip_geo';
  }
  
  // If no data, return null
  if (!carrierData) {
    console.log('❌ Failed to detect carrier');
    return null;
  }
  
  // Parse carrier name
  const carrier = parseCarrier(carrierData.org);
  const isMobile = isMobileNetwork(carrierData);
  
  // Prepare result
  const result = {
    carrier: carrier,
    carrier_ip: carrierData.ip,
    carrier_location: `${carrierData.city || 'Unknown'}, ${carrierData.country || 'Unknown'}`,
    device_type: deviceType,
    is_mobile_network: isMobile,
    detection_method: detectionMethod,
    raw_data: carrierData
  };
  
  console.log('✅ Carrier detection complete:', result);
  
  return result;
}

// ========================================
// 💾 Save Carrier Info to Backend
// ========================================

export async function saveCarrierInfo(endpoint, carrierInfo, backendUrl) {
  try {
    console.log('💾 Saving carrier info to backend...');
    
    const response = await fetch(`${backendUrl}/api/notifications/update-carrier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: endpoint,
        carrier: carrierInfo.carrier,
        carrier_ip: carrierInfo.carrier_ip,
        carrier_location: carrierInfo.carrier_location,
        device_type: carrierInfo.device_type,
        is_mobile_network: carrierInfo.is_mobile_network,
        detection_method: carrierInfo.detection_method
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.skip) {
        console.log('✅ Already has mobile carrier, skipped');
      } else {
        console.log('✅ Carrier info saved:', data);
      }
      return data;
    } else {
      console.error('❌ Failed to save carrier info:', data.error);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Save carrier error:', error);
    return null;
  }
}

// ========================================
// 🔍 Check if Already Has Mobile Carrier
// ========================================

export async function checkHasMobileCarrier(endpoint, backendUrl) {
  try {
    console.log('🔍 Checking if has mobile carrier...');
    
    const response = await fetch(`${backendUrl}/api/notifications/check-carrier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endpoint })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('📊 Has mobile carrier:', data.has_mobile_carrier);
      return data;
    } else {
      console.error('❌ Check failed:', data.error);
      return { should_collect: true };
    }
    
  } catch (error) {
    console.error('❌ Check carrier error:', error);
    return { should_collect: true };
  }
}

// ========================================
// 🎯 Complete Carrier Collection Flow
// ========================================

export async function collectCarrierData(endpoint, backendUrl) {
  try {
    console.log('🎯 Starting carrier collection flow...');
    
    // 1. Check if already has mobile carrier
    const checkResult = await checkHasMobileCarrier(endpoint, backendUrl);
    
    if (!checkResult.should_collect) {
      console.log('✅ Already has mobile carrier, skipping collection');
      return {
        success: true,
        skipped: true,
        carrier: checkResult.carrier
      };
    }
    
    // 2. Detect carrier info
    const carrierInfo = await detectCarrierInfo();
    
    if (!carrierInfo) {
      console.log('❌ Failed to detect carrier');
      return {
        success: false,
        error: 'Failed to detect carrier'
      };
    }
    
    // 3. Save to backend
    const saveResult = await saveCarrierInfo(endpoint, carrierInfo, backendUrl);
    
    if (!saveResult) {
      return {
        success: false,
        error: 'Failed to save carrier info'
      };
    }
    
    // 4. Return result
    return {
      success: true,
      carrier: carrierInfo.carrier,
      is_mobile: carrierInfo.is_mobile_network,
      device: carrierInfo.device_type,
      complete: carrierInfo.is_mobile_network // Complete if mobile
    };
    
  } catch (error) {
    console.error('❌ Collect carrier error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}