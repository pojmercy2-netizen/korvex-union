// Compatibility alias: admin/create-user.vue calls POST /admin/users/create
// but our canonical route is POST /api/admin/users
import createUserHandler from '../../admin/users/index.post'
export default createUserHandler
