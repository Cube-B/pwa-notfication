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
            
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none'
            });
            
            console.log('✅ Service Worker registered:', registration.scope);
            
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
                        console.log('✅ New version installed, will activate on next visit');
                        // Don't reload automatically - let it activate naturally
                        // User will get new version next time they close and reopen app
                    }
                });
            });
            
        } catch (error) {
            console.error('❌ SW registration failed:', error);
        }
    });
}