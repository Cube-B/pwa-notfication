import { ref, onMounted } from 'vue';
import api from '../services/api.js';

export function usePushNotifications() {
    const isSupported = ref(false);
    const isSubscribed = ref(false);
    const permission = ref('default');
    const subscription = ref(null);
    const error = ref(null);

    onMounted(() => {
        isSupported.value = 'Notification' in window && 
                           'serviceWorker' in navigator && 
                           'PushManager' in window;
        
        if (isSupported.value) {
            permission.value = Notification.permission;
            checkSubscription();
        }
    });

    async function checkSubscription() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            
            if (sub) {
                subscription.value = sub;
                isSubscribed.value = true;
            }
        } catch (err) {
            console.error('Check subscription error:', err);
        }
    }

    async function requestPermission() {
        try {
            const result = await Notification.requestPermission();
            permission.value = result;
            return result;
        } catch (err) {
            error.value = err.message;
            return 'denied';
        }
    }

    async function subscribe(userId = null) {
        try {
            error.value = null;

            if (permission.value !== 'granted') {
                const perm = await requestPermission();
                if (perm !== 'granted') {
                    throw new Error('กรุณาอนุญาตการแจ้งเตือน');
                }
            }

            const { publicKey } = await api.getVapidPublicKey();
            const registration = await navigator.serviceWorker.ready;

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            await api.subscribe(sub.toJSON(), userId);

            subscription.value = sub;
            isSubscribed.value = true;

            return sub;
        } catch (err) {
            error.value = err.message;
            throw err;
        }
    }

    async function unsubscribe() {
        try {
            error.value = null;

            if (!subscription.value) {
                throw new Error('ยังไม่ได้ subscribe');
            }

            await subscription.value.unsubscribe();
            await api.unsubscribe(subscription.value.endpoint);

            subscription.value = null;
            isSubscribed.value = false;
        } catch (err) {
            error.value = err.message;
            throw err;
        }
    }

    async function sendTestNotification() {
        try {
            error.value = null;

            if (!subscription.value) {
                throw new Error('ยังไม่ได้ subscribe');
            }

            await api.sendTestNotification(subscription.value.endpoint);
        } catch (err) {
            error.value = err.message;
            throw err;
        }
    }

    return {
        isSupported,
        isSubscribed,
        permission,
        subscription,
        error,
        requestPermission,
        subscribe,
        unsubscribe,
        sendTestNotification
    };
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
