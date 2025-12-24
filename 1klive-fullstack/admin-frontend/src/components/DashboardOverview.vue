<!-- ╔════════════════════════════════════════════════════════════════╗
     ║                                                                ║
     ║    📊 Dashboard Overview Page v2.0.0 - Bootstrap Edition      ║
     ║                                                                ║
     ╚════════════════════════════════════════════════════════════════╝ -->

<template>
  <div class="p-4">
    
    <!-- Header -->
    <div class="mb-4">
      <h1 class="h2 fw-bold mb-1">📊 Dashboard</h1>
      <p class="text-muted mb-0">ภาพรวมระบบและสถิติ</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="spinner-wrapper">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted">กำลังโหลดข้อมูล...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <div>{{ error }}</div>
    </div>

    <!-- Dashboard Content -->
    <div v-else>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        
        <!-- Total Subscriptions -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card stats-card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="icon-wrapper bg-primary bg-opacity-10">
                  <i class="bi bi-people-fill text-primary"></i>
                </div>
                <span class="badge bg-success bg-opacity-10 text-success">
                  +{{ stats.subscriptions.today }} วันนี้
                </span>
              </div>
              <h3 class="h2 fw-bold mb-1">{{ stats.subscriptions.total.toLocaleString() }}</h3>
              <p class="text-muted mb-2 small">Total Subscriptions</p>
              <div class="d-flex align-items-center small text-muted">
                <span class="text-success me-2">● {{ stats.subscriptions.active }}</span> Active
                <span class="mx-2">•</span>
                <span class="text-danger me-2">● {{ stats.subscriptions.inactive }}</span> Inactive
              </div>
            </div>
          </div>
        </div>

        <!-- Total Notifications -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card stats-card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="icon-wrapper bg-purple bg-opacity-10">
                  <i class="bi bi-bell-fill text-purple"></i>
                </div>
                <span class="badge bg-success bg-opacity-10 text-success">
                  +{{ stats.notifications.today_sent }} วันนี้
                </span>
              </div>
              <h3 class="h2 fw-bold mb-1">{{ stats.notifications.total_sent.toLocaleString() }}</h3>
              <p class="text-muted mb-2 small">Total Notifications</p>
              <div class="d-flex align-items-center small text-muted">
                <span class="text-success me-2">✓ {{ stats.notifications.total_success.toLocaleString() }}</span> Success
                <span class="mx-2">•</span>
                <span class="text-danger me-2">✗ {{ stats.notifications.total_failed.toLocaleString() }}</span> Failed
              </div>
            </div>
          </div>
        </div>

        <!-- Success Rate -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card stats-card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="icon-wrapper bg-success bg-opacity-10">
                  <i class="bi bi-check-circle-fill text-success"></i>
                </div>
                <span class="badge"
                      :class="stats.notifications.success_rate >= 95 
                        ? 'bg-success bg-opacity-10 text-success' 
                        : 'bg-warning bg-opacity-10 text-warning'">
                  {{ stats.notifications.success_rate >= 95 ? 'ดีเยี่ยม' : 'ปานกลาง' }}
                </span>
              </div>
              <h3 class="h2 fw-bold mb-1">{{ stats.notifications.success_rate }}%</h3>
              <p class="text-muted mb-2 small">Success Rate</p>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar"
                     :class="stats.notifications.success_rate >= 95 ? 'bg-success' : 'bg-warning'"
                     :style="{ width: stats.notifications.success_rate + '%' }">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Today Activity -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card stats-card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="icon-wrapper bg-warning bg-opacity-10">
                  <i class="bi bi-graph-up-arrow text-warning"></i>
                </div>
                <span class="badge bg-info bg-opacity-10 text-info">Today</span>
              </div>
              <h3 class="h2 fw-bold mb-1">{{ stats.today.new_subscriptions }}</h3>
              <p class="text-muted mb-2 small">New Subscriptions</p>
              <div class="small text-muted">
                {{ stats.today.carrier_detections }} carrier detections
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row g-4 mb-4">
        
        <!-- Carrier Distribution -->
        <div class="col-12 col-lg-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title fw-bold mb-4">
                <i class="bi bi-broadcast text-primary me-2"></i>
                Carrier Distribution
              </h5>
              <div v-if="Object.keys(stats.carriers).length === 0" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                No carrier data yet
              </div>
              <div v-else class="d-flex flex-column gap-3">
                <div v-for="(count, carrier) in stats.carriers" :key="carrier" class="d-flex align-items-center">
                  <span class="fw-medium" style="min-width: 80px;">{{ carrier }}</span>
                  <div class="progress flex-grow-1 mx-3" style="height: 12px;">
                    <div class="progress-bar"
                         :class="getCarrierColor(carrier)"
                         :style="{ width: (count / stats.subscriptions.total * 100) + '%' }">
                    </div>
                  </div>
                  <span class="fw-bold" style="min-width: 60px; text-align: right;">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Device Distribution -->
        <div class="col-12 col-lg-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title fw-bold mb-4">
                <i class="bi bi-phone text-primary me-2"></i>
                Device Distribution
              </h5>
              <div v-if="Object.keys(stats.devices).length === 0" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                No device data yet
              </div>
              <div v-else class="d-flex flex-column gap-3">
                <div v-for="(count, device) in stats.devices" :key="device" class="d-flex align-items-center">
                  <span class="fw-medium" style="min-width: 80px;">{{ device }}</span>
                  <div class="progress flex-grow-1 mx-3" style="height: 12px;">
                    <div class="progress-bar"
                         :class="device === 'iOS' ? 'bg-primary' : 'bg-success'"
                         :style="{ width: (count / stats.subscriptions.total * 100) + '%' }">
                    </div>
                  </div>
                  <span class="fw-bold" style="min-width: 60px; text-align: right;">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Notifications -->
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <h5 class="card-title fw-bold mb-4">
            <i class="bi bi-bell text-primary me-2"></i>
            Recent Notifications
          </h5>
          <div v-if="stats.recent_notifications.length === 0" class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
            No notifications sent yet
          </div>
          <div v-else class="d-flex flex-column gap-3">
            <div v-for="notif in stats.recent_notifications" :key="notif.id"
                 class="d-flex align-items-center justify-content-between p-3 bg-light rounded">
              <div class="flex-grow-1">
                <h6 class="mb-1 fw-medium">{{ notif.title }}</h6>
                <p class="mb-0 small text-muted">{{ formatDate(notif.sent_at) }}</p>
              </div>
              <div class="d-flex align-items-center gap-3 small">
                <div class="text-center">
                  <div class="fw-bold text-info">{{ notif.recipients }}</div>
                  <div class="text-muted">Recipients</div>
                </div>
                <div class="text-center">
                  <div class="fw-bold text-success">{{ notif.success }}</div>
                  <div class="text-muted">Success</div>
                </div>
                <div class="text-center">
                  <div class="fw-bold text-danger">{{ notif.failed }}</div>
                  <div class="text-muted">Failed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const BACKEND_URL = 'http://localhost:3000'

const loading = ref(true)
const error = ref('')
const stats = ref({
  subscriptions: {
    total: 0,
    active: 0,
    inactive: 0,
    today: 0
  },
  notifications: {
    total_sent: 0,
    total_success: 0,
    total_failed: 0,
    success_rate: 0,
    today_sent: 0
  },
  carriers: {},
  devices: {},
  today: {
    new_subscriptions: 0,
    carrier_detections: 0
  },
  recent_notifications: []
})

// Fetch dashboard stats
const fetchStats = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('adminToken')
    
    if (!token) {
      error.value = 'กรุณาเข้าสู่ระบบ'
      return
    }
    
    console.log('📊 Fetching dashboard stats...')
    
    const response = await fetch(`${BACKEND_URL}/api/admin/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const data = await response.json()
    
    if (data.success) {
      stats.value = data.stats
      console.log('✅ Dashboard stats loaded')
    } else {
      error.value = data.error || 'ไม่สามารถโหลดข้อมูลได้'
    }
    
  } catch (err) {
    console.error('❌ Fetch stats error:', err)
    error.value = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์'
  } finally {
    loading.value = false
  }
}

// Get carrier color
const getCarrierColor = (carrier) => {
  const colors = {
    'AIS': 'bg-success',
    'DTAC': 'bg-primary',
    'True': 'bg-danger',
    'NT': 'bg-warning',
    '3BB': 'bg-purple',
    'TOT': 'bg-info'
  }
  return colors[carrier] || 'bg-secondary'
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

// Auto refresh every 30 seconds
let refreshInterval
onMounted(() => {
  fetchStats()
  
  refreshInterval = setInterval(() => {
    fetchStats()
  }, 30000) // 30 seconds
})

// Cleanup
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.text-purple {
  color: #6f42c1;
}

.bg-purple {
  background-color: #6f42c1 !important;
}
</style>