import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShoppingBag, 
  Coffee, 
  Home, 
  Car,
  MoreHorizontal
} from 'lucide-react';

import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

interface Transaction {
  id: string | number;
  title: string;
  category: string;
  amount: number;
  transaction_date: string;
  type: 'income' | 'expense';
}

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'food': return Coffee;
      case 'shopping': return ShoppingBag;
      case 'utilities': return Home;
      case 'transport': return Car;
      case 'salary': return ArrowUpRight;
      default: return MoreHorizontal;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'food': return 'bg-emerald-100 text-emerald-700';
      case 'shopping': return 'bg-amber-100 text-amber-700';
      case 'utilities': return 'bg-blue-100 text-blue-700';
      case 'salary': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatCurrency = (amount: number, type: 'income' | 'expense') => {
    const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Giao dịch gần đây</h3>
        <button className="text-xs font-bold text-aura-indigo hover:underline">Xem tất cả</button>
      </div>
      
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Chưa có giao dịch nào</div>
        ) : (
          transactions.map((tx) => {
            const Icon = getCategoryIcon(tx.category);
            const colorClass = getCategoryColor(tx.category);
            return (
              <div key={tx.id} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{tx.title}</p>
                    <p className="text-xs text-muted-foreground uppercase text-[10px] tracking-wider">{tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-foreground'}`}>
                    {formatCurrency(tx.amount, tx.type)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">
                    {dayjs(tx.transaction_date).format('DD [Th] MM, YYYY')}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
