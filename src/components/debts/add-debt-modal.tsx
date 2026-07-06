'use client';

import { useState, useTransition, useEffect } from 'react';
import { Plus, ChevronLeft } from 'lucide-react';
import { Modal, Drawer, Form, Input, InputNumber, DatePicker, Button, Select, ConfigProvider } from 'antd';
import { createDebt, createContact } from '@/app/debts/actions';
import { toast } from 'react-hot-toast';

const antdTheme = {
  token: {
    colorPrimary: '#6366f1',
    borderRadius: 8,
    fontFamily: 'inherit',
  },
  components: {
    Button: { borderRadius: 8, controlHeightLG: 40, fontWeight: 600 },
    Input: { borderRadius: 8, controlHeightLG: 40 },
    Select: { borderRadius: 8, controlHeightLG: 40 },
    InputNumber: { borderRadius: 8, controlHeightLG: 40 },
    DatePicker: { borderRadius: 8, controlHeightLG: 40 },
    Modal: { borderRadiusLG: 24, paddingContentHorizontalLG: 24, paddingLG: 24 },
  },
};

const labelClass = "font-bold text-slate-500 uppercase tracking-widest text-[10px]";

function DebtTypeSelector({ value, onChange }: { value?: string, onChange?: (val: string) => void }) {
  return (
    <div className="flex p-1 bg-slate-100 rounded-lg w-full text-sm">
      <button
        type="button"
        onClick={() => onChange?.('receivable')}
        className={`flex-1 py-2 rounded-md transition-all duration-200 ${value === 'receivable' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-green-600'}`}
      >
        Cho vay (Phải thu)
      </button>
      <button
        type="button"
        onClick={() => onChange?.('payable')}
        className={`flex-1 py-2 rounded-md transition-all duration-200 ${value === 'payable' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-red-600'}`}
      >
        Đi vay (Phải trả)
      </button>
    </div>
  );
}

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

export default function AddDebtModal({ 
  trigger, 
  contacts, 
  defaultType = 'receivable' 
}: { 
  trigger?: React.ReactNode; 
  contacts: any[];
  defaultType?: 'receivable' | 'payable';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form] = Form.useForm();
  const isMobile = useIsMobile();
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');

  const totalAmount = Form.useWatch('total_amount', form);

  const getAmountSuggestions = () => {
    if (!totalAmount || totalAmount >= 10000000) return [];
    return Array.from(new Set([
      totalAmount * 1000,
      totalAmount * 10000,
      totalAmount * 100000,
      totalAmount * 1000000
    ])).filter(val => val >= 1000 && val <= 10000000000).slice(0, 3);
  };

  const suggestions = getAmountSuggestions();

  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener('closeAllModals', handleClose);
    return () => window.removeEventListener('closeAllModals', handleClose);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCreateContact = async () => {
    if (!newContactName.trim()) return;
    
    startTransition(async () => {
      const result = await createContact({ name: newContactName });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Thêm người liên hệ thành công');
        form.setFieldValue('contact_id', result.data.id);
        setIsCreatingContact(false);
        setNewContactName('');
      }
    });
  };

  const handleFinish = (values: any) => {
    startTransition(async () => {
      const result = await createDebt({
        type: values.type,
        contact_id: values.contact_id,
        total_amount: values.total_amount,
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
        note: values.note
      });
      
      if (result.error) {
        if (isMobile) Modal.error({ title: 'Lỗi', content: result.error, centered: true });
        else toast.error(result.error);
      } else {
        if (!isMobile) toast.success('Thêm khoản nợ thành công!');
        setIsOpen(false);
        form.resetFields();
      }
    });
  };

  const headerContent = (
    <div className="flex items-center justify-between w-full pr-1">
      <div className="flex items-center gap-3">
        <button onClick={() => !isPending && setIsOpen(false)} className="md:hidden p-1 -ml-1 text-foreground transition-colors shrink-0 border-none bg-transparent cursor-pointer flex items-center justify-center">
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <span className="text-xl font-bold tracking-tight text-foreground">Thêm khoản nợ</span>
      </div>
      {isMobile && (
        <button
          onClick={() => form.submit()}
          disabled={isPending}
          className="font-bold text-sm px-3 bg-indigo-500 text-white rounded-lg border-none p-1 cursor-pointer active:opacity-70 transition-opacity"
        >
          Lưu
        </button>
      )}
    </div>
  );

  const formContent = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pt-4 px-4 pb-24 md:pb-0">
        
        <Form.Item name="type" label={<span className={labelClass}>Loại nợ</span>} rules={[{ required: true }]}>
          <DebtTypeSelector />
        </Form.Item>

        <Form.Item name="contact_id" label={<span className={labelClass}>Người liên hệ</span>} rules={[{ required: true, message: 'Vui lòng chọn người liên hệ!' }]}>
          <Select
            size="large"
            placeholder="Chọn người liên hệ"
            options={contacts.map(c => ({ value: c.id, label: c.name }))}
            popupRender={(menu) => (
              <>
                {menu}
                <div className="px-3 py-2 border-t border-slate-100">
                  {isCreatingContact ? (
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Tên người mới" 
                        value={newContactName} 
                        onChange={e => setNewContactName(e.target.value)} 
                        autoFocus
                      />
                      <Button type="primary" onClick={handleCreateContact} loading={isPending}>Thêm</Button>
                      <Button onClick={() => setIsCreatingContact(false)}>Hủy</Button>
                    </div>
                  ) : (
                    <Button type="link" icon={<Plus className="w-4 h-4"/>} onClick={() => setIsCreatingContact(true)} className="p-0">
                      Tạo người liên hệ mới
                    </Button>
                  )}
                </div>
              </>
            )}
          />
        </Form.Item>

        <div>
          <Form.Item 
            name="total_amount" 
            label={<span className={labelClass}>Số tiền (VNĐ)</span>} 
            rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
            style={suggestions.length > 0 ? { marginBottom: '8px' } : undefined}
          >
            <InputNumber
              id="total_amount_input_field"
              inputMode="decimal"
              size="large"
              className="w-full bg-slate-50 border-slate-200 hover:border-aura-indigo focus:border-aura-indigo transition-all"
              style={{ width: '100%' }}
              min={0}
              controls={false}
              keyboard={false}
              changeOnWheel={false}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value ? value.replace(/,/g, '') as any : ''}
              placeholder="0"
            />
          </Form.Item>
          {suggestions.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {suggestions.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => form.setFieldValue('total_amount', val)}
                  className="whitespace-nowrap px-3 py-1.5 text-xs font-semibold text-gray-800 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                >
                  {new Intl.NumberFormat('vi-VN').format(val)}
                </button>
              ))}
            </div>
          )}
        </div>

        <Form.Item name="due_date" label={<span className={labelClass}>Ngày hẹn trả (không bắt buộc)</span>}>
          <DatePicker size="large" className="w-full bg-slate-50" format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item name="note" label={<span className={labelClass}>Ghi chú</span>}>
          <Input.TextArea rows={3} className="bg-slate-50" placeholder="Lý do mượn/cho vay..." />
        </Form.Item>

      </div>

      <div className="hidden md:flex justify-end gap-3 mt-auto pt-6 pb-2 border-t border-slate-100 bg-white">
        <Button onClick={() => setIsOpen(false)} disabled={isPending} className="border-none">Hủy</Button>
        <Button type="primary" onClick={() => form.submit()} loading={isPending} className="shadow-xl">Lưu khoản nợ</Button>
      </div>
    </div>
  );

  return (
    <ConfigProvider theme={antdTheme}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ type: defaultType }}
        requiredMark={false}
      >
        {trigger ? (
          <div onClick={() => setIsOpen(true)} className="cursor-pointer">{trigger}</div>
        ) : (
          <button type="button" onClick={() => setIsOpen(true)} className="bg-primary text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-primary/90">
            <Plus className="w-4 h-4 inline mr-1" /> Thêm mới
          </button>
        )}

      {isMobile ? (
        <Drawer
          title={headerContent}
          placement="right"
          size="100%"
          onClose={() => !isPending && setIsOpen(false)}
          open={isOpen}
          closable={false}
          className="transaction-drawer"
          styles={{ body: { padding: 0 } }}
          destroyOnHidden
        >
          {formContent}
        </Drawer>
      ) : (
        <Modal
          title={headerContent}
          open={isOpen}
          onCancel={() => !isPending && setIsOpen(false)}
          footer={null}
          width={500}
          centered
          className="transaction-modal"
          destroyOnHidden
          styles={{ body: { padding: 0 } }}
        >
          {formContent}
        </Modal>
      )}
      </Form>
    </ConfigProvider>
  );
}
