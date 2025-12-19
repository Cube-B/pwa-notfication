const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async getVapidPublicKey() {
        return await this.request('/notifications/vapid-public-key');
    }

    async subscribe(subscription, userId = null) {
        return await this.request('/notifications/subscribe', {
            method: 'POST',
            body: JSON.stringify({ subscription, userId })
        });
    }

    async unsubscribe(endpoint) {
        return await this.request('/notifications/unsubscribe', {
            method: 'POST',
            body: JSON.stringify({ endpoint })
        });
    }

    async sendTestNotification(endpoint) {
        return await this.request('/notifications/send', {
            method: 'POST',
            body: JSON.stringify({
                title: '🎰 เฮงเฮง888',
                body: 'ทดสอบการแจ้งเตือน - สำเร็จ! 🎉',
                icon: '/logo.png'
            })
        });
    }

    async getNotificationStats() {
        return await this.request('/notifications/stats');
    }
}

export default new ApiService(API_BASE_URL);
