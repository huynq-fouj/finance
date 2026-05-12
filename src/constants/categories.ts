import {
  Coffee,
  ShoppingBag,
  Car,
  Home,
  Gamepad2,
  MoreHorizontal,
  ArrowUpRight,
  BookOpen,
  HeartPulse,
  TrendingUp,
  Plane,
  Gift,
  Briefcase,
  Dumbbell,
  Building,
  ShoppingCart,
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
  { value: 'business',      label: 'Kinh doanh',                 icon: Briefcase,      className: 'bg-sky-100 text-sky-700' },
  { value: 'investment',    label: 'Đầu tư',                     icon: TrendingUp,     className: 'bg-teal-100 text-teal-700' },
  { value: 'food',          label: 'Ăn ngoài / Cafe',            icon: Coffee,         className: 'bg-emerald-100 text-emerald-700' },
  { value: 'groceries',     label: 'Đi chợ / Siêu thị',          icon: ShoppingCart,   className: 'bg-green-100 text-green-700' },
  { value: 'shopping',      label: 'Mua sắm chung',              icon: ShoppingBag,    className: 'bg-amber-100 text-amber-700' },
  { value: 'housing',       label: 'Thuê nhà / Chỗ ở',           icon: Building,       className: 'bg-fuchsia-100 text-fuchsia-700' },
  { value: 'transport',     label: 'Di chuyển',                  icon: Car,            className: 'bg-violet-100 text-violet-700' },
  { value: 'utilities',     label: 'Hóa đơn & Tiện ích',         icon: Home,           className: 'bg-blue-100 text-blue-700' },
  { value: 'entertainment', label: 'Giải trí',                   icon: Gamepad2,       className: 'bg-pink-100 text-pink-700' },
  { value: 'education',     label: 'Giáo dục / Học tập',         icon: BookOpen,       className: 'bg-orange-100 text-orange-700' },
  { value: 'health',        label: 'Sức khỏe / Y tế',            icon: HeartPulse,     className: 'bg-red-100 text-red-700' },
  { value: 'travel',        label: 'Du lịch',                    icon: Plane,          className: 'bg-cyan-100 text-cyan-700' },
  { value: 'gift',          label: 'Quà tặng & Quyên góp',       icon: Gift,           className: 'bg-rose-100 text-rose-700' },
  { value: 'sports',        label: 'Thể thao',                   icon: Dumbbell,       className: 'bg-lime-100 text-lime-700' },
  { value: 'other',         label: 'Khác',                       icon: MoreHorizontal, className: 'bg-slate-100 text-slate-700' },
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
