export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Korvex Union API Service'
  }
})
