// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  devtools: {
    enabled: false
  },

  runtimeConfig: {
    // Server-only secrets (never exposed to client)
    databaseUrl: process.env.DATABASE_URL || '',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'korvex-access-secret-change-me',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'korvex-refresh-secret-change-me',
    jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    jwtRefreshExpiryRememberMe: process.env.JWT_REFRESH_EXPIRY_REMEMBER_ME || '30d',
    // Public (safe to expose)
    public: {
      appName: 'Korvex Union'
    }
  },

  nitro: {
    compressPublicAssets: true,
    minify: true
  },

  routeRules: {
    // Marketing pages: Incremental Static Regeneration / Edge Caching
    // Netlify Edge serves them in <30ms worldwide with zero lambda cold start
    '/': { isr: 3600 },
    '/about': { isr: 3600 },
    '/business': { isr: 3600 },
    '/personal': { isr: 3600 },
    '/loans': { isr: 3600 },
    '/investments': { isr: 3600 },

    // Static redirects
    '/resources': { redirect: { to: '/', statusCode: 301 } },
    '/resources/**': { redirect: { to: '/', statusCode: 301 } },

    // Edge cache settings endpoint so public visits don't invoke serverless functions
    '/api/settings': { cache: { maxAge: 3600, staleMaxAge: 86400 } },

    // Auth & Dashboard pages are client-side authenticated; SPA mode delivers instant HTML shell
    '/login': { ssr: false },
    '/register': { ssr: false },
    '/admin/login': { ssr: false },
    '/dashboard/**': { ssr: false },
    '/admin/**': { ssr: false },

    // Static assets long-term cache headers
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/logo.png': { headers: { 'cache-control': 'public, max-age=604800, stale-while-revalidate=86400' } },
    '/about-us.png': { headers: { 'cache-control': 'public, max-age=604800, stale-while-revalidate=86400' } },
    '/banking-services.png': { headers: { 'cache-control': 'public, max-age=604800, stale-while-revalidate=86400' } },
    '/favicon.png': { headers: { 'cache-control': 'public, max-age=604800, stale-while-revalidate=86400' } }
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2025-01-15',

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'korvex-color-mode-v2'
  },

  app: {
    head: {
      title: 'Korvex Union — Bank Smarter. Live Better.',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Korvex Union is a secure, premium digital banking platform designed to help you manage today and build for tomorrow.' },
        { name: 'theme-color', content: '#0A192F' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/favicon.png' }
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
