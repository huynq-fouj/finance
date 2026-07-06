'use client';

import { useState, useTransition, useEffect } from 'react';
import { ChevronLeft, Wallet, User, CheckCircle2 } from 'lucide-react';
import { Modal, Drawer, Form, InputNumber, Input, Button, ConfigProvider } from 'antd';
import { addDebtRepayment, getDebtTransactions, deleteDebt } from '@/app/debts/actions';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';

const antdTheme = {
  token: {
    colorPrimary: '#6366f1',
    borderRadius: 8,
    fontFamily: 'inherit',
  },
  components: {
    Button: { borderRadius: 8, controlHeightLG: 40, fontWeight: 600 },
    InputNumber: { borderRadius: 8, controlHeightLG: 40 },
    Input: { borderRadius: 8, controlHeightLG: 40 },
    Modal: { borderRadiusLG: 24, paddingContentHorizontalLG: 24, paddingLG: 24 },
  },
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

export default function DebtDetailModal({ 
  debt, 
  open, 
  onClose,
  onSaved
}: { 
  debt: any; 
  open: boolean; 
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [form] = Form.useForm();
  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => {
    const handleClose = () => onClose();
    window.addEventListener('closeAllModals', handleClose);
    return () => window.removeEventListener('closeAllModals', handleClose);
  }, [onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (open && debt?.id) {
      setLoadingTx(true);
      getDebtTransactions(debt.id).then(res => {
        setTransactions(res.data || []);
        setLoadingTx(false);
      });
      form.resetFields();
    }
  }, [open, debt?.id, form]);

  const handleFinish = (values: any) => {
    if (!debt) return;
    if (!values.amount || values.amount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (values.amount > debt.remaining_amount) {
      toast.error('Số tiền trả không được vượt quá số nợ còn lại');
      return;
    }
    
    startTransition(async () => {
      const result = await addDebtRepayment(debt.id, values.amount, values.note);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Ghi nhận thanh toán thành công!');
        form.resetFields();
        // Refresh transactions
        const res = await getDebtTransactions(debt.id);
        setTransactions(res.data || []);
        if (onSaved) onSaved();
      }
    });
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa khoản nợ này? Dữ liệu không thể khôi phục.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      centered: true,
      onOk: () => {
        startTransition(async () => {
          const result = await deleteDebt(debt.id);
          if (result.error) toast.error(result.error);
          else {
            toast.success('Xóa khoản nợ thành công');
            onClose();
            if (onSaved) onSaved();
          }
        });
      }
    });
  };

  const isReceivable = debt?.type === 'receivable';

  const headerContent = (
    <div className="flex items-center justify-between w-full pr-1">
      <div className="flex items-center gap-3">
        <button onClick={() => !isPending && onClose()} className="md:hidden p-1 -ml-1 text-foreground transition-colors shrink-0 border-none bg-transparent cursor-pointer flex items-center justify-center">
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <span className="text-xl font-bold tracking-tight text-foreground">Chi tiết khoản nợ</span>
      </div>
      <Button className='!bg-red-50 hover:!bg-red-100' danger type="text" onClick={handleDelete} disabled={isPending}>Xóa</Button>
    </div>
  );

  const formContent = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto pt-4 px-4 pb-24 md:pb-6 space-y-6">
        
        {/* Info Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Người liên hệ</div>
              <div className="text-lg font-bold text-slate-900">{debt?.contacts?.name || '---'}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 border-dashed">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Tổng nợ</div>
              <div className="font-bold text-slate-700">{new Intl.NumberFormat('vi-VN').format(debt?.total_amount || 0)} đ</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Còn lại</div>
              <div className={`font-bold ${isReceivable ? 'text-green-600' : 'text-red-500'}`}>
                {new Intl.NumberFormat('vi-VN').format(debt?.remaining_amount || 0)} đ
              </div>
            </div>
          </div>
        </div>

        {/* Repayment Form */}
          {debt?.status !== 'settled' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-500" />
                Ghi nhận {isReceivable ? 'thu tiền' : 'trả tiền'}
              </h3>
              <Form.Item name="amount" rules={[{ required: true, message: 'Nhập số tiền!' }]} className="mb-3">
                <InputNumber
                  size="large"
                  placeholder="Số tiền"
                  className="w-full bg-slate-50"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value ? value.replace(/,/g, '') as any : ''}
                  style={{ width: '100%' }}
                  controls={false}
                />
              </Form.Item>
              <Form.Item name="note" className="mb-3">
                <Input size="large" placeholder="Ghi chú (không bắt buộc)" className="bg-slate-50" />
              </Form.Item>
              <Button type="primary" onClick={() => form.submit()} loading={isPending} block size="large" className="shadow-md">
                Xác nhận
              </Button>
            </div>
          )}

        {/* Transaction History */}
        <div>
          <h3 className="font-bold text-slate-800 mb-3 text-sm">Lịch sử thanh toán</h3>
          {loadingTx ? (
            <div className="text-center py-4 text-slate-400 text-sm">Đang tải...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
              <p className="text-slate-400 text-sm">Chưa có giao dịch thanh toán nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        {isReceivable ? 'Thu tiền' : 'Trả nợ'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {dayjs(tx.transaction_date).format('DD/MM/YYYY HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      {new Intl.NumberFormat('vi-VN').format(tx.amount)} đ
                    </div>
                    {tx.note && <div className="text-[10px] text-slate-400">{tx.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ConfigProvider theme={antdTheme}>
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
      {debt && (
        isMobile ? (
          <Drawer title={headerContent} placement="right" size="100%" onClose={() => !isPending && onClose()} open={open} closable={false} className="transaction-drawer" styles={{ body: { padding: 0 } }}>
            {formContent}
          </Drawer>
        ) : (
          <Modal title={headerContent} open={open} onCancel={() => !isPending && onClose()} footer={null} width={450} centered className="transaction-modal" styles={{ body: { padding: 0, height: '600px' } }}>
            {formContent}
          </Modal>
        )
      )}
      </Form>
    </ConfigProvider>
  );
}
