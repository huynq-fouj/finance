'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { signToken } from '@/utils/auth'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  // Find user in public.users
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user) {
    return redirect(`/login?message=${encodeURIComponent('Invalid login credentials')}`)
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash)
  if (!isValid) {
    return redirect(`/login?message=${encodeURIComponent('Invalid login credentials')}`)
  }

  // Create token
  const token = await signToken({ userId: user.id, email: user.email })
  
  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(password, salt)

  // Insert user
  const { data: user, error } = await supabase
    .from('users')
    .insert([{ email, password_hash: passwordHash }])
    .select()
    .single()

  if (error) {
    return redirect(`/signup?message=${encodeURIComponent(error.message)}`)
  }

  // Create token
  const token = await signToken({ userId: user.id, email: user.email })
  
  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
  revalidatePath('/', 'layout')
  redirect('/login')
}
