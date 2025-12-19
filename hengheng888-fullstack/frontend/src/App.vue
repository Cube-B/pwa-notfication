<template>
  <div id="app">
    <div v-if="error" class="error-screen">
      <div class="logo">❌</div>
      <h1>เกิดข้อผิดพลาด</h1>
      <p>{{ error }}</p>
      <pre class="error-detail">{{ errorDetail }}</pre>
      <button @click="redirectToTarget" class="error-btn">
        🚀 เปิดเว็บไซต์
      </button>
    </div>

    <div v-else-if="isLoading" class="loading-screen">
      <div class="loader"></div>
      <p>กำลังโหลด...</p>
    </div>

    <div v-else-if="isDesktop" class="desktop-warning">
      <div class="warning-icon">💻</div>
      <h1>Desktop Mode</h1>
      <p>กรุณาเปิดด้วยมือถือหรือแท็บเล็ต</p>
      <button @click="redirectToTarget" class="desktop-btn">
        🚀 เปิด เฮงเฮง888
      </button>
    </div>

    <div v-else-if="!isPWA" class="install-screen">
      <div class="logo">📱</div>
      <h1>ติดตั้ง เฮงเฮง888</h1>
      <p>กรุณาติดตั้งแอปพลิเคชันก่อนใช้งาน</p>
      
      <button 
        v-if="canInstall" 
        @click="installPWA"
        :disabled="isInstalling"
        class="install-btn"
      >
        {{ isInstalling ? '⏳ กำลังติดตั้ง...' : '📥 ติดตั้ง เฮงเฮง888' }}
      </button>

      <div v-if="isIOS" class="ios-instructions">
        <p><strong>สำหรับ iOS:</strong></p>
        <ol>
          <li>แตะปุ่ม แชร์ (📤)</li>
          <li>เลือก "เพิ่มที่หน้าจอ Home"</li>
          <li>แตะ "เพิ่ม"</li>
        </ol>
      </div>
    </div>

    <div v-else-if="showPermissionScreen" class="permission-screen">
      <div class="logo bell-animation">🔔</div>
      <h1>เปิดการแจ้งเตือน</h1>
      <p class="permission-message">
        รับการแจ้งเตือนโปรโมชั่นและข่าวสารพิเศษ
      </p>
      <p class="status-text" v-if="subscribeStatus">{{ subscribeStatus }}</p>
      <button 
        @click="requestPermission" 
        :disabled="isSubscribing"
        class="permission-btn"
      >
        {{ isSubscribing ? '⏳ กำลังติดตั้ง...' : '🔔 เปิดการแจ้งเตือน' }}
      </button>
      <button @click="skipAndRedirect" class="skip-btn">
        ข้ามขั้นตอนนี้
      </button>
    </div>

    <div v-else class="redirect-screen">
      <div class="logo success-animation">🚀</div>
      <h1>เปิด เฮงเฮง888</h1>
      <p>กำลังเชื่อมต่อ...</p>
      <div class="loader"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const TARGET_URL = 'https://hengheng888.mssg.me/'

// ⚠️ ต้องแก้ไข IP นี้ให้ตรงกับ Mac ของคุณ!
const BACKEND_URL = 'http://192.168.1.XXX:3000'  // 👈 แก้ IP ตรงนี้!

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

const skipAndRedirect = () => {
  console.log('⏭️ Skipping permission')
  showPermissionScreen.value = false
  redirectToTarget()
}

const installPWA = async () => {
  if (!window.deferredPrompt) {
    console.log('❌ No deferredPrompt available')
    return
  }
  
  isInstalling.value = true
  
  try {
    const promptEvent = window.deferredPrompt
    promptEvent.prompt()
    const result = await promptEvent.userChoice
    
    console.log('📱 Install result:', result.outcome)
    
    if (result.outcome === 'accepted') {
      console.log('✅ PWA installed')
      isPWA.value = true
      
      setTimeout(() => {
        showPermissionScreen.value = true
        isLoading.value = false
      }, 500)
    }
  } catch (e) {
    console.error('❌ Install error:', e)
    error.value = 'ติดตั้งไม่สำเร็จ'
    errorDetail.value = e.message
  }
  
  window.deferredPrompt = null
  isInstalling.value = false
}

const requestPermission = async () => {
  console.log('🔔 Requesting permission...')
  console.log('🌐 Backend URL:', BACKEND_URL)
  
  isSubscribing.value = true
  subscribeStatus.value = 'กำลังขอสิทธิ์...'
  
  try {
    if (!('Notification' in window)) {
      throw new Error('เบราว์เซอร์ไม่รองรับการแจ้งเตือน')
    }

    const permission = await Notification.requestPermission()
    console.log('📋 Permission result:', permission)
    
    if (permission !== 'granted') {
      subscribeStatus.value = '⚠️ ไม่ได้รับสิทธิ์'
      setTimeout(() => skipAndRedirect(), 2000)
      return
    }
    
    subscribeStatus.value = '✅ ได้รับสิทธิ์แล้ว กำลัง subscribe...'
    
    // Subscribe to push
    const success = await subscribeToPushSafe()
    
    if (success) {
      subscribeStatus.value = '🎉 ติดตั้งสำเร็จ! กำลังเปิดเว็บไซต์...'
      setTimeout(() => redirectToTarget(), 2000)
    } else {
      throw new Error('Subscribe ไม่สำเร็จ')
    }
    
  } catch (e) {
    console.error('❌ Permission error:', e)
    error.value = 'Subscribe ไม่สำเร็จ'
    errorDetail.value = e.message
    isSubscribing.value = false
  }
}

const subscribeToPushSafe = async () => {
  try {
    console.log('📡 Starting push subscription...')
    
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker ไม่รองรับ')
    }

    subscribeStatus.value = 'รอ Service Worker...'
    
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Service Worker timeout')), 10000))
    ])
    
    console.log('✅ Service Worker ready')
    subscribeStatus.value = 'กำลังขอ VAPID key...'

    // Get VAPID key
    console.log('📡 Fetching VAPID key from:', `${BACKEND_URL}/api/notifications/vapid-public-key`)
    
    const response = await fetch(`${BACKEND_URL}/api/notifications/vapid-public-key`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    console.log('📡 VAPID response status:', response.status)
    
    if (!response.ok) {
      const text = await response.text()
      console.error('❌ VAPID response:', text)
      throw new Error(`Failed to get VAPID key: ${response.status} - ${text}`)
    }
    
    const data = await response.json()
    const publicKey = data.publicKey
    
    if (!publicKey) {
      throw new Error('VAPID key is empty')
    }
    
    console.log('✅ Got VAPID key:', publicKey.substring(0, 20) + '...')
    subscribeStatus.value = 'กำลัง subscribe...'

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey
    })
    
    console.log('✅ Push subscription created')
    console.log('Endpoint:', subscription.endpoint)
    subscribeStatus.value = 'กำลังบันทึก subscription...'

    // Save to backend
    console.log('📡 Saving to:', `${BACKEND_URL}/api/notifications/subscribe`)
    
    const saveResponse = await fetch(`${BACKEND_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ subscription })
    })
    
    console.log('📡 Save response status:', saveResponse.status)

    if (saveResponse.ok) {
      const result = await saveResponse.json()
      console.log('✅ Subscription saved:', result)
      return true
    } else {
      const text = await saveResponse.text()
      console.error('❌ Save failed:', text)
      throw new Error(`Save failed: ${saveResponse.status} - ${text}`)
    }
    
  } catch (e) {
    console.error('❌ Subscribe error:', e)
    throw e
  }
}

onMounted(async () => {
  console.log('🚀 App mounted')
  console.log('🌐 Backend URL:', BACKEND_URL)
  
  const safetyTimeout = setTimeout(() => {
    if (isLoading.value) {
      console.warn('⚠️ Safety timeout')
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
    console.log('📱 Is PWA:', isPWA.value)

    if (isPWA.value) {
      showPermissionScreen.value = true
      isLoading.value = false
    } else {
      isLoading.value = false
      
      window.addEventListener('pwa-install-ready', () => {
        canInstall.value = true
      })

      window.addEventListener('pwa-installed', () => {
        isPWA.value = true
        showPermissionScreen.value = true
      })

      if (window.deferredPrompt) {
        canInstall.value = true
      }
    }
    
    clearTimeout(safetyTimeout)
    
  } catch (e) {
    console.error('❌ Mount error:', e)
    error.value = 'เกิดข้อผิดพลาด'
    errorDetail.value = e.message
    isLoading.value = false
    clearTimeout(safetyTimeout)
  }
})
</script>

<style scoped>
/* ... styles เหมือนเดิม ... */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
}

.loading-screen,
.desktop-warning,
.install-screen,
.permission-screen,
.redirect-screen,
.error-screen {
  text-align: center;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.logo {
  font-size: 80px;
  margin-bottom: 20px;
}

.warning-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

h1 {
  font-size: 2em;
  margin-bottom: 15px;
}

p {
  font-size: 1.2em;
  margin-bottom: 20px;
  opacity: 0.9;
}

.error-detail {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 10px;
  text-align: left;
  font-size: 0.9em;
  margin: 15px 0;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.status-text {
  font-size: 1em;
  margin: 15px 0;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.install-btn,
.desktop-btn,
.permission-btn,
.skip-btn,
.error-btn {
  background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
  color: #1a1a2e;
  border: none;
  padding: 16px 40px;
  font-size: 1.15em;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  transition: all 0.3s;
  margin: 10px;
}

.skip-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1em;
  padding: 12px 30px;
}

.install-btn:hover,
.desktop-btn:hover,
.permission-btn:hover,
.skip-btn:hover,
.error-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6);
}

.install-btn:disabled,
.permission-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.ios-instructions {
  margin-top: 30px;
  text-align: left;
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 10px;
}

.ios-instructions ol {
  margin-left: 20px;
  margin-top: 10px;
}

.ios-instructions li {
  margin-bottom: 10px;
  line-height: 1.6;
}

.loader {
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top: 5px solid white;
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

.bell-animation {
  animation: ring 1s ease-in-out infinite;
}

@keyframes ring {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(-15deg); }
  20%, 40% { transform: rotate(15deg); }
  50% { transform: rotate(0deg); }
}

.success-animation {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.permission-message {
  font-size: 1.1em;
  margin: 20px 0;
}

@media (max-width: 600px) {
  .logo {
    font-size: 60px;
  }

  h1 {
    font-size: 1.8em;
  }

  p {
    font-size: 1.05em;
  }
}
</style>
