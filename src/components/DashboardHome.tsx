import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Sparkles, 
  History,
  Users,
  Settings,
  Plane,
  CheckSquare,
  Plus,
  Trash2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { AppSettings, Activity, Customer, ServiceRequest, VisaApplication, Invoice, UserRole, Transaction } from '../types';
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis
} from 'recharts';
import { BarChart, Bar, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';

interface DashboardHomeProps {
  customers: Customer[];
  requests: ServiceRequest[];
  visas: VisaApplication[];
  invoices: Invoice[];
  transactions: Transaction[];
  activities: Activity[];
  onNavigate: (tab: string) => void;
  currency: string;
  settings: AppSettings;
  userRole: UserRole;
}

export default function DashboardHome({ 
  customers = [],
  requests = [],
  visas = [],
  invoices = [],
  transactions = [],
  activities = [],
  onNavigate,
  currency,
  settings,
  userRole
}: DashboardHomeProps) {
  
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const { isDark, classes } = useTheme();

  // Quick Tasks State
  const [quickTasks, setQuickTasks] = useState<{id: string, text: string, done: boolean}[]>(() => {
    const saved = localStorage.getItem('quickTasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    localStorage.setItem('quickTasks', JSON.stringify(quickTasks));
  }, [quickTasks]);

  const addQuickTask = () => {
    if (!newTaskText.trim()) return;
    setQuickTasks([{ id: `${Date.now()}-${Math.floor(Math.random() * 1000000)}`, text: newTaskText, done: false }, ...quickTasks]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setQuickTasks(quickTasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    setQuickTasks(quickTasks.filter(t => t.id !== id));
  };

  // KPI Calculations
  const totalCustomers = customers.length;
  const activeRequests = requests.filter(r => r.status !== 'completed' && r.status !== 'rejected').length;
  
  // Calculate revenue from paid invoices this month (mocked as total for now)
  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const pendingApprovals = requests.filter(r => r.status === 'pending_accountant').length;

  // Recharts Data - Financial Chart (Income vs Expense) from transactions
  const financialChartData = React.useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const dataByMonth: Record<string, { name: string, income: number, expense: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      if (isNaN(date.getTime())) return;
      
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      
      if (!dataByMonth[monthName]) {
        dataByMonth[monthName] = { name: monthName, income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        dataByMonth[monthName].income += Number(t.amount);
      } else {
        dataByMonth[monthName].expense += Number(t.amount);
      }
    });

    // If no transactions, provide mock data for visual purposes
    if (Object.keys(dataByMonth).length === 0) {
      return [
        { name: 'يناير', income: 42000, expense: 15000 },
        { name: 'فبراير', income: 55000, expense: 22000 },
        { name: 'مارس', income: 38000, expense: 18000 },
        { name: 'أبريل', income: 61000, expense: 25000 },
      ];
    }

    return Object.values(dataByMonth);
  }, [transactions]);

  const visaStatusData = [
    { name: 'موافق عليه', value: visas.filter(v => v.stage === 'approved').length || 1, color: '#10b981' },
    { name: 'تحت المراجعة', value: visas.filter(v => v.stage === 'review').length || 1, color: '#3b82f6' },
    { name: 'مُقدَّم', value: visas.filter(v => v.stage === 'submitted').length || 1, color: '#f59e0b' },
  ];

  const upcomingDeadlines = React.useMemo(() => {
    // combine upcoming requests and visas
    const items = [
      ...requests.filter(r => r.status !== 'completed').map(r => ({
        id: r.id,
        title: `طلب: ${r.serviceType} - ${r.customerName}`,
        date: r.expiryDate || r.receiptDate,
        type: 'request'
      })),
      ...visas.filter(v => v.stage !== 'approved' && v.stage !== 'rejected').map(v => ({
        id: v.id,
        title: `فيزا: ${v.customerName}`,
        date: v.appointmentDate || v.submissionDate || new Date().toISOString(),
        type: 'visa'
      }))
    ];
    
    // filter future or soon dates
    const now = new Date();
    return items
      .filter(i => new Date(i.date).getTime() > now.getTime() - 24*60*60*1000)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [requests, visas]);

  const handleAddToCalendar = (title: string, dateStr: string) => {
    const date = new Date(dateStr);
    const start = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(date.getTime() + 60*60*1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent('تذكير بموعد من نظام يزل')}`;
    window.open(url, '_blank');
  };

  const renderKPIs = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { title: 'إجمالي العملاء', value: totalCustomers, icon: Users },
        { title: 'طلبات نشطة', value: activeRequests + visas.length, icon: Briefcase },
        { title: 'إيرادات الشهر', value: `${totalRevenue.toLocaleString()} ${currency}`, icon: DollarSign },
        { title: 'بانتظار الاعتماد', value: pendingApprovals, icon: CheckSquare },
      ].map((kpi, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between group"
        >
          <div>
            <div className="text-slate-500 dark:text-slate-300 text-xs font-bold mb-2">{kpi.title}</div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 font-mono">{kpi.value}</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <kpi.icon className="w-5 h-5" />
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-6">الدخل والمصروفات</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} vertical={false} />
              <XAxis dataKey="name" stroke={isDark ? '#64748b' : '#94a3b8'} style={{ fontSize: 12 }} />
              <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} style={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{fill: isDark ? '#1e293b' : '#f8fafc'}}
                contentStyle={{ 
                  backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                  borderColor: isDark ? '#334155' : '#e2e8f0', 
                  borderRadius: '16px', 
                  color: isDark ? '#f8fafc' : '#1e293b', 
                  direction: 'rtl' 
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="income" name="الدخل" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="المصروفات" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-1 bg-white dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-2">حالات الفيزا</h2>
        <div className="h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={visaStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                {visaStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative overflow-hidden ${classes.card} p-8 rounded-[2rem] shadow-sm text-slate-900 dark:text-slate-50`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            نظرة عامة
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">
            أداء الشركة اليوم — حسب صلاحياتك
          </p>

          <div className="mt-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              مسار الطلب من المبيعات حتى الفاتورة
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              كل طلب يمر تلقائيًا: مبيعات &larr; اعتماد المحاسب &larr; تنفيذ &larr; فاتورة تلقائية.
            </p>
          </div>
        </div>
      </motion.div>

      {renderKPIs()}
      {renderCharts()}

      {/* Bottom Grid: Activity Feed & Quick Tasks & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className={`${classes.card} rounded-[2rem] p-8 shadow-sm`}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            آخر الأنشطة
          </h2>
          <div className="space-y-2">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((act, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                  <div className="flex-1 flex justify-between items-center">
                    <p className="text-sm text-slate-900 dark:text-slate-100">{act.details}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{new Date(act.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">لا توجد نشاطات مسجلة بعد</div>
            )}
          </div>
        </div>

        {/* Quick Tasks */}
        <div className={`${classes.card} rounded-[2rem] p-8 shadow-sm flex flex-col`}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
              <CheckSquare className="w-5 h-5" />
            </div>
            المهام السريعة
          </h2>
          
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addQuickTask()}
              placeholder="إضافة مهمة جديدة..." 
              className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
            />
            <button 
              onClick={addQuickTask}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-2">
            {quickTasks.length > 0 ? (
              <AnimatePresence>
                {quickTasks.map(task => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        task.done 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-200 dark:border-slate-700 text-transparent hover:border-blue-500'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>
                    <span className={`flex-1 text-sm transition-all ${task.done ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                      {task.text}
                    </span>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">لا توجد مهام حالياً</div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines / Calendar Reminders */}
        <div className={`${classes.card} rounded-[2rem] p-8 shadow-sm flex flex-col`}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </div>
            المواعيد القريبة
          </h2>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map(item => (
                <div 
                  key={`${item.type}-${item.id}`}
                  className="flex flex-col gap-2 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.title}</span>
                    <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${
                      item.type === 'visa' 
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' 
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {item.type === 'visa' ? 'فيزا' : 'طلب'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(item.date).toLocaleDateString('ar-EG')}
                    </span>
                    <button 
                      onClick={() => handleAddToCalendar(item.title, item.date)}
                      className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 text-slate-600 dark:text-slate-400 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> التقويم
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">لا توجد مواعيد قريبة</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
