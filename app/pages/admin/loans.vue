<template>
  <div class="admin-page fade-in">
    <div class="page-header">
      <h1 class="admin-page-title">Loan Applications</h1>
      <p class="page-subtitle">Review, approve, or decline user loan requests</p>
    </div>

    <!-- Loan Requests Table -->
    <div class="admin-card">
      <div v-if="loading" class="admin-loading">
        <Icon name="lucide:loader-2" class="spin-icon" /> Loading requests...
      </div>
      <div v-else class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Loan Product</th>
              <th>Amount</th>
              <th>Term</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in loanRequests" :key="req.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ req.userName[0] }}</div>
                  <div>
                    <div class="user-name-text">{{ req.userName }}</div>
                    <div class="user-email-text">{{ req.userEmail }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="product-badge" :class="req.type">
                  {{ req.name }}
                </span>
              </td>
              <td>
                <span class="amount-value">${{ req.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </td>
              <td class="muted-cell">{{ req.term }} months</td>
              <td class="reason-cell" :title="req.note">{{ req.note }}</td>
              <td class="muted-cell">{{ formatDate(req.created_at) }}</td>
              <td>
                <span :class="['status-badge', req.status.toLowerCase()]">
                  {{ req.status }}
                </span>
              </td>
              <td>
                <div class="action-btns" v-if="req.status === 'PENDING'">
                  <button 
                    class="action-btn approve-btn" 
                    title="Approve Loan" 
                    :disabled="actionLoading"
                    @click="handleApprove(req)"
                  >
                    Approve
                  </button>
                  <button 
                    class="action-btn decline-btn" 
                    title="Decline Loan" 
                    :disabled="actionLoading"
                    @click="handleDecline(req)"
                  >
                    Decline
                  </button>
                </div>
                <span v-else class="no-actions">—</span>
              </td>
            </tr>
            <tr v-if="loanRequests.length === 0">
              <td colspan="8" class="empty-row">No loan requests found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" :class="['toast-bar', toast.type]">
        <Icon :name="toast.type === 'success' ? 'lucide:check-circle' : 'lucide:x-circle'" />
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Loan Approvals | Korvex Union Admin' })

const auth = useAuth()
const loading = ref(true)
const actionLoading = ref(false)
const loanRequests = ref<any[]>([])

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

const loadRequests = () => {
  loading.value = true
  if (import.meta.client) {
    const data = localStorage.getItem('loan_requests')
    loanRequests.value = data ? JSON.parse(data) : []
  }
  loading.value = false
}

onMounted(() => {
  loadRequests()
})

const handleApprove = async (req: any) => {
  actionLoading.value = true
  try {
    // Attempt to deposit to user's account if API backend is alive
    const res = await auth.apiCall(`/admin/users/${req.userId}/deposit`, 'POST', {
      amount: req.amount,
      note: `Approved ${req.name}`
    })

    // Update status in local storage
    if (import.meta.client) {
      const data = localStorage.getItem('loan_requests')
      const currentRequests = data ? JSON.parse(data) : []
      const index = currentRequests.findIndex((r: any) => r.id === req.id)
      if (index !== -1) {
        currentRequests[index].status = 'APPROVED'
        localStorage.setItem('loan_requests', JSON.stringify(currentRequests))
        loanRequests.value = currentRequests
      }
    }

    if (res.success) {
      showToast(`Loan of $${req.amount.toLocaleString()} approved and deposited.`)
    } else {
      showToast(`Loan of $${req.amount.toLocaleString()} approved (Mock).`)
    }
  } catch (error) {
    showToast('Failed to approve loan.', 'error')
  } finally {
    actionLoading.value = false
  }
}

const handleDecline = async (req: any) => {
  actionLoading.value = true
  try {
    if (import.meta.client) {
      const data = localStorage.getItem('loan_requests')
      const currentRequests = data ? JSON.parse(data) : []
      const index = currentRequests.findIndex((r: any) => r.id === req.id)
      if (index !== -1) {
        currentRequests[index].status = 'REJECTED'
        localStorage.setItem('loan_requests', JSON.stringify(currentRequests))
        loanRequests.value = currentRequests
      }
    }
    showToast(`Loan application declined.`)
  } catch (error) {
    showToast('Failed to decline loan.', 'error')
  } finally {
    actionLoading.value = false
  }
}

const formatDate = (isoStr: string) => {
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.admin-page { animation: fadeIn 0.4s ease-out; color: #f8fafc; padding-bottom: 40px; }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px);} to { opacity:1; transform:translateY(0);} }

.page-header { margin-bottom: 28px; }
.admin-page-title { font-size: 28px; font-weight: 700; color: #f1f5f9; }
.page-subtitle { color: #94a3b8; font-size: 14px; margin-top: 4px; }

.admin-card { background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; }
.admin-loading { padding: 32px; text-align: center; color: #94a3b8; }
.spin-icon { animation: spin 1s linear infinite; margin-right: 8px; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.admin-table-container { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.admin-table th { padding: 14px 16px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap; }
.admin-table td { padding: 14px 16px; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; font-size: 14px; }
.admin-table tr:hover td { background: rgba(255,255,255,0.02); }

.user-cell { display: flex; align-items: center; gap: 12px; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg,#ef4444,#f43f5e); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
.user-name-text { font-weight: 600; color: #f1f5f9; font-size: 14px; }
.user-email-text { font-size: 11px; color: #64748b; }

.product-badge { display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.product-badge.personal { background: rgba(168,85,247,0.15); color: #c084fc; }
.product-badge.home-eq { background: rgba(59,130,246,0.15); color: #60a5fa; }
.product-badge.auto { background: rgba(14,165,233,0.15); color: #38bdf8; }
.product-badge.business { background: rgba(249,115,22,0.15); color: #fb923c; }

.amount-value { font-weight: 700; color: #f1f5f9; }
.muted-cell { color: #94a3b8; font-size: 13px; }
.reason-cell { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #94a3b8; }
.empty-row { text-align: center; color: #64748b; padding: 32px !important; }
.no-actions { color: #64748b; }

.status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.status-badge.approved { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
.status-badge.rejected { background: rgba(239,68,68,0.15);  color: #f87171; border: 1px solid rgba(239,68,68,0.25);  }
.status-badge.pending { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }

.action-btns { display: flex; gap: 8px; }
.action-btn { padding: 6px 12px; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.approve-btn { background: #10b981; color: #fff; }
.approve-btn:hover { background: #059669; }
.decline-btn { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
.decline-btn:hover { background: rgba(239,68,68,0.25); }

/* Toast */
.toast-bar { position: fixed; bottom: 24px; right: 24px; display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; color: #fff; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 999; }
.toast-bar.success { background: #10b981; }
.toast-bar.error { background: #ef4444; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(20px); }
.toast-leave-to { opacity: 0; transform: translateY(-20px); }
</style>
