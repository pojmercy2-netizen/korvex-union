<template>
  <div>
    <PageLoader />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
*, *::before, *::after {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease;
}
/* Prevent transition on images and icons */
img, svg, .theme-toggle-thumb {
  transition: none !important;
}
.theme-toggle-thumb {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease !important;
}
</style>
