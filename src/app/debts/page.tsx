import { getDebts, getContacts } from './actions';
import DebtListClient from '@/components/debts/debt-list-client';

export const metadata = {
  title: 'Công nợ - Aura Moni',
};

interface PageProps {
  searchParams: Promise<{
    type?: 'receivable' | 'payable';
  }>;
}

export default async function DebtsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = params.type || 'receivable';

  const [debtsRes, contactsRes] = await Promise.all([
    getDebts({ type }),
    getContacts()
  ]);

  return (
    <div className="max-w-none p-4 md:p-8 animate-in fade-in duration-700 h-[calc(100vh-64px)] md:h-screen flex flex-col">
      <div className="flex flex-col gap-2 mb-6 pt-6 md:pt-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Công nợ</h1>
        <p className="text-sm text-muted-foreground">Theo dõi các khoản tiền cho vay và đi vay.</p>
      </div>

      <DebtListClient 
        debts={debtsRes.data} 
        contacts={contactsRes.data} 
        currentType={type} 
      />
    </div>
  );
}
