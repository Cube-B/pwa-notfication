<template>
  <div id="app">
    <!-- Error Screen -->
    <div v-if="error" class="error-screen">
      <div class="logo-container">
        <img :src="pwaConfig.branding?.logo_url" :alt="pwaConfig.branding?.app_name + ' Logo'" class="logo-image">
      </div>
      <div class="error-icon">❌</div>
      <h1>เกิดข้อผิดพลาด</h1>
      <p>{{ error }}</p>
      <pre class="error-detail">{{ errorDetail }}</pre>
      <button @click="redirectToTarget" class="error-btn">
        🚀 เปิดเว็บไซต์
      </button>
    </div>

    <!-- Loading Screen -->
    <div v-else-if="isLoading" class="loading-screen">
      <div class="loader"></div>
      <p>กำลังโหลด...</p>
    </div>

    <!-- Desktop Warning -->
    <div v-else-if="isDesktop" class="desktop-warning">
      <div class="logo-container">
        <img :src="pwaConfig.branding?.logo_url" :alt="pwaConfig.branding?.app_name + ' Logo'" class="logo-image">
      </div>
      <div class="warning-icon">💻</div>
      <h1>Desktop Mode</h1>
      <p>กรุณาเปิดด้วยมือถือหรือแท็บเล็ต</p>
      <button @click="redirectToTarget" class="desktop-btn">
        🚀 เปิด {{ pwaConfig.branding?.app_short_name || pwaConfig.branding?.app_name }}
      </button>
    </div>

    <!-- Install Screen (before PWA installation) -->
    <div v-else-if="!isPWA" class="install-screen">
      <div class="logo-container">
        <img :src="pwaConfig.branding?.logo_url" :alt="pwaConfig.branding?.app_name + ' Logo'" class="logo-image">
      </div>
      <h1>ติดตั้ง {{ pwaConfig.branding?.app_name }}</h1>
      <p class="subtitle">{{ pwaConfig.branding?.app_description }}</p>
      
      <div class="features">
        <div class="feature">
          <span class="icon">📺</span>
          <span>รับชมสดตลอด 24 ชั่วโมง</span>
        </div>
        <div class="feature">
          <span class="icon">🔔</span>
          <span>แจ้งเตือนไลฟ์สดทันที</span>
        </div>
        <div class="feature">
          <span class="icon">⚡</span>
          <span>เข้าถึงง่าย เร็วทันใจ</span>
        </div>
      </div>
      
      <!-- Auto Install Button (Android Chrome) -->
      <button 
        v-if="canInstall" 
        @click="installPWA"
        :disabled="isInstalling"
        class="install-btn"
      >
        {{ isInstalling ? '⏳ กำลังติดตั้ง...' : '📦 ติดตั้ง ' + pwaConfig.branding?.app_name }}
      </button>

      <!-- Manual Install Instructions (Android) -->
      <div v-if="!isIOS && !canInstall" class="android-instructions">
        <p class="instruction-title">📱 วิธีติดตั้งบน Android:</p>
        <div class="instruction-steps">
          <div class="step">
            <span class="step-number">1</span>
            <span>กดปุ่ม <strong>เมนู ⋮</strong> มุมบนขวา</span>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <span>เลือก <strong>"ติดตั้งแอป"</strong> หรือ <strong>"Add to Home screen"</strong></span>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <span>กด <strong>"ติดตั้ง"</strong> เพื่อยืนยัน</span>
          </div>
        </div>
        <button @click="redirectToTarget" class="skip-btn-alt">
          ข้ามไปเว็บไซต์
        </button>
      </div>

      <!-- iOS Instructions -->
      <div v-if="isIOS" class="ios-instructions">
        <p><strong>📱 สำหรับ iOS:</strong></p>
        <ol>
          <li>แตะปุ่ม แชร์ (📤)</li>
          <li>เลือก "เพิ่มที่หน้าจอ Home"</li>
          <li>แตะ "เพิ่ม"</li>
        </ol>
      </div>
    </div>

    <!-- Permission Screen (after PWA installation) -->
    <div v-else-if="showPermissionScreen" class="permission-screen">
      <div class="logo-container">
        <img :src="pwaConfig.branding?.logo_url" :alt="pwaConfig.branding?.app_name + ' Logo'" class="logo-image">
      </div>
      <div class="bell-icon bell-animation">🔔</div>
      <h1>{{ alreadySubscribed ? 'พร้อมใช้งาน' : 'เปิดการแจ้งเตือน' }}</h1>
      <p class="permission-message">
        <strong v-if="!alreadySubscribed">⚠️ สำคัญมาก:</strong> 
        <span v-if="!alreadySubscribed">เพื่อรับข่าวสารและดูแลคุณได้ดีที่สุด<br/>กรุณากดปุ่มด้านล่างเพื่อเปิดการแจ้งเตือน</span>
        <span v-else>✅ คุณเปิดการแจ้งเตือนเรียบร้อยแล้ว<br/>พร้อมรับข่าวสารและโปรโมชั่นพิเศษ</span><br/><br/>
        📺 รับแจ้งเตือนเมื่อมีการถ่ายทอดสดใหม่<br/>
        🎁 โปรโมชั่นและข่าวสารพิเศษจาก {{ pwaConfig.branding?.app_name }}
      </p>
      
      <div v-if="subscribeStatus" class="status-box">
        <p class="status-text">{{ subscribeStatus }}</p>
      </div>
      
      <!-- ปุ่มสำหรับคนที่ยังไม่ subscribe -->
      <button 
        v-if="!alreadySubscribed"
        @click="requestPermissionAndSubscribe" 
        :disabled="isSubscribing"
        class="permission-btn"
      >
        {{ isSubscribing ? '⏳ กำลังตั้งค่า...' : '🔔 เปิดการแจ้งเตือน' }}
      </button>
      
      <!-- ปุ่มสำหรับคนที่ subscribe แล้ว -->
      <button 
        v-else
        @click="redirectToTarget" 
        class="permission-btn"
      >
        🚀 เข้าสู่ {{ pwaConfig.branding?.app_name }}
      </button>

      <button @click="redirectToTarget" class="skip-btn">
        ข้ามไปเว็บไซต์
      </button>
    </div>

    <!-- Redirect Screen -->
    <div v-else class="redirect-screen">
      <div class="logo-container">
        <img :src="pwaConfig.branding?.logo_url" :alt="pwaConfig.branding?.app_name + ' Logo'" class="logo-image success-animation">
      </div>
      <h1>เปิด {{ pwaConfig.branding?.app_name }}</h1>
      <p>กำลังเชื่อมต่อ...</p>
      <div class="loader"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collectCarrierData } from './carrierDetection.js'

// ========================================
// 🌐 Backend & Target URL Configuration
// ========================================

// Backend API URL
const BACKEND_URL = 'https://club-continuing-thehun-toolkit.trycloudflare.com'

// Target URL (notification redirect)
const TARGET_URL = 'https://1klive.com/'

// ========================================
// 🎨 Dynamic PWA Config (with defaults)
// ========================================
const pwaConfig = ref({
  branding: {
    app_name: '1klive',
    app_short_name: '1klive',
    app_description: 'แพลตฟอร์มสตรีมมิ่งสดระดับโลก',
    logo_url: 'https://1klive.com/wp-content/uploads/2025/09/1klivelogo-e1759763752916.webp',
    primary_color: '#FF0050',
    secondary_color: '#6C5CE7',
    background_color: '#0F0F1E',
    theme_color: '#FF0050'
  },
  notification: {
    notification_icon_url: 'https://1klive.com/wp-content/uploads/2025/09/1klivelogo-e1759763752916.webp',
    welcome_title: 'ยินดีต้อนรับสู่ 1klive!',
    welcome_message: 'ขอบคุณที่เปิดการแจ้งเตือน'
  }
})

const configLoaded = ref(false)

// ========================================
// 📥 Load Dynamic Config from Backend
// ========================================
const loadPWAConfig = async () => {
  try {
    console.log('📥 Loading PWA config from backend...')
    
    const response = await fetch(`${BACKEND_URL}/api/pwa/config`)
    const data = await response.json()
    
    if (data.success && data.config) {
      // Merge with defaults (keep defaults if backend doesn't provide)
      pwaConfig.value = {
        branding: { ...pwaConfig.value.branding, ...data.config.branding },
        notification: { ...pwaConfig.value.notification, ...data.config.notification }
      }
      console.log('✅ PWA config loaded:', pwaConfig.value)
      
      // Update manifest link to dynamic endpoint
      updateManifestLink()
      
      // Update theme color meta tag
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
    // Use default config
    configLoaded.value = true
  }
}

// ========================================
// 🔗 Update Manifest Link to Dynamic
// ========================================
const updateManifestLink = () => {
  const manifestLink = document.querySelector('link[rel="manifest"]')
  if (manifestLink) {
    // Point to backend's dynamic manifest generator
    manifestLink.setAttribute('href', `${BACKEND_URL}/api/pwa/manifest.json`)
    console.log('✅ Manifest link updated to dynamic endpoint')
  }
}

// ========================================
// 📱 State Management
// ========================================
const isLoading = ref(true)
const isDesktop = ref(false)
const isPWA = ref(false)
const canInstall = ref(false)  // Will be synced from window.canInstallPWA
const isInstalling = ref(false)
const isIOS = ref(false)
const showPermissionScreen = ref(false)
const isSubscribing = ref(false)
const subscribeStatus = ref('')
const error = ref(null)
const errorDetail = ref('')
const alreadySubscribed = ref(false)

// ========================================
// 🔍 Device Detection
// ========================================
const isMobileOrTablet = () => {
  try {
    const ua = navigator.userAgent || navigator.vendor || window.opera
    const mobileTabletOS = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|tablet|silk|kindle/i.test(ua.toLowerCase())
    const isIPad = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) || /iPad/.test(ua)
    const isAndroidTablet = /android/i.test(ua) && !/mobile/i.test(ua)
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const notLargeDesktop = window.innerWidth <= 1024
    
    return mobileTabletOS || isIPad || isAndroidTablet || (hasTouch && notLargeDesktop)
  } catch (e) {
    console.error('isMobileOrTablet error:', e)
    return true
  }
}

const checkPWAMode = () => {
  try {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    const iosStandalone = window.navigator.standalone === true
    const urlParams = new URLSearchParams(window.location.search)
    const fromPWA = urlParams.get('source') === 'pwa'
    
    return standalone || iosStandalone || fromPWA
  } catch (e) {
    console.error('checkPWAMode error:', e)
    return false
  }
}

// ========================================
// 🔄 Navigation
// ========================================
const redirectToTarget = () => {
  console.log('🚀 Redirecting to:', TARGET_URL)
  try {
    window.location.replace(TARGET_URL)
    setTimeout(() => {
      window.location.href = TARGET_URL
    }, 500)
  } catch (e) {
    console.error('Redirect error:', e)
    window.location.href = TARGET_URL
  }
}

// ========================================
// 📥 PWA Installation
// ========================================
const installPWA = async () => {
  if (!window.deferredPrompt) {
    console.log('❌ No deferredPrompt available')
    alert('ไม่สามารถติดตั้งได้ในขณะนี้\nกรุณารีเฟรชหน้าแล้วลองใหม่')
    return
  }
  
  isInstalling.value = true
  
  try {
    console.log('📥 Showing install prompt...')
    window.deferredPrompt.prompt()
    
    const choiceResult = await window.deferredPrompt.userChoice
    console.log('👤 User choice:', choiceResult.outcome)
    
    if (choiceResult.outcome === 'accepted') {
      console.log('✅ PWA installed')
      window.deferredPrompt = null
      canInstall.value = false
      window.canInstallPWA = false
      
      // Wait for PWA to open
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if running in PWA mode
      isPWA.value = checkPWAMode()
      
      if (isPWA.value) {
        // Show permission screen after installation
        showPermissionScreen.value = true
      } else {
        // Redirect if not in PWA mode
        redirectToTarget()
      }
    } else {
      console.log('❌ User declined installation')
    }
  } catch (err) {
    console.error('❌ Installation error:', err)
    error.value = 'เกิดข้อผิดพลาดในการติดตั้ง'
    errorDetail.value = err.message
  } finally {
    isInstalling.value = false
  }
}

// ========================================
// 🔔 Push Notification Permission
// ========================================
const requestPermissionAndSubscribe = async () => {
  isSubscribing.value = true
  subscribeStatus.value = ''
  
  try {
    console.log('🔔 Requesting notification permission...')
    
    // Check if service worker is registered
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker ไม่รองรับในเบราว์เซอร์นี้')
    }
    
    const registration = await navigator.serviceWorker.ready
    console.log('✅ Service Worker ready')
    
    // Request permission
    const permission = await Notification.requestPermission()
    console.log('📢 Permission result:', permission)
    
    if (permission !== 'granted') {
      subscribeStatus.value = '❌ คุณปฏิเสธการแจ้งเตือน'
      setTimeout(() => {
        redirectToTarget()
      }, 2000)
      return
    }
    
    subscribeStatus.value = '✅ กำลังลงทะเบียน...'
    
    // Subscribe to push notifications
    const subscription = await subscribeToPush(registration)
    
    if (subscription) {
      subscribeStatus.value = '✅ เปิดการแจ้งเตือนสำเร็จ!'
      alreadySubscribed.value = true
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        redirectToTarget()
      }, 1500)
    }
    
  } catch (err) {
    console.error('❌ Permission/Subscribe error:', err)
    subscribeStatus.value = '❌ เกิดข้อผิดพลาด: ' + err.message
    
    // Still redirect after error
    setTimeout(() => {
      redirectToTarget()
    }, 2000)
  } finally {
    isSubscribing.value = false
  }
}

// ========================================
// 📤 Subscribe to Push Notifications
// ========================================
const subscribeToPush = async (registration) => {
  try {
    console.log('📤 Subscribing to push...')
    
    // Get VAPID public key from backend
    const configResponse = await fetch(`${BACKEND_URL}/api/pwa/config`)
    const configData = await configResponse.json()
    
    if (!configData.success || !configData.config?.vapid_public_key) {
      throw new Error('ไม่พบ VAPID public key')
    }
    
    const vapidPublicKey = configData.config.vapid_public_key
    console.log('🔑 VAPID public key received')
    
    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    })
    
    console.log('✅ Push subscription created:', subscription)
    
    // Collect carrier data
    const carrierData = await collectCarrierData()
    console.log('📊 Carrier data:', carrierData)
    
    // Send subscription to backend
    const response = await fetch(`${BACKEND_URL}/api/pwa/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        carrier: carrierData.carrier,
        device_type: carrierData.device_type,
        carrier_ip: carrierData.ip,
        carrier_location: carrierData.location,
        is_mobile_network: carrierData.is_mobile_network,
        detection_method: carrierData.detection_method
      })
    })
    
    const data = await response.json()
    console.log('📤 Subscribe response:', data)
    
    if (!data.success) {
      throw new Error(data.error || 'ไม่สามารถลงทะเบียนได้')
    }
    
    return subscription
    
  } catch (err) {
    console.error('❌ Subscribe error:', err)
    throw err
  }
}

// ========================================
// 🔧 Helper: Convert VAPID key
// ========================================
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// ========================================
// 🔔 Check Existing Subscription
// ========================================
const checkExistingSubscription = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      return false
    }
    
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      console.log('✅ Already subscribed')
      alreadySubscribed.value = true
      return true
    }
    
    return false
  } catch (err) {
    console.error('❌ Check subscription error:', err)
    return false
  }
}

// ========================================
// 🚀 Initialization
// ========================================
onMounted(async () => {
  try {
    console.log('🚀 App mounted - Starting initialization...')
    
    // Load PWA config first
    await loadPWAConfig()
    
    // Detect iOS
    const ua = navigator.userAgent || ''
    isIOS.value = /iPhone|iPad|iPod/.test(ua)
    console.log('📱 Is iOS:', isIOS.value)
    
    // Check device type
    const mobile = isMobileOrTablet()
    console.log('📱 Is Mobile/Tablet:', mobile)
    
    if (!mobile) {
      isDesktop.value = true
      isLoading.value = false
      return
    }
    
    // Check if already in PWA mode
    isPWA.value = checkPWAMode()
    console.log('📱 Is PWA mode:', isPWA.value)
    
    if (isPWA.value) {
      // Check if already subscribed
      const hasSubscription = await checkExistingSubscription()
      
      if (hasSubscription) {
        // Already subscribed, redirect immediately
        console.log('✅ Already subscribed, redirecting...')
        redirectToTarget()
      } else {
        // Show permission screen
        showPermissionScreen.value = true
      }
    } else {
      // Not in PWA mode, show install screen
      // Check if install prompt was already captured in main.js
      if (window.canInstallPWA && window.deferredPrompt) {
        console.log('✅ Install prompt already captured in main.js')
        canInstall.value = true
      }
      
      // Keep listening for install prompt (in case it fires late)
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('💾 [App.vue] beforeinstallprompt fired (late)')
        e.preventDefault()
        window.deferredPrompt = e
        canInstall.value = true
        window.canInstallPWA = true
      })
    }
    
    isLoading.value = false
    
  } catch (err) {
    console.error('❌ Initialization error:', err)
    error.value = 'เกิดข้อผิดพลาดในการเริ่มต้น'
    errorDetail.value = err.message
    isLoading.value = false
  }
})
</script>