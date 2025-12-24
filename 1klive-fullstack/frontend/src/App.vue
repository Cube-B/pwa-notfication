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
        {{ isInstalling ? '⏳ กำลังติดตั้ง...' : '📥 ติดตั้ง ' + pwaConfig.branding?.app_name }}
      </button>

      <!-- Manual Install Instructions (Android) -->
      <div v-if="!isIOS && !canInstall" class="android-instructions">
        <p class="instruction-title"><strong>📱 วิธีติดตั้งบน Android:</strong></p>
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
      <div class="bell-icon">🔔</div>
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
const canInstall = ref(false)
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
    const promptEvent = window.deferredPrompt
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Prompt timeout')), 10000)
    })
    
    const promptPromise = (async () => {
      console.log('📱 Showing install prompt...')
      promptEvent.prompt()
      
      console.log('⏳ Waiting for user choice...')
      const { outcome } = await promptEvent.userChoice
      console.log(`📊 User choice: ${outcome}`)
      
      return outcome
    })()
    
    const outcome = await Promise.race([promptPromise, timeoutPromise])
    
    if (outcome === 'accepted') {
      console.log('✅ User accepted the install prompt')
      
      window.deferredPrompt = null
      canInstall.value = false
      
      console.log('⏳ Waiting for PWA mode detection...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('🔍 Checking PWA mode...')
      isPWA.value = checkPWAMode()
      
      if (isPWA.value) {
        console.log('✅ PWA mode confirmed, showing permission screen')
        showPermissionScreen.value = true
      } else {
        console.log('⚠️ PWA mode not detected, trying again...')
        setTimeout(() => {
          isPWA.value = checkPWAMode()
          if (isPWA.value) {
            console.log('✅ PWA mode confirmed (2nd check)')
            showPermissionScreen.value = true
          } else {
            console.log('⚠️ Still not in PWA mode, redirecting...')
            redirectToTarget()
          }
        }, 1000)
      }
    } else {
      console.log('❌ User dismissed the install prompt')
      alert('❌ การติดตั้งถูกยกเลิก\nกรุณาลองใหม่อีกครั้ง')
    }
    
  } catch (e) {
    console.error('❌ Install error:', e)
    alert('เกิดข้อผิดพลาด: ' + e.message)
  } finally {
    isInstalling.value = false
  }
}

// ========================================
// 🔔 Request Permission & Subscribe
// ========================================
const requestPermissionAndSubscribe = async () => {
  isSubscribing.value = true
  subscribeStatus.value = ''
  
  try {
    console.log('🔔 Requesting notification permission...')
    
    const permission = await Notification.requestPermission()
    console.log('📊 Permission result:', permission)
    
    if (permission !== 'granted') {
      console.log('❌ Permission denied')
      subscribeStatus.value = '❌ คุณปฏิเสธการแจ้งเตือน กรุณาเปิดในการตั้งค่าเบราว์เซอร์'
      
      setTimeout(() => {
        alert('⚠️ คุณปฏิเสธการแจ้งเตือน\n\nหากต้องการเปิดการแจ้งเตือน กรุณา:\n1. ไปที่การตั้งค่าเบราว์เซอร์\n2. หา "การแจ้งเตือน" หรือ "Notifications"\n3. อนุญาตสำหรับเว็บไซต์นี้')
      }, 500)
      
      return
    }
    
    console.log('✅ Permission granted')
    subscribeStatus.value = '✅ ได้รับอนุญาตแล้ว กำลังตั้งค่า...'
    
    console.log('🔧 Getting service worker...')
    const registration = await navigator.serviceWorker.ready
    console.log('✅ Service worker ready')
    
    console.log('🔑 Getting VAPID key...')
    const vapidResponse = await fetch(`${BACKEND_URL}/api/notifications/vapid`)
    const vapidData = await vapidResponse.json()
    console.log('✅ VAPID key received')
    
    if (!vapidData.publicKey) {
      throw new Error('No VAPID public key')
    }
    
    subscribeStatus.value = '🔑 กำลังสร้างการเชื่อมต่อ...'
    
    console.log('📡 Subscribing to push...')
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey)
    })
    
    console.log('✅ Push subscription created')
    console.log('📍 Endpoint:', subscription.endpoint.substring(0, 50) + '...')
    
    subscribeStatus.value = '💾 กำลังบันทึกข้อมูล...'
    
    console.log('💾 Saving subscription to backend...')
    const saveResponse = await fetch(`${BACKEND_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription,
        carrier: null,
        device_type: detectDeviceType(),
        user_agent: navigator.userAgent
      })
    })
    
    if (!saveResponse.ok) {
      throw new Error(`HTTP error! status: ${saveResponse.status}`)
    }
    
    const saveData = await saveResponse.json()
    console.log('✅ Subscription saved:', saveData)
    
    subscribeStatus.value = '✅ ตั้งค่าสำเร็จ!'
    
    console.log('🎉 Showing welcome notification...')
    try {
      await registration.showNotification(
        pwaConfig.value.notification?.welcome_title || 'ยินดีต้อนรับ!',
        {
          body: pwaConfig.value.notification?.welcome_message || 'ขอบคุณที่เปิดการแจ้งเตือน',
          icon: pwaConfig.value.notification?.notification_icon_url || pwaConfig.value.branding?.logo_url,
          badge: pwaConfig.value.notification?.notification_icon_url || pwaConfig.value.branding?.logo_url,
          tag: 'welcome',
          requireInteraction: false,
          data: {
            url: TARGET_URL
          }
        }
      )
      console.log('✅ Welcome notification shown')
    } catch (notifError) {
      console.error('⚠️ Welcome notification error:', notifError)
    }
    
    setTimeout(() => {
      console.log('📡 Collecting carrier data...')
      collectCarrierData(subscription.endpoint, BACKEND_URL)
        .then(carrierResult => {
          if (carrierResult.success) {
            console.log('✅ Carrier data collected:', carrierResult.carrier || 'WiFi')
          }
        })
        .catch(err => {
          console.warn('⚠️ Carrier detection error (non-blocking):', err)
        })
    }, 2000)
    
    alreadySubscribed.value = true
    
    setTimeout(() => {
      console.log('🚀 Redirecting to target...')
      redirectToTarget()
    }, 2000)
    
  } catch (error) {
    console.error('❌ Subscribe error:', error)
    
    let errorMessage = '❌ เกิดข้อผิดพลาด: '
    
    if (error.name === 'NotAllowedError') {
      errorMessage += 'คุณปฏิเสธการแจ้งเตือน'
    } else if (error.name === 'NotSupportedError') {
      errorMessage += 'เบราว์เซอร์ไม่รองรับ Push Notifications'
    } else {
      errorMessage += error.message
    }
    
    subscribeStatus.value = errorMessage
    
  } finally {
    isSubscribing.value = false
  }
}

// ========================================
// 🔧 Helper Functions
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

const detectDeviceType = () => {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS'
  if (/Android/.test(ua)) return 'Android'
  return 'Unknown'
}

// ========================================
// 📬 Check for missed notifications
// ========================================
const checkMissedNotifications = async (endpoint) => {
  try {
    console.log('📬 Checking for missed notifications...')
    
    const response = await fetch(`${BACKEND_URL}/api/notifications/missed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endpoint })
    })
    
    if (!response.ok) {
      console.error('Failed to check missed notifications')
      return
    }
    
    const data = await response.json()
    
    if (data.success && data.count > 0) {
      console.log(`📬 Found ${data.count} missed notifications`)
      showMissedNotifications(data.missed, endpoint)
    } else {
      console.log('✅ No missed notifications')
    }
  } catch (error) {
    console.error('❌ Error checking missed notifications:', error)
  }
}

// ========================================
// 📢 Show missed notifications
// ========================================
const showMissedNotifications = async (notifications, endpoint) => {
  try {
    console.log(`📢 Showing ${notifications.length} missed notifications`)
    
    for (const notif of notifications) {
      if (Notification.permission === 'granted') {
        const notification = new Notification(notif.title, {
          body: notif.body,
          icon: notif.icon || pwaConfig.value.notification?.notification_icon_url,
          badge: pwaConfig.value.notification?.notification_icon_url,
          tag: `missed-${notif.id}`,
          data: {
            url: notif.url,
            notificationId: notif.id
          }
        })
        
        notification.onclick = () => {
          window.open(notif.url || TARGET_URL, '_blank')
          notification.close()
          markNotificationAsRead(endpoint, notif.id)
        }
        
        await new Promise(resolve => setTimeout(resolve, 100))
        markNotificationAsRead(endpoint, notif.id)
      }
    }
  } catch (error) {
    console.error('❌ Error showing missed notifications:', error)
  }
}

// ========================================
// ✅ Mark notification as read
// ========================================
const markNotificationAsRead = async (endpoint, notificationId) => {
  try {
    await fetch(`${BACKEND_URL}/api/notifications/mark-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endpoint, notificationId })
    })
    
    console.log(`✅ Marked notification ${notificationId} as read`)
  } catch (error) {
    console.error('❌ Error marking as read:', error)
  }
}

// ========================================
// 🚀 Component Lifecycle
// ========================================
onMounted(async () => {
  console.log('🚀 1klive App mounted')
  console.log('🌐 Backend URL:', BACKEND_URL)
  console.log('🎯 Target URL:', TARGET_URL)
  
  // Load PWA config from backend first
  await loadPWAConfig()
  
  const safetyTimeout = setTimeout(() => {
    if (isLoading.value) {
      console.warn('⚠️ Safety timeout triggered')
      isLoading.value = false
      redirectToTarget()
    }
  }, 10000)
  
  try {
    if (!isMobileOrTablet()) {
      console.log('💻 Desktop detected')
      isDesktop.value = true
      isLoading.value = false
      clearTimeout(safetyTimeout)
      return
    }

    isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent)
    isPWA.value = checkPWAMode()
    console.log('📱 Device: ' + (isIOS.value ? 'iOS' : 'Android'))
    console.log('📱 Is PWA:', isPWA.value)
    console.log('📱 User Agent:', navigator.userAgent)

    if (isPWA.value) {
      console.log('✅ Already in PWA mode')
      
      try {
        const registration = await navigator.serviceWorker.ready
        const existingSubscription = await registration.pushManager.getSubscription()
        
        if (existingSubscription && Notification.permission === 'granted') {
          console.log('✅ Already subscribed')
          console.log('📍 Endpoint:', existingSubscription.endpoint.substring(0, 50) + '...')
          alreadySubscribed.value = true
          
          checkMissedNotifications(existingSubscription.endpoint)
          
          console.log('📡 Checking carrier data status...')
          collectCarrierData(existingSubscription.endpoint, BACKEND_URL)
            .then(carrierResult => {
              if (carrierResult.success) {
                if (carrierResult.skipped) {
                  console.log('✅ Already has mobile carrier data')
                } else if (carrierResult.is_mobile) {
                  console.log('✅ Mobile carrier detected:', carrierResult.carrier)
                } else {
                  console.log('📶 WiFi detected, will check again next time')
                }
              }
            })
            .catch(err => {
              console.warn('⚠️ Carrier check error (non-blocking):', err)
            })
        } else {
          console.log('📝 Not subscribed yet')
          alreadySubscribed.value = false
        }
      } catch (error) {
        console.error('❌ Error checking subscription:', error)
        alreadySubscribed.value = false
      }
      
      showPermissionScreen.value = true
      isLoading.value = false
    } else {
      console.log('📲 Not in PWA mode, showing install screen')
      isLoading.value = false
      
      // 🔥 CRITICAL: Listen for events from main.js
      window.addEventListener('pwa-install-ready', () => {
        console.log('✅ PWA install ready event received (from main.js)')
        canInstall.value = true
      })

      window.addEventListener('pwa-installed', () => {
        console.log('✅ PWA installed event received (from main.js)')
        isPWA.value = true
        showPermissionScreen.value = true
      })

      // Check if deferredPrompt already set by main.js
      if (window.deferredPrompt) {
        console.log('✅ deferredPrompt already available (set by main.js)')
        canInstall.value = true
      } else {
        console.log('⏳ Waiting for beforeinstallprompt event...')
        console.log('⏳ main.js will capture it and set window.deferredPrompt')
        
        // Wait 3 seconds then check status
        setTimeout(() => {
          if (!canInstall.value && !window.deferredPrompt) {
            console.warn('⚠️ beforeinstallprompt not fired after 3 seconds')
            console.warn('⚠️ Possible reasons:')
            console.warn('   1. PWA criteria not met (needs HTTPS, valid manifest, sw.js)')
            console.warn('   2. Already installed')
            console.warn('   3. Browser doesn\'t support (use Chrome/Edge)')
            console.log('📱 Showing manual install instructions as fallback')
          }
        }, 3000)
      }
    }
    
    clearTimeout(safetyTimeout)
    
  } catch (e) {
    console.error('❌ Mount error:', e)
    error.value = 'เกิดข้อผิดพลาดในการโหลด'
    errorDetail.value = e.message
    isLoading.value = false
    clearTimeout(safetyTimeout)
  }
})
</script>

<style scoped>
/* ========================================
   🎨 Global Styles
   ======================================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* ========================================
   📦 Common Screen Styles
   ======================================== */
.error-screen,
.loading-screen,
.desktop-warning,
.install-screen,
.permission-screen,
.redirect-screen {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px 30px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo */
.logo-container {
  margin-bottom: 30px;
}

.logo-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.success-animation {
  animation: success 0.5s ease-in-out;
}

@keyframes success {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Headings */
h1 {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* ========================================
   🔴 Error Screen
   ======================================== */
.error-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.error-detail {
  background: #f0f0f0;
  padding: 15px;
  border-radius: 10px;
  font-family: monospace;
  font-size: 12px;
  text-align: left;
  overflow-x: auto;
  margin-bottom: 20px;
}

.error-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.error-btn:hover {
  transform: scale(1.05);
}

/* ========================================
   ⏳ Loading Screen
   ======================================== */
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ========================================
   💻 Desktop Warning
   ======================================== */
.warning-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.desktop-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.desktop-btn:hover {
  transform: scale(1.05);
}

/* ========================================
   📥 Install Screen
   ======================================== */
.subtitle {
  font-size: 16px;
  color: #999;
  margin-bottom: 30px;
}

.features {
  margin: 30px 0;
  text-align: left;
}

.feature {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 10px;
}

.feature .icon {
  font-size: 24px;
  margin-right: 15px;
}

.feature span:last-child {
  font-size: 14px;
  color: #555;
}

.install-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s;
  width: 100%;
}

.install-btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.install-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Android Instructions */
.android-instructions {
  margin-top: 30px;
  padding: 20px;
  background: #f0f7ff;
  border-radius: 10px;
  text-align: left;
}

.instruction-title {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 16px;
}

.instruction-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-number {
  background: #667eea;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

.step span:last-child {
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

/* iOS Instructions */
.ios-instructions {
  margin-top: 30px;
  padding: 20px;
  background: #f0f7ff;
  border-radius: 10px;
  text-align: left;
}

.ios-instructions p {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 16px;
}

.ios-instructions ol {
  padding-left: 20px;
  color: #555;
}

.ios-instructions li {
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.5;
}

/* ========================================
   🔔 Permission Screen
   ======================================== */
.bell-icon {
  font-size: 60px;
  margin-bottom: 20px;
  animation: ring 1s ease-in-out infinite;
}

@keyframes ring {
  0%, 100% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(10deg);
  }
}

.permission-message {
  font-size: 14px;
  line-height: 1.8;
  color: #555;
  margin-bottom: 25px;
}

.status-box {
  background: #f0f7ff;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.status-text {
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.permission-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s;
  width: 100%;
}

.permission-btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.permission-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ========================================
   📱 Responsive Design
   ======================================== */
@media (max-width: 480px) {
  #app {
    padding: 10px;
  }
  
  .error-screen,
  .loading-screen,
  .desktop-warning,
  .install-screen,
  .permission-screen,
  .redirect-screen {
    padding: 30px 20px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  .logo-image {
    width: 100px;
    height: 100px;
  }
}
</style>