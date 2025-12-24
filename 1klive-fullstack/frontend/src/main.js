import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// ════════════════════════════════════════════════════════════════
// 💾 CRITICAL: Capture beforeinstallprompt BEFORE Vue mounts
// ════════════════════════════════════════════════════════════════
// Global variables for install prompt
window.deferredPrompt = null
window.canInstallPWA = false  // Flag for App.vue to check

// Capture beforeinstallprompt event (MUST be before Vue mount!)
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💾 [main.js] beforeinstallprompt captured!')
    e.preventDefault()
    window.deferredPrompt = e
    window.canInstallPWA = true  // Set flag for App.vue
    window.dispatchEvent(new CustomEvent('pwa-install-ready'))
    console.log('✅ [main.js] Install prompt ready, flag set to true')
})

// Capture appinstalled event
window.addEventListener('appinstalled', () => {
    console.log('✅ [main.js] PWA installed successfully!')
    window.deferredPrompt = null
    window.canInstallPWA = false
    window.dispatchEvent(new CustomEvent('pwa-installed'))
})

// ════════════════════════════════════════════════════════════════
// 🚀 Mount Vue App
// ════════════════════════════════════════════════════════════════
createApp(App).mount('#app')
console.log('✅ [main.js] Vue app mounted')

// ════════════════════════════════════════════════════════════════
// 🔧 Service Worker Registration
// ════════════════════════════════════════════════════════════════
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            console.log('🔄 [SW] Registering Service Worker...')
            
            // Add timeout for registration (10 seconds)
            const registrationPromise = navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none'
            })
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Service Worker registration timeout'))
                }, 10000)
            })
            
            const registration = await Promise.race([
                registrationPromise,
                timeoutPromise
            ])
            
            console.log('✅ [SW] Service Worker registered:', registration.scope)
            
            // Verify SW is actually working
            if (!navigator.serviceWorker.controller && registration.active) {
                console.log('🔄 [SW] Claiming clients...')
                registration.active.postMessage({ type: 'CLIENTS_CLAIM' })
            }
            
            // ────────────────────────────────────────────────────
            // Silent update check (no intrusive dialogs)
            // ────────────────────────────────────────────────────
            const checkForUpdates = async () => {
                try {
                    await registration.update()
                } catch (error) {
                    console.warn('⚠️ [SW] Update check failed:', error)
                }
            }
            
            // Check for updates every 5 minutes (not too aggressive)
            setInterval(checkForUpdates, 300000)
            
            // Check when page becomes visible
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    checkForUpdates()
                }
            })
            
            // ────────────────────────────────────────────────────
            // Listen for SW updates
            // ────────────────────────────────────────────────────
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing
                console.log('🆕 [SW] New Service Worker found')
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('✅ [SW] New version installed (will activate on next load)')
                    }
                })
            })
            
            // ────────────────────────────────────────────────────
            // One-time reload on controller change (for force updates)
            // ────────────────────────────────────────────────────
            let refreshing = false
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    console.log('🔄 [SW] New SW controller detected, reloading once...')
                    refreshing = true
                    window.location.reload()
                }
            })
            
        } catch (error) {
            console.error('❌ [SW] Registration failed:', error)
            
            // Show user-friendly error messages
            if (error.message.includes('timeout')) {
                console.error('⚠️ [SW] Registration timeout - slow network or SW file issue')
            } else if (error.message.includes('SecurityError')) {
                console.error('⚠️ [SW] HTTPS required for Service Worker')
            } else if (error.message.includes('NetworkError')) {
                console.error('⚠️ [SW] Network error - check internet connection')
            }
            
            // ────────────────────────────────────────────────────
            // Try to unregister and re-register after delay
            // ────────────────────────────────────────────────────
            try {
                const registrations = await navigator.serviceWorker.getRegistrations()
                for (const reg of registrations) {
                    await reg.unregister()
                    console.log('🗑️ [SW] Unregistered old SW')
                }
                
                // Retry after 3 seconds
                setTimeout(() => {
                    console.log('🔄 [SW] Retrying registration...')
                    window.location.reload()
                }, 3000)
            } catch (cleanupError) {
                console.error('❌ [SW] Cleanup failed:', cleanupError)
            }
        }
    })
} else {
    console.warn('⚠️ [SW] Service Worker not supported in this browser')
}