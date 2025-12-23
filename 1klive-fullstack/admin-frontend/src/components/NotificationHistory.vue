<template>
  <div class="p-4">
    
    <div class="mb-4">
      <h1 class="h2 fw-bold mb-1">
        <i class="bi bi-clock-history text-primary me-2"></i>
        Notification History
      </h1>
      <p class="text-muted mb-0">ดูประวัติการส่ง notifications</p>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-primary bg-opacity-10 me-3">
                <i class="bi bi-send text-primary"></i>
              </div>
              <div>
                <h3 class="h4 fw-bold mb-0">{{ logs.length }}</h3>
                <small class="text-muted">Total Sent</small>
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
                <h3 class="h4 fw-bold mb-0">{{ totalSuccess }}</h3>
                <small class="text-muted">Successful</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-wrapper bg-danger bg-opacity-10 me-3">
                <i class="bi bi-x-circle text-danger"></i>
              </div>
              <div>
                <h3 class="h4 fw-bold mb-0">{{ totalFailed }}</h3>
                <small class="text-muted">Failed</small>
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
                <i class="bi bi-percent text-info"></i>
              </div>
              <div>
                <h3 class="h4 fw-bold mb-0">{{ successRate }}%</h3>
                <small class="text-muted">Success Rate</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Target</th>
                  <th>Recipients</th>
                  <th>Success</th>
                  <th>Failed</th>
                  <th>Sent By</th>
                  <th>Date</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in logs" :key="log.id">
                  <td>
                    <strong>{{ log.title }}</strong>
                  </td>
                  <td>
                    <small class="text-muted">{{ truncate(log.message, 40) }}</small>
                  </td>
                  <td>
                    <span class="badge" :class="getTargetBadge(log.target_type)">
                      {{ getTargetLabel(log.target_type) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ log.total_recipients || 0 }}</span>
                  </td>
                  <td>
                    <span class="badge bg-success">{{ log.success_count || 0 }}</span>
                  </td>
                  <td>
                    <span class="badge bg-danger">{{ log.failed_count || 0 }}</span>
                  </td>
                  <td>
                    <small class="text-muted">{{ log.created_by_username || 'Unknown' }}</small>
                  </td>
                  <td>
                    <small class="text-muted">{{ formatDate(log.created_at) }}</small>
                  </td>
                  <td class="text-end">
                    <button
                      @click="viewDetails(log)"
                      class="btn btn-sm btn-outline-primary"
                      title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="logs.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
              <p>No notification history found</p>
            </div>
          </div>

          <div v-if="pagination.has_more" class="text-center mt-3">
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

    <div class="modal fade" id="detailsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-info-circle me-2"></i>
              Notification Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedLog">
            
            <div class="mb-4">
              <h5 class="fw-bold">{{ selectedLog.title }}</h5>
              <p class="text-muted mb-2">{{ selectedLog.message }}</p>
              <div v-if="selectedLog.url">
                <small class="text-muted">URL: </small>
                <a :href="selectedLog.url" target="_blank" class="small">{{ selectedLog.url }}</a>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-6 col-md-3">
                <div class="text-center p-3 bg-light rounded">
                  <div class="h4 fw-bold mb-0">{{ selectedLog.total_recipients || 0 }}</div>
                  <small class="text-muted">Recipients</small>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-center p-3 bg-success bg-opacity-10 rounded">
                  <div class="h4 fw-bold mb-0 text-success">{{ selectedLog.success_count || 0 }}</div>
                  <small class="text-muted">Success</small>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-center p-3 bg-danger bg-opacity-10 rounded">
                  <div class="h4 fw-bold mb-0 text-danger">{{ selectedLog.failed_count || 0 }}</div>
                  <small class="text-muted">Failed</small>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-center p-3 bg-info bg-opacity-10 rounded">
                  <div class="h4 fw-bold mb-0 text-info">{{ getSuccessRate(selectedLog) }}%</div>
                  <small class="text-muted">Success Rate</small>
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td class="fw-medium" style="width: 150px;">Target Type:</td>
                    <td>
                      <span class="badge" :class="getTargetBadge(selectedLog.target_type)">
                        {{ getTargetLabel(selectedLog.target_type) }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="selectedLog.target_filter">
                    <td class="fw-medium">Target Filter:</td>
                    <td>
                      <code class="small">{{ formatFilter(selectedLog.target_filter) }}</code>
                    </td>
                  </tr>
                  <tr>
                    <td class="fw-medium">Status:</td>
                    <td>
                      <span class="badge bg-success">{{ selectedLog.status }}</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="fw-medium">Created By:</td>
                    <td>{{ selectedLog.created_by_username || 'Unknown' }}</td>
                  </tr>
                  <tr>
                    <td class="fw-medium">Created At:</td>
                    <td>{{ formatDateFull(selectedLog.created_at) }}</td>
                  </tr>
                  <tr v-if="selectedLog.sent_at">
                    <td class="fw-medium">Sent At:</td>
                    <td>{{ formatDateFull(selectedLog.sent_at) }}</td>
                  </tr>
                </tbody>
              </table>
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
import { ref, computed, onMounted } from 'vue'

const BACKEND_URL = 'http://localhost:3000'
const Modal = window.bootstrap?.Modal

const logs = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const pagination = ref({
  limit: 20,
  offset: 0,
  has_more: false
})
const selectedLog = ref(null)
let detailsModal = null

const totalSuccess = computed(() => {
  return logs.value.reduce((sum, log) => sum + (log.success_count || 0), 0)
})

const totalFailed = computed(() => {
  return logs.value.reduce((sum, log) => sum + (log.failed_count || 0), 0)
})

const successRate = computed(() => {
  const total = totalSuccess.value + totalFailed.value
  if (total === 0) return 0
  return Math.round((totalSuccess.value / total) * 100)
})

const fetchLogs = async (append = false) => {
  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
  }
  
  error.value = ''
  
  try {
    const token = localStorage.getItem('adminToken')
    const params = new URLSearchParams({
      limit: pagination.value.limit,
      offset: pagination.value.offset
    })
    
    const response = await fetch(
      `${BACKEND_URL}/api/admin/notifications/logs?${params}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    
    const data = await response.json()
    
    if (data.success) {
      if (append) {
        logs.value = [...logs.value, ...data.logs]
      } else {
        logs.value = data.logs
      }
      pagination.value.has_more = data.logs.length >= pagination.value.limit
    } else {
      error.value = data.error || 'Failed to load history'
    }
  } catch (err) {
    console.error('Fetch logs error:', err)
    error.value = 'Failed to load notification history'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  pagination.value.offset += pagination.value.limit
  fetchLogs(true)
}

const viewDetails = (log) => {
  selectedLog.value = log
  if (!detailsModal) {
    detailsModal = new Modal(document.getElementById('detailsModal'))
  }
  detailsModal.show()
}

const getSuccessRate = (log) => {
  const total = (log.success_count || 0) + (log.failed_count || 0)
  if (total === 0) return 0
  return Math.round(((log.success_count || 0) / total) * 100)
}

const getTargetBadge = (type) => {
  const badges = {
    'all': 'bg-primary',
    'broadcast': 'bg-primary',
    'carriers': 'bg-info',
    'devices': 'bg-secondary'
  }
  return badges[type] || 'bg-secondary'
}

const getTargetLabel = (type) => {
  const labels = {
    'all': 'All Users',
    'broadcast': 'Broadcast',
    'carriers': 'Carriers',
    'devices': 'Devices'
  }
  return labels[type] || type
}

const formatFilter = (filter) => {
  if (!filter) return '-'
  try {
    const parsed = typeof filter === 'string' ? JSON.parse(filter) : filter
    return JSON.stringify(parsed, null, 2)
  } catch {
    return filter
  }
}

const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

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
  fetchLogs()
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