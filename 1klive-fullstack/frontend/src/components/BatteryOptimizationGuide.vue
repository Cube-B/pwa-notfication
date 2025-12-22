<template>
  <div v-if="showGuide" class="battery-guide-overlay">
    <div class="battery-guide-modal">
      <button class="close-btn" @click="closeGuide">✕</button>
      
      <div class="guide-header">
        <div class="icon">⚡</div>
        <h2>วิธีรับการแจ้งเตือนแม้ปิดหน้าจอ</h2>
        <p class="subtitle">ใช้เวลาแค่ 30 วินาที</p>
      </div>

      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>เปิด Settings</h3>
            <p>กดที่ไอคอน Settings บนมือถือ</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>ไปที่ Apps</h3>
            <p>เลือก <strong>Apps</strong> → หา <strong>1klive</strong></p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>เลือก Battery</h3>
            <p>แตะที่ <strong>Battery</strong></p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>เลือก Unrestricted</h3>
            <p>เปลี่ยนเป็น <strong>Unrestricted</strong></p>
          </div>
        </div>
      </div>

      <div class="guide-footer">
        <button class="btn-primary" @click="understood">เข้าใจแล้ว</button>
        <button class="btn-secondary" @click="remindLater">เตือนภายหลัง</button>
      </div>

      <div class="note">
        <small>💡 การตั้งค่านี้ช่วยให้คุณไม่พลาดการแจ้งเตือนสำคัญ</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showGuide = ref(false)

const props = defineProps({
  autoShow: {
    type: Boolean,
    default: true
  }
})

onMounted(() => {
  // เช็คว่าเคยแสดงไปแล้วหรือยัง
  const hasSeenGuide = localStorage.getItem('battery_guide_seen')
  const remindAt = localStorage.getItem('battery_guide_remind_at')
  
  if (props.autoShow && !hasSeenGuide) {
    // แสดงหลัง 2 วินาที
    setTimeout(() => {
      showGuide.value = true
    }, 2000)
  } else if (remindAt && Date.now() > parseInt(remindAt)) {
    // ถึงเวลาเตือนแล้ว
    setTimeout(() => {
      showGuide.value = true
    }, 2000)
  }
})

function closeGuide() {
  showGuide.value = false
}

function understood() {
  localStorage.setItem('battery_guide_seen', 'true')
  localStorage.removeItem('battery_guide_remind_at')
  showGuide.value = false
}

function remindLater() {
  // เตือนอีกครั้งใน 24 ชั่วโมง
  const remindAt = Date.now() + (24 * 60 * 60 * 1000)
  localStorage.setItem('battery_guide_remind_at', remindAt.toString())
  showGuide.value = false
}
</script>

<style scoped>
.battery-guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.battery-guide-modal {
  background: #1a1a2e;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 30px;
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.guide-header {
  text-align: center;
  margin-bottom: 30px;
}

.icon {
  font-size: 60px;
  margin-bottom: 15px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.guide-header h2 {
  color: white;
  margin: 0 0 10px 0;
  font-size: 24px;
}

.subtitle {
  color: #888;
  margin: 0;
  font-size: 14px;
}

.steps {
  margin: 30px 0;
}

.step {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  transition: all 0.3s;
}

.step:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.step-content h3 {
  color: white;
  margin: 0 0 8px 0;
  font-size: 18px;
}

.step-content p {
  color: #aaa;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.step-content strong {
  color: #667eea;
}

.guide-footer {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.note {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.note small {
  color: #888;
  font-size: 12px;
}

/* Scrollbar */
.battery-guide-modal::-webkit-scrollbar {
  width: 8px;
}

.battery-guide-modal::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.battery-guide-modal::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.battery-guide-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>