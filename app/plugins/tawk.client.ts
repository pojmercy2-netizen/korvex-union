export default defineNuxtPlugin(() => {
  // Only run on the client side (file is already .client.ts but guard just in case)
  if (typeof window === 'undefined') return

  // Avoid loading twice on hot-reload
  if (document.querySelector('script[src*="tawk.to"]')) return

  const loadTawk = () => {
    if (document.querySelector('script[src*="tawk.to"]')) return

    // Initialise Tawk globals
    ;(window as any).Tawk_API = (window as any).Tawk_API || {}
    ;(window as any).Tawk_LoadStart = new Date()

    const s1 = document.createElement('script')
    s1.async = true
    s1.src = 'https://embed.tawk.to/6a4a38f58f99461d47cf6e21/1jsout0ho'
    s1.charset = 'UTF-8'
    s1.setAttribute('crossorigin', '*')
    document.head.appendChild(s1)
  }

  // Defer until page is interactive so it never slows down critical rendering or mobile bandwidth
  if (document.readyState === 'complete') {
    setTimeout(loadTawk, 2500)
  } else {
    window.addEventListener('load', () => setTimeout(loadTawk, 2500), { once: true })
  }
})
