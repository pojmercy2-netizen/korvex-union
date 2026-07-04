import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { users } from '../../../database/schema/users'
import { accounts } from '../../../database/schema/accounts'
import { transfers } from '../../../database/schema/transfers'
import { transactions } from '../../../database/schema/transactions'
import { withErrorHandler, badRequest, forbidden } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

const createTransferSchema = z.object({
  method: z.enum(['Crypto Transfer', 'Skrill', 'Google Pay', 'Western Union', 'Wise', 'Payoneer']),
  amount: z.number().positive('Amount must be positive'),
  pin: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  walletAddress: z.string().optional().or(z.literal('')),
  coin: z.string().optional().or(z.literal('')),
  recipientName: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  currency: z.string().optional().or(z.literal('')),
  note: z.string().optional().or(z.literal(''))
})

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const body = await readBody(event)
  const validated = createTransferSchema.parse(body)

  const db = useDb()

  // 1. Get user profile details (check transfer PIN if set)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1)

  if (user && user.transferPin) {
    if (!validated.pin) {
      throw forbidden('Transfer PIN is required to complete this transfer')
    }
    if (user.transferPin !== validated.pin) {
      throw badRequest('Invalid transfer PIN')
    }
  }

  // 2. Fetch user's checking account (must deduct from checking)
  const [checkingAccount] = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, authUser.id),
        eq(accounts.accountType, 'checking')
      )
    )
    .limit(1)

  if (!checkingAccount) {
    throw badRequest('No checking account found to execute transfer')
  }

  const currentBalance = parseFloat(checkingAccount.balance)
  if (currentBalance < validated.amount) {
    throw badRequest('Insufficient funds in checking account')
  }

  const newBalance = (currentBalance - validated.amount).toFixed(2)

  // 3. Execute inside a transaction: deduct balance, insert transfer record, insert transaction record
  const result = await db.transaction(async (tx) => {
    // Deduct checking account balance
    await tx
      .update(accounts)
      .set({
        balance: newBalance
      })
      .where(eq(accounts.id, checkingAccount.id))

    // Create transfer audit entry
    const [newTransfer] = await tx
      .insert(transfers)
      .values({
        userId: authUser.id,
        method: validated.method,
        amount: validated.amount.toFixed(2),
        recipientEmail: validated.email || null,
        recipientName: validated.recipientName || null,
        recipientPhone: validated.phone || null,
        walletAddress: validated.walletAddress || null,
        coin: validated.coin || null,
        country: validated.country || null,
        currency: validated.currency || 'USD',
        note: validated.note || null,
        status: 'completed'
      })
      .returning()

    // Create transaction log entry
    await tx
      .insert(transactions)
      .values({
        accountId: checkingAccount.id,
        userId: authUser.id,
        type: 'transfer',
        amount: (-validated.amount).toFixed(2),
        description: `Sent via ${validated.method} to ${validated.recipientName || validated.email || validated.walletAddress || 'beneficiary'}`,
        status: 'completed',
        method: validated.method,
        reference: `TRF${Date.now()}`
      })

    return newTransfer
  })

  return sendSuccess(event, result, `Transfer of $${validated.amount.toFixed(2)} completed successfully`, 201)
})
