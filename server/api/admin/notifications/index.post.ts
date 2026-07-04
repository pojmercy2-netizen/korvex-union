import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { notifications } from '../../../database/schema/notifications'
import { users } from '../../../database/schema/users'
import { withErrorHandler } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { logAdminAction } from '../../../utils/adminLog'
import { sendSuccess } from '../../../utils/response'

const createNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  type: z.string().optional().default('info'),
  userId: z.string().optional().nullable()
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const reqBody = await readBody(event)
  const validated = createNotificationSchema.parse(reqBody)

  const db = useDb()

  if (validated.userId) {
    // Single user notification
    const [inserted] = await db
      .insert(notifications)
      .values({
        userId: validated.userId,
        title: validated.title,
        body: validated.body,
        type: validated.type
      })
      .returning()

    await logAdminAction(event, {
      adminId: admin.id,
      action: 'SEND_NOTIFICATION',
      targetType: 'users',
      targetId: validated.userId,
      details: { title: validated.title }
    })

    return sendSuccess(event, inserted, 'Notification sent successfully')
  } else {
    // Broadcast notification to all active users
    const allUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.status, 'active'))

    if (allUsers.length > 0) {
      const inserts = allUsers.map(u => ({
        userId: u.id,
        title: validated.title,
        body: validated.body,
        type: validated.type
      }))

      await db.insert(notifications).values(inserts)
    }

    await logAdminAction(event, {
      adminId: admin.id,
      action: 'BROADCAST_NOTIFICATION',
      details: { title: validated.title, recipientsCount: allUsers.length }
    })

    return sendSuccess(event, null, `Notification broadcasted to ${allUsers.length} active users successfully`)
  }
})
