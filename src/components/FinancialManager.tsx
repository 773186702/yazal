import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Tag, 
  FileText, 
  Briefcase,
  X,
  UserCheck,
  CreditCard,
  ChevronDown,
  Check,
  Building,
  User
} from 'lucide-react';
import { Transaction, Project, Customer } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface FinancialManagerProps {
  transactions: Transaction[];
  projects: Project[];
  customers?: Customer[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  currency: string;
}

const AVAILABLE_CURRENCIES = [
  { code: 'SAR', name: 'ريال سعودي (SAR)' },
  { code: 'USD', name: 'دولار أمريكي (USD)' },
  { code: 'YER', name: 'ريال يمني (YER)' },
  { code: 'EUR', name: 'يورو (EUR)' },
  { code: 'AED', name: 'درهم إماراتي (AED)' },
  { code: 'KWD', name: 'دينار كويتي (KWD)' },
  { code: 'QAR', name: 'ريال قطري (QAR)' },
  { code: 'BHD', name: 'دينار بحريني (BHD)' },
  { code: 'OMR', name: 'ريال عماني (OMR)' },
  { code: 'EGP', name: 'جنيه مصري (EGP)' },
  { code: 'JOD', name: 'دينار أردني (JOD)' },
];

const PAYMENT_METHODS = [
  'تحويل بنكي',
  'نقداً / كاش',
  'بطاقة ائتمان / مدى',
  'محفظة الكريمي',
  'محفظة جيب / جوالي',
  'شيك بنكي',
  'سداد إلكتروني'
];

const INCOME_CATEGORIES = [
  'رسوم خدمات وتأشيرات',
  'استشارات وحجوزات طيران',
  'مبيعات وعمولات مبيعات',
  'سداد ديون وفواتير عملاء',
  'إيرادات خدمات الشحن والتخليص',
  'أرباح استثمارية',
  'دفعة مقدمة من عميل',
  'أخرى'
];

const EXPENSE_CATEGORIES = [
  'رواتب وأجور الموظفين',
  'مكافآت ونسب المبيعات',
  'إيجارات ومقر العمل',
  'مصاريف تشغيلية ونثرية',
  'رسوم حكومية ومعاملات',
  'تسويق وإعلانات',
  'صيانة ومعدات مكتبية',
  'فواتير كهرباء وانترنت',
  'أخرى'
];

const DEFAULT_STAFF_LIST = [
  'سارة يوسف (محاسب)',
  'أحمد محمود (مبيعات)',
  'علي الكينعي (مدير النظام)',
  'محمد علي (مندوب منفذ)',
  'فاطمة أحمد (خدمة عملاء)'
];

export default function FinancialManager({
  transactions,
  projects,
  customers = [],
  onAddTransaction,
  onDeleteTransaction,
  currency
}: FinancialManagerProps) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('SAR');
  const [paymentMethod, setPaymentMethod] = useState('تحويل بنكي');
  const [category, setCategory] = useState('رسوم خدمات وتأشيرات');
  const [recipientOrPayer, setRecipientOrPayer] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  // Category Combobox search state
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Currency Combobox search state
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Payment Method Combobox search state
  const [paymentSearch, setPaymentSearch] = useState('');
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  // Recipient/Payer Combobox search state
  const [personSearch, setPersonSearch] = useState('');
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const personRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setShowCurrencyDropdown(false);
      }
      if (paymentRef.current && !paymentRef.current.contains(e.target as Node)) {
        setShowPaymentDropdown(false);
      }
      if (personRef.current && !personRef.current.contains(e.target as Node)) {
        setShowPersonDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAddModal = () => {
    setType('income');
    setAmount('');
    const initCurr = currency === 'ريال سعودي' ? 'SAR' : (currency || 'SAR');
    setSelectedCurrency(initCurr);
    setCurrencySearch(initCurr);
    setPaymentMethod('تحويل بنكي');
    setPaymentSearch('تحويل بنكي');
    setCategory(INCOME_CATEGORIES[0]);
    setCategorySearch(INCOME_CATEGORIES[0]);
    setRecipientOrPayer('');
    setPersonSearch('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    const defaultCat = newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0];
    setCategory(defaultCat);
    setCategorySearch(defaultCat);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    onAddTransaction({
      type,
      amount: val,
      currency: selectedCurrency || currencySearch || 'SAR',
      category: categorySearch || category,
      paymentMethod: paymentSearch || paymentMethod || 'تحويل بنكي',
      recipientOrPayer: personSearch || recipientOrPayer || 'غير محدد',
      date,
      description: description || (categorySearch || category),
      by: personSearch || recipientOrPayer || 'المستخدم الحالي'
    });
    setIsModalOpen(false);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesCurrency = currencyFilter === 'all' || t.currency === currencyFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      t.description.toLowerCase().includes(searchLower) ||
      (t.category && t.category.toLowerCase().includes(searchLower)) ||
      (t.paymentMethod && t.paymentMethod.toLowerCase().includes(searchLower)) ||
      (t.recipientOrPayer && t.recipientOrPayer.toLowerCase().includes(searchLower)) ||
      (t.by && t.by.toLowerCase().includes(searchLower));

    return matchesFilter && matchesCurrency && matchesSearch;
  });

  // Calculate stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Prepare chart data (recharts)
  const chartData = filteredTransactions.slice(0, 10).map(t => ({
    name: t.date,
    المبلغ: t.amount,
    النوع: t.type === 'income' ? 'دخل' : 'صرف'
  })).reverse();

  // Combine staff and customer names for recipient/payer selection
  const peopleOptions = [
    ...DEFAULT_STAFF_LIST.map(s => ({ name: s, type: 'موظف' })),
    ...customers.map(c => ({ name: `${c.name} (${c.code || 'عميل'})`, type: 'عميل' }))
  ];

  const currentCategoryList = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const filteredCategories = currentCategoryList.filter(cat => 
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredCurrencies = AVAILABLE_CURRENCIES.filter(c => 
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const filteredPaymentMethods = PAYMENT_METHODS.filter(m => 
    m.toLowerCase().includes(paymentSearch.toLowerCase())
  );

  const filteredPeople = peopleOptions.filter(p => 
    p.name.toLowerCase().includes(personSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">المعاملات المالية الحسابية</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">تتبع التدفق المالي، العملات، طرق الدفع، والمستلمين والموظفين بدقة</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة معاملة مالية جديدة
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">إجمالي المقبوضات (المداخيل)</span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              {totalIncome.toLocaleString()} <span className="text-xs">{currency}</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">إجمالي المصروفات (الخارج)</span>
            <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 block">
              {totalExpense.toLocaleString()} <span className="text-xs">{currency}</span>
            </span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">صافي التدفق المالي</span>
            <span className={`text-xl font-bold font-mono mt-1 block ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {netProfit.toLocaleString()} <span className="text-xs">{currency}</span>
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {(['all', 'income', 'expense'] as const).map((tab) => {
            const labels = {
              all: 'جميع العمليات',
              income: 'المقبوضات (إيداع)',
              expense: 'المصروفات (صرف)'
            };
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}

          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="px-3 py-1.8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">جميع العملات</option>
            {AVAILABLE_CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالفئة، طريقة الدفع، الشخص أو الوصف..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pr-10 pl-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors font-semibold"
          />
        </div>
      </div>

      {/* Transactions Table Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 font-bold">النوع</th>
                <th className="p-4 font-bold">البند / الفئة</th>
                <th className="p-4 font-bold">طريقة الدفع</th>
                <th className="p-4 font-bold">المستلم / الدافع / المسند إليه</th>
                <th className="p-4 font-bold">التاريخ</th>
                <th className="p-4 font-bold">البيان والتفاصيل</th>
                <th className="p-4 font-bold">المبلغ والعملة</th>
                <th className="p-4 font-bold text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((t) => {
                  return (
                    <motion.tr 
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <td className="p-4">
                        {t.type === 'income' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                            دخل (مقبوضات)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full">
                            مصروف (صرف)
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700 text-[11px]">
                          {t.category || 'عام'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                          <span>{t.paymentMethod || 'نقداً'}</span>
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{t.recipientOrPayer || t.by || 'غير محدد'}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-500 dir-ltr text-right text-[11px]">{t.date}</td>
                      <td className="p-4 max-w-xs truncate text-slate-500 dark:text-slate-400" title={t.description}>
                        {t.description || 'لا يوجد وصف'}
                      </td>
                      <td className="p-4 font-bold text-sm font-mono">
                        <span className={t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                        </span>{' '}
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{t.currency}</span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onDeleteTransaction(t.id)}
                          className="p-1.5 bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="حذف المعاملة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 font-medium">
                    لا توجد معاملات مالية مطابقة للبحث أو التصفية الحالية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Entry Modal with Advanced Categorization */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col text-slate-800 dark:text-slate-100 max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span>تسجيل معاملة مالية جديدة</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">تحديد الفئة، طريقة الدفع، العملة والشخص المسند إليه</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
                {/* Transaction Type Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">نوع العملية المالية</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('income')}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                        type === 'income'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-sm font-extrabold'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>مقبوضات / دخل (إيداع)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('expense')}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                        type === 'expense'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 shadow-sm font-extrabold'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                      <span>مصروفات / صرف (خارج)</span>
                    </button>
                  </div>
                </div>

                {/* Amount and Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">المبلغ المالية *</label>
                    <div className="relative">
                      <DollarSign className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="any"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Searchable Currency Combobox */}
                  <div className="space-y-1.5 relative" ref={currencyRef}>
                    <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">تصنيف العملة (مع البحث) *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="ابحث أو اختر العملة..."
                        value={currencySearch}
                        onChange={(e) => {
                          setCurrencySearch(e.target.value);
                          setSelectedCurrency(e.target.value);
                          setShowCurrencyDropdown(true);
                        }}
                        onFocus={() => setShowCurrencyDropdown(true)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-4 pl-9 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {showCurrencyDropdown && (
                      <div className="absolute z-20 top-full right-0 left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredCurrencies.length > 0 ? (
                          filteredCurrencies.map((c) => (
                            <button
                              type="button"
                              key={c.code}
                              onClick={() => {
                                setSelectedCurrency(c.code);
                                setCurrencySearch(c.name);
                                setShowCurrencyDropdown(false);
                              }}
                              className="w-full text-right px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 flex items-center justify-between cursor-pointer"
                            >
                              <span>{c.name}</span>
                              {selectedCurrency === c.code && <Check className="w-3.5 h-3.5 text-blue-600" />}
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-400">
                            لا توجد نتيجة مطابقة لـ "{currencySearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method and Searchable Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Searchable Payment Method Combobox */}
                  <div className="space-y-1.5 relative" ref={paymentRef}>
                    <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">طريقة الدفع (مع البحث)</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="ابحث أو اختر طريقة الدفع..."
                        value={paymentSearch}
                        onChange={(e) => {
                          setPaymentSearch(e.target.value);
                          setPaymentMethod(e.target.value);
                          setShowPaymentDropdown(true);
                        }}
                        onFocus={() => setShowPaymentDropdown(true)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-4 pl-9 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {showPaymentDropdown && (
                      <div className="absolute z-20 top-full right-0 left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredPaymentMethods.length > 0 ? (
                          filteredPaymentMethods.map((m) => (
                            <button
                              type="button"
                              key={m}
                              onClick={() => {
                                setPaymentMethod(m);
                                setPaymentSearch(m);
                                setShowPaymentDropdown(false);
                              }}
                              className="w-full text-right px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 flex items-center justify-between cursor-pointer"
                            >
                              <span>{m}</span>
                              {paymentMethod === m && <Check className="w-3.5 h-3.5 text-blue-600" />}
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-400">
                            سيتم اعتماده كطريقة دفع جديدة: "{paymentSearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Searchable Category Combobox */}
                  <div className="space-y-1.5 relative" ref={categoryRef}>
                    <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">الفئة / البند (مع البحث)</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="ابحث أو اختر الفئة..."
                        value={categorySearch}
                        onChange={(e) => {
                          setCategorySearch(e.target.value);
                          setCategory(e.target.value);
                          setShowCategoryDropdown(true);
                        }}
                        onFocus={() => setShowCategoryDropdown(true)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-4 pl-9 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {showCategoryDropdown && (
                      <div className="absolute z-20 top-full right-0 left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((catOption) => (
                            <button
                              type="button"
                              key={catOption}
                              onClick={() => {
                                setCategory(catOption);
                                setCategorySearch(catOption);
                                setShowCategoryDropdown(false);
                              }}
                              className="w-full text-right px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 flex items-center justify-between cursor-pointer"
                            >
                              <span>{catOption}</span>
                              {categorySearch === catOption && <Check className="w-3.5 h-3.5 text-blue-600" />}
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-400">
                            سيتم اعتماد البند المكتوب: <strong className="text-slate-700 dark:text-slate-200">"{categorySearch}"</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recipient or Payer / Employee Linkage */}
                <div className="space-y-1.5 relative" ref={personRef}>
                  <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">
                    {type === 'income' ? 'الدافع / العميل / الموظف المستلم الشحنة' : 'المستلم / الموظف المستفيد / الجهة'}
                  </label>
                  <div className="relative">
                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="اختر موظفاً/عميلاً أو اكتب اسماً جديداً..."
                      value={personSearch}
                      onChange={(e) => {
                        setPersonSearch(e.target.value);
                        setRecipientOrPayer(e.target.value);
                        setShowPersonDropdown(true);
                      }}
                      onFocus={() => setShowPersonDropdown(true)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-10 pl-9 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  {showPersonDropdown && (
                    <div className="absolute z-20 top-full right-0 left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      <div className="p-2 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-950">قائمة الموظفين والعملاء المتاحين</div>
                      {filteredPeople.map((personOpt, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => {
                            setPersonSearch(personOpt.name);
                            setRecipientOrPayer(personOpt.name);
                            setShowPersonDropdown(false);
                          }}
                          className="w-full text-right px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{personOpt.type}</span>
                            <span>{personOpt.name}</span>
                          </span>
                          {personSearch === personOpt.name && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date and Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">تاريخ العملية</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">بيان / ملاحظات العملية</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="تفاصيل التصفية المالية أو الإشعار..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    تسجيل وتوثيق المعاملة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
