'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import dayjs from 'dayjs';
import { getUser } from '../auth/actions';

export async function getDashboardData(range: 'recent' | 'month' = 'recent') {
  const user = await getUser();
  if (!user) return null;

  const supabase = createAdminClient();

  // Fetch transactions
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id);

  if (range === 'month') {
    const startOfMonth = dayjs().startOf('month').toISOString();
    const endOfMonth = dayjs().endOf('month').toISOString();
    query = query.gte('transaction_date', startOfMonth).lte('transaction_date', endOfMonth);
  }

  const { data: transactions, error } = await query.order('transaction_date', { ascending: false });

  if (error || !transactions) {
    console.error('Error fetching transactions:', error);
    return null;
  }

  // Basic Stats (Still based on all time or filtered? Let's keep all time for the top stats)
  const { data: allTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id);
  
  const totalIncome = (allTransactions || [])
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
  const totalExpense = (allTransactions || [])
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
  const balance = totalIncome - totalExpense;
  const savings = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Chart Data
  let chartData: any[] = [];

  if (range === 'recent') {
    chartData = Array.from({ length: 6 }, (_, i) => {
      const d = dayjs().subtract(i, 'month');
      return {
        name: `Th ${d.month() + 1}`,
        month: d.format('YYYY-MM'),
        income: 0,
        expenses: 0
      };
    }).reverse();

    transactions.forEach(tx => {
      const txMonth = dayjs(tx.transaction_date).format('YYYY-MM');
      const monthData = chartData.find(m => m.month === txMonth);
      if (monthData) {
        if (tx.type === 'income') monthData.income += Number(tx.amount);
        else monthData.expenses += Number(tx.amount);
      }
    });
  } else {
    // Current month daily data
    const daysInMonth = dayjs().daysInMonth();
    chartData = Array.from({ length: daysInMonth }, (_, i) => {
      const d = dayjs().date(i + 1);
      return {
        name: d.format('DD/MM'),
        date: d.format('YYYY-MM-DD'),
        income: 0,
        expenses: 0
      };
    });

    transactions.forEach(tx => {
      const txDate = dayjs(tx.transaction_date).format('YYYY-MM-DD');
      const dayData = chartData.find(d => d.date === txDate);
      if (dayData) {
        if (tx.type === 'income') dayData.income += Number(tx.amount);
        else dayData.expenses += Number(tx.amount);
      }
    });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name || 'Admin',
    },
    stats: {
      balance,
      totalIncome,
      totalExpense,
      savings: Math.max(0, Math.round(savings))
    },
    recentTransactions: (allTransactions || []).slice(0, 5),
    chartData,
  };
}
