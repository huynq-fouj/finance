This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Database Setup (Supabase)

Dưới đây là các lệnh SQL cần thiết để khởi tạo bảng dữ liệu cho ứng dụng trên Supabase. Bạn hãy chạy các lệnh này trong mục **SQL Editor** của Supabase Dashboard.

### 1. Bảng Users (Người dùng)

```sql
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 2. Bảng Transactions (Giao dịch Thu/Chi)

**Trường hợp 1: Bạn CHƯA tạo bảng `transactions`**
Hãy chạy toàn bộ đoạn mã SQL dưới đây:

```sql
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Đánh index để tối ưu truy vấn sau này
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
```

**Trường hợp 2: Bạn ĐÃ tạo bảng `transactions` trước đó (không có cột category)**
Chỉ cần chạy lệnh sau để bổ sung cột `category` (danh mục) mà không làm mất dữ liệu cũ:

```sql
ALTER TABLE public.transactions 
ADD COLUMN category TEXT NOT NULL DEFAULT 'other';
```
