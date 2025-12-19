import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Global variable สำหรับ install prompt
window.deferredPrompt = null;

// Capture beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💾 beforeinstallprompt captured');
    e.preventDefault();
    window.deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-install-ready'));
});

// Capture appinstalled
window.addEventListener('appinstalled', () => {
    console.log('✅ appinstalled fired');
    window.dispatchEvent(new CustomEvent('pwa-installed'));
});

createApp(App).mount('#app')

// Service Worker Registration with Auto-Update
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            console.log('🔄 Registering Service Worker...');
            
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none'  // ⚠️ สำคัญ: ไม่ cache sw.js
            });
            
            console.log('✅ Service Worker registered:', registration.scope);
            
            // Check for updates ทุกๆ 30 วินาที
            setInterval(() => {
                console.log('🔍 Checking for updates...');
                registration.update();
            }, 30000);
            
            // Listen for SW updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('🆕 New SW found, installing...');
                
                newWorker.addEventListener('statechange', () => {
                    console.log('SW state:', newWorker.state);
                    
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            console.log('🔄 New version available!');
                            
                            // แจ้งเตือน user
                            showUpdateNotification(newWorker);
                        } else {
                            console.log('✅ First install');
                        }
                    }
                });
            });
            
            // Listen for messages from SW
            navigator.serviceWorker.addEventListener('message', (event) => {
                console.log('💬 Message from SW:', event.data);
                
                if (event.data.type === 'SW_UPDATED') {
                    console.log(`✅ Updated to version ${event.data.version}`);
                    
                    // แสดง toast notification
                    showToast(`อัปเดตเป็นเวอร์ชัน ${event.data.version} แล้ว`);
                }
            });
            
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    });
}

// Listen for controller change (new SW activated)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 New Service Worker activated');
        
        // แสดงข้อความว่ากำลังรีโหลด
        showToast('กำลังอัปเดตแอป...', 1000);
        
        // Reload page หลัง 1 วินาที
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });
}

// แสดง Update Notification
function showUpdateNotification(newWorker) {
    // สร้าง toast notification
    const toast = document.createElement('div');
    toast.className = 'update-toast';
    toast.innerHTML = `
        <div class="update-content">
            <span class="update-icon">🔄</span>
            <span class="update-text">มีเวอร์ชันใหม่พร้อมใช้งาน</span>
        </div>
        <button class="update-btn" id="updateBtn">อัปเดตเลย</button>
        <button class="close-btn" id="closeBtn">ปิด</button>
    `;
    
    // Styles
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideUp 0.3s ease;
        max-width: 90%;
    `;
    
    document.body.appendChild(toast);
    
    // Update button handler
    document.getElementById('updateBtn').addEventListener('click', () => {
        console.log('🔄 User requested update');
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        toast.remove();
    });
    
    // Close button handler
    document.getElementById('closeBtn').addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.remove();
        }
    }, 10000);
}

// แสดง Toast message
function showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 999999;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translate(-50%, 100px);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .update-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .update-icon {
        font-size: 24px;
    }
    
    .update-text {
        font-weight: 500;
    }
    
    .update-btn, .close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
    }
    
    .update-btn {
        background: #FFD700;
        color: #1a1a2e;
        border: none;
    }
    
    .update-btn:hover {
        background: #FFC107;
        transform: scale(1.05);
    }
    
    .close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
    }
`;
document.head.appendChild(style);

console.log('✅ Main.js loaded with auto-update support');
