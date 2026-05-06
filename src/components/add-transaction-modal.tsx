'use client';

import { useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { Modal, Form, Input, InputNumber, DatePicker, Button, Radio, Select } from 'antd';
import { createTransaction } from '@/app/transactions/actions';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';

export default function AddTransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    const formData = new FormData();
    formData.append('type', values.type);
    formData.append('title', values.title);
    formData.append('amount', values.amount.toString());
    
    // antd DatePicker returns a dayjs object
    formData.append('transactionDate', values.transactionDate.toISOString());
    formData.append('category', values.category);
    
    if (values.description) {
      formData.append('description', values.description);
    }
    
    startTransition(async () => {
      const result = await createTransaction(formData);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Thêm giao dịch thành công!');
        setIsOpen(false);
        form.resetFields();
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary text-white h-11 px-3 sm:px-5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2 active:scale-95 shrink-0 border-none outline-none cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Thêm mới</span>
      </button>

      <Modal
        title={<span className="text-xl font-bold">Thêm Giao Dịch Mới</span>}
        open={isOpen}
        onCancel={() => !isPending && setIsOpen(false)}
        footer={null}
        destroyOnHidden
        centered
        className="font-sans"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ 
            type: 'expense',
            transactionDate: dayjs()
          }}
          className="mt-6"
        >
          <Form.Item
            name="type"
            label={<span className="font-semibold text-slate-600 uppercase tracking-wider text-xs">Loại giao dịch</span>}
            rules={[{ required: true }]}
          >
            <Radio.Group className="w-full grid grid-cols-2 text-center" optionType="button" buttonStyle="solid">
              <Radio.Button value="income" className="w-full text-center h-10 leading-9 font-medium">Thu nhập</Radio.Button>
              <Radio.Button value="expense" className="w-full text-center h-10 leading-9 font-medium">Chi tiêu</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="title"
              label={<span className="font-semibold text-slate-600 uppercase tracking-wider text-xs">Tên giao dịch</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên giao dịch!' }]}
            >
              <Input size="large" placeholder="VD: Lương tháng, Mua sắm..." className="rounded-xl" />
            </Form.Item>

            <Form.Item
              name="category"
              label={<span className="font-semibold text-slate-600 uppercase tracking-wider text-xs">Danh mục</span>}
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <Select 
                size="large" 
                placeholder="Chọn danh mục" 
                className="rounded-xl"
                options={[
                  { value: 'salary', label: 'Lương' },
                  { value: 'food', label: 'Ăn uống' },
                  { value: 'shopping', label: 'Mua sắm' },
                  { value: 'transport', label: 'Di chuyển' },
                  { value: 'utilities', label: 'Hóa đơn & Tiện ích' },
                  { value: 'entertainment', label: 'Giải trí' },
                  { value: 'other', label: 'Khác' },
                ]}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="amount"
              label={<span className="font-semibold text-slate-600 uppercase tracking-wider text-xs">Số tiền (VNĐ)</span>}
              rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
            >
              <InputNumber
                size="large"
                className="w-full rounded-xl"
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value ? value.replace(/,/g, '') as any : ''}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              name="transactionDate"
              label={<span className="font-semibold text-slate-600 uppercase tracking-wider text-xs">Thời gian</span>}
              rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
            >
              <DatePicker 
                showTime 
                size="large"
                className="w-full rounded-xl" 
                format="DD/MM/YYYY HH:mm"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={<span className="font-semibold text-slate-600 uppercase tracking-wider text-xs">Mô tả thêm</span>}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Ghi chú thêm về giao dịch này..." 
              size="large"
              className="rounded-xl"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-8">
            <Button size="large" onClick={() => setIsOpen(false)} disabled={isPending} className="rounded-xl border-slate-200 text-slate-600 font-medium">
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={isPending}
              className="rounded-xl bg-slate-900 hover:!bg-slate-800 font-bold"
            >
              Lưu giao dịch
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
