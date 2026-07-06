'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HandCoins, User, Calendar, CheckCircle2, Clock } from 'lucide-react';
import AddDebtModal from './add-debt-modal';
import DebtDetailModal from './debt-detail-modal';
import dayjs from 'dayjs';
import { getDebtsSummary } from '@/app/debts/actions';

export default function DebtListClient({ 
  debts, 
  contacts,
  currentType 
}: { 
  debts: any[];
  contacts: any[];
  currentType: 'receivable' | 'payable';
}) {
  const router = useRouter();
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [summary, setSummary] = useState<{ receivable: number | null; payable: number | null }>({
    receivable: null,
    payable: null,
  });

  useEffect(() => {
    let isMounted = true;
    getDebtsSummary().then(res => {
      if (isMounted) {
        setSummary({
          receivable: res.receivable,
          payable: res.payable
        });
      }
    });
    return () => { isMounted = false; };
  }, [debts]);
  
  const handleTabChange = (type: 'receivable' | 'payable') => {
    router.push(`/debts?type=${type}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
        <button 
          onClick={() => handleTabChange('receivable')}
          className={`p-4 rounded-lg border text-left transition-all ${
            currentType === 'receivable' 
              ? 'bg-green-50 border-green-200 shadow-sm' 
              : 'bg-white border-slate-100 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <HandCoins className="w-5 h-5" />
            <span className="font-bold text-sm">Tiền cho vay</span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {summary.receivable !== null ? new Intl.NumberFormat('vi-VN').format(summary.receivable) + ' đ' : '... đ'}
          </div>
        </button>

        <button 
          onClick={() => handleTabChange('payable')}
          className={`p-4 rounded-lg border text-left transition-all ${
            currentType === 'payable' 
              ? 'bg-red-50 border-red-200 shadow-sm' 
              : 'bg-white border-slate-100 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <HandCoins className="w-5 h-5" />
            <span className="font-bold text-sm">Tiền đi vay</span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {summary.payable !== null ? new Intl.NumberFormat('vi-VN').format(summary.payable) + ' đ' : '... đ'}
          </div>
        </button>
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="font-bold text-lg text-slate-800">Danh sách nợ</h2>
        <AddDebtModal contacts={contacts} defaultType={currentType} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-20 md:pb-0 pr-1 space-y-3">
        {debts.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <p className="text-slate-500 text-sm mb-4">Chưa có khoản nợ nào ở mục này.</p>
          </div>
        ) : (
          debts.map(debt => (
            <div 
              key={debt.id} 
              onClick={() => setSelectedDebt(debt)}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col md:flex-row items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{debt.contacts?.name || 'Người liên hệ'}</h3>
                    {debt.due_date && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Hẹn trả: {dayjs(debt.due_date).format('DD/MM/YYYY')}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold text-sm ${currentType === 'receivable' ? 'text-green-600' : 'text-red-500'}`}>
                    <span className='text-slate-800'>Tổng:</span> {new Intl.NumberFormat('vi-VN').format(debt.remaining_amount)} đ
                  </div>
                  {debt.status === 'partial' && (
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                      Đã trả {new Intl.NumberFormat('vi-VN').format(debt.total_amount - debt.remaining_amount)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit
                  ${debt.status === 'settled' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-600'}`}>
                  {debt.status === 'settled' ? (
                    <><CheckCircle2 className="w-3 h-3"/> Đã xong</>
                  ) : (
                    <><Clock className="w-3 h-3"/> Đang nợ</>
                  )}
                </div>
                {/* We will add clicking on this card to open details modal later */}
                <div className="text-xs text-indigo-500 font-semibold hover:underline">
                  Xem chi tiết
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <DebtDetailModal 
        debt={selectedDebt} 
        open={!!selectedDebt} 
        onClose={() => setSelectedDebt(null)} 
      />
    </div>
  );
}
