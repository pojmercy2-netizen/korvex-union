<template>
  <div class="gtranslate_wrapper"></div>
</template>

<script setup lang="ts">
onMounted(() => {
  // Set the configuration before loading the script
  if (typeof window !== 'undefined') {
    (window as any).gtranslateSettings = {
      default_language: 'en',
      wrapper_selector: '.gtranslate_wrapper',
      flag_style: '3d'
    }

    // Only inject the script once
    if (!document.querySelector('script[src*="gtranslate"]')) {
      const script = document.createElement('script')
      script.src = 'https://cdn.gtranslate.net/widgets/latest/float.js'
      script.defer = true
      document.body.appendChild(script)
    }
  }
})
</script>

<style>
/* Position the GTranslate float widget above the WhatsApp button on the left */
.gtranslate_wrapper {
  position: fixed !important;
  bottom: 96px !important;
  left: 24px !important;
  z-index: 9998 !important;
  right: auto !important;
}

@media (max-width: 768px) {
  .gtranslate_wrapper {
    bottom: 88px !important;
    left: 20px !important;
  }
}
</style>
