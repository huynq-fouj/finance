import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/auth/actions'
import Link from 'next/link'

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 items-center mt-20 px-4">
      <div className="max-w-4xl w-full flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Tài khoản</h1>
        <form action={signOut}>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-md transition-colors">
            Đăng Xuất
          </button>
        </form>
      </div>

      <div className="max-w-4xl w-full flex flex-col gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-700 border-b pb-4 mb-2">Thông tin cá nhân</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="font-medium text-slate-500">Email</div>
          <div className="md:col-span-2 text-slate-900">{user.email}</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
          <div className="font-medium text-slate-500">User ID</div>
          <div className="md:col-span-2 font-mono text-sm text-slate-600 bg-slate-50 p-2 rounded">{user.id}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
          <div className="font-medium text-slate-500">Lần đăng nhập cuối</div>
          <div className="md:col-span-2 text-slate-900">
            {new Date(user.last_sign_in_at || '').toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full text-center mt-8">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 transition-colors">
          &larr; Quay lại Trang chủ
        </Link>
      </div>
    </div>
  )
}
