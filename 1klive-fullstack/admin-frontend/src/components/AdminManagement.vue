<!-- ╔════════════════════════════════════════════════════════════════╗
     ║                                                                ║
     ║    👥 Admin Management Page v2.0.0 - Bootstrap Edition        ║
     ║                                                                ║
     ╚════════════════════════════════════════════════════════════════╝ -->

<template>
  <div class="p-4">
    
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 fw-bold mb-1">
          <i class="bi bi-people-fill text-primary me-2"></i>
          Admin Management
        </h1>
        <p class="text-muted mb-0">จัดการผู้ดูแลระบบ</p>
      </div>
      <button
        @click="openCreateModal"
        class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i>
        Create Admin
      </button>
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
                <small class="text-muted">Total Admins</small>
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
                <i class="bi bi-shield-check text-success"></i>
              </div>
              <div>
                <h3 class="h4 fw-bold mb-0">{{ stats.super_admins || 0 }}</h3>
                <small class="text-muted">Super Admins</small>
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
                <i class="bi bi-person-badge text-info"></i>
              </div>
              <div>
                <h3 class="h4 fw-bold mb-0">{{ stats.admins || 0 }}</h3>
                <small class="text-muted">Admins</small>
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
                <i class="bi bi-eye text-warning"></i>
              </div>
              <div>
                <h3 class="h4 fw-bold mb-0">{{ stats.viewers || 0 }}</h3>
                <small class="text-muted">Viewers</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin List -->
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
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in admins" :key="admin.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                         style="width: 32px; height: 32px; font-size: 14px;">
                      {{ admin.username.charAt(0).toUpperCase() }}
                    </div>
                    <strong>{{ admin.username }}</strong>
                  </div>
                </td>
                <td>{{ admin.email }}</td>
                <td>{{ admin.full_name || '-' }}</td>
                <td>
                  <span class="badge"
                        :class="getRoleBadge(admin.role)">
                    {{ getRoleLabel(admin.role) }}
                  </span>
                </td>
                <td>
                  <span class="badge"
                        :class="admin.active ? 'bg-success' : 'bg-secondary'">
                    {{ admin.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <small class="text-muted">
                    {{ formatDate(admin.last_login_at) }}
                  </small>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button
                      @click="openEditModal(admin)"
                      class="btn btn-outline-primary"
                      title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      @click="confirmDelete(admin)"
                      class="btn btn-outline-danger"
                      title="Delete"
                      :disabled="admin.id === currentUser.id">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="admins.length === 0" class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
            <p>No admins found</p>
          </div>
        </div>

      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="adminModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="modalMode === 'create' ? 'bi bi-plus-circle' : 'bi bi-pencil'" class="me-2"></i>
              {{ modalMode === 'create' ? 'Create Admin' : 'Edit Admin' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            
            <!-- Username -->
            <div class="mb-3">
              <label class="form-label fw-medium">
                Username <span class="text-danger">*</span>
              </label>
              <input
                v-model="formData.username"
                type="text"
                class="form-control"
                :disabled="modalMode === 'edit'"
                required />
            </div>

            <!-- Email -->
            <div class="mb-3">
              <label class="form-label fw-medium">
                Email <span class="text-danger">*</span>
              </label>
              <input
                v-model="formData.email"
                type="email"
                class="form-control"
                required />
            </div>

            <!-- Full Name -->
            <div class="mb-3">
              <label class="form-label fw-medium">Full Name</label>
              <input
                v-model="formData.full_name"
                type="text"
                class="form-control" />
            </div>

            <!-- Role -->
            <div class="mb-3">
              <label class="form-label fw-medium">
                Role <span class="text-danger">*</span>
              </label>
              <select v-model="formData.role" class="form-select" required>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <small class="form-text text-muted">
                Super Admin: Full access | Admin: Manage content | Viewer: Read only
              </small>
            </div>

            <!-- Password (Create only) -->
            <div v-if="modalMode === 'create'" class="mb-3">
              <label class="form-label fw-medium">
                Password <span class="text-danger">*</span>
              </label>
              <input
                v-model="formData.password"
                type="password"
                class="form-control"
                minlength="8"
                required />
              <small class="form-text text-muted">Minimum 8 characters</small>
            </div>

            <!-- Active Status (Edit only) -->
            <div v-if="modalMode === 'edit'" class="mb-3">
              <div class="form-check form-switch">
                <input
                  v-model="formData.active"
                  type="checkbox"
                  class="form-check-input"
                  id="activeSwitch">
                <label class="form-check-label" for="activeSwitch">
                  Active
                </label>
              </div>
            </div>

            <!-- Error -->
            <div v-if="modalError" class="alert alert-danger">
              {{ modalError }}
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button
              @click="saveAdmin"
              :disabled="saving"
              class="btn btn-primary">
              <span v-if="saving">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Saving...
              </span>
              <span v-else>
                <i class="bi bi-check-circle me-2"></i>
                Save
              </span>
            </button>
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
            <p>Are you sure you want to delete admin <strong>{{ deleteTarget?.username }}</strong>?</p>
            <p class="text-danger mb-0">This action cannot be undone!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button
              @click="deleteAdmin"
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
import { ref, onMounted, computed } from 'vue'

const BACKEND_URL = 'http://localhost:3000'

// Bootstrap Modal from CDN
const Modal = window.bootstrap?.Modal

const admins = ref([])
const stats = ref({})
const loading = ref(true)
const error = ref('')

const modalMode = ref('create') // 'create' or 'edit'
const formData = ref({
  username: '',
  email: '',
  full_name: '',
  role: 'admin',
  password: '',
  active: true
})

const saving = ref(false)
const modalError = ref('')
const deleteTarget = ref(null)
const deleting = ref(false)

let adminModal = null
let deleteModal = null

const currentUser = computed(() => {
  const user = localStorage.getItem('adminUser')
  return user ? JSON.parse(user) : {}
})

// Fetch admins
const fetchAdmins = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('adminToken')
    
    const [adminsRes, statsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/admin/admins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${BACKEND_URL}/api/admin/admins/stats/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])
    
    const adminsData = await adminsRes.json()
    const statsData = await statsRes.json()
    
    if (adminsData.success) {
      admins.value = adminsData.admins
    }
    
    if (statsData.success) {
      stats.value = statsData.stats
    }
    
  } catch (err) {
    console.error('❌ Fetch admins error:', err)
    error.value = 'Failed to load admins'
  } finally {
    loading.value = false
  }
}

// Open create modal
const openCreateModal = () => {
  modalMode.value = 'create'
  formData.value = {
    username: '',
    email: '',
    full_name: '',
    role: 'admin',
    password: '',
    active: true
  }
  modalError.value = ''
  
  if (!adminModal) {
    adminModal = new Modal(document.getElementById('adminModal'))
  }
  adminModal.show()
}

// Open edit modal
const openEditModal = (admin) => {
  modalMode.value = 'edit'
  formData.value = {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    full_name: admin.full_name,
    role: admin.role,
    active: admin.active
  }
  modalError.value = ''
  
  if (!adminModal) {
    adminModal = new Modal(document.getElementById('adminModal'))
  }
  adminModal.show()
}

// Save admin
const saveAdmin = async () => {
  saving.value = true
  modalError.value = ''
  
  try {
    const token = localStorage.getItem('adminToken')
    
    const url = modalMode.value === 'create'
      ? `${BACKEND_URL}/api/admin/admins`
      : `${BACKEND_URL}/api/admin/admins/${formData.value.id}`
    
    const method = modalMode.value === 'create' ? 'POST' : 'PUT'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData.value)
    })
    
    const data = await response.json()
    
    if (data.success) {
      adminModal.hide()
      fetchAdmins() // Reload list
    } else {
      modalError.value = data.error || 'Failed to save admin'
    }
    
  } catch (err) {
    console.error('❌ Save admin error:', err)
    modalError.value = 'Network error'
  } finally {
    saving.value = false
  }
}

// Confirm delete
const confirmDelete = (admin) => {
  deleteTarget.value = admin
  
  if (!deleteModal) {
    deleteModal = new Modal(document.getElementById('deleteModal'))
  }
  deleteModal.show()
}

// Delete admin
const deleteAdmin = async () => {
  deleting.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    
    const response = await fetch(
      `${BACKEND_URL}/api/admin/admins/${deleteTarget.value.id}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    )
    
    const data = await response.json()
    
    if (data.success) {
      deleteModal.hide()
      fetchAdmins() // Reload list
    }
    
  } catch (err) {
    console.error('❌ Delete admin error:', err)
  } finally {
    deleting.value = false
  }
}

// Get role badge class
const getRoleBadge = (role) => {
  const badges = {
    'super_admin': 'bg-danger',
    'admin': 'bg-primary',
    'viewer': 'bg-secondary'
  }
  return badges[role] || 'bg-secondary'
}

// Get role label
const getRoleLabel = (role) => {
  const labels = {
    'super_admin': 'Super Admin',
    'admin': 'Admin',
    'viewer': 'Viewer'
  }
  return labels[role] || role
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchAdmins()
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