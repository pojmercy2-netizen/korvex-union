<template>
  <div :class="['balance-card', type === 'premium' ? 'premium-balance-card' : type]">
    <!-- Diagonal green accent line for premium card -->
    <div v-if="type === 'premium'" class="balance-card-diagonal" />

    <!-- Premium Card Layout -->
    <div v-if="type === 'premium'" class="premium-card-header">
      <div class="premium-card-left">
        <span class="premium-label-muted">TOTAL BALANCE</span>
        <div class="premium-balance-display">
          <h2 class="premium-balance-val">
            {{ isBalanceVisible ? formatCurrency(balance) : '$ ••••••' }}
          </h2>
          <button 
            type="button"
            class="premium-toggle-btn" 
            @click="toggleBalance" 
            :aria-label="isBalanceVisible ? 'Hide balance' : 'Show balance'"
          >
            <Icon :name="isBalanceVisible ? 'lucide:eye' : 'lucide:eye-off'" class="w-5 h-5" />
          </button>
        </div>
        <div class="premium-change-text">{{ subtitle }}</div>
      </div>

      <div class="premium-card-right" v-if="showKyc">
        <span :class="['kyc-pill', kycStatus.toLowerCase().replace(' ', '-')]">{{ kycStatus }}</span>
        <span class="premium-label-muted">KYC STATUS</span>
      </div>
    </div>

    <!-- Legacy / Default Card Layout -->
    <div v-else>
      <div class="card-header">
        <span class="account-name">{{ name }}</span>
        <span class="account-number">{{ accountNumber }}</span>
      </div>
      <h2 class="account-balance">{{ formatCurrency(balance) }}</h2>
      <span class="available-balance">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  accountNumber?: string
  balance: number
  subtitle: string
  type?: 'checking' | 'savings' | 'premium'
  showKyc?: boolean
}>(), {
  accountNumber: '',
  type: 'checking',
  showKyc: false
})

const isBalanceVisible = ref(true)
const kycStatus = ref('Unverified')

const toggleBalance = () => {
  isBalanceVisible.value = !isBalanceVisible.value
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

onMounted(() => {
  if (import.meta.client) {
    const status = localStorage.getItem('kyc_status')
    if (status) {
      kycStatus.value = status
    } else {
      localStorage.setItem('kyc_status', 'Unverified')
      kycStatus.value = 'Unverified'
    }
  }
})
</script>

<style scoped>
.balance-card {
  background: var(--color-surface);
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}

.dark .balance-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.balance-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--color-secondary);
}

.balance-card.savings::before {
  background-color: var(--color-success);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.account-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.dark .account-name {
  color: #94a3b8;
}

.account-number {
  font-size: 14px;
  color: var(--color-text-muted);
  opacity: 0.8;
}

.dark .account-number {
  color: #94a3b8;
}

.account-balance {
  font-size: 40px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -1px;
  margin-bottom: 8px;
}

.dark .account-balance {
  color: var(--color-text-light);
}

.available-balance {
  font-size: 14px;
  color: var(--color-text-muted);
}

.dark .available-balance {
  color: #94a3b8;
}

@media (max-width: 480px) {
  .balance-card {
    padding: 20px 16px;
  }
  .card-header {
    margin-bottom: 16px;
  }
  .account-name {
    font-size: 14px;
  }
  .account-balance {
    font-size: 26px;
    margin-bottom: 4px;
  }
  .available-balance {
    font-size: 12px;
  }
}
</style>
