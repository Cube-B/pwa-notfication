<!-- ╔════════════════════════════════════════════════════════════════╗
     ║                                                                ║
     ║    📱 Subscription Management v2.0.0 - Bootstrap Edition      ║
     ║                                                                ║
     ╚════════════════════════════════════════════════════════════════╝ -->

<template>
  <div class="p-4">
    
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 fw-bold mb-1">
          <i class="bi bi-people-fill text-primary me-2"></i>
          Subscriptions
        </h1>
        <p class="text-muted mb-0">จัดการ push notification subscriptions</p>
      </div>
      <div class="d-flex gap-2">
        <button
          @click="exportCSV"
          :disabled="exporting"
          class="btn btn-outline-success">
          <i class="bi bi-download me-2"></i>
          Export CSV
        </button>
        <button
          v-if="selectedIds.length > 0"
          @click="confirmBulkDelete"
          class="btn btn-outline-danger">
          <i class="bi bi-trash me-2"></i>
          Delete Selected ({{ selectedIds.length }})
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-primary bg-opacity-10 me-3">
                <i class="bi bi-people text-primary"></i>
              </div>
              <div>
                <h3 class="h4 fw-bold mb-0">{{ stats.total || 0 }}</h3>
                <small class="text-muted">Total</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-success bg-opacity-10 me-3">
                <i class="bi bi-check-circle text-success"></i>
              </div>
              <div>
                <h3 class="h4 fw-bold mb-0">{{ stats.active || 0 }}</h3>
                <small class="text-muted">Active</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-warning bg-opacity-10 me-3">
                <i class="bi bi-x-circle text-warning"></i>
              </div>
              <div>
                <h3 class="h4 fw-bold mb-0">{{ stats.inactive || 0 }}</h3>
                <small class="text-muted">Inactive</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-info bg-opacity-10 me-3">
                <i class="bi bi-sim text-info"></i>
              </div>
              <div>
                <h3 class="h4 fw-bold mb-0">{{ Object.keys(stats.carriers || {}).length }}</h3>
                <small class="text-muted">Carriers</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          
          <!-- Search -->
          <div class="col-12 col-md-4">
            <label class="form-label small fw-medium">Search</label>
            <input
              v-model="filters.search"
              @input="debouncedFetch"
              type="text"
              class="form-control"
              placeholder="Search endpoint or user agent..." />
          </div>

          <!-- Carrier Filter -->
          <div class="col-6 col-md-2">
            <label class="form-label small fw-medium">Carrier</label>
            <select v-model="filters.carrier" @change="fetchSubscriptions" class="form-select">
              <option value="">All Carriers</option>
              <option v-for="carrier in availableCarriers" :key="carrier" :value="carrier">
                {{ carrier }}
              </option>
            </select>
          </div>

          <!-- Device Filter -->
          <div class="col-6 col-md-2">
            <label class="form-label small fw-medium">Device</label>
            <select v-model="filters.device" @change="fetchSubscriptions" class="form-select">
              <option value="">All Devices</option>
              <option v-for="device in availableDevices" :key="device" :value="device">
                {{ device }}
              </option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="col-6 col-md-2">
            <label class="form-label small fw-medium">Status</label>
            <select v-model="filters.active" @change="fetchSubscriptions" class="form-select">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <!-- Clear Filters -->
          <div class="col-6 col-md-2">
            <label class="form-label small fw-medium">&nbsp;</label>
            <button
              @click="clearFilters"
              class="btn btn-outline-secondary w-100">
              <i class="bi bi-x-circle me-2"></i>
              Clear
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- Subscriptions Table -->
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
                  <th style="width: 40px;">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      @change="toggleSelectAll"
                      :checked="isAllSelected" />
                  </th>
                  <th>Endpoint</th>
                  <th>Carrier</th>
                  <th>Device</th>
                  <th>User Agent</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sub in subscriptions" :key="sub.id">
                  <td>
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :value="sub.id"
                      v-model="selectedIds" />
                  </td>
                  <td>
                    <small class="font-monospace text-muted">
                      {{ truncateEndpoint(sub.endpoint) }}
                    </small>
                  </td>
                  <td>
                    <span class="badge bg-info">{{ sub.carrier || 'Unknown' }}</span>
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ sub.device_type || 'Unknown' }}</span>
                  </td>
                  <td>
                    <small class="text-muted">{{ truncateUA(sub.user_agent) }}</small>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="sub.active ? 'bg-success' : 'bg-warning'">
                      {{ sub.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">{{ formatDate(sub.created_at) }}</small>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button
                        @click="toggleActive(sub)"
                        class="btn btn-outline-primary"
                        :title="sub.active ? 'Deactivate' : 'Activate'">
                        <i :class="sub.active ? 'bi bi-pause' : 'bi bi-play'"></i>
                      </button>
                      <button
                        @click="confirmDelete(sub)"
                        class="btn btn-outline-danger"
                        title="Delete">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div v-if="subscriptions.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
              <p>No subscriptions found</p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.total > 0" class="d-flex justify-content-between align-items-center mt-3">
            <div class="text-muted small">
              Showing {{ pagination.offset + 1 }} - {{ Math.min(pagination.offset + pagination.limit, pagination.total) }}
              of {{ pagination.total }}
            </div>
            <div class="btn-group">
              <button
                @click="previousPage"
                :disabled="pagination.offset === 0"
                class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-chevron-left"></i>
                Previous
              </button>
              <button
                @click="nextPage"
                :disabled="!pagination.has_more"
                class="btn btn-outline-secondary btn-sm">
                Next
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger bg-opacity-10">
            <h5 class="modal-title text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Confirm Delete
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p v-if="deleteTarget">
              Are you sure you want to delete this subscription?
            </p>
            <p v-else>
              Are you sure you want to delete <strong>{{ selectedIds.length }}</strong> subscriptions?
            </p>
            <p class="text-danger mb-0">This action cannot be undone!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button
              @click="deleteTarget ? deleteSingle() : deleteBulk()"
              :disabled="deleting"
              class="btn btn-danger">
              <span v-if="deleting">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Deleting...
              </span>
              <span v-else>
                <i class="bi bi-trash me-2"></i>
                Delete
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const BACKEND_URL = 'http://localhost:3000'

// Bootstrap Modal from CDN
const Modal = window.bootstrap?.Modal

const subscriptions = ref([])
const stats = ref({})
const loading = ref(true)
const error = ref('')

const filters = ref({
  search: '',
  carrier: '',
  device: '',
  active: ''
})

const pagination = ref({
  total: 0,
  limit: 50,
  offset: 0,
  has_more: false
})

const selectedIds = ref([])
const deleteTarget = ref(null)
const deleting = ref(false)
const exporting = ref(false)

const availableCarriers = ref([])
const availableDevices = ref([])

let deleteModal = null
let debounceTimer = null

// Is all selected?
const isAllSelected = computed(() => {
  return subscriptions.value.length > 0 && 
         selectedIds.value.length === subscriptions.value.length
})

// Fetch subscriptions
const fetchSubscriptions = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('adminToken')
    
    const params = new URLSearchParams({
      limit: pagination.value.limit,
      offset: pagination.value.offset,
      ...filters.value
    })
    
    const [subsRes, statsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/admin/subscriptions?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${BACKEND_URL}/api/admin/subscriptions/stats/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])
    
    const subsData = await subsRes.json()
    const statsData = await statsRes.json()
    
    if (subsData.success) {
      subscriptions.value = subsData.subscriptions
      pagination.value = subsData.pagination
    }
    
    if (statsData.success) {
      stats.value = statsData.stats
      availableCarriers.value = Object.keys(statsData.stats.carriers || {})
      availableDevices.value = Object.keys(statsData.stats.devices || {})
    }
    
  } catch (err) {
    console.error('❌ Fetch subscriptions error:', err)
    error.value = 'Failed to load subscriptions'
  } finally {
    loading.value = false
  }
}

// Debounced fetch
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    pagination.value.offset = 0
    fetchSubscriptions()
  }, 500)
}

// Clear filters
const clearFilters = () => {
  filters.value = {
    search: '',
    carrier: '',
    device: '',
    active: ''
  }
  pagination.value.offset = 0
  fetchSubscriptions()
}

// Pagination
const previousPage = () => {
  if (pagination.value.offset > 0) {
    pagination.value.offset -= pagination.value.limit
    fetchSubscriptions()
  }
}

const nextPage = () => {
  if (pagination.value.has_more) {
    pagination.value.offset += pagination.value.limit
    fetchSubscriptions()
  }
}

// Toggle select all
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = subscriptions.value.map(s => s.id)
  }
}

// Toggle active status
const toggleActive = async (sub) => {
  try {
    const token = localStorage.getItem('adminToken')
    
    const response = await fetch(
      `${BACKEND_URL}/api/admin/subscriptions/${sub.id}/toggle`,
      {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    )
    
    const data = await response.json()
    
    if (data.success) {
      fetchSubscriptions()
    }
    
  } catch (err) {
    console.error('❌ Toggle active error:', err)
  }
}

// Confirm delete single
const confirmDelete = (sub) => {
  deleteTarget.value = sub
  
  if (!deleteModal) {
    deleteModal = new Modal(document.getElementById('deleteModal'))
  }
  deleteModal.show()
}

// Confirm bulk delete
const confirmBulkDelete = () => {
  deleteTarget.value = null
  
  if (!deleteModal) {
    deleteModal = new Modal(document.getElementById('deleteModal'))
  }
  deleteModal.show()
}

// Delete single
const deleteSingle = async () => {
  deleting.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    
    const response = await fetch(
      `${BACKEND_URL}/api/admin/subscriptions/${deleteTarget.value.id}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    )
    
    const data = await response.json()
    
    if (data.success) {
      deleteModal.hide()
      fetchSubscriptions()
    }
    
  } catch (err) {
    console.error('❌ Delete subscription error:', err)
  } finally {
    deleting.value = false
  }
}

// Delete bulk
const deleteBulk = async () => {
  deleting.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    
    const response = await fetch(
      `${BACKEND_URL}/api/admin/subscriptions/bulk-delete`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedIds.value })
      }
    )
    
    const data = await response.json()
    
    if (data.success) {
      deleteModal.hide()
      selectedIds.value = []
      fetchSubscriptions()
    }
    
  } catch (err) {
    console.error('❌ Bulk delete error:', err)
  } finally {
    deleting.value = false
  }
}

// Export CSV
const exportCSV = async () => {
  exporting.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    
    const params = new URLSearchParams({
      ...filters.value
    })
    
    const response = await fetch(
      `${BACKEND_URL}/api/admin/subscriptions/export/csv?${params}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    )
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscriptions-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
  } catch (err) {
    console.error('❌ Export CSV error:', err)
  } finally {
    exporting.value = false
  }
}

// Truncate endpoint
const truncateEndpoint = (endpoint) => {
  if (!endpoint) return ''
  const maxLen = 50
  return endpoint.length > maxLen 
    ? endpoint.substring(0, maxLen) + '...'
    : endpoint
}

// Truncate user agent
const truncateUA = (ua) => {
  if (!ua) return 'Unknown'
  const maxLen = 40
  return ua.length > maxLen 
    ? ua.substring(0, maxLen) + '...'
    : ua
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchSubscriptions()
})
</script>

<style scoped>
.icon-wrapper {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
</style>