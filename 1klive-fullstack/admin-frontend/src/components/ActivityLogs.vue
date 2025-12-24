<!-- ╔════════════════════════════════════════════════════════════════╗
     ║                                                                ║
     ║    📜 Activity Logs Viewer v2.0.0 - Bootstrap Edition         ║
     ║                                                                ║
     ╚════════════════════════════════════════════════════════════════╝ -->

<template>
  <div class="p-4">
    
    <!-- Header -->
    <div class="mb-4">
      <h1 class="h2 fw-bold mb-1">
        <i class="bi bi-activity text-primary me-2"></i>
        Activity Logs
      </h1>
      <p class="text-muted mb-0">ดูประวัติการทำงานของ admins</p>
    </div>

    <!-- Activity Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        
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

        <!-- Table -->
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th style="width: 50px;"></th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Admin</th>
                  <th>Details</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in activities" :key="log.id">
                  <td>
                    <i :class="getActionIcon(log.action)" class="fs-5" :style="{ color: getActionColor(log.action) }"></i>
                  </td>
                  <td>
                    <span class="badge" :class="getActionBadge(log.action)">
                      {{ getActionLabel(log.action) }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">
                      {{ log.entity_type || '-' }}
                      <span v-if="log.entity_id" class="font-monospace">#{{ log.entity_id }}</span>
                    </small>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                           style="width: 28px; height: 28px; font-size: 12px;">
                        {{ (log.username || 'U').charAt(0).toUpperCase() }}
                      </div>
                      <small>{{ log.username || 'Unknown' }}</small>
                    </div>
                  </td>
                  <td>
                    <button
                      v-if="log.details"
                      @click="viewDetails(log)"
                      class="btn btn-sm btn-link p-0 text-decoration-none">
                      <small>View details</small>
                      <i class="bi bi-chevron-right"></i>
                    </button>
                    <small v-else class="text-muted">-</small>
                  </td>
                  <td>
                    <small class="text-muted">{{ formatDate(log.created_at) }}</small>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div v-if="activities.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
              <p>No activity logs found</p>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="hasMore" class="text-center mt-3">
            <button
              @click="loadMore"
              :disabled="loadingMore"
              class="btn btn-outline-primary">
              <span v-if="loadingMore">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Loading...
              </span>
              <span v-else>
                <i class="bi bi-arrow-down-circle me-2"></i>
                Load More
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Details Modal -->
    <div class="modal fade" id="detailsModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-info-circle me-2"></i>
              Activity Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedActivity">
            
            <div class="mb-3">
              <label class="small text-muted d-block mb-1">Action:</label>
              <span class="badge" :class="getActionBadge(selectedActivity.action)">
                {{ getActionLabel(selectedActivity.action) }}
              </span>
            </div>

            <div class="mb-3">
              <label class="small text-muted d-block mb-1">Performed by:</label>
              <strong>{{ selectedActivity.username || 'Unknown' }}</strong>
            </div>

            <div class="mb-3">
              <label class="small text-muted d-block mb-1">Entity:</label>
              {{ selectedActivity.entity_type || '-' }}
              <span v-if="selectedActivity.entity_id" class="font-monospace">#{{ selectedActivity.entity_id }}</span>
            </div>

            <div class="mb-3">
              <label class="small text-muted d-block mb-1">Date & Time:</label>
              {{ formatDateFull(selectedActivity.created_at) }}
            </div>

            <div v-if="selectedActivity.details">
              <label class="small text-muted d-block mb-1">Details:</label>
              <pre class="bg-light p-3 rounded"><code>{{ formatDetails(selectedActivity.details) }}</code></pre>
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const BACKEND_URL = 'http://localhost:3000'

// Bootstrap Modal from CDN
const Modal = window.bootstrap?.Modal

const activities = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const hasMore = ref(false)

const limit = ref(20)
const offset = ref(0)

const selectedActivity = ref(null)

let detailsModal = null

// Fetch activities
const fetchActivities = async (append = false) => {
  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
  }
  
  error.value = ''
  
  try {
    const token = localStorage.getItem('adminToken')
    
    const params = new URLSearchParams({
      limit: limit.value,
      offset: offset.value
    })
    
    const response = await fetch(
      `${BACKEND_URL}/api/admin/dashboard/recent?${params}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    )
    
    const data = await response.json()
    
    if (data.success) {
      if (append) {
        activities.value = [...activities.value, ...data.activities]
      } else {
        activities.value = data.activities
      }
      
      hasMore.value = data.activities.length >= limit.value
    } else {
      error.value = data.error || 'Failed to load activities'
    }
    
  } catch (err) {
    console.error('❌ Fetch activities error:', err)
    error.value = 'Failed to load activity logs'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// Load more
const loadMore = () => {
  offset.value += limit.value
  fetchActivities(true)
}

// View details
const viewDetails = (activity) => {
  selectedActivity.value = activity
  
  if (!detailsModal) {
    detailsModal = new Modal(document.getElementById('detailsModal'))
  }
  detailsModal.show()
}

// Get action icon
const getActionIcon = (action) => {
  const icons = {
    'login': 'bi bi-box-arrow-in-right',
    'logout': 'bi bi-box-arrow-right',
    'create_admin': 'bi bi-person-plus-fill',
    'update_admin': 'bi bi-person-fill-gear',
    'delete_admin': 'bi bi-person-dash-fill',
    'change_password': 'bi bi-key-fill',
    'send_notification': 'bi bi-send-fill',
    'broadcast_notification': 'bi bi-broadcast',
    'create_template': 'bi bi-file-earmark-plus',
    'update_pwa_settings': 'bi bi-gear-fill',
    'update_system_settings': 'bi bi-sliders',
    'delete_subscription': 'bi bi-trash-fill',
    'bulk_delete_subscriptions': 'bi bi-trash3-fill',
    'toggle_subscription': 'bi bi-toggle-on'
  }
  return icons[action] || 'bi bi-dot'
}

// Get action color
const getActionColor = (action) => {
  if (action.includes('delete')) return '#dc3545'
  if (action.includes('create')) return '#198754'
  if (action.includes('update')) return '#0d6efd'
  if (action.includes('send') || action.includes('broadcast')) return '#fd7e14'
  if (action === 'login') return '#198754'
  if (action === 'logout') return '#6c757d'
  return '#6c757d'
}

// Get action badge
const getActionBadge = (action) => {
  if (action.includes('delete')) return 'bg-danger'
  if (action.includes('create')) return 'bg-success'
  if (action.includes('update')) return 'bg-primary'
  if (action.includes('send') || action.includes('broadcast')) return 'bg-warning'
  if (action === 'login') return 'bg-success'
  if (action === 'logout') return 'bg-secondary'
  return 'bg-secondary'
}

// Get action label
const getActionLabel = (action) => {
  const labels = {
    'login': 'Login',
    'logout': 'Logout',
    'create_admin': 'Create Admin',
    'update_admin': 'Update Admin',
    'delete_admin': 'Delete Admin',
    'change_password': 'Change Password',
    'send_notification': 'Send Notification',
    'broadcast_notification': 'Broadcast',
    'create_template': 'Create Template',
    'update_pwa_settings': 'Update PWA Settings',
    'update_system_settings': 'Update System Settings',
    'reset_pwa_settings': 'Reset PWA Settings',
    'delete_subscription': 'Delete Subscription',
    'bulk_delete_subscriptions': 'Bulk Delete',
    'toggle_subscription': 'Toggle Subscription'
  }
  return labels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Format details
const formatDetails = (details) => {
  if (!details) return ''
  try {
    const parsed = typeof details === 'string' ? JSON.parse(details) : details
    return JSON.stringify(parsed, null, 2)
  } catch {
    return details
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format date full
const formatDateFull = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  fetchActivities()
})
</script>

<style scoped>
pre {
  max-height: 300px;
  overflow-y: auto;
}

code {
  font-size: 0.875rem;
}
</style>