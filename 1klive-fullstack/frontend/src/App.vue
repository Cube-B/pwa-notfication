<template>
  <div id="app">
    <!-- Error Screen -->
    <div v-if="error" class="error-screen">
      <div class="logo-container">
        <img src="https://1klive.com/wp-content/uploads/2025/09/1klivelogo-e1759763752916.webp" alt="1klive Logo" class="logo-image">
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
        <img src="https://1klive.com/wp-content/uploads/2025/09/1klivelogo-e1759763752916.webp" alt="1klive Logo" class="logo-image">
      </div>
      <div class="warning-icon">💻</div>
      <h1>Desktop Mode</h1>
      <p>กรุณาเปิดด้วยมือถือหรือแท็บเล็ต</p>
      <button @click="redirectToTarget" class="desktop-btn">
        🚀 เปิด 1klive
      </button>
    </div>

    <!-- Install Screen (before PWA installation) -->
    <div v-else-if="!isPWA" class="install-screen">
      <div class="logo-container">
        <img src="https://1klive.com/wp-content/uploads/2025/09/1klivelogo-e1759763752916.webp" alt="1klive Logo" class="logo-image">
      </div>
      <h1>ติดตั้ง 1klive</h1>
      <p class="subtitle">แพลตฟอร์มสตรีมมิ่งสดระดับโลก</p>
      
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
        {{ isInstalling ? '⏳ กำลังติดตั้ง...' : '📥 ติดตั้ง 1klive' }}
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
        <img src="https://1klive.com/wp-content/uploads/2025/09/1klivelogo-e1759763752916.webp" alt="1klive Logo" class="logo-image">
      </div>
      <div class="bell-icon">🔔</div>
      <h1>{{ alreadySubscribed ? 'พร้อมใช้งาน' : 'เปิดการแจ้งเตือน' }}</h1>
      <p class="permission-message">
        <strong v-if="!alreadySubscribed">⚠️ สำคัญมาก:</strong> 
        <span v-if="!alreadySubscribed">เพื่อรับข่าวสารและดูแลคุณได้ดีที่สุด<br/>กรุณากดปุ่มด้านล่างเพื่อเปิดการแจ้งเตือน</span>
        <span v-else>✅ คุณเปิดการแจ้งเตือนเรียบร้อยแล้ว<br/>พร้อมรับข่าวสารและโปรโมชั่นพิเศษ</span><br/><br/>
        📺 รับแจ้งเตือนเมื่อมีการถ่ายทอดสดใหม่<br/>
        🎁 โปรโมชั่นและข่าวสารพิเศษจาก 1klive
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
        🚀 เข้าสู่ 1klive
      </button>
    </div>

    <!-- Redirect Screen -->
    <div v-else class="redirect-screen">
      <div class="logo-container">
        <img src="https://1klive.com/wp-content/uploads/2025/09/1klivelogo-e1759763752916.webp" alt="1klive Logo" class="logo-image success-animation">
      </div>
      <h1>เปิด 1klive</h1>
      <p>กำลังเชื่อมต่อ...</p>
      <div class="loader"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collectCarrierData } from './carrierDetection.js'

// ========================================
// 🔧 Configuration
// ========================================
const TARGET_URL = 'https://1klive.com/'

// ⚠️ ต้องแก้ไข IP นี้ให้ตรงกับ Backend Server ของคุณ!
const BACKEND_URL = 'https://basic-fusion-glass-guest.trycloudflare.com'  // ✅ Updated!

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
const alreadySubscribed = ref(false) // เช็คว่า subscribe แล้วหรือยัง

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
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Installation timeout after 30 seconds'))
      }, 30000)
    })
    
    // Race between install and timeout
    promptEvent.prompt()
    
    const result = await Promise.race([
      promptEvent.userChoice,
      timeoutPromise
    ])
    
    console.log('📱 Install result:', result.outcome)
    
    if (result.outcome === 'accepted') {
      console.log('✅ PWA installed successfully')
      isPWA.value = true
      
      // Wait for Service Worker to be ready
      try {
        await navigator.serviceWorker.ready
        console.log('✅ Service Worker ready after install')
      } catch (swError) {
        console.error('⚠️ SW ready error:', swError)
      }
      
      // Show permission screen after installation
      setTimeout(() => {
        showPermissionScreen.value = true
        isLoading.value = false
      }, 500)
    } else {
      console.log('❌ PWA installation declined')
      alert('คุณยกเลิกการติดตั้ง\nหากต้องการติดตั้งอีกครั้ง กรุณารีเฟรชหน้า')
    }
  } catch (e) {
    console.error('❌ Install error:', e)
    
    if (e.message.includes('timeout')) {
      alert('การติดตั้งใช้เวลานานเกินไป\nกรุณา:\n1. เช็คอินเทอร์เน็ต\n2. Clear cache ของ Chrome\n3. ลองใหม่อีกครั้ง')
    } else {
      alert(`ติดตั้งไม่สำเร็จ: ${e.message}\n\nแนะนำ:\n1. Clear cache Chrome\n2. ปิดแอพทั้งหมด\n3. ลองใหม่อีกครั้ง`)
    }
    
    error.value = 'ติดตั้งไม่สำเร็จ'
    errorDetail.value = e.message
  }
  
  window.deferredPrompt = null
  isInstalling.value = false
}

// ========================================
// 🔔 Notification Permission & Subscription
// ========================================
const requestPermissionAndSubscribe = async () => {
  console.log('🔔 Requesting notification permission...')
  console.log('🌐 Backend URL:', BACKEND_URL)
  
  isSubscribing.value = true
  subscribeStatus.value = 'กำลังเตรียมระบบ...'
  
  try {
    // Step 1: Check notification support
    if (!('Notification' in window)) {
      throw new Error('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน')
    }

    // Step 1.5: Wait for Service Worker to be ready (IMPORTANT!)
    console.log('⏳ Waiting for Service Worker to be ready...')
    subscribeStatus.value = 'กำลังเตรียมระบบ... (รอสักครู่)'
    
    const registration = await navigator.serviceWorker.ready
    console.log('✅ Service Worker is ready')
    
    // Give Service Worker a moment to fully initialize
    await new Promise(resolve => setTimeout(resolve, 500))

    // Step 2: Request permission
    console.log('📝 Requesting permission...')
    subscribeStatus.value = 'กำลังขอสิทธิ์การแจ้งเตือน...'
    
    const permission = await Notification.requestPermission()
    console.log('🔑 Permission result:', permission)
    
    if (permission !== 'granted') {
      subscribeStatus.value = '❌ คุณไม่อนุญาตให้แจ้งเตือน - กรุณากดปุ่มอีกครั้ง'
      console.warn('⚠️ Permission denied')
      // ไม่ redirect - ให้ผู้ใช้ลองกดอีกครั้ง
      return
    }

    subscribeStatus.value = 'กำลังตรวจสอบการแจ้งเตือนเดิม...'

    // Step 3: Check existing subscription
    const existingSubscription = await registration.pushManager.getSubscription()
    
    if (existingSubscription) {
      console.log('🔍 Found existing subscription')
      console.log('📍 Endpoint:', existingSubscription.endpoint.substring(0, 50) + '...')
      
      // ✅ ใช้ subscription เดิมต่อ - ไม่ต้อง unsubscribe และ subscribe ใหม่
      // แค่ update ข้อมูลใน backend
      console.log('♻️ Reusing existing subscription')
      
      subscribeStatus.value = 'กำลังอัปเดตข้อมูล...'
      
      const updateResponse = await fetch(`${BACKEND_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ subscription: existingSubscription })
      })
      
      if (!updateResponse.ok) {
        const text = await updateResponse.text()
        throw new Error(`อัปเดตไม่สำเร็จ: ${updateResponse.status} - ${text}`)
      }
      
      const result = await updateResponse.json()
      console.log('✅ Subscription updated:', result)
      
      subscribeStatus.value = '✅ เปิดการแจ้งเตือนสำเร็จ!'
      
      // Show battery optimization reminder for Android
      if (!isIOS.value) {
        setTimeout(() => {
          alert('💡 เคล็ดลับสำหรับ Android:\n\nเพื่อให้ได้รับการแจ้งเตือนแม้ปิดหน้าจอ\nกรุณาตั้งค่า:\n\nSettings → Apps → 1klive\n→ Battery → Unrestricted')
        }, 2000)
      }
      
      // Redirect after delay
      setTimeout(() => {
        console.log('🚀 Redirecting to main site...')
        redirectToTarget()
      }, 2000)
      
      return // ✅ ไม่ต้อง subscribe ใหม่
    }
    
    // ถ้าไม่มี subscription เก่า ถึงจะสร้างใหม่
    console.log('📝 No existing subscription found, creating new one...')

    subscribeStatus.value = 'กำลังลงทะเบียนการแจ้งเตือนใหม่...'

    // Step 4: Get VAPID public key from backend
    console.log('🔑 Fetching VAPID key...')
    const vapidResponse = await fetch(`${BACKEND_URL}/api/notifications/vapid`)
    
    if (!vapidResponse.ok) {
      throw new Error(`VAPID fetch failed: ${vapidResponse.status}`)
    }
    
    const { publicKey } = await vapidResponse.json()
    console.log('✅ VAPID key received')

    // Step 5: Create NEW subscription
    console.log('📡 Creating new push subscription...')
    subscribeStatus.value = 'กำลังสร้างการเชื่อมต่อ...'
    
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    })
    
    console.log('✅ New push subscription created')
    console.log('📍 New endpoint:', newSubscription.endpoint.substring(0, 50) + '...')

    // Step 6: Save new subscription to backend
    subscribeStatus.value = 'กำลังบันทึกข้อมูล...'
    console.log('💾 Saving new subscription to backend...')
    
    const saveResponse = await fetch(`${BACKEND_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ subscription: newSubscription })
    })
    
    console.log('📡 Save response status:', saveResponse.status)

    if (!saveResponse.ok) {
      const text = await saveResponse.text()
      throw new Error(`บันทึกไม่สำเร็จ: ${saveResponse.status} - ${text}`)
    }
    
    const result = await saveResponse.json()
    console.log('✅ New subscription saved:', result)

    // Step 7: Collect carrier data (async, don't wait)
    console.log('📡 Starting carrier data collection...')
    collectCarrierData(newSubscription.endpoint, BACKEND_URL)
      .then(carrierResult => {
        if (carrierResult.success) {
          console.log('✅ Carrier data collected:', carrierResult.carrier)
          if (carrierResult.is_mobile) {
            console.log('📱 Mobile network detected!')
          } else {
            console.log('📶 WiFi detected, will retry next time')
          }
        }
      })
      .catch(err => {
        console.warn('⚠️ Carrier collection error (non-blocking):', err)
      })

    // Step 8: Success!
    subscribeStatus.value = '✅ เปิดการแจ้งเตือนสำเร็จ!'
    
    // Show battery optimization reminder for Android
    if (!isIOS.value) {
      setTimeout(() => {
        alert('💡 เคล็ดลับสำหรับ Android:\n\nเพื่อให้ได้รับการแจ้งเตือนแม้ปิดหน้าจอ\nกรุณาตั้งค่า:\n\nSettings → Apps → 1klive\n→ Battery → Unrestricted')
      }, 2000)
    }
    
    // Wait for welcome notification and then redirect
    setTimeout(() => {
      console.log('🚀 Redirecting to main site...')
      redirectToTarget()
    }, 2000)
    
  } catch (e) {
    console.error('❌ Permission/Subscribe error:', e)
    error.value = 'ไม่สามารถเปิดการแจ้งเตือนได้'
    errorDetail.value = e.message
    subscribeStatus.value = `❌ เกิดข้อผิดพลาด: ${e.message}\nกรุณากดปุ่มอีกครั้ง`
    
    // ไม่ redirect - ให้ผู้ใช้ลองกดอีกครั้ง
  } finally {
    isSubscribing.value = false
  }
}

// Helper function to convert VAPID key
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
      
      // Show missed notifications
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
    
    // Show as browser notifications
    for (const notif of notifications) {
      // Request permission if needed
      if (Notification.permission === 'granted') {
        const notification = new Notification(notif.title, {
          body: notif.body,
          icon: notif.icon || '/logo.png',
          badge: '/logo.png',
          tag: `missed-${notif.id}`,
          data: {
            url: notif.url,
            notificationId: notif.id
          }
        })
        
        notification.onclick = () => {
          window.open(notif.url || 'https://1klive.com', '_blank')
          notification.close()
          
          // Mark as read
          markNotificationAsRead(endpoint, notif.id)
        }
        
        // Mark as read after showing
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
  
  // Safety timeout
  const safetyTimeout = setTimeout(() => {
    if (isLoading.value) {
      console.warn('⚠️ Safety timeout triggered')
      isLoading.value = false
      redirectToTarget()
    }
  }, 10000)
  
  try {
    // Check if desktop
    if (!isMobileOrTablet()) {
      console.log('💻 Desktop detected')
      isDesktop.value = true
      isLoading.value = false
      clearTimeout(safetyTimeout)
      return
    }

    // Check device type
    isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent)
    isPWA.value = checkPWAMode()
    console.log('📱 Device: ' + (isIOS.value ? 'iOS' : 'Android'))
    console.log('📱 Is PWA:', isPWA.value)
    console.log('📱 User Agent:', navigator.userAgent)

    // If already installed as PWA, check if already subscribed
    if (isPWA.value) {
      console.log('✅ Already in PWA mode')
      
      // Check if already subscribed (but don't auto-redirect to prevent loop)
      try {
        const registration = await navigator.serviceWorker.ready
        const existingSubscription = await registration.pushManager.getSubscription()
        
        if (existingSubscription && Notification.permission === 'granted') {
          console.log('✅ Already subscribed')
          console.log('📍 Endpoint:', existingSubscription.endpoint.substring(0, 50) + '...')
          alreadySubscribed.value = true
          
          // Check for missed notifications
          checkMissedNotifications(existingSubscription.endpoint)
          
          // Collect carrier data if not yet complete
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
      // Not installed yet, show install screen
      console.log('📲 Not in PWA mode, showing install screen')
      isLoading.value = false
      
      // Listen for install events
      window.addEventListener('pwa-install-ready', () => {
        console.log('✅ PWA install ready event received')
        canInstall.value = true
      })

      window.addEventListener('pwa-installed', () => {
        console.log('✅ PWA installed event received')
        isPWA.value = true
        showPermissionScreen.value = true
      })

      // Check if we can already install
      if (window.deferredPrompt) {
        console.log('✅ deferredPrompt already available')
        canInstall.value = true
      } else {
        console.log('⏳ Waiting for beforeinstallprompt event...')
        
        // Wait 3 seconds then log status
        setTimeout(() => {
          if (!canInstall.value && !window.deferredPrompt) {
            console.warn('⚠️ beforeinstallprompt not fired after 3 seconds')
            console.warn('⚠️ User needs to install manually via browser menu')
            console.log('📱 Showing manual install instructions')
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