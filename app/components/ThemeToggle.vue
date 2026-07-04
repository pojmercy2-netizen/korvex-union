<template>
  <button
    class="theme-toggle"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <span class="theme-toggle-track">
      <span class="theme-toggle-thumb" :class="{ dark: isDark }">
        <Icon
          :name="isDark ? 'lucide:moon' : 'lucide:sun'"
          :size="14"
          class="theme-toggle-icon"
        />
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const toggle = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 999px;
  flex-shrink: 0;
}

.theme-toggle-track {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--color-border);
  display: flex;
  align-items: center;
  padding: 3px;
  transition: background 0.3s ease;
  position: relative;
  border: 1.5px solid var(--color-border);
}

.dark .theme-toggle-track {
  background: rgba(0, 102, 255, 0.3);
  border-color: rgba(0, 102, 255, 0.4);
}

.theme-toggle-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  transform: translateX(0);
}

.theme-toggle-thumb.dark {
  transform: translateX(22px);
  background: #7da7ff;
}

.theme-toggle-icon {
  color: #fff;
}

@media (max-width: 480px) {
  .theme-toggle-track {
    width: 38px;
    height: 22px;
  }
  .theme-toggle-thumb {
    width: 16px;
    height: 16px;
  }
  .theme-toggle-thumb.dark {
    transform: translateX(16px);
  }
}
</style>
