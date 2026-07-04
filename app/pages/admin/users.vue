<template>
  <div class="admin-page fade-in">
    <h1 class="admin-page-title">User Management</h1>
    
    <div class="admin-card">
      <div v-if="loading" class="admin-loading">Loading users...</div>
      <div v-else class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.full_name }}</td>
              <td>{{ user.email }}</td>
              <td><span :class="['role-badge', user.role]">{{ user.role }}</span></td>
              <td>
                <span v-if="user.is_banned" class="status-badge failed">Banned</span>
                <span v-else class="status-badge success">Active</span>
              </td>
              <td>{{ user.is_verified ? '✅' : '❌' }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <button 
                  v-if="!user.is_banned && user.role !== 'admin' && user.role !== 'superadmin'" 
                  class="admin-btn danger-btn" 
                  @click="handleBanUser(user.id)"
                >
                  Ban User
                </button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="7" class="text-center">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'User Management | Korvex Union Admin'
})

interface User {
  id: string
  email: string
  username: string
  full_name: string
  role: string
  is_banned: boolean
  is_verified: boolean
  created_at: string
}

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    email: 'john.smith@example.com',
    username: 'johnsmith',
    full_name: 'John Smith',
    role: 'user',
    is_banned: false,
    is_verified: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 15).toISOString()
  },
  {
    id: '2',
    email: 'jane.doe@example.com',
    username: 'janedoe',
    full_name: 'Jane Doe',
    role: 'user',
    is_banned: true,
    is_verified: false,
    created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString()
  },
  {
    id: '3',
    email: 'admin.korvexunion@example.com',
    username: 'admin',
    full_name: 'Admin User',
    role: 'admin',
    is_banned: false,
    is_verified: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 60).toISOString()
  }
]

const users = ref<User[]>([])
const loading = ref(true)

const auth = useAuth()

const alert = (msg: string) => {
  if (import.meta.client) {
    window.alert(msg)
  }
}

const confirm = (msg: string) => {
  if (import.meta.client) {
    return window.confirm(msg)
  }
  return false
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await auth.apiCall<any>('/admin/users', 'GET')
    if (res.success && res.data?.data) {
      users.value = res.data.data
    } else {
      console.warn('Backend server offline. Using mock users list.')
      users.value = DEFAULT_USERS
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    users.value = DEFAULT_USERS
  } finally {
    loading.value = false
  }
}

const handleBanUser = async (userId: string) => {
  if (!confirm('Are you sure you want to ban this user?')) return
  
  try {
    const res = await auth.apiCall(`/admin/users/${userId}/ban`, 'PUT')
    if (res.success) {
      alert('User banned successfully.')
      await fetchUsers()
    } else {
      // Offline fallback: toggle banned status in mock array
      const localUser = users.value.find(u => u.id === userId)
      if (localUser) {
        localUser.is_banned = true
        alert('User banned successfully (Mock Fallback).')
      } else {
        alert(res.error || 'Failed to ban user.')
      }
    }
  } catch (e) {
    alert('An error occurred while banning the user.')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-page {
  animation: fadeIn 0.4s ease-out;
  color: #f8fafc;
}

.admin-page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 32px;
  color: #f1f5f9;
}

.admin-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
}

.admin-loading {
  padding: 32px;
  text-align: center;
  color: #94a3b8;
  font-size: 18px;
}

.admin-table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th {
  padding: 16px;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-table td {
  padding: 16px;
  color: #cbd5e1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
  font-size: 14px;
}

.admin-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.role-badge.admin, .role-badge.superadmin {
  background: rgba(139, 92, 246, 0.15);
  color: #c084fc;
  border: 1px solid rgba(139, 92, 246, 0.25);
}

.role-badge.user {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.success {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.status-badge.failed {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.admin-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.admin-btn.danger-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.admin-btn.danger-btn:hover {
  background: rgba(239, 68, 68, 0.25);
}

.text-center {
  text-align: center;
}
</style>
