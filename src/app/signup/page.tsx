import Link from 'next/link'
import { signUp } from '@/app/auth/actions'

export default async function SignupPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto mt-20">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{' '}
        Trang chủ
      </Link>

      <form className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground" action={signUp}>
        <h1 className="text-3xl font-bold mb-6 text-center text-slate-800">Đăng Ký Tài Khoản</h1>
        <label className="text-md text-slate-600" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border border-slate-300 mb-6 text-slate-900"
          name="email"
          placeholder="you@example.com"
          required
        />
        <label className="text-md text-slate-600" htmlFor="password">
          Mật khẩu
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border border-slate-300 mb-6 text-slate-900"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        <button className="bg-indigo-600 text-white rounded-md px-4 py-2 text-foreground mb-2 hover:bg-indigo-700 transition-colors">
          Đăng Ký
        </button>
        <p className="text-sm text-center text-slate-600">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-amber-50 text-amber-800 text-center rounded-md">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}
