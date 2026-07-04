import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { users } from '../../../database/schema/users'
import { accounts } from '../../../database/schema/accounts'
import { transactions } from '../../../database/schema/transactions'
import { hashPassword } from '../../../utils/hash'
import { withErrorHandler, conflict } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { logAdminAction } from '../../../utils/adminLog'
import { sendSuccess } from '../../../utils/response'

const createUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  balance: z.number().nonnegative().optional().default(0),
  currency: z.string().optional().default('USD'),
  role: z.enum(['user', 'admin', 'superadmin']).optional().default('user'),
  kycStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional().default('unverified'),
  password: z.string().min(8).optional()
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)
  const validated = createUserSchema.parse(body)

  const db = useDb()

  // Verify email uniqueness
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, validated.email))
    .limit(1)

  if (existing) {
    throw conflict('Email is already registered')
  }

  // Handle password creation
  const rawPassword = validated.password || Math.random().toString(36).substring(2, 12) + '!'
  const passwordHash = await hashPassword(rawPassword)

  const finalName = `${validated.firstName} ${validated.lastName}`
  const username = validated.email.split('@')[0] || `user_${Date.now()}`

  // Execute transaction to create user and checking account
  const result = await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(users)
      .values({
        email: validated.email,
        fullName: finalName,
        username,
        phone: validated.phone || null,
        passwordHash,
        role: validated.role,
        status: 'active',
        kycStatus: validated.kycStatus
      })
      .returning()

    // Create checking account
    const randAcct = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')
    const [newAccount] = await tx
      .insert(accounts)
      .values({
        userId: newUser.id,
        accountNumber: randAcct,
        accountType: 'checking',
        balance: validated.balance.toFixed(2),
        currency: validated.currency
      })
      .returning()

    // Log the initial balance transaction if positive
    if (validated.balance > 0) {
      await tx
        .insert(transactions)
        .values({
          accountId: newAccount.id,
          userId: newUser.id,
          type: 'deposit',
          amount: validated.balance.toFixed(2),
          description: 'Initial balance deposit by admin',
          status: 'completed',
          method: 'Admin Credit',
          reference: `INIT${Date.now()}`
        })
    }

    return { newUser, rawPassword }
  })

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'CREATE_USER',
    targetType: 'users',
    targetId: result.newUser.id,
    details: { email: validated.email, role: validated.role, balance: validated.balance }
  })

  return sendSuccess(
    event,
    {
      id: result.newUser.id,
      fullName: result.newUser.fullName,
      email: result.newUser.email,
      role: result.newUser.role,
      status: result.newUser.status,
      password: result.rawPassword // return password so admin can view it/copy link
    },
    'User account created successfully',
    201
  )
})
