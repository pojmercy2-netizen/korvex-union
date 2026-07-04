// Compatibility alias: admin/notifications.vue calls POST /admin/notifications/send
// but our canonical route is POST /api/admin/notifications
import notificationsHandler from '../../admin/notifications/index.post'
export default notificationsHandler
