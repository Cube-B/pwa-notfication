<!-- ╔════════════════════════════════════════════════════════════════╗
     ║                                                                ║
     ║    📱 Notification Sender Page v2.0.0 - Bootstrap Edition     ║
     ║                                                                ║
     ╚════════════════════════════════════════════════════════════════╝ -->

<template>
  <div class="p-4">
    
    <!-- Header -->
    <div class="mb-4">
      <h1 class="h2 fw-bold mb-1">
        <i class="bi bi-bell-fill text-primary me-2"></i>
        Send Notification
      </h1>
      <p class="text-muted mb-0">ส่งการแจ้งเตือนไปยังผู้ใช้</p>
    </div>

    <div class="row g-4">
      
      <!-- Left Column - Form -->
      <div class="col-12 col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            
            <!-- Template Selection -->
            <div class="mb-4">
              <label class="form-label fw-medium">
                <i class="bi bi-file-text me-2"></i>
                Template (Optional)
              </label>
              <select v-model="selectedTemplate" @change="loadTemplate" class="form-select">
                <option :value="null">-- Create from scratch --</option>
                <option v-for="template in templates" :key="template.id" :value="template">
                  {{ template.name }}
                </option>
              </select>
            </div>

            <!-- Title -->
            <div class="mb-3">
              <label class="form-label fw-medium">
                Title <span class="text-danger">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                required
                maxlength="100"
                class="form-control"
                placeholder="Enter notification title" />
              <div class="form-text">{{ form.title.length }}/100 characters</div>
            </div>

            <!-- Message -->
            <div class="mb-3">
              <label class="form-label fw-medium">
                Message <span class="text-danger">*</span>
              </label>
              <textarea
                v-model="form.message"
                required
                maxlength="500"
                rows="4"
                class="form-control"
                placeholder="Enter notification message"></textarea>
              <div class="form-text">{{ form.message.length }}/500 characters</div>
            </div>

            <!-- URL (Optional) -->
            <div class="mb-4">
              <label class="form-label fw-medium">
                Action URL (Optional)
              </label>
              <input
                v-model="form.url"
                type="url"
                class="form-control"
                placeholder="https://1klive.com" />
              <div class="form-text">URL to open when notification is clicked</div>
            </div>

            <!-- Target Selection -->
            <div class="mb-4">
              <label class="form-label fw-medium">
                <i class="bi bi-bullseye me-2"></i>
                Target Audience <span class="text-danger">*</span>
              </label>
              
              <div class="btn-group w-100 mb-3" role="group">
                <input type="radio" class="btn-check" id="target-all" value="all" v-model="form.target">
                <label class="btn btn-outline-primary" for="target-all">
                  <i class="bi bi-broadcast me-2"></i>
                  All Users ({{ stats.active }})
                </label>

                <input type="radio" class="btn-check" id="target-carriers" value="carriers" v-model="form.target">
                <label class="btn btn-outline-primary" for="target-carriers">
                  <i class="bi bi-sim me-2"></i>
                  By Carrier
                </label>

                <input type="radio" class="btn-check" id="target-devices" value="devices" v-model="form.target">
                <label class="btn btn-outline-primary" for="target-devices">
                  <i class="bi bi-phone me-2"></i>
                  By Device
                </label>
              </div>

              <!-- Carrier Selection -->
              <div v-if="form.target === 'carriers'" class="p-3 bg-light rounded mb-3">
                <label class="form-label fw-medium small">Select Carriers:</label>
                <div class="d-flex flex-wrap gap-2">
                  <div v-for="carrier in stats.carriers" :key="carrier" class="form-check">
                    <input
                      :id="`carrier-${carrier}`"
                      v-model="form.carriers"
                      :value="carrier"
                      type="checkbox"
                      class="form-check-input">
                    <label :for="`carrier-${carrier}`" class="form-check-label">
                      {{ carrier }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Device Selection -->
              <div v-if="form.target === 'devices'" class="p-3 bg-light rounded mb-3">
                <label class="form-label fw-medium small">Select Devices:</label>
                <div class="d-flex flex-wrap gap-2">
                  <div v-for="device in stats.devices" :key="device" class="form-check">
                    <input
                      :id="`device-${device}`"
                      v-model="form.devices"
                      :value="device"
                      type="checkbox"
                      class="form-check-input">
                    <label :for="`device-${device}`" class="form-check-label">
                      {{ device }}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-2">
              <button
                @click="sendNotification"
                :disabled="sending || !canSend"
                class="btn btn-primary btn-lg">
                <span v-if="sending" class="d-flex align-items-center">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Sending...
                </span>
                <span v-else>
                  <i class="bi bi-send me-2"></i>
                  Send Notification
                </span>
              </button>
              
              <button
                @click="resetForm"
                type="button"
                class="btn btn-outline-secondary btn-lg">
                <i class="bi bi-arrow-clockwise me-2"></i>
                Reset
              </button>
            </div>

          </div>
        </div>

        <!-- Result Alert -->
        <div v-if="result" class="mt-3">
          <div class="alert" :class="result.success ? 'alert-success' : 'alert-danger'" role="alert">
            <div class="d-flex align-items-center mb-2">
              <i :class="result.success ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'" class="fs-4 me-2"></i>
              <h5 class="mb-0">
                {{ result.success ? 'Notification Sent!' : 'Send Failed' }}
              </h5>
            </div>
            <p class="mb-2">{{ result.message }}</p>
            <div v-if="result.success && result.data" class="small">
              <strong>Summary:</strong><br>
              Total: {{ result.data.total }} |
              Success: {{ result.data.success }} |
              Failed: {{ result.data.failed }}
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Preview & Stats -->
      <div class="col-12 col-lg-4">
        
        <!-- Preview -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <h6 class="card-title fw-bold mb-3">
              <i class="bi bi-eye me-2"></i>
              Preview
            </h6>
            
            <!-- Notification Preview -->
            <div class="p-3 border rounded bg-light">
              <div class="d-flex align-items-start">
                <div class="flex-shrink-0 me-3">
                  <div class="rounded bg-primary bg-opacity-10 p-2">
                    <i class="bi bi-app text-primary fs-4"></i>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-bold mb-1">
                    {{ form.title || 'Notification Title' }}
                  </div>
                  <div class="small text-muted mb-2">
                    {{ form.message || 'Your message will appear here...' }}
                  </div>
                  <div v-if="form.url" class="small text-primary">
                    <i class="bi bi-link-45deg me-1"></i>
                    {{ form.url }}
                  </div>
                  <div class="small text-muted mt-1">
                    <i class="bi bi-clock me-1"></i>
                    Just now
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Target Stats -->
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="card-title fw-bold mb-3">
              <i class="bi bi-graph-up me-2"></i>
              Target Statistics
            </h6>
            
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span class="small">Total Subscriptions</span>
                <span class="fw-bold">{{ stats.total }}</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="small">Active</span>
                <span class="fw-bold text-success">{{ stats.active }}</span>
              </div>
            </div>

            <hr>

            <div class="mb-3">
              <div class="small text-muted mb-2">Recipients:</div>
              <div class="h3 fw-bold text-primary mb-0">
                {{ estimatedRecipients }}
              </div>
              <div class="small text-muted">
                {{ form.target === 'all' ? 'All active users' :
                   form.target === 'carriers' ? `Selected carriers (${form.carriers.length})` :
                   form.target === 'devices' ? `Selected devices (${form.devices.length})` : '' }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const BACKEND_URL = 'http://localhost:3000'

const templates = ref([])
const selectedTemplate = ref(null)
const stats = ref({
  total: 0,
  active: 0,
  carriers: [],
  devices: []
})

const form = ref({
  title: '',
  message: '',
  url: '',
  target: 'all',
  carriers: [],
  devices: []
})

const sending = ref(false)
const result = ref(null)

// Can send?
const canSend = computed(() => {
  if (!form.value.title || !form.value.message) return false
  if (form.value.target === 'carriers' && form.value.carriers.length === 0) return false
  if (form.value.target === 'devices' && form.value.devices.length === 0) return false
  return true
})

// Estimated recipients
const estimatedRecipients = computed(() => {
  if (form.value.target === 'all') {
    return stats.value.active
  }
  // For simplicity, return active count
  // In production, you'd calculate based on selected carriers/devices
  return stats.value.active
})

// Fetch templates
const fetchTemplates = async () => {
  try {
    const token = localStorage.getItem('adminToken')
    const response = await fetch(`${BACKEND_URL}/api/admin/notifications/templates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    if (data.success) {
      templates.value = data.templates
    }
  } catch (error) {
    console.error('❌ Fetch templates error:', error)
  }
}

// Fetch stats
const fetchStats = async () => {
  try {
    const token = localStorage.getItem('adminToken')
    const response = await fetch(`${BACKEND_URL}/api/admin/notifications/subscriptions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    if (data.success) {
      stats.value = data.data
    }
  } catch (error) {
    console.error('❌ Fetch stats error:', error)
  }
}

// Load template
const loadTemplate = () => {
  if (selectedTemplate.value) {
    form.value.title = selectedTemplate.value.title
    form.value.message = selectedTemplate.value.message
    form.value.url = selectedTemplate.value.url || ''
  }
}

// Send notification
const sendNotification = async () => {
  sending.value = true
  result.value = null
  
  try {
    const token = localStorage.getItem('adminToken')
    
    const endpoint = form.value.target === 'all' 
      ? '/api/admin/notifications/broadcast'
      : '/api/admin/notifications/send'
    
    const payload = {
      title: form.value.title,
      message: form.value.message,
      url: form.value.url || null,
      target: form.value.target,
      carriers: form.value.carriers,
      devices: form.value.devices
    }
    
    console.log('📤 Sending notification:', payload)
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    const data = await response.json()
    
    if (data.success) {
      result.value = {
        success: true,
        message: 'Notification sent successfully!',
        data: data.data
      }
      
      // Reset form after success
      setTimeout(() => {
        resetForm()
        result.value = null
      }, 5000)
      
    } else {
      result.value = {
        success: false,
        message: data.error || 'Failed to send notification'
      }
    }
    
  } catch (error) {
    console.error('❌ Send error:', error)
    result.value = {
      success: false,
      message: 'Network error. Please try again.'
    }
  } finally {
    sending.value = false
  }
}

// Reset form
const resetForm = () => {
  form.value = {
    title: '',
    message: '',
    url: '',
    target: 'all',
    carriers: [],
    devices: []
  }
  selectedTemplate.value = null
}

onMounted(() => {
  fetchTemplates()
  fetchStats()
})
</script>

<style scoped>
.btn-check:checked + .btn-outline-primary {
  background-color: var(--bs-primary);
  color: white;
}
</style>