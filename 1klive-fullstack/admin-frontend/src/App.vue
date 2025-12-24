<!-- ╔════════════════════════════════════════════════════════════════╗
     ║                                                                ║
     ║    🎯 Admin Dashboard App v2.0.0 - Bootstrap Edition          ║
     ║                                                                ║
     ╚════════════════════════════════════════════════════════════════╝ -->

<template>
  <div :data-bs-theme="isDark ? 'dark' : 'light'">
    
    <!-- Show Login if not authenticated -->
    <AdminLogin v-if="!isAuthenticated" />

    <!-- Show Dashboard if authenticated -->
    <div v-else class="d-flex min-vh-100">
      
      <!-- Sidebar -->
      <div class="sidebar bg-body-secondary border-end" style="width: 260px;">
        
        <!-- Logo -->
        <div class="p-3 border-bottom">
          <div class="d-flex align-items-center">
            <div class="d-flex align-items-center justify-content-center rounded bg-primary" 
                 style="width: 40px; height: 40px;">
              <i class="bi bi-lightning-charge-fill text-white fs-5"></i>
            </div>
            <div class="ms-2">
              <div class="fw-bold">1klive</div>
              <div class="small text-muted">Admin Panel</div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="p-2">
          <ul class="nav flex-column gap-1">
            <li class="nav-item">
              <a href="#dashboard"
                 @click.prevent="currentPage = 'dashboard'"
                 class="nav-link d-flex align-items-center rounded"
                 :class="currentPage === 'dashboard' ? 'active bg-primary text-white' : 'text-body'">
                <i class="bi bi-house-door-fill me-2"></i>
                Dashboard
              </a>
            </li>

            <li class="nav-item">
              <a href="#notifications"
                 @click.prevent="currentPage = 'notifications'"
                 class="nav-link d-flex align-items-center rounded"
                 :class="currentPage === 'notifications' ? 'active bg-primary text-white' : 'text-body'">
                <i class="bi bi-bell-fill me-2"></i>
                Notifications
              </a>
            </li>

            <li class="nav-item">
              <a href="#subscriptions"
                 @click.prevent="currentPage = 'subscriptions'"
                 class="nav-link d-flex align-items-center rounded"
                 :class="currentPage === 'subscriptions' ? 'active bg-primary text-white' : 'text-body'">
                <i class="bi bi-person-badge-fill me-2"></i>
                Subscriptions
              </a>
            </li>

            <li class="nav-item">
              <a href="#history"
                 @click.prevent="currentPage = 'history'"
                 class="nav-link d-flex align-items-center rounded"
                 :class="currentPage === 'history' ? 'active bg-primary text-white' : 'text-body'">
                <i class="bi bi-clock-history me-2"></i>
                History
              </a>
            </li>

            <li class="nav-item">
              <a href="#activity"
                 @click.prevent="currentPage = 'activity'"
                 class="nav-link d-flex align-items-center rounded"
                 :class="currentPage === 'activity' ? 'active bg-primary text-white' : 'text-body'">
                <i class="bi bi-activity me-2"></i>
                Activity
              </a>
            </li>

            <li class="nav-item">
              <a href="#admins"
                 @click.prevent="currentPage = 'admins'"
                 class="nav-link d-flex align-items-center rounded"
                 :class="currentPage === 'admins' ? 'active bg-primary text-white' : 'text-body'">
                <i class="bi bi-people-fill me-2"></i>
                Admins
              </a>
            </li>

            <li class="nav-item">
              <a href="#settings"
                 @click.prevent="currentPage = 'settings'"
                 class="nav-link d-flex align-items-center rounded"
                 :class="currentPage === 'settings' ? 'active bg-primary text-white' : 'text-body'">
                <i class="bi bi-gear-fill me-2"></i>
                Settings
              </a>
            </li>
          </ul>
        </nav>

        <!-- Bottom Section -->
        <div class="position-absolute bottom-0 w-100 p-2 border-top" style="width: 260px;">
          
          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="btn w-100 mb-2 d-flex align-items-center justify-content-center"
            :class="isDark ? 'btn-secondary' : 'btn-outline-secondary'">
            <i :class="isDark ? 'bi bi-sun-fill text-warning me-2' : 'bi bi-moon-fill me-2'"></i>
            {{ isDark ? 'Light Mode' : 'Dark Mode' }}
          </button>

          <!-- User Info -->
          <div class="d-flex align-items-center justify-content-between p-2 rounded bg-body-tertiary">
            <div class="d-flex align-items-center">
              <div class="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                   style="width: 32px; height: 32px; font-size: 14px;">
                {{ adminUser?.username?.charAt(0).toUpperCase() }}
              </div>
              <div class="ms-2 small">
                <div class="fw-medium">{{ adminUser?.username }}</div>
                <div class="text-muted" style="font-size: 0.75rem;">{{ adminUser?.role }}</div>
              </div>
            </div>
            <button
              @click="handleLogout"
              class="btn btn-sm btn-outline-danger border-0"
              title="Logout">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>

      </div>

      <!-- Main Content -->
      <div class="flex-grow-1 overflow-auto bg-body">
        
        <!-- Page Content -->
        <DashboardOverview v-if="currentPage === 'dashboard'" />
        <NotificationSender v-else-if="currentPage === 'notifications'" />
        <SubscriptionManagement v-else-if="currentPage === 'subscriptions'" />
        <NotificationHistory v-else-if="currentPage === 'history'" />
        <ActivityLogs v-else-if="currentPage === 'activity'" />
        <AdminManagement v-else-if="currentPage === 'admins'" />
        <SettingsEditor v-else-if="currentPage === 'settings'" />
        
        <!-- Other pages (coming soon) -->
        <div v-else class="p-4">
          <div class="text-center py-5">
            <i class="bi bi-hammer fs-1 text-muted mb-3 d-block"></i>
            <h2 class="h3 fw-bold mb-2">Coming Soon</h2>
            <p class="text-muted">This page is under development</p>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLogin from './components/AdminLogin.vue'
import DashboardOverview from './components/DashboardOverview.vue'
import NotificationSender from './components/NotificationSender.vue'
import AdminManagement from './components/AdminManagement.vue'
import SettingsEditor from './components/SettingsEditor.vue'
import SubscriptionManagement from './components/SubscriptionManagement.vue'
import NotificationHistory from './components/NotificationHistory.vue'
import ActivityLogs from './components/ActivityLogs.vue'

const isAuthenticated = ref(false)
const adminUser = ref(null)
const currentPage = ref('dashboard')
const isDark = ref(false)

// Check authentication on mount
onMounted(() => {
  const token = localStorage.getItem('adminToken')
  const user = localStorage.getItem('adminUser')
  const darkMode = localStorage.getItem('adminDarkMode')
  
  if (token && user) {
    isAuthenticated.value = true
    adminUser.value = JSON.parse(user)
  }
  
  isDark.value = darkMode === 'true'
  updateTheme()
  
  // Listen for login event
  window.addEventListener('admin-login', handleLoginEvent)
})

// Handle login event
const handleLoginEvent = (event) => {
  console.log('✅ Login event received:', event.detail)
  isAuthenticated.value = true
  adminUser.value = event.detail.admin
}

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

// Handle logout
const handleLogout = () => {
  if (confirm('ต้องการออกจากระบบหรือไม่?')) {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    isAuthenticated.value = false
    adminUser.value = null
    console.log('✅ Logged out')
  }
}
</script>

<style scoped>
.sidebar {
  position: relative;
  min-height: 100vh;
}

.nav-link {
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
}

.nav-link:hover:not(.active):not(.opacity-50) {
  background-color: var(--bs-secondary-bg);
}

.nav-link.active {
  font-weight: 600;
}
</style>