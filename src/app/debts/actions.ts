'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { verifyToken } from '@/utils/auth'
import { createAdminClient } from '@/utils/supabase/admin'
import dayjs from 'dayjs'

// ==========================================
// CONTACTS ACTIONS
// ==========================================

export async function getContacts() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { data: [], total: 0 }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return { data: [], total: 0 }

  const supabase = createAdminClient()

  const { data, count, error } = await supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('user_id', payload.userId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching contacts:', error)
    return { data: [], total: 0 }
  }

  return {
    data: data || [],
    total: count || 0,
  }
}

export async function createContact(data: { name: string; phone?: string; avatar_url?: string }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { error: 'Không tìm thấy phiên đăng nhập' }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return { error: 'Phiên đăng nhập không hợp lệ' }

  if (!data.name) return { error: 'Tên người liên hệ là bắt buộc' }

  const supabase = createAdminClient()

  const { data: newContact, error } = await supabase
    .from('contacts')
    .insert([{
      user_id: payload.userId,
      name: data.name,
      phone: data.phone || null,
      avatar_url: data.avatar_url || null,
    }])
    .select()
    .single()

  if (error) {
    console.error('Lỗi khi tạo người liên hệ:', error)
    return { error: 'Có lỗi xảy ra khi thêm người liên hệ' }
  }

  revalidatePath('/debts')
  return { success: true, data: newContact }
}

export async function updateContact(id: string, data: { name: string; phone?: string; avatar_url?: string }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { error: 'Không tìm thấy phiên đăng nhập' }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return { error: 'Phiên đăng nhập không hợp lệ' }

  if (!data.name) return { error: 'Tên người liên hệ là bắt buộc' }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('contacts')
    .update({
      name: data.name,
      phone: data.phone || null,
      avatar_url: data.avatar_url || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', payload.userId)

  if (error) {
    console.error('Error updating contact:', error)
    return { error: 'Có lỗi xảy ra khi cập nhật' }
  }

  revalidatePath('/debts')
  return { success: true }
}

export async function deleteContact(id: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { error: 'Không tìm thấy phiên đăng nhập' }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return { error: 'Phiên đăng nhập không hợp lệ' }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', payload.userId)

  if (error) {
    console.error('Error deleting contact:', error)
    return { error: 'Có lỗi xảy ra khi xóa' }
  }

  revalidatePath('/debts')
  return { success: true }
}

// ==========================================
// DEBTS ACTIONS
// ==========================================

export async function getDebtsSummary() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { receivable: 0, payable: 0 }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return { receivable: 0, payable: 0 }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('debts')
    .select('type, remaining_amount')
    .eq('user_id', payload.userId)

  if (error) {
    console.error('Error fetching debts summary:', error)
    return { receivable: 0, payable: 0 }
  }

  return (data || []).reduce((acc, debt) => {
    if (debt.type === 'receivable') acc.receivable += Number(debt.remaining_amount || 0)
    if (debt.type === 'payable') acc.payable += Number(debt.remaining_amount || 0)
    return acc
  }, { receivable: 0, payable: 0 })
}

export async function getDebts({ type }: { type?: 'receivable' | 'payable' } = {}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { data: [], total: 0 }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return { data: [], total: 0 }

  const supabase = createAdminClient()

  let query = supabase
    .from('debts')
    .select(`
      *,
      contacts (
        id,
        name,
        phone,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('user_id', payload.userId)
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching debts:', error)
    return { data: [], total: 0 }
  }

  return {
    data: data || [],
    total: count || 0,
  }
}

export async function createDebt(data: {
  contact_id: string
  type: 'receivable' | 'payable'
  total_amount: number
  due_date?: string
  note?: string
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { error: 'Không tìm thấy phiên đăng nhập' }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return { error: 'Phiên đăng nhập không hợp lệ' }

  if (!data.contact_id || !data.type || !data.total_amount) {
    return { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('debts')
    .insert([{
      user_id: payload.userId,
      contact_id: data.contact_id,
      type: data.type,
      total_amount: data.total_amount,
      remaining_amount: data.total_amount,
      due_date: data.due_date ? dayjs(data.due_date).format('YYYY-MM-DD') : null,
      note: data.note || null,
      status: 'pending'
    }])

  if (error) {
    console.error('Lỗi khi tạo khoản nợ:', error)
    return { error: 'Có lỗi xảy ra khi thêm khoản nợ' }
  }

  revalidatePath('/debts')
  return { success: true }
}

export async function updateDebt(id: string, data: {
  total_amount: number
  due_date?: string
  note?: string
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { error: 'Không tìm thấy phiên đăng nhập' }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return { error: 'Phiên đăng nhập không hợp lệ' }

  const supabase = createAdminClient()

  // Need to adjust remaining amount if total_amount changes
  const { data: debt } = await supabase.from('debts').select('total_amount, remaining_amount, status').eq('id', id).single()
  
  if (!debt) return { error: 'Không tìm thấy khoản nợ' }

  const paid_amount = debt.total_amount - debt.remaining_amount
  const new_remaining = data.total_amount - paid_amount
  
  let new_status = debt.status
  if (new_remaining <= 0) {
    new_status = 'settled'
  } else if (paid_amount > 0) {
    new_status = 'partial'
  } else {
    new_status = 'pending'
  }

  const { error } = await supabase
    .from('debts')
    .update({
      total_amount: data.total_amount,
      remaining_amount: new_remaining,
      due_date: data.due_date ? dayjs(data.due_date).format('YYYY-MM-DD') : null,
      note: data.note || null,
      status: new_status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', payload.userId)

  if (error) {
    console.error('Error updating debt:', error)
    return { error: 'Có lỗi xảy ra khi cập nhật' }
  }

  revalidatePath('/debts')
  return { success: true }
}

export async function deleteDebt(id: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { error: 'Không tìm thấy phiên đăng nhập' }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return { error: 'Phiên đăng nhập không hợp lệ' }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id)
    .eq('user_id', payload.userId)

  if (error) {
    console.error('Error deleting debt:', error)
    return { error: 'Có lỗi xảy ra khi xóa' }
  }

  revalidatePath('/debts')
  return { success: true }
}

// ==========================================
// DEBT TRANSACTIONS (REPAYMENT)
// ==========================================

export async function addDebtRepayment(debt_id: string, amount: number, note?: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { error: 'Không tìm thấy phiên đăng nhập' }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return { error: 'Phiên đăng nhập không hợp lệ' }

  if (amount <= 0) return { error: 'Số tiền phải lớn hơn 0' }

  const supabase = createAdminClient()

  // 1. Get current debt
  const { data: debt, error: debtError } = await supabase
    .from('debts')
    .select('remaining_amount, total_amount')
    .eq('id', debt_id)
    .eq('user_id', payload.userId)
    .single()

  if (debtError || !debt) {
    return { error: 'Không tìm thấy khoản nợ' }
  }

  if (amount > debt.remaining_amount) {
    return { error: 'Số tiền trả không được lớn hơn số nợ còn lại' }
  }

  // 2. Start transaction-like behavior using RPC or just sequential updates
  // Since we don't have an RPC function for this in Supabase yet, we do sequential updates.
  // In a high concurrency environment, we should use RPC. But for this app, sequential is okay.

  const { error: insertTxError } = await supabase
    .from('debt_transactions')
    .insert([{
      user_id: payload.userId,
      debt_id: debt_id,
      amount: amount,
      note: note || null
    }])

  if (insertTxError) {
    console.error('Error adding debt transaction:', insertTxError)
    return { error: 'Lỗi ghi nhận lịch sử thanh toán' }
  }

  // 3. Update debt remaining amount and status
  const new_remaining = debt.remaining_amount - amount
  const new_status = new_remaining <= 0 ? 'settled' : 'partial'

  const { error: updateDebtError } = await supabase
    .from('debts')
    .update({
      remaining_amount: new_remaining,
      status: new_status,
      updated_at: new Date().toISOString()
    })
    .eq('id', debt_id)

  if (updateDebtError) {
    console.error('Error updating debt after repayment:', updateDebtError)
    return { error: 'Đã lưu giao dịch nhưng lỗi cập nhật dư nợ' }
  }

  revalidatePath('/debts')
  return { success: true }
}

export async function getDebtTransactions(debt_id: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { data: [] }

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return { data: [] }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('debt_transactions')
    .select('*')
    .eq('debt_id', debt_id)
    .eq('user_id', payload.userId)
    .order('transaction_date', { ascending: false })

  if (error) {
    console.error('Error fetching debt transactions:', error)
    return { data: [] }
  }

  return { data: data || [] }
}
