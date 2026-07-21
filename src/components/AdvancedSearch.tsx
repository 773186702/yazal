import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Briefcase, 
  CheckSquare, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  SlidersHorizontal, 
  Calendar, 
  DollarSign, 
  ArrowUpDown, 
  ArrowUpRight,
  Filter,
  X,
  FileText,
  Mic,
  MicOff
} from 'lucide-react';
import { Project, Task, Transaction, Contact } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdvancedSearchProps {
  projects: Project[];
  tasks: Task[];
  transactions: Transaction[];
  contacts: Contact[];
  onNavigate: (tab: string) => void;
  currency: string;
  theme?: 'light' | 'dark';
}

type ScopeType = 'all' | 'projects' | 'tasks' | 'transactions' | 'contacts';
type SortOption = 'date_desc' | 'date_asc' | 'alpha_asc' | 'alpha_desc' | 'value_desc' | 'value_asc';

interface SearchResultItem {
  id: string;
  type: 'project' | 'task' | 'transaction' | 'contact';
  title: string;
  subtitle: string;
  badge: {
    text: string;
    colorClass: string;
  };
  date?: string;
  value?: number;
  description?: string;
  originalItem: any;
}

export default function AdvancedSearch({
  projects,
  tasks,
  transactions,
  contacts,
  onNavigate,
  currency,
  theme = 'light'
}: AdvancedSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [scope, setScope] = useState<ScopeType>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ar-SA'; // Arabic by default

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setKeyword(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setKeyword('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Filter States
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');

  // Available unique transaction categories
  const txCategories = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.category)));
  }, [transactions]);

  // Handle clearing all filters
  const handleResetFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setTxTypeFilter('');
    setStartDate('');
    setEndDate('');
    setMinValue('');
    setMaxValue('');
    setSortBy('date_desc');
  };

  // Compile search results based on all filters
  const results = useMemo(() => {
    const list: SearchResultItem[] = [];
    const kw = keyword.toLowerCase().trim();

    // 1. Projects
    if (scope === 'all' || scope === 'projects') {
      projects.forEach(p => {
        // Keyword check
        const matchesKw = !kw || 
          p.name.toLowerCase().includes(kw) || 
          p.manager.toLowerCase().includes(kw) || 
          p.description.toLowerCase().includes(kw);

        // Status filter
        const matchesStatus = !statusFilter || p.status === statusFilter;

        // Date filter
        const startMatch = !startDate || p.startDate >= startDate;
        const endMatch = !endDate || p.endDate <= endDate;

        // Value filter (Budget)
        const val = p.budget;
        const minValMatch = !minValue || val >= Number(minValue);
        const maxValMatch = !maxValue || val <= Number(maxValue);

        if (matchesKw && matchesStatus && startMatch && endMatch && minValMatch && maxValMatch) {
          const statusLabels: Record<string, string> = {
            active: 'نشط',
            completed: 'مكتمل',
            on_hold: 'قيد الانتظار',
            not_started: 'لم يبدأ'
          };
          const colorClasses: Record<string, string> = {
            active: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/30',
            completed: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/30',
            on_hold: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/30',
            not_started: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          };

          list.push({
            id: p.id,
            type: 'project',
            title: p.name,
            subtitle: `المدير: ${p.manager} | نسبة التقدم: ${p.progress}%`,
            badge: {
              text: statusLabels[p.status] || p.status,
              colorClass: colorClasses[p.status] || 'bg-slate-100 text-slate-800'
            },
            date: p.startDate,
            value: p.budget,
            description: p.description,
            originalItem: p
          });
        }
      });
    }

    // 2. Tasks
    if (scope === 'all' || scope === 'tasks') {
      tasks.forEach(t => {
        const matchesKw = !kw || 
          t.title.toLowerCase().includes(kw) || 
          t.assignedTo.toLowerCase().includes(kw);

        // Status & Priority check
        const matchesStatus = !statusFilter || t.status === statusFilter;
        const matchesPriority = !priorityFilter || t.priority === priorityFilter;

        // Date filter
        const startMatch = !startDate || t.dueDate >= startDate;
        const endMatch = !endDate || t.dueDate <= endDate;

        if (matchesKw && matchesStatus && matchesPriority && startMatch && endMatch) {
          const priorityLabels: Record<string, string> = {
            high: 'أولوية عالية',
            medium: 'أولوية متوسطة',
            low: 'أولوية منخفضرة'
          };
          const colorClasses: Record<string, string> = {
            high: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/30',
            medium: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/30',
            low: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          };

          const statusText = t.status === 'done' ? 'منجزة' : t.status === 'in_progress' ? 'قيد العمل' : 'بانتظار البدء';

          list.push({
            id: t.id,
            type: 'task',
            title: t.title,
            subtitle: `المسؤول: ${t.assignedTo} | حالة المهمة: ${statusText}`,
            badge: {
              text: priorityLabels[t.priority] || t.priority,
              colorClass: colorClasses[t.priority] || 'bg-slate-100 text-slate-800'
            },
            date: t.dueDate,
            description: `تاريخ الاستحقاق: ${t.dueDate}`,
            originalItem: t
          });
        }
      });
    }

    // 3. Transactions
    if (scope === 'all' || scope === 'transactions') {
      transactions.forEach(t => {
        const matchesKw = !kw || 
          t.category.toLowerCase().includes(kw) || 
          t.description.toLowerCase().includes(kw);

        // Type filter
        const matchesType = !txTypeFilter || t.type === txTypeFilter;
        // Category filters mapped inside status filter as shorthand
        const matchesCategory = !statusFilter || t.category === statusFilter;

        // Date filter
        const startMatch = !startDate || t.date >= startDate;
        const endMatch = !endDate || t.date <= endDate;

        // Value filter (Amount)
        const val = t.amount;
        const minValMatch = !minValue || val >= Number(minValue);
        const maxValMatch = !maxValue || val <= Number(maxValue);

        if (matchesKw && matchesType && matchesCategory && startMatch && endMatch && minValMatch && maxValMatch) {
          list.push({
            id: t.id,
            type: 'transaction',
            title: t.description,
            subtitle: `التصنيف: ${t.category}`,
            badge: {
              text: t.type === 'income' ? 'إيرادات' : 'مصروفات',
              colorClass: t.type === 'income' 
                ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900/30' 
                : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/30'
            },
            date: t.date,
            value: t.amount,
            originalItem: t
          });
        }
      });
    }

    // 4. Contacts
    if (scope === 'all' || scope === 'contacts') {
      contacts.forEach(c => {
        const matchesKw = !kw || 
          c.name.toLowerCase().includes(kw) || 
          c.role.toLowerCase().includes(kw) || 
          c.email.toLowerCase().includes(kw) || 
          c.phone.includes(kw) || 
          c.notes.toLowerCase().includes(kw);

        // Status check
        const matchesStatus = !statusFilter || c.status === statusFilter;

        if (matchesKw && matchesStatus) {
          list.push({
            id: c.id,
            type: 'contact',
            title: c.name,
            subtitle: `${c.role} | هاتف: ${c.phone}`,
            badge: {
              text: c.status === 'active' ? 'نشط' : 'مستبعد',
              colorClass: c.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/30'
                : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            },
            description: c.notes || c.email,
            originalItem: c
          });
        }
      });
    }

    // 5. Sorting implementation
    return list.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return (b.date || '').localeCompare(a.date || '');
        case 'date_asc':
          return (a.date || '').localeCompare(b.date || '');
        case 'alpha_asc':
          return a.title.localeCompare(b.title);
        case 'alpha_desc':
          return b.title.localeCompare(a.title);
        case 'value_desc':
          return (b.value || 0) - (a.value || 0);
        case 'value_asc':
          return (a.value || 0) - (b.value || 0);
        default:
          return 0;
      }
    });
  }, [projects, tasks, transactions, contacts, scope, keyword, statusFilter, priorityFilter, txTypeFilter, startDate, endDate, minValue, maxValue, sortBy]);

  // Navigate back to core tabs upon result clicking
  const handleItemClick = (item: SearchResultItem) => {
    if (item.type === 'project') onNavigate('projects');
    if (item.type === 'task') onNavigate('tasks');
    if (item.type === 'transaction') onNavigate('financial');
    if (item.type === 'contact') onNavigate('contacts');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'task': return <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'transaction': return <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'contact': return <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${theme === 'dark' ? 'dark text-slate-100' : 'text-slate-800'}`}>
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">البحث والتحليل المتقدم</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          قم بإجراء عمليات بحث دقيقة وعميقة بكافة تفاصيل وسجلات الأعمال والمشاريع والمعاملات وتصفيتها فورياً
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-4 md:p-6 space-y-4">
        
        {/* Search Bar & Scope Selection */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 flex items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="اكتب كلمة مفتاحية للبحث (مثال: يزل، عقد، أحمد، استشارات...)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pr-11 pl-12 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-colors shadow-inner"
              />
              <button
                onClick={toggleListening}
                className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                  isListening ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="بحث صوتي"
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showFilters || statusFilter || startDate || minValue
                ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/50 dark:border-blue-900 dark:text-blue-400'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>خيارات الفلترة</span>
            {(statusFilter || startDate || minValue) && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Scope Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'all', label: 'البحث الشامل', icon: Search },
            { id: 'projects', label: 'المشاريع', icon: Briefcase },
            { id: 'tasks', label: 'المهام', icon: CheckSquare },
            { id: 'transactions', label: 'المالية', icon: TrendingUp },
            { id: 'contacts', label: 'العملاء', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = scope === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setScope(tab.id as ScopeType);
                  handleResetFilters();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                
                {/* 1. Date range */}
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="text-slate-550 dark:text-slate-400 font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-450" />
                    <span>النطاق الزمني (من - إلى)</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
                    />
                    <span className="text-slate-400">إلى</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* 2. Specific Scope Filters */}
                {scope === 'projects' && (
                  <div className="space-y-1.5">
                    <label className="text-slate-550 dark:text-slate-400 font-bold">حالة تقدم المشروع</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <option value="">جميع الحالات</option>
                      <option value="active">نشط</option>
                      <option value="completed">مكتمل</option>
                      <option value="on_hold">قيد الانتظار</option>
                      <option value="not_started">لم يبدأ</option>
                    </select>
                  </div>
                )}

                {scope === 'tasks' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-slate-550 dark:text-slate-400 font-bold">أولوية المهمة</label>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 font-medium"
                      >
                        <option value="">جميع الأولويات</option>
                        <option value="high">أولوية عالية</option>
                        <option value="medium">أولوية متوسطة</option>
                        <option value="low">أولوية منخفضة</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-550 dark:text-slate-400 font-bold">حالة الإنجاز</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 font-medium"
                      >
                        <option value="">جميع الحالات</option>
                        <option value="todo">بانتظار البدء (To do)</option>
                        <option value="in_progress">قيد العمل (In Progress)</option>
                        <option value="done">مكتملة (Done)</option>
                      </select>
                    </div>
                  </>
                )}

                {scope === 'transactions' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-slate-550 dark:text-slate-400 font-bold">نوع المعاملة</label>
                      <select
                        value={txTypeFilter}
                        onChange={(e) => setTxTypeFilter(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 font-medium"
                      >
                        <option value="">جميع الأنواع</option>
                        <option value="income">إيراد / مدخول (+)</option>
                        <option value="expense">مصروفات (-)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-550 dark:text-slate-400 font-bold">التصنيف المالي</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 font-medium"
                      >
                        <option value="">جميع التصنيفات</option>
                        {txCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {scope === 'contacts' && (
                  <div className="space-y-1.5">
                    <label className="text-slate-550 dark:text-slate-400 font-bold">حالة جهة الاتصال</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <option value="">جميع الحالات</option>
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </div>
                )}

                {/* 3. Value Ranges (Budget / Amount) */}
                {(scope === 'projects' || scope === 'transactions') && (
                  <div className="space-y-1.5 col-span-1 md:col-span-1">
                    <label className="text-slate-550 dark:text-slate-400 font-bold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-450" />
                      <span>القيمة المالية ({currency})</span>
                    </label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="number"
                        value={minValue}
                        onChange={(e) => setMinValue(e.target.value)}
                        placeholder="الأدنى"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-2.5 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 text-center"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="number"
                        value={maxValue}
                        onChange={(e) => setMaxValue(e.target.value)}
                        placeholder="الأقصى"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-2.5 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 text-center"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Sorting Control */}
                <div className="space-y-1.5">
                  <label className="text-slate-550 dark:text-slate-400 font-bold flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-450" />
                    <span>ترتيب وتصنيف النتائج</span>
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <option value="date_desc">التاريخ (الأحدث أولاً)</option>
                    <option value="date_asc">التاريخ (الأقدم أولاً)</option>
                    <option value="alpha_asc">الاسم / العنوان (أ - ي)</option>
                    <option value="alpha_desc">الاسم / العنوان (ي - أ)</option>
                    {(scope === 'projects' || scope === 'transactions') && (
                      <>
                        <option value="value_desc">القيمة (الأعلى أولاً)</option>
                        <option value="value_asc">القيمة (الأقل أولاً)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Reset button inside Drawer */}
                <div className="flex items-end justify-end pt-3 md:col-span-3 lg:col-span-1">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors py-2 font-bold cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>تصفير الفلاتر</span>
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center text-xs">
        <h3 className="font-extrabold text-slate-500 dark:text-slate-450 uppercase tracking-widest">
          نتائج البحث المطابقة ({results.length})
        </h3>
        {keyword && (
          <span className="text-slate-400">
            البحث عن: "<strong>{keyword}</strong>"
          </span>
        )}
      </div>

      {/* Search Results List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {results.map((item, idx) => (
            <motion.div
              key={`${item.type}-${item.id}`}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
              onClick={() => handleItemClick(item)}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-900 rounded-2xl p-4 md:p-5 flex justify-between items-center gap-4 transition-all hover:shadow-md cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                {/* Visual Category Icon container */}
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {getIcon(item.type)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${item.badge.colorClass}`}>
                      {item.badge.text}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                    {item.subtitle}
                  </p>
                  {item.description && (
                    <p className="text-slate-400 dark:text-slate-500 text-xs leading-normal font-normal line-clamp-1 max-w-2xl pt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* End parameters details */}
              <div className="text-left flex flex-col items-end gap-2 shrink-0">
                {item.value !== undefined && (
                  <span className="font-mono text-sm font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg">
                    {item.value.toLocaleString()} <span className="text-[10px] font-sans text-slate-400">{currency}</span>
                  </span>
                )}
                {item.date && (
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </span>
                )}
                <span className="text-[10px] text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity duration-300 font-bold">
                  <span>انتقل للتفاصيل</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-slate-400 font-medium shadow-sm space-y-3"
          >
            <Search className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-sm font-extrabold text-slate-600 dark:text-slate-300">لم نجد أي نتائج مطابقة لبحثك</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto leading-normal">
              تأكد من كتابة الكلمات المفتاحية بشكل صحيح أو جرب تغيير نطاق البحث أو تصفير فلاتر التاريخ والأسعار المخصصة.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
