<template>
  <nav class="navbar" :class="{ 'navbar-scrolled': scrolled }">
    <div class="container navbar-container">
      <!-- Logo -->
      <NuxtLink to="/" class="navbar-logo" @click="closeMobileMenu">
        <div class="logo-icon">
          <img src="/logo.png" alt="Korvex Union Logo" class="logo-img" />
        </div>
      </NuxtLink>

      <!-- Desktop Links -->
      <ul class="navbar-links desktop-only">
        <li v-for="link in navLinks" :key="link.label" class="nav-item">
          <a v-if="link.hash" class="nav-link" href="#" @click.prevent="scrollToSection(link.hash)">
            {{ link.label }}
            <Icon name="lucide:chevron-down" :size="14" class="nav-chevron" />
          </a>
          <NuxtLink v-else :to="link.path" class="nav-link">
            {{ link.label }}
            <Icon name="lucide:chevron-down" :size="14" class="nav-chevron" />
          </NuxtLink>
        </li>
      </ul>

      <!-- Desktop Actions -->
      <div class="navbar-actions desktop-only">
        <ThemeToggle />
        <button class="search-btn" aria-label="Search">
          <Icon name="lucide:search" :size="20" />
        </button>
        <NuxtLink to="/login" class="btn navbar-login-btn login-btn">Log In</NuxtLink>
        <NuxtLink to="/register" class="btn btn-primary open-account-btn">Open an Account</NuxtLink>
      </div>

      <!-- Mobile Toggle -->
      <button
        class="mobile-menu-btn"
        :aria-expanded="isMobileMenuOpen"
        aria-label="Toggle mobile menu"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <Icon v-if="isMobileMenuOpen" name="lucide:x" :size="28" />
        <Icon v-else name="lucide:menu" :size="28" />
      </button>

      <!-- Mobile Menu Overlay -->
      <div class="mobile-menu-overlay" :class="{ open: isMobileMenuOpen }">
        <div class="mobile-menu-content">
          <ul class="mobile-nav-links">
            <li v-for="link in navLinks" :key="link.label">
              <a v-if="link.hash" href="#" @click.prevent="scrollToSection(link.hash); closeMobileMenu()">{{ link.label }}</a>
              <NuxtLink v-else :to="link.path" @click="closeMobileMenu">{{ link.label }}</NuxtLink>
            </li>
          </ul>
          <div class="mobile-nav-actions">
            <ThemeToggle style="align-self: flex-start; margin-bottom: 8px;" />
            <NuxtLink to="/login" class="btn navbar-login-btn" @click="closeMobileMenu">Log In</NuxtLink>
            <NuxtLink to="/register" class="btn btn-primary" @click="closeMobileMenu">Open an Account</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { y: scrollY } = useWindowScroll()
const scrolled = computed(() => scrollY.value > 10)
const isMobileMenuOpen = ref(false)
const closeMobileMenu = () => { isMobileMenuOpen.value = false }

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/', hash: 'services', label: 'Services' },
  { path: '/personal', label: 'Personal' },
  { path: '/business', label: 'Business' },
  { path: '/loans', label: 'Loans' },
  { path: '/investments', label: 'Investments' },
  { path: '/about', label: 'About Us' },
  { path: '/', hash: 'faq', label: 'FAQ' },
  { path: '/', hash: 'contact', label: 'Contact' }
]

const router = useRouter()
const route = useRoute()

const scrollToSection = (hash: string) => {
  closeMobileMenu()
  if (route.path === '/') {
    const el = document.getElementById(hash)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  } else {
    router.push({ path: '/', hash: `#${hash}` })
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: transparent;
  transition: background 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease;
  
  --navbar-link-color: rgba(30, 41, 59, 0.8);
  --navbar-link-hover-color: #0066FF;
  --navbar-link-hover-bg: rgba(0, 102, 255, 0.06);
  --navbar-scrolled-bg: rgba(255, 255, 255, 0.95);
  --navbar-scrolled-box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
  --navbar-search-btn-color: rgba(30, 41, 59, 0.7);
  --navbar-search-btn-hover-bg: rgba(0, 102, 255, 0.06);
  --navbar-search-btn-hover-color: #0066FF;
  --navbar-mobile-btn-color: rgba(30, 41, 59, 0.85);
  --navbar-mobile-btn-hover-bg: rgba(0, 102, 255, 0.06);
  --navbar-mobile-overlay-bg: #ffffff;
  
  --navbar-btn-border: var(--color-secondary);
  --navbar-btn-color: var(--color-secondary);
  --navbar-btn-border-hover: var(--color-secondary-hover);
  --navbar-btn-bg-hover: rgba(0, 102, 255, 0.06);
  --navbar-btn-color-hover: var(--color-secondary-hover);
}

:global(.dark) .navbar {
  --navbar-link-color: rgba(255, 255, 255, 0.75);
  --navbar-link-hover-color: #ffffff;
  --navbar-link-hover-bg: rgba(255, 255, 255, 0.08);
  --navbar-scrolled-bg: rgba(10, 25, 47, 0.95);
  --navbar-scrolled-box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  --navbar-search-btn-color: rgba(255, 255, 255, 0.7);
  --navbar-search-btn-hover-bg: rgba(255, 255, 255, 0.1);
  --navbar-search-btn-hover-color: #ffffff;
  --navbar-mobile-btn-color: rgba(255, 255, 255, 0.85);
  --navbar-mobile-btn-hover-bg: rgba(255, 255, 255, 0.1);
  --navbar-mobile-overlay-bg: var(--color-primary);
  
  --navbar-btn-border: rgba(255, 255, 255, 0.4);
  --navbar-btn-color: #ffffff;
  --navbar-btn-border-hover: rgba(255, 255, 255, 0.8);
  --navbar-btn-bg-hover: rgba(255, 255, 255, 0.12);
  --navbar-btn-color-hover: #ffffff;
}

.navbar-scrolled {
  background: var(--navbar-scrolled-bg);
  backdrop-filter: blur(12px);
  box-shadow: var(--navbar-scrolled-box-shadow);
  border-bottom: 1px solid var(--color-border);
}

:global(.dark) .navbar-scrolled {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.navbar-container {
  display: flex;
  align-items: center;
  height: 72px;
  gap: 20px;
}

.navbar-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-right: 16px;
}

.logo-icon {
  width: 220px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

@media (max-width: 1024px) {
  .logo-icon {
    width: 200px;
    height: 54px;
  }
}

@media (max-width: 768px) {
  .logo-icon {
    width: 175px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .logo-icon {
    width: 145px;
    height: 40px;
  }
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Desktop Nav Links */
.navbar-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.nav-item { position: relative; }

.nav-link {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 6px 10px;
  border-radius: 8px;
  color: var(--navbar-link-color);
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--navbar-link-hover-color);
  background: var(--navbar-link-hover-bg);
}

.nav-chevron {
  opacity: 0.6;
  transition: transform 0.2s;
}

/* Desktop Actions */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  color: var(--navbar-search-btn-color);
  transition: all 0.2s;
}
.search-btn:hover {
  background: var(--navbar-search-btn-hover-bg);
  color: var(--navbar-search-btn-hover-color);
}

.navbar-login-btn {
  border: 1.5px solid var(--navbar-btn-border);
  color: var(--navbar-btn-color);
  background: transparent;
}
.navbar-login-btn:hover {
  border-color: var(--navbar-btn-border-hover);
  background: var(--navbar-btn-bg-hover);
  color: var(--navbar-btn-color-hover);
}

.login-btn {
  font-size: 14px;
  padding: 8px 18px;
}

.open-account-btn {
  font-size: 14px;
  padding: 8px 18px;
}

/* Mobile toggle */
.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  color: var(--navbar-mobile-btn-color);
  width: 44px;
  height: 44px;
  border-radius: 8px;
  margin-left: auto;
  transition: background 0.2s;
}
.mobile-menu-btn:hover { background: var(--navbar-mobile-btn-hover-bg); }

/* Mobile overlay */
.mobile-menu-overlay {
  display: none;
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--navbar-mobile-overlay-bg);
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow-y: auto;
  z-index: 99;
}

.mobile-menu-overlay.open {
  transform: translateX(0);
}

.mobile-menu-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-nav-links li a {
  display: block;
  padding: 14px 16px;
  font-size: 18px;
  font-weight: 500;
  color: var(--navbar-link-color);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}
.mobile-nav-links li a:hover {
  color: var(--navbar-link-hover-color);
  background: var(--navbar-link-hover-bg);
}

.mobile-nav-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}


.mobile-nav-actions .btn {
  justify-content: center;
  padding: 14px;
  font-size: 16px;
}

.desktop-only {
  display: flex;
}

@media (max-width: 900px) {
  .desktop-only { display: none !important; }
  .mobile-menu-btn { display: flex; }
  .mobile-menu-overlay { display: block; }
  .navbar-container { gap: 16px; }
}
</style>
