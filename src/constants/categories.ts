import {
  Coffee,
  ShoppingBag,
  Car,
  Home,
  Gamepad2,
  MoreHorizontal,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryItem {
  value: string;
  label: string;
  icon: LucideIcon;
  className: string;
}

export const CATEGORIES: CategoryItem[] = [
  { value: 'salary',        label: 'Lương/Thưởng',               icon: ArrowUpRight,   className: 'bg-indigo-100 text-indigo-700' },
  { value: 'food',          label: 'Ăn uống',             icon: Coffee,         className: 'bg-emerald-100 text-emerald-700' },
  { value: 'shopping',      label: 'Mua sắm',             icon: ShoppingBag,    className: 'bg-amber-100 text-amber-700' },
  { value: 'transport',     label: 'Di chuyển',            icon: Car,            className: 'bg-violet-100 text-violet-700' },
  { value: 'utilities',     label: 'Hóa đơn & Tiện ích',  icon: Home,           className: 'bg-blue-100 text-blue-700' },
  { value: 'entertainment', label: 'Giải trí',             icon: Gamepad2,       className: 'bg-pink-100 text-pink-700' },
  { value: 'other',         label: 'Khác',                 icon: MoreHorizontal, className: 'bg-slate-100 text-slate-700' },
];

/** Lookup helpers */
export const getCategoryByValue = (value: string): CategoryItem =>
  CATEGORIES.find(c => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];

export const getCategoryIcon = (value: string): LucideIcon =>
  getCategoryByValue(value).icon;

export const getCategoryColor = (value: string): string =>
  getCategoryByValue(value).className;

/** For antd Select options (value + label only) */
export const categorySelectOptions = CATEGORIES.map(({ value, label }) => ({ value, label }));
