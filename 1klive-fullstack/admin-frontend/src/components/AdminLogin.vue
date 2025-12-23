<!-- ╔════════════════════════════════════════════════════════════════╗
     ║                                                                ║
     ║    🔐 Admin Login Page v2.0.0 - Bootstrap Edition             ║
     ║                                                                ║
     ╚════════════════════════════════════════════════════════════════╝ -->

<template>
  <div class="gradient-bg d-flex align-items-center justify-content-center min-vh-100 px-3">
    
    <!-- Dark Mode Toggle -->
    <button
      @click="toggleDarkMode"
      class="theme-toggle btn shadow"
      :class="isDark ? 'btn-dark' : 'btn-light'">
      <i :class="isDark ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-fill'"></i>
    </button>

    <!-- Login Card -->
    <div class="login-card w-100">
      <div class="card shadow-lg border-0">
        
        <!-- Header -->
        <div class="card-header text-center bg-white border-0 py-4">
          <div class="mb-3">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 p-3"
                 style="width: 80px; height: 80px;">
              <i class="bi bi-shield-lock-fill text-primary" style="font-size: 2.5rem;"></i>
            </div>
          </div>
          <h1 class="h3 fw-bold mb-2">1klive Admin</h1>
          <p class="text-muted mb-0">เข้าสู่ระบบจัดการ</p>
        </div>

        <!-- Form -->
        <div class="card-body p-4">
          
          <!-- Error Message -->
          <div v-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-circle-fill me-2"></i>
            <div>{{ error }}</div>
          </div>

          <form @submit.prevent="handleLogin">
            
            <!-- Username -->
            <div class="mb-3">
              <label class="form-label fw-medium">ชื่อผู้ใช้</label>
              <input
                v-model="username"
                type="text"
                required
                class="form-control form-control-lg"
                placeholder="admin" />
            </div>

            <!-- Password -->
            <div class="mb-4">
              <label class="form-label fw-medium">รหัสผ่าน</label>
              <input
                v-model="password"
                type="password"
                required
                class="form-control form-control-lg"
                placeholder="••••••••" />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="btn btn-primary btn-lg w-100 fw-medium">
              <span v-if="loading" class="d-flex align-items-center justify-content-center">
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                กำลังเข้าสู่ระบบ...
              </span>
              <span v-else>เข้าสู่ระบบ</span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <div class="card-footer text-center bg-light border-0 py-3">
          <small class="text-muted">© 2024 1klive. All rights reserved.</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const BACKEND_URL = 'http://localhost:3000'

const username = ref('admin')
const password = ref('admin123')
const loading = ref(false)
const error = ref('')
const isDark = ref(false)

// Load dark mode preference
onMounted(() => {
  const savedDarkMode = localStorage.getItem('adminDarkMode')
  isDark.value = savedDarkMode === 'true'
  updateTheme()
  
  // Pre-fill username if saved
  const savedUsername = localStorage.getItem('adminUsername')
  if (savedUsername) {
    username.value = savedUsername
  }
})

// Update theme
const updateTheme = () => {
  const html = document.documentElement
  html.setAttribute('data-bs-theme', isDark.value ? 'dark' : 'light')
}

// Toggle dark mode
const toggleDarkMode = () => {
  isDark.value = !isDark.value
  localStorage.setItem('adminDarkMode', isDark.value.toString())
  updateTheme()
}

// Handle login
const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    console.log('🔐 Attempting login...')
    
    const response = await fetch(`${BACKEND_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Login successful')
      
      // Save token and user info
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminUser', JSON.stringify(data.admin))
      localStorage.setItem('adminUsername', username.value)
      
      // Emit login event
      window.dispatchEvent(new CustomEvent('admin-login', { detail: data }))
      
    } else {
      console.error('❌ Login failed:', data.error)
      error.value = data.error || 'เข้าสู่ระบบไม่สำเร็จ'
    }
    
  } catch (err) {
    console.error('❌ Login error:', err)
    error.value = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Additional custom styles */
.login-card {
  max-width: 420px;
}

.theme-toggle {
  width: 3rem;
  height: 3rem;
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.theme-toggle:hover {
  transform: scale(1.1);
}
</style>