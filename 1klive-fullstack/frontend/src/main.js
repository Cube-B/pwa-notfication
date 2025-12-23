import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Global variable สำหรับ install prompt
window.deferredPrompt = null;

// Capture beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💾 beforeinstallprompt captured');
    e.preventDefault();
    window.deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-install-ready'));
});

// Capture appinstalled event
window.addEventListener('appinstalled', () => {
    console.log('✅ appinstalled fired');
    window.dispatchEvent(new CustomEvent('pwa-installed'));
});

createApp(App).mount('#app')

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            console.log('🔄 Registering Service Worker...');
            
            // Add timeout for registration
            const registrationPromise = navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none'
            });
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Service Worker registration timeout'))
                }, 10000);
            });
            
            const registration = await Promise.race([
                registrationPromise,
                timeoutPromise
            ]);
            
            console.log('✅ Service Worker registered:', registration.scope);
            
            // Verify SW is actually working
            if (!navigator.serviceWorker.controller && registration.active) {
                console.log('🔄 Claiming clients...');
                registration.active.postMessage({ type: 'CLIENTS_CLAIM' });
            }
            
            // Simple update check without dialog (silent update)
            const checkForUpdates = async () => {
                try {
                    await registration.update();
                } catch (error) {
                    console.warn('⚠️ Update check failed:', error);
                }
            };
            
            // Check for updates every 5 minutes (not too aggressive)
            setInterval(checkForUpdates, 300000);
            
            // Check when page becomes visible
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    checkForUpdates();
                }
            });
            
            // Listen for SW updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('🆕 New Service Worker found');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('✅ New version installed');
                    }
                });
            });
            
            // One-time reload on controller change (for force updates)
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    console.log('🔄 New SW controller, reloading once...');
                    refreshing = true;
                    window.location.reload();
                }
            });
            
        } catch (error) {
            console.error('❌ SW registration failed:', error);
            
            // Show user-friendly error
            if (error.message.includes('timeout')) {
                console.error('⚠️ SW registration timeout - slow network or SW file issue');
            } else if (error.message.includes('SecurityError')) {
                console.error('⚠️ HTTPS required for Service Worker');
            } else if (error.message.includes('NetworkError')) {
                console.error('⚠️ Network error - check internet connection');
            }
            
            // Try to unregister and re-register after delay
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const reg of registrations) {
                    await reg.unregister();
                    console.log('🗑️ Unregistered old SW');
                }
                
                // Retry after 3 seconds
                setTimeout(() => {
                    console.log('🔄 Retrying SW registration...');
                    window.location.reload();
                }, 3000);
            } catch (cleanupError) {
                console.error('❌ SW cleanup failed:', cleanupError);
            }
        }
    });
}