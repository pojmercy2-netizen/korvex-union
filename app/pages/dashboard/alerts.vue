<template>
  <div class="dashboard-page-container">
    <div class="dashboard-page-header flex-between">
      <div>
        <h2>System Alerts</h2>
        <p>Review recent account notifications and security alerts.</p>
      </div>
      <button class="text-btn" @click="markAllRead">Mark All Read</button>
    </div>

    <div class="dashboard-card">
      <div class="message-list">
        <div 
          v-for="alert in alerts" 
          :key="alert.id" 
          :class="['message-item', { unread: alert.unread }]"
          @click="openAlert(alert)"
        >
          <div class="message-icon" :style="{ backgroundColor: alert.bg, color: alert.color }">
            <Icon :name="alert.icon" class="w-5 h-5 text-current" />
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">{{ alert.sender }}</span>
              <span class="message-time">{{ alert.time }}</span>
            </div>
            <div class="message-subject">{{ alert.subject }}</div>
            <div class="message-preview">{{ alert.preview }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'System Alerts | Korvex Union'
})

interface Alert {
  id: number
  sender: string
  time: string
  subject: string
  preview: string
  icon: string
  bg: string
  color: string
  unread: boolean
}

const alerts = ref<Alert[]>([
  {
    id: 1,
    sender: 'Security Alert',
    time: '2 hours ago',
    subject: 'New Login Detected',
    preview: 'Your account was accessed from a new device in San Francisco, CA. If this wasn\'t you, please change your password immediately.',
    icon: 'i-lucide-shield-alert',
    bg: '#fee2e2',
    color: '#ef4444',
    unread: true
  },
  {
    id: 2,
    sender: 'Account Alert',
    time: 'Yesterday',
    subject: 'Low Balance Warning',
    preview: 'Your Everyday Checking account balance fell below your threshold of $500.00 briefly yesterday.',
    icon: 'i-lucide-alert-triangle',
    bg: '#fef3c7',
    color: '#f59e0b',
    unread: false
  },
  {
    id: 3,
    sender: 'Transaction Alert',
    time: 'May 20',
    subject: 'Large Deposit Cleared',
    preview: 'A direct deposit of $2,650.00 has successfully cleared and is now available in your checking account.',
    icon: 'i-lucide-check-circle',
    bg: '#dcfce7',
    color: '#10b981',
    unread: false
  }
])

const alertPrompt = (msg: string) => {
  if (import.meta.client) {
    window.alert(msg)
  }
}

const markAllRead = () => {
  alerts.value.forEach(a => a.unread = false)
  alertPrompt('Marked all alerts as read.')
}

const openAlert = (a: Alert) => {
  a.unread = false
  alertPrompt(`System Alert:\n\n[${a.sender}] ${a.subject}\n\n${a.preview}`)
}
</script>

<style scoped>
.dashboard-page-container {
  max-width: 1000px;
  margin: 0 auto;
}

.dashboard-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.dashboard-page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.dark .dashboard-page-header h2 {
  color: var(--color-text-light);
}

.dashboard-page-header p {
  font-size: 14px;
  color: var(--color-text-muted);
}

.dark .dashboard-page-header p {
  color: #94a3b8;
}

.text-btn {
  color: var(--color-secondary);
  font-size: 14px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.text-btn:hover {
  background-color: rgba(0, 102, 255, 0.05);
}

.dark .text-btn:hover {
  background-color: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
}

.dashboard-card {
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
  padding: 24px;
}

.dark .dashboard-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.dark .message-item {
  border-color: var(--color-border-dark);
}

.message-item:hover {
  background-color: var(--color-background-subtle);
}

.dark .message-item:hover {
  background-color: var(--color-background-dark-subtle);
}

.message-item.unread {
  background-color: rgba(239, 68, 68, 0.03);
  border-color: rgba(239, 68, 68, 0.15);
}

.dark .message-item.unread {
  background-color: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.2);
}

.message-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.message-sender {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-main);
}

.dark .message-sender {
  color: var(--color-text-light);
}

.message-time {
  font-size: 12px;
  color: var(--color-text-muted);
}

.dark .message-time {
  color: #94a3b8;
}

.message-subject {
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 4px;
  font-size: 14px;
}

.dark .message-subject {
  color: var(--color-text-light);
}

.message-preview {
  font-size: 13px;
  color: var(--color-text-muted);
}

.dark .message-preview {
  color: #94a3b8;
}
</style>
