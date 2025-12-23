// ╔════════════════════════════════════════════════════════════════╗
// ║  App.vue - Dynamic Config Loading (เพิ่มใน script setup)    ║
// ╚════════════════════════════════════════════════════════════════╝

// เพิ่มตรงนี้หลัง BACKEND_URL และ TARGET_URL

// ========================================
// 🎨 Dynamic PWA Config
// ========================================
const pwaConfig = ref({
  branding: {
    app_name: '1klive',
    app_short_name: '1klive',
    app_description: 'Live streaming platform',
    logo_url: 'https://1klive.com/wp-content/uploads/2025/09/1klivelogo-e1759763752916.webp',
    primary_color: '#667eea',
    secondary_color: '#764ba2',
    background_color: '#ffffff',
    theme_color: '#667eea'
  },
  notification: {
    notification_icon_url: 'https://1klive.com/wp-content/uploads/2025/09/1klivelogo-e1759763752916.webp',
    welcome_title: 'Welcome to 1klive!',
    welcome_message: 'Thank you for enabling notifications.'
  }
})

const configLoaded = ref(false)

// ========================================
// 📥 Load Dynamic Config
// ========================================
const loadPWAConfig = async () => {
  try {
    console.log('📥 Loading PWA config from backend...')
    
    const response = await fetch(`${BACKEND_URL}/api/pwa/config`)
    const data = await response.json()
    
    if (data.success && data.config) {
      pwaConfig.value = data.config
      console.log('✅ PWA config loaded:', pwaConfig.value)
      
      // Update manifest link
      updateManifestLink()
      
      // Update theme color
      if (pwaConfig.value.branding?.theme_color) {
        document.querySelector('meta[name="theme-color"]')?.setAttribute(
          'content', 
          pwaConfig.value.branding.theme_color
        )
      }
      
      configLoaded.value = true
    }
  } catch (error) {
    console.error('❌ Failed to load PWA config:', error)
    // ใช้ default config ที่กำหนดไว้
    configLoaded.value = true
  }
}

// ========================================
// 🔗 Update Manifest Link
// ========================================
const updateManifestLink = () => {
  const manifestLink = document.querySelector('link[rel="manifest"]')
  if (manifestLink) {
    // Point to dynamic manifest endpoint
    manifestLink.setAttribute('href', `${BACKEND_URL}/api/pwa/manifest.json`)
    console.log('✅ Manifest link updated')
  }
}

// ========================================
// แก้ไข onMounted - เพิ่มการโหลด config
// ========================================

// หา onMounted เดิมและเพิ่มบรรทัดนี้ที่ต้นฟังก์ชัน:

onMounted(async () => {
  console.log('🚀 1klive App mounted')
  console.log('🌐 Backend URL:', BACKEND_URL)
  console.log('🎯 Target URL:', TARGET_URL)
  
  // ✅ เพิ่มบรรทัดนี้
  await loadPWAConfig()
  
  // ... (ส่วนที่เหลือเหมือนเดิม)
  
})

// ========================================
// แก้ไข subscribeNotifications - ใช้ dynamic config
// ========================================

// ในฟังก์ชัน subscribeNotifications ตอนส่ง Welcome notification:
// หาส่วนนี้:

// Send welcome notification
if ('showNotification' in registration) {
  await registration.showNotification(
    pwaConfig.value.notification?.welcome_title || 'Welcome to 1klive!',
    {
      body: pwaConfig.value.notification?.welcome_message || 'Thank you for enabling notifications.',
      icon: pwaConfig.value.notification?.notification_icon_url || pwaConfig.value.branding?.logo_url,
      badge: pwaConfig.value.notification?.notification_icon_url || pwaConfig.value.branding?.logo_url,
      tag: 'welcome',
      requireInteraction: false,
      data: {
        url: TARGET_URL
      }
    }
  )
}

// ========================================
// Update Install Screen - ใช้ dynamic logo
// ========================================

// ในส่วน template ที่แสดง Install Screen:
// แทนที่:
// <img src="https://1klive.com/wp-content/uploads/..." />

// ด้วย:
<img :src="pwaConfig.branding?.logo_url" 
     :alt="pwaConfig.branding?.app_name"
     class="logo-image" />

// ========================================
// Update App Title - ใช้ dynamic name
// ========================================

// แทนที่ "ติดตั้ง 1klive" ด้วย:
<h2>ติดตั้ง {{ pwaConfig.branding?.app_name }}</h2>

// แทนที่ "1klive" ทั้งหมดในหน้าด้วย:
{{ pwaConfig.branding?.app_name }}