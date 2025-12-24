<!-- ╔════════════════════════════════════════════════════════════════╗
     ║                                                                ║
     ║    ⚙️ Settings Editor Page v2.0.0 - Bootstrap Edition         ║
     ║                                                                ║
     ╚════════════════════════════════════════════════════════════════╝ -->

<template>
  <div class="p-4">
    
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 fw-bold mb-1">
          <i class="bi bi-gear-fill text-primary me-2"></i>
          PWA Settings
        </h1>
        <p class="text-muted mb-0">จัดการการตั้งค่า PWA</p>
      </div>
      <div class="d-flex gap-2">
        <button
          @click="confirmReset"
          class="btn btn-outline-danger">
          <i class="bi bi-arrow-clockwise me-2"></i>
          Reset to Default
        </button>
        <button
          @click="saveSettings"
          :disabled="saving || !hasChanges"
          class="btn btn-primary">
          <span v-if="saving">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Saving...
          </span>
          <span v-else>
            <i class="bi bi-check-circle me-2"></i>
            Save Changes
          </span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <!-- Settings Form -->
    <div v-else class="row g-4">
      
      <!-- Left Column - Form -->
      <div class="col-12 col-lg-8">
        
        <!-- Category Tabs -->
        <ul class="nav nav-tabs mb-4" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'branding' }"
              @click="activeTab = 'branding'"
              type="button">
              <i class="bi bi-palette me-2"></i>
              Branding
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'urls' }"
              @click="activeTab = 'urls'"
              type="button">
              <i class="bi bi-link-45deg me-2"></i>
              URLs
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'notification' }"
              @click="activeTab = 'notification'"
              type="button">
              <i class="bi bi-bell me-2"></i>
              Notification
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'health' }"
              @click="activeTab = 'health'"
              type="button">
              <i class="bi bi-heart-pulse me-2"></i>
              Health Check
            </button>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            
            <!-- Branding Tab -->
            <div v-show="activeTab === 'branding'">
              <h5 class="fw-bold mb-3">Branding & Appearance</h5>
              
              <div class="mb-3">
                <label class="form-label fw-medium">App Name</label>
                <input v-model="form.app_name" type="text" class="form-control" />
                <small class="form-text text-muted">Full application name</small>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Short Name</label>
                <input v-model="form.app_short_name" type="text" class="form-control" maxlength="12" />
                <small class="form-text text-muted">Max 12 characters (for home screen)</small>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Description</label>
                <textarea v-model="form.app_description" class="form-control" rows="2"></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Logo URL</label>
                <input v-model="form.logo_url" type="url" class="form-control" />
                <small class="form-text text-muted">URL to your logo image</small>
              </div>

              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label fw-medium">Primary Color</label>
                  <div class="input-group">
                    <input v-model="form.primary_color" type="color" class="form-control form-control-color" />
                    <input v-model="form.primary_color" type="text" class="form-control" />
                  </div>
                </div>

                <div class="col-6 mb-3">
                  <label class="form-label fw-medium">Secondary Color</label>
                  <div class="input-group">
                    <input v-model="form.secondary_color" type="color" class="form-control form-control-color" />
                    <input v-model="form.secondary_color" type="text" class="form-control" />
                  </div>
                </div>

                <div class="col-6 mb-3">
                  <label class="form-label fw-medium">Background Color</label>
                  <div class="input-group">
                    <input v-model="form.background_color" type="color" class="form-control form-control-color" />
                    <input v-model="form.background_color" type="text" class="form-control" />
                  </div>
                </div>

                <div class="col-6 mb-3">
                  <label class="form-label fw-medium">Theme Color</label>
                  <div class="input-group">
                    <input v-model="form.theme_color" type="color" class="form-control form-control-color" />
                    <input v-model="form.theme_color" type="text" class="form-control" />
                  </div>
                </div>
              </div>
            </div>

            <!-- URLs Tab -->
            <div v-show="activeTab === 'urls'">
              <h5 class="fw-bold mb-3">URLs & Links</h5>
              
              <div class="mb-3">
                <label class="form-label fw-medium">Start URL</label>
                <input v-model="form.start_url" type="text" class="form-control" />
                <small class="form-text text-muted">PWA start path (e.g., /)</small>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Home URL</label>
                <input v-model="form.home_url" type="url" class="form-control" />
                <small class="form-text text-muted">Main website URL</small>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Support URL</label>
                <input v-model="form.support_url" type="url" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Terms & Conditions URL</label>
                <input v-model="form.terms_url" type="url" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Privacy Policy URL</label>
                <input v-model="form.privacy_url" type="url" class="form-control" />
              </div>
            </div>

            <!-- Notification Tab -->
            <div v-show="activeTab === 'notification'">
              <h5 class="fw-bold mb-3">Notification Settings</h5>
              
              <div class="mb-3">
                <label class="form-label fw-medium">Notification Icon URL</label>
                <input v-model="form.notification_icon_url" type="url" class="form-control" />
                <small class="form-text text-muted">Icon for push notifications</small>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Welcome Title</label>
                <input v-model="form.welcome_title" type="text" class="form-control" />
                <small class="form-text text-muted">Title for welcome notification</small>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Welcome Message</label>
                <textarea v-model="form.welcome_message" class="form-control" rows="3"></textarea>
                <small class="form-text text-muted">Message for welcome notification</small>
              </div>
            </div>

            <!-- Health Check Tab -->
            <div v-show="activeTab === 'health'">
              <h5 class="fw-bold mb-3">Health Check Configuration</h5>
              
              <div class="mb-3">
                <div class="form-check form-switch">
                  <input
                    v-model="form.health_check_enabled"
                    type="checkbox"
                    class="form-check-input"
                    id="healthCheckSwitch">
                  <label class="form-check-label fw-medium" for="healthCheckSwitch">
                    Enable Health Check
                  </label>
                </div>
                <small class="form-text text-muted">Monitor service worker health</small>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Check Interval (seconds)</label>
                <input v-model.number="form.health_check_interval" type="number" class="form-control" min="60" />
                <small class="form-text text-muted">How often to check (minimum 60s)</small>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Health Check URL</label>
                <input v-model="form.health_check_url" type="url" class="form-control" />
                <small class="form-text text-muted">Endpoint to check</small>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Timeout (seconds)</label>
                <input v-model.number="form.health_check_timeout" type="number" class="form-control" min="5" max="30" />
                <small class="form-text text-muted">Request timeout (5-30s)</small>
              </div>
            </div>

          </div>
        </div>

        <!-- Success Alert -->
        <div v-if="saveSuccess" class="alert alert-success mt-3">
          <i class="bi bi-check-circle me-2"></i>
          Settings saved successfully!
        </div>

      </div>

      <!-- Right Column - Preview -->
      <div class="col-12 col-lg-4">
        <div class="card border-0 shadow-sm sticky-top" style="top: 1rem;">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-eye me-2"></i>
              Preview
            </h6>
            
            <!-- App Preview -->
            <div class="p-3 border rounded bg-light mb-3">
              <div class="d-flex align-items-center mb-2">
                <img
                  :src="form.logo_url || 'https://via.placeholder.com/40'"
                  alt="Logo"
                  class="rounded me-2"
                  style="width: 40px; height: 40px; object-fit: cover;"
                  @error="$event.target.src='https://via.placeholder.com/40'" />
                <div>
                  <div class="fw-bold">{{ form.app_name || 'App Name' }}</div>
                  <small class="text-muted">{{ form.app_short_name || 'Short' }}</small>
                </div>
              </div>
              <p class="small text-muted mb-0">{{ form.app_description || 'Description' }}</p>
            </div>

            <!-- Color Preview -->
            <div class="mb-3">
              <label class="small fw-medium d-block mb-2">Colors:</label>
              <div class="d-flex gap-2">
                <div class="flex-grow-1 text-center">
                  <div
                    class="rounded mb-1"
                    :style="{ backgroundColor: form.primary_color, height: '40px' }"></div>
                  <small class="text-muted">Primary</small>
                </div>
                <div class="flex-grow-1 text-center">
                  <div
                    class="rounded mb-1"
                    :style="{ backgroundColor: form.secondary_color, height: '40px' }"></div>
                  <small class="text-muted">Secondary</small>
                </div>
              </div>
            </div>

            <!-- Notification Preview -->
            <div class="p-3 border rounded bg-light">
              <div class="d-flex align-items-start">
                <div class="me-2">
                  <div class="rounded bg-primary bg-opacity-10 p-2">
                    <i class="bi bi-bell-fill text-primary"></i>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-bold small">{{ form.welcome_title || 'Welcome!' }}</div>
                  <div class="small text-muted">{{ form.welcome_message || 'Thank you for subscribing' }}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- Reset Confirmation Modal -->
    <div class="modal fade" id="resetModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger bg-opacity-10">
            <h5 class="modal-title text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Confirm Reset
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to reset all settings to default values?</p>
            <p class="text-danger mb-0">This action cannot be undone!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button
              @click="resetSettings"
              :disabled="resetting"
              class="btn btn-danger">
              <span v-if="resetting">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Resetting...
              </span>
              <span v-else>
                <i class="bi bi-arrow-clockwise me-2"></i>
                Reset
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const BACKEND_URL = 'http://localhost:3000'

// Bootstrap Modal from CDN
const Modal = window.bootstrap?.Modal

const loading = ref(true)
const error = ref('')
const activeTab = ref('branding')

const originalSettings = ref({})
const form = ref({
  app_name: '',
  app_short_name: '',
  app_description: '',
  logo_url: '',
  primary_color: '#667eea',
  secondary_color: '#764ba2',
  background_color: '#ffffff',
  theme_color: '#667eea',
  start_url: '/',
  home_url: '',
  support_url: '',
  terms_url: '',
  privacy_url: '',
  notification_icon_url: '',
  welcome_title: '',
  welcome_message: '',
  health_check_enabled: true,
  health_check_interval: 300,
  health_check_url: '',
  health_check_timeout: 10
})

const saving = ref(false)
const saveSuccess = ref(false)
const resetting = ref(false)

let resetModal = null

// Has changes?
const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(originalSettings.value)
})

// Fetch settings
const fetchSettings = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('adminToken')
    
    const response = await fetch(`${BACKEND_URL}/api/admin/settings/pwa`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Flatten settings
      const flattened = {}
      Object.values(data.settings).forEach(category => {
        Object.entries(category).forEach(([key, obj]) => {
          // Handle boolean conversion
          if (key === 'health_check_enabled') {
            flattened[key] = obj.value === 'true' || obj.value === true
          } else if (key === 'health_check_interval' || key === 'health_check_timeout') {
            flattened[key] = parseInt(obj.value) || 0
          } else {
            flattened[key] = obj.value
          }
        })
      })
      
      form.value = { ...form.value, ...flattened }
      originalSettings.value = { ...form.value }
    } else {
      error.value = data.error || 'Failed to load settings'
    }
    
  } catch (err) {
    console.error('❌ Fetch settings error:', err)
    error.value = 'Failed to load settings'
  } finally {
    loading.value = false
  }
}

// Save settings
const saveSettings = async () => {
  saving.value = true
  saveSuccess.value = false
  
  try {
    const token = localStorage.getItem('adminToken')
    
    // Convert boolean to string for health_check_enabled
    const payload = { ...form.value }
    payload.health_check_enabled = payload.health_check_enabled ? 'true' : 'false'
    payload.health_check_interval = payload.health_check_interval.toString()
    payload.health_check_timeout = payload.health_check_timeout.toString()
    
    const response = await fetch(`${BACKEND_URL}/api/admin/settings/pwa`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ settings: payload })
    })
    
    const data = await response.json()
    
    if (data.success) {
      originalSettings.value = { ...form.value }
      saveSuccess.value = true
      
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      error.value = data.error || 'Failed to save settings'
    }
    
  } catch (err) {
    console.error('❌ Save settings error:', err)
    error.value = 'Network error'
  } finally {
    saving.value = false
  }
}

// Confirm reset
const confirmReset = () => {
  if (!resetModal) {
    resetModal = new Modal(document.getElementById('resetModal'))
  }
  resetModal.show()
}

// Reset settings
const resetSettings = async () => {
  resetting.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    
    const response = await fetch(`${BACKEND_URL}/api/admin/settings/pwa/reset`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    const data = await response.json()
    
    if (data.success) {
      resetModal.hide()
      await fetchSettings() // Reload settings
      saveSuccess.value = true
      
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    }
    
  } catch (err) {
    console.error('❌ Reset settings error:', err)
  } finally {
    resetting.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.nav-tabs .nav-link {
  border: none;
  color: var(--bs-secondary);
}

.nav-tabs .nav-link.active {
  color: var(--bs-primary);
  border-bottom: 2px solid var(--bs-primary);
  background: transparent;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  color: var(--bs-primary);
}
</style>