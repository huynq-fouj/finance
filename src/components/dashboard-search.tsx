'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DashboardSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Chuyển hướng sang trang giao dịch với tham số tìm kiếm
    router.push(`/transactions?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative group flex-1 md:flex-none">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-aura-indigo transition-colors" />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm kiếm nhanh (Enter)..." 
        className="pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-aura-indigo/5 focus:border-aura-indigo transition-all w-full md:w-64"
      />
    </form>
  );
}
