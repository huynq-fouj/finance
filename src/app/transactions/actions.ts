'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { verifyToken } from '@/utils/auth'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const getAdminClient = () => createSupabaseClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createTransaction(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return { error: 'Không tìm thấy phiên đăng nhập' }
  }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) {
    return { error: 'Phiên đăng nhập không hợp lệ' }
  }

  const type = formData.get('type') as string
  const title = formData.get('title') as string
  const amountStr = formData.get('amount') as string
  const amount = parseFloat(amountStr)
  const transactionDate = formData.get('transactionDate') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string

  if (!title || isNaN(amount) || !transactionDate || !type || !category) {
    return { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc' }
  }

  const supabase = getAdminClient()

  const { error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: payload.userId,
        type: type, // 'income' or 'expense'
        title: title,
        category: category,
        amount: amount,
        transaction_date: new Date(transactionDate).toISOString(),
        description: description || null
      }
    ])

  if (error) {
    console.error('Lỗi khi tạo giao dịch:', error)
    return { error: 'Có lỗi xảy ra khi tạo giao dịch. Vui lòng đảm bảo bạn đã tạo bảng transactions trong database.' }
  }

  revalidatePath('/')
  revalidatePath('/transactions')
  
  return { success: true }
}
