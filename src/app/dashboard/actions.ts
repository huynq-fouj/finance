'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import dayjs from 'dayjs';
import { getUser } from '../auth/actions';

export async function getDashboardData(
  range: 'recent' | 'month' = 'recent',
  period: 'this_month' | 'this_week' | 'last_week' | 'last_month' | 'this_year' = 'this_month'
) {
  const user = await getUser();
  if (!user) return null;

  const supabase = createAdminClient();

  // Fetch ALL transactions for balance and global stats
  const { data: allTransactions, error: allErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false });

  if (allErr || !allTransactions) {
    console.error('Error fetching transactions:', allErr);
    return null;
  }

  // Calculate Balance (All time)
  const totalIncomeAll = allTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalExpenseAll = allTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const balance = totalIncomeAll - totalExpenseAll;

  // Calculate Period-based Stats
  let startDate = dayjs().startOf('month');
  let endDate = dayjs().endOf('month');

  if (period === 'this_week') {
    startDate = dayjs().startOf('week');
    endDate = dayjs().endOf('week');
  } else if (period === 'last_week') {
    startDate = dayjs().subtract(1, 'week').startOf('week');
    endDate = dayjs().subtract(1, 'week').endOf('week');
  } else if (period === 'last_month') {
    startDate = dayjs().subtract(1, 'month').startOf('month');
    endDate = dayjs().subtract(1, 'month').endOf('month');
  } else if (period === 'this_year') {
    startDate = dayjs().startOf('year');
    endDate = dayjs().endOf('year');
  }

  const periodTransactions = allTransactions.filter(tx => {
    const txDate = dayjs(tx.transaction_date);
    return txDate.isAfter(startDate.subtract(1, 'ms')) && txDate.isBefore(endDate.add(1, 'ms'));
  });

  const totalIncome = periodTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
  const totalExpense = periodTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
  const savings = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Chart Data logic (Keep as is but using range)
  let transactionsForChart = allTransactions;
  if (range === 'month') {
    const startOfMonth = dayjs().startOf('month');
    const endOfMonth = dayjs().endOf('month');
    transactionsForChart = allTransactions.filter(tx => {
      const txDate = dayjs(tx.transaction_date);
      return txDate.isAfter(startOfMonth.subtract(1, 'ms')) && txDate.isBefore(endOfMonth.add(1, 'ms'));
    });
  }

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

    allTransactions.forEach(tx => {
      const txMonth = dayjs(tx.transaction_date).format('YYYY-MM');
      const monthData = chartData.find(m => m.month === txMonth);
      if (monthData) {
        if (tx.type === 'income') monthData.income += Number(tx.amount);
        else monthData.expenses += Number(tx.amount);
      }
    });
  } else {
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

    transactionsForChart.forEach(tx => {
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
    recentTransactions: allTransactions.slice(0, 5),
    chartData,
  };
}
