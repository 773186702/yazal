import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Briefcase, 
  User, 
  DollarSign, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X,
  Eye,
  FileSpreadsheet,
  FileText,
  ShieldAlert,
  Plane,
  List,
  LayoutDashboard,
  Settings2,
  Printer,
  FileDown,
  Receipt,
  Check
} from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ServiceRequest, Customer, UserRole } from '../types';
// @ts-ignore
import logoImage from '../assets/images/yazal_logo_1784463282605.jpg';

interface ServiceRequestsManagerProps {
  requests: ServiceRequest[];
  customers: Customer[];
  userRole: UserRole;
  onAddRequest: (r: Partial<ServiceRequest>) => void;
  onUpdateStatus: (id: string, status: ServiceRequest['status']) => void;
  initialFilter?: string;
  isNewRequestOnly?: boolean;
  settings?: any;
  onUpdateCustomer?: (c: Customer) => void;
}

export default function ServiceRequestsManager({
  requests,
  customers,
  userRole = 'admin',
  onAddRequest,
  onUpdateStatus,
  initialFilter = 'all',
  isNewRequestOnly = false,
  settings,
  onUpdateCustomer
}: ServiceRequestsManagerProps) {
  const [filter, setFilter] = useState<string>(initialFilter);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const defaultColumns = ['العميل', 'رقم الجوال', 'نوع الخدمة', 'المبلغ', 'الموظف', 'الحالة', 'التاريخ'];
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<ServiceRequest | null>(null);
  const [selectedRequestForInvoice, setSelectedRequestForInvoice] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    try {
      const storedCols = localStorage.getItem('tableColumns');
      if (storedCols) {
        const cols = JSON.parse(storedCols);
        if (Array.isArray(cols) && cols.length > 0) {
          setVisibleColumns(cols);
        }
      }
    } catch(e) {}
  }, []);
  
  // Add Modal State & Auto-draft
  const [showAddModal, setShowAddModal] = useState(false);
  const [draftRequest, setDraftRequest] = useState<{
    custCode: string;
    serviceType: string;
    amount: string;
    currency: string;
    payType: string;
    paidAmount: string;
  }>(() => {
    const saved = localStorage.getItem('requestDraft_v2');
    return saved ? JSON.parse(saved) : { 
      custCode: '', 
      serviceType: '', 
      amount: '', 
      currency: 'SAR', 
      payType: 'نقداً', 
      paidAmount: '' 
    };
  });

  useEffect(() => {
    localStorage.setItem('requestDraft_v2', JSON.stringify(draftRequest));
  }, [draftRequest]);

  // Auto price lookup and calculation based on selected currency
  useEffect(() => {
    if (!draftRequest.serviceType) return;
    const currentService = (settings?.services || []).find((s: any) => {
      const name = typeof s === 'string' ? s : s.name;
      return name === draftRequest.serviceType;
    });

    if (currentService && typeof currentService === 'object') {
      const currencyCode = draftRequest.currency || 'SAR';
      let finalPrice = currentService.price || 1000;

      if (currencyCode === 'USD') {
        finalPrice = currentService.priceUSD || currentService.price;
      } else if (currencyCode === 'SAR') {
        finalPrice = currentService.priceSAR || currentService.price;
      } else if (currencyCode === 'YER') {
        finalPrice = currentService.priceYER || currentService.price;
      }

      setDraftRequest(prev => {
        if (prev.amount !== finalPrice.toString()) {
          return {
            ...prev,
            amount: finalPrice.toString(),
            paidAmount: finalPrice.toString()
          };
        }
        return prev;
      });
    }
  }, [draftRequest.serviceType, draftRequest.currency, settings?.services]);

  const handlePrint = () => {
    // Basic print logic using browser print
    window.print();
  };

  const handleShare = async (request: ServiceRequest) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `فاتورة ${request.customerName}`,
          text: `فاتورة خدمة ${request.serviceType} بمبلغ ${request.amount} ${request.currency}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('ميزة المشاركة غير مدعومة في متصفحك.');
    }
  };

  // Dropdown states for Add Request modal
  const [isCustDropdownOpen, setIsCustDropdownOpen] = useState(false);
  const [custSearch, setCustSearch] = useState('');

  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  const [isPayTypeDropdownOpen, setIsPayTypeDropdownOpen] = useState(false);
  const [payTypeSearch, setPayTypeSearch] = useState('');

  const handleQuickAdd = () => {
    setShowAddModal(true);
  };

  const submitAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.code === draftRequest.custCode);
    if (!customer) {
      alert('العميل غير موجود!');
      return;
    }

    const amount = parseFloat(draftRequest.amount) || 0;
    const paidAmount = parseFloat(draftRequest.paidAmount || draftRequest.amount) || 0;
    const remainingAmount = Math.max(0, amount - paidAmount);
    
    onAddRequest({
      customerId: customer.id,
      customerName: customer.name,
      serviceType: draftRequest.serviceType || 'خدمة عامة',
      amount: amount,
      paidAmount: paidAmount,
      remainingAmount: remainingAmount,
      currency: draftRequest.currency || 'SAR',
      payType: draftRequest.payType || 'نقداً',
      receiptDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
      employee: 'المستخدم الحالي',
      status: 'pending_accountant',
      docs: [],
      history: [
        { 
          title: `تم إنشاء الطلب (الدفع: ${draftRequest.payType || 'نقداً'} - الإجمالي: ${amount} - المدفوع: ${paidAmount} - الدين المتبقي: ${remainingAmount})`, 
          date: 'الآن' 
        }
      ]
    });

    // If there is outstanding debt, register it under the customer
    if (remainingAmount > 0 && onUpdateCustomer) {
      const newDebt = {
        id: `DEBT-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        serviceType: draftRequest.serviceType || 'خدمة عامة',
        totalAmount: amount,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        currency: draftRequest.currency || 'SAR',
        date: new Date().toISOString().split('T')[0],
        status: 'unpaid' as const
      };

      const updatedCustomer: Customer = {
        ...customer,
        timeline: [
          { 
            title: `تم تسجيل دين آجل بقيمة ${remainingAmount} ${draftRequest.currency || 'SAR'} لطلب الخدمة: ${draftRequest.serviceType}`, 
            date: 'الآن' 
          },
          ...(customer.timeline || [])
        ],
        debts: [
          newDebt,
          ...(customer.debts || [])
        ]
      };
      onUpdateCustomer(updatedCustomer);
    }

    setDraftRequest({ 
      custCode: '', 
      serviceType: '', 
      amount: '', 
      currency: 'SAR', 
      payType: 'نقداً', 
      paidAmount: '' 
    }); // Clear draft
    setShowAddModal(false);
  };

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'all' || req.status === filter;
    const matchesSearch = req.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          req.serviceType.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const requestsByDate = filteredRequests.reduce((acc, req) => {
    const dateStr = req.receiptDate;
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(req);
    return acc;
  }, {} as Record<string, ServiceRequest[]>);

  const getStatusBadge = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold border bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> مكتمل
          </span>
        );
      case 'pending_accountant':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold border bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> مراجعة المحاسب
          </span>
        );
      case 'executor_pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold border bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800">
            <Briefcase className="w-3.5 h-3.5" /> قيد التنفيذ
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold border bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5" /> مرفوض
          </span>
        );
      default:
        return null;
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredRequests.map(r => ({
      'اسم العميل': r.customerName,
      'نوع الخدمة': r.serviceType,
      'المبلغ': r.amount,
      'العملة': r.currency,
      'تاريخ الاستلام': r.receiptDate,
      'الموظف': r.employee,
      'الحالة': r.status === 'completed' ? 'مكتمل' : r.status === 'executor_pending' ? 'قيد التنفيذ' : r.status === 'pending_accountant' ? 'مراجعة المحاسب' : 'مرفوض'
    }));

    if (csvData.length === 0) return;
    const headers = Object.keys(csvData[0]);
    const csvRows = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const val = row[header as keyof typeof row] || '';
        return `"${val.toString().replace(/"/g, '""')}"`;
      }).join(','))
    ];
    const csvString = csvRows.join('\r\n');

    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `طلبات_الخدمات_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const requestRows = filteredRequests.map(r => {
      const statusLabel = r.status === 'completed' ? 'مكتمل' : r.status === 'executor_pending' ? 'قيد التنفيذ' : r.status === 'pending_accountant' ? 'مراجعة المحاسب' : 'مرفوض';
      return `
        <tr>
          <td>${r.customerName}</td>
          <td>${r.serviceType}</td>
          <td style="font-family: monospace;">${r.amount} ${r.currency}</td>
          <td>${r.employee}</td>
          <td><span class="badge status-${r.status}">${statusLabel}</span></td>
          <td style="font-family: monospace;">${r.receiptDate}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
      <head>
        <title>تقرير طلبات الخدمات - Voya ERP</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: right; font-size: 13px; }
          th { background-color: #f8fafc; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
          .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
          .status-completed { background-color: #d1fae5; color: #065f46; }
          .status-executor_pending { background-color: #dbeafe; color: #1e40af; }
          .status-pending_accountant { background-color: #fef3c7; color: #92400e; }
          .status-rejected { background-color: #ffe4e6; color: #e11d48; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div><h2>تقرير طلبات الخدمات</h2></div>
          <div><button onclick="window.print()" class="no-print">طباعة PDF</button></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>العميل</th>
              <th>الخدمة</th>
              <th>المبلغ</th>
              <th>الموظف</th>
              <th>الحالة</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>${requestRows}</tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const canModify = userRole === 'admin';
  const canCreate = userRole === 'admin' || userRole === 'sales';
  const canApproveAccountant = userRole === 'admin' || userRole === 'accountant';
  const canExecute = userRole === 'admin' || userRole === 'executor';

  return (
    <div className="space-y-6">
      {/* Header and Filter Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Plane className="w-6 h-6 text-blue-600" />
            إدارة طلبات الخدمات
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">متابعة مسار الطلب: مبيعات &larr; محاسب &larr; تنفيذ</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {canCreate && (
            <button
              onClick={handleQuickAdd}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" /> طلب جديد
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> بطاقات
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <List className="w-4 h-4" /> جدول
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${viewMode === 'calendar' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <CalendarIcon className="w-4 h-4" /> التقويم
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={handleExportCSV}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="تصدير CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            </button>
            <button
              onClick={handleExportPDF}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="تصدير PDF"
            >
              <FileText className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center text-slate-800 dark:text-slate-100">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {(['all', 'pending_accountant', 'executor_pending', 'completed'] as const).map((tab) => {
            const labels: Record<string, string> = {
              all: 'الكل',
              pending_accountant: 'مراجعة محاسب',
              executor_pending: 'قيد التنفيذ',
              completed: 'مكتمل'
            };
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن اسم العميل، نوع الخدمة..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pr-10 pl-4 text-xs text-slate-800 dark:text-slate-250 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-100">
          <style>{`
            .react-calendar { width: 100%; max-width: 100%; background: transparent; border: none; font-family: inherit; }
            .react-calendar__navigation button { color: inherit; min-width: 44px; background: none; font-size: 16px; margin-top: 8px; border-radius: 8px; }
            .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: rgba(59, 130, 246, 0.1); }
            .react-calendar__month-view__weekdays { text-transform: uppercase; font-weight: bold; font-size: 0.75em; color: #64748b; }
            .react-calendar__month-view__days__day--weekend { color: #ef4444; }
            .react-calendar__tile { padding: 1em 0.5em; background: none; text-align: center; line-height: 16px; font-size: 0.875em; border-radius: 8px; }
            .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: rgba(59, 130, 246, 0.1); }
            .react-calendar__tile--now { background: #fef08a !important; color: #854d0e !important; }
            .react-calendar__tile--active { background: #3b82f6 !important; color: white !important; font-weight: bold; }
            .calendar-day-content { display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 4px; gap: 2px; }
            .calendar-indicator { width: 6px; height: 6px; border-radius: 50%; }
          `}</style>
          <Calendar
            onChange={(val) => setCalendarDate(val as Date)}
            value={calendarDate}
            className="w-full"
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const dateStr = date.toISOString().split('T')[0];
                const dayRequests = requestsByDate[dateStr];
                if (dayRequests && dayRequests.length > 0) {
                  return (
                    <div className="calendar-day-content">
                      <div className="flex gap-1">
                        {dayRequests.slice(0, 3).map((r, i) => (
                          <span 
                            key={i} 
                            className="calendar-indicator" 
                            style={{ 
                              backgroundColor: r.status === 'completed' ? '#10b981' : 
                                               r.status === 'pending_accountant' ? '#f59e0b' : 
                                               r.status === 'executor_pending' ? '#3b82f6' : '#ef4444' 
                            }} 
                          />
                        ))}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1">{dayRequests.length} طلبات</span>
                    </div>
                  );
                }
              }
              return null;
            }}
          />
          
          <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="font-bold mb-4">طلبات تاريخ {calendarDate.toLocaleDateString('ar-EG')}</h3>
            <div className="space-y-3">
              {(requestsByDate[calendarDate.toISOString().split('T')[0]] || []).length > 0 ? (
                requestsByDate[calendarDate.toISOString().split('T')[0]].map(req => (
                  <div key={req.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{req.customerName}</p>
                        <p className="text-xs text-slate-500">{req.serviceType}</p>
                      </div>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">لا توجد طلبات في هذا اليوم.</p>
              )}
            </div>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {visibleColumns.includes('العميل') && <th className="p-4 font-bold">العميل</th>}
                {visibleColumns.includes('رقم الجوال') && <th className="p-4 font-bold">رقم الجوال</th>}
                {visibleColumns.includes('نوع الخدمة') && <th className="p-4 font-bold">الخدمة</th>}
                {visibleColumns.includes('المبلغ') && <th className="p-4 font-bold">المبلغ</th>}
                {visibleColumns.includes('الموظف') && <th className="p-4 font-bold">الموظف</th>}
                {visibleColumns.includes('التاريخ') && <th className="p-4 font-bold">تاريخ الاستلام</th>}
                {visibleColumns.includes('الحالة') && <th className="p-4 font-bold">الحالة</th>}
                <th className="p-4 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {filteredRequests.map(req => {
                const customer = customers.find(c => c.id === req.customerId);
                return (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {visibleColumns.includes('العميل') && (
                      <td className="p-4 font-bold">{req.customerName}</td>
                    )}
                    {visibleColumns.includes('رقم الجوال') && (
                      <td className="p-4 text-xs font-mono text-slate-500">{customer?.phone || '---'}</td>
                    )}
                    {visibleColumns.includes('نوع الخدمة') && (
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{req.serviceType}</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('المبلغ') && (
                      <td className="p-4 font-mono text-right">
                        <div className="font-bold text-slate-700 dark:text-slate-300">
                          {req.amount.toLocaleString()} {req.currency}
                        </div>
                        {req.paidAmount !== undefined && (
                          <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                            <div>المدفوع: <span className="text-emerald-600 font-bold">{req.paidAmount.toLocaleString()} {req.currency}</span></div>
                            {req.remainingAmount !== undefined && req.remainingAmount > 0 && (
                              <div>المتبقي: <span className="text-rose-500 font-bold">{req.remainingAmount.toLocaleString()} {req.currency}</span></div>
                            )}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md w-max font-sans font-medium">{req.payType || 'نقداً'}</span>
                      </td>
                    )}
                    {visibleColumns.includes('الموظف') && (
                      <td className="p-4 text-xs text-slate-500">{req.employee || '---'}</td>
                    )}
                    {visibleColumns.includes('التاريخ') && (
                      <td className="p-4 text-xs font-mono">{new Date(req.receiptDate).toLocaleDateString('ar-EG')}</td>
                    )}
                    {visibleColumns.includes('الحالة') && (
                      <td className="p-4">{getStatusBadge(req.status)}</td>
                    )}
                    <td className="p-4">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelectedRequestForDetail(req)}
                          className="p-1.5 text-slate-450 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {req.status === 'completed' && (
                          <button
                            onClick={() => setSelectedRequestForInvoice(req)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors cursor-pointer"
                            title="تحميل/طباعة الفاتورة"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                        {canModify && (
                          <button
                            onClick={() => {}}
                            className="p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="تعديل الإعدادات"
                          >
                            <Settings2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 text-sm">
                    لا توجد بيانات متاحة للعرض
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredRequests.map((req, index) => (
            <motion.div
              key={req.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 text-slate-800 dark:text-slate-100"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight leading-snug">{req.customerName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.serviceType}</span>
                  </div>
                </div>
                {getStatusBadge(req.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px]">المبلغ والحالة المالية</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                    {req.amount.toLocaleString()} {req.currency}
                  </span>
                  {req.paidAmount !== undefined && (
                    <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                      <div>المدفوع: <span className="text-emerald-600 font-bold">{req.paidAmount.toLocaleString()} {req.currency}</span></div>
                      {req.remainingAmount !== undefined && req.remainingAmount > 0 && (
                        <div>الدين الآجل: <span className="text-rose-500 font-bold">{req.remainingAmount.toLocaleString()} {req.currency}</span></div>
                      )}
                    </div>
                  )}
                  <span className="text-[10px] font-medium text-slate-400 mt-1 block">طريقة الدفع: {req.payType || 'نقداً'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px]">تاريخ الاستلام</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    {req.receiptDate}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                الموظف المباشر: {req.employee}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                {(canApproveAccountant && req.status === 'pending_accountant') ? (
                  <button
                    onClick={() => onUpdateStatus(req.id, 'executor_pending')}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-650 dark:text-blue-400 rounded-xl transition-colors border border-blue-100 dark:border-blue-900/30 cursor-pointer text-xs font-bold font-sans"
                    title="اعتماد المحاسب"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>اعتماد المحاسب</span>
                  </button>
                ) : (canExecute && req.status === 'executor_pending') ? (
                  <button
                    onClick={() => onUpdateStatus(req.id, 'completed')}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-650 dark:text-blue-400 rounded-xl transition-colors border border-blue-100 dark:border-blue-900/30 cursor-pointer text-xs font-bold font-sans"
                    title="تحديث حالة التنفيذ"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>إكمال التنفيذ</span>
                  </button>
                ) : req.status === 'completed' ? (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => setSelectedRequestForDetail(req)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-400 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer text-xs font-bold font-sans"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-4 h-4 shrink-0" />
                      <span>التفاصيل</span>
                    </button>
                    <button
                      onClick={() => setSelectedRequestForInvoice(req)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 rounded-xl transition-colors border border-emerald-100 dark:border-emerald-900/30 cursor-pointer text-xs font-bold font-sans"
                      title="طباعة الفاتورة"
                    >
                      <Printer className="w-4 h-4 shrink-0" />
                      <span>الفاتورة</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedRequestForDetail(req)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-400 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer text-xs font-bold font-sans"
                    title="عرض التفاصيل"
                  >
                    <Eye className="w-4 h-4" />
                    <span>عرض التفاصيل</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredRequests.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 dark:text-slate-500 font-medium">
            لا توجد طلبات مطابقة للبحث أو الفلترة حالياً.
          </div>
        )}
      </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl z-50"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">إضافة طلب خدمة جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitAddRequest} className="space-y-4">
              {/* Searchable Customer Dropdown */}
              <div className="relative">
                <label className="block text-xs font-extrabold mb-1.5 text-slate-500 dark:text-slate-400">العميل</label>
                <button
                  type="button"
                  onClick={() => setIsCustDropdownOpen(!isCustDropdownOpen)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-right flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all font-bold text-slate-800 dark:text-white"
                >
                  <span>
                    {draftRequest.custCode
                      ? `${customers.find(c => c.code === draftRequest.custCode)?.name || ''} (${draftRequest.custCode})`
                      : 'اختر العميل...'}
                  </span>
                  <span className="text-xs text-slate-400">▼</span>
                </button>

                {isCustDropdownOpen && (
                  <div className="absolute right-0 left-0 mt-1 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-2 space-y-1 max-h-60 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="بحث عن عميل بالاسم أو الرمز..."
                      value={custSearch}
                      onChange={e => setCustSearch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-750 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 mb-2 font-bold"
                    />
                    {customers
                      .filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.code.toLowerCase().includes(custSearch.toLowerCase()))
                      .map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setDraftRequest({ ...draftRequest, custCode: c.code });
                            setIsCustDropdownOpen(false);
                            setCustSearch('');
                          }}
                          className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors flex justify-between font-bold"
                        >
                          <span className="text-slate-800 dark:text-white">{c.name}</span>
                          <span className="text-slate-400 font-mono text-[10px]">{c.code}</span>
                        </button>
                      ))}
                    {customers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.code.toLowerCase().includes(custSearch.toLowerCase())).length === 0 && (
                      <div className="text-center py-3 text-xs text-slate-400">لا يوجد نتائج تطابق البحث</div>
                    )}
                  </div>
                )}
              </div>

              {/* Searchable Service Dropdown */}
              <div className="relative">
                <label className="block text-xs font-extrabold mb-1.5 text-slate-500 dark:text-slate-400">نوع الخدمة</label>
                <button
                  type="button"
                  onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-right flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all font-bold text-slate-800 dark:text-white"
                >
                  <span>{draftRequest.serviceType || 'اختر الخدمة...'}</span>
                  <span className="text-xs text-slate-400">▼</span>
                </button>

                {isServiceDropdownOpen && (
                  <div className="absolute right-0 left-0 mt-1 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-2 space-y-1 max-h-60 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="بحث عن خدمة..."
                      value={serviceSearch}
                      onChange={e => setServiceSearch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-750 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 mb-2 font-bold"
                    />
                    {(settings?.services || [
                      { name: 'فيزا شنغن', price: 450, priceUSD: 120, priceSAR: 450, priceYER: 198000 },
                      { name: 'فيزا أمريكا', price: 690, priceUSD: 185, priceSAR: 690, priceYER: 305250 },
                      { name: 'فيزا بريطانيا', price: 560, priceUSD: 150, priceSAR: 560, priceYER: 247500 },
                      { name: 'حجز فندق', price: 185, priceUSD: 50, priceSAR: 185, priceYER: 82500 },
                      { name: 'تذكرة طيران', price: 1125, priceUSD: 300, priceSAR: 1125, priceYER: 495000 }
                    ]).map((s: any) => {
                      const serviceName = typeof s === 'string' ? s : s.name;
                      const currencyCode = draftRequest.currency || 'SAR';
                      let servicePrice = 1000;
                      if (typeof s === 'string') {
                        servicePrice = 1000;
                      } else {
                        servicePrice = s.price || 1000;
                        if (currencyCode === 'USD') {
                          servicePrice = s.priceUSD || servicePrice;
                        } else if (currencyCode === 'SAR') {
                          servicePrice = s.priceSAR || servicePrice;
                        } else if (currencyCode === 'YER') {
                          servicePrice = s.priceYER || servicePrice;
                        }
                      }
                      return (
                        <button
                          key={serviceName}
                          type="button"
                          onClick={() => {
                            setDraftRequest({
                              ...draftRequest,
                              serviceType: serviceName,
                              amount: servicePrice.toString(),
                              paidAmount: servicePrice.toString() // default to full payment
                            });
                            setIsServiceDropdownOpen(false);
                            setServiceSearch('');
                          }}
                          className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors flex justify-between font-bold"
                        >
                          <span className="text-slate-800 dark:text-white">{serviceName}</span>
                          <span className="text-emerald-650 dark:text-emerald-400 font-mono text-[10px] font-bold">{servicePrice} {draftRequest.currency}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Read Only Auto Filled price */}
              <div>
                <label className="block text-xs font-extrabold mb-1.5 text-slate-500 dark:text-slate-400">سعر الخدمة (تلقائي وثابت لمنع التلاعب)</label>
                <div className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-extrabold flex justify-between">
                  <span>{draftRequest.amount ? parseFloat(draftRequest.amount).toLocaleString() : '0'}</span>
                  <span>{draftRequest.currency}</span>
                </div>
              </div>

              {/* Currency Dropdown */}
              <div className="relative">
                <label className="block text-xs font-extrabold mb-1.5 text-slate-500 dark:text-slate-400">العملة</label>
                <button
                  type="button"
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-right flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all font-bold text-slate-800 dark:text-white"
                >
                  <span>{draftRequest.currency || 'اختر العملة...'}</span>
                  <span className="text-xs text-slate-400">▼</span>
                </button>

                {isCurrencyDropdownOpen && (
                  <div className="absolute right-0 left-0 mt-1 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-2 space-y-1 max-h-40 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="بحث عن عملة..."
                      value={currencySearch}
                      onChange={e => setCurrencySearch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-750 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 mb-2 font-bold"
                    />
                    {(settings?.currencies || ['ريال يمني', 'ريال سعودي', 'دولار أمريكي', 'درهم إماراتي', 'يورو']).map((curr: string) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => {
                          setDraftRequest({ ...draftRequest, currency: curr });
                          setIsCurrencyDropdownOpen(false);
                          setCurrencySearch('');
                        }}
                        className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors font-bold text-slate-800 dark:text-white block"
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Type Dropdown */}
              <div className="relative">
                <label className="block text-xs font-extrabold mb-1.5 text-slate-500 dark:text-slate-400">طريقة الدفع</label>
                <button
                  type="button"
                  onClick={() => setIsPayTypeDropdownOpen(!isPayTypeDropdownOpen)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-right flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all font-bold text-slate-800 dark:text-white"
                >
                  <span>{draftRequest.payType || 'اختر طريقة الدفع...'}</span>
                  <span className="text-xs text-slate-400">▼</span>
                </button>

                {isPayTypeDropdownOpen && (
                  <div className="absolute right-0 left-0 mt-1 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-2 space-y-1 max-h-40 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="بحث عن طريقة دفع..."
                      value={payTypeSearch}
                      onChange={e => setPayTypeSearch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-750 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 mb-2 font-bold"
                    />
                    {(settings?.paymentMethods || ['نقداً', 'محفظة جيب', 'محفظة الكريمي', 'محفظة جوالي', 'محفظة فلوسك']).map((method: string) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          setDraftRequest({ ...draftRequest, payType: method });
                          setIsPayTypeDropdownOpen(false);
                          setPayTypeSearch('');
                        }}
                        className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors font-bold text-slate-800 dark:text-white block"
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Paid Amount and Credit Calculation */}
              <div>
                <label className="block text-xs font-extrabold mb-1.5 text-slate-500 dark:text-slate-400">المبلغ المدفوع حالياً</label>
                <input
                  type="number"
                  required
                  placeholder="أدخل المبلغ المدفوع..."
                  value={draftRequest.paidAmount}
                  onChange={e => setDraftRequest({ ...draftRequest, paidAmount: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-extrabold text-slate-800 dark:text-white"
                />

                {/* Arrears and Debt Visual Feedback */}
                {draftRequest.amount && (
                  <div className="mt-3 p-3 rounded-2xl border border-slate-150 dark:border-slate-800 text-xs font-bold transition-all">
                    {parseFloat(draftRequest.amount) - parseFloat(draftRequest.paidAmount || '0') > 0 ? (
                      <div className="text-rose-500 flex justify-between">
                        <span>المبلغ الآجل والمتبقي كدين:</span>
                        <span>{(parseFloat(draftRequest.amount) - parseFloat(draftRequest.paidAmount || '0')).toLocaleString()} {draftRequest.currency}</span>
                      </div>
                    ) : (
                      <div className="text-emerald-600 flex justify-between">
                        <span>حالة الدفع:</span>
                        <span>تم السداد بالكامل 👍</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-md">
                  إنشاء الطلب
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors text-sm">
                  إلغاء
                </button>
              </div>
              <p className="text-xs text-center text-slate-400 mt-2">يتم حفظ مدخلات الطلب تلقائياً كمسودة</p>
            </form>
          </motion.div>
        </div>
      )}

      {selectedRequestForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700 shadow-2xl z-50 text-slate-800 dark:text-slate-100 space-y-5"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">تفاصيل طلب الخدمة</h3>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">ID: {selectedRequestForDetail.id}</span>
              </div>
              <button 
                onClick={() => setSelectedRequestForDetail(null)} 
                className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Request Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">العميل الكريم</span>
                <span className="text-slate-800 dark:text-white text-sm">{selectedRequestForDetail.customerName}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">رقم جوال العميل</span>
                <span className="text-slate-700 dark:text-slate-350 font-mono">{customers.find(c => c.id === selectedRequestForDetail.customerId || c.name === selectedRequestForDetail.customerName)?.phone || '---'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">نوع الخدمة المطلوبة</span>
                <span className="text-blue-650 dark:text-blue-400 flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span>{selectedRequestForDetail.serviceType}</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">الموظف المسؤول</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedRequestForDetail.employee}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">تاريخ استلام المعاملة</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{new Date(selectedRequestForDetail.receiptDate).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">تاريخ الانتهاء المتوقع</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{new Date(selectedRequestForDetail.expiryDate).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</span>
              </div>
            </div>

            {/* Financial and Payment Summary Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3.5">
              <div className="flex justify-between items-center text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-extrabold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <DollarSign className="w-4 h-4 text-blue-500" /> الحالة المالية والسداد
                </span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md font-bold">
                  {selectedRequestForDetail.payType || 'نقداً'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">الإجمالي</span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-white mt-1 block">
                    {selectedRequestForDetail.amount.toLocaleString()} {selectedRequestForDetail.currency}
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold text-emerald-600">المدفوع</span>
                  <span className="text-xs font-mono font-bold text-emerald-650 dark:text-emerald-450 mt-1 block">
                    {(selectedRequestForDetail.paidAmount || 0).toLocaleString()} {selectedRequestForDetail.currency}
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold text-rose-500">المتبقي</span>
                  <span className="text-xs font-mono font-bold text-rose-500 mt-1 block">
                    {(selectedRequestForDetail.remainingAmount || 0).toLocaleString()} {selectedRequestForDetail.currency}
                  </span>
                </div>
              </div>

              {/* Debt progress bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>نسبة استيفاء المبلغ:</span>
                  <span>{Math.round(((selectedRequestForDetail.paidAmount || 0) / (selectedRequestForDetail.amount || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round(((selectedRequestForDetail.paidAmount || 0) / (selectedRequestForDetail.amount || 1)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Workflow / History Timeline */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">سير المعاملة والمراحل الفعّالة</span>
              <div className="relative border-r-2 border-slate-200 dark:border-slate-800 mr-2.5 pr-4 space-y-3 pb-1">
                <div className="relative">
                  <div className="absolute -right-6.5 top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-950/50" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-white block">إنشاء الطلب وتحديد السعر (مبيعات)</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{new Date(selectedRequestForDetail.receiptDate).toLocaleDateString('ar-EG')} - بواسطة {selectedRequestForDetail.employee}</span>
                  </div>
                </div>

                <div className="relative">
                  <div className={`absolute -right-6.5 top-0.5 w-3 h-3 rounded-full ${
                    selectedRequestForDetail.status !== 'pending_accountant' 
                      ? 'bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-950/50' 
                      : 'bg-amber-400 ring-4 ring-amber-50 dark:ring-amber-950/30 animate-pulse'
                  }`} />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-white block">اعتماد الإدارة والمحاسبة والمطابقة المباشرة</span>
                    {selectedRequestForDetail.status !== 'pending_accountant' ? (
                      <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block flex items-center gap-1">✓ تم التدقيق والاعتماد المالي والتحصيل</span>
                    ) : (
                      <span className="text-[10px] text-amber-500 font-bold mt-0.5 block flex items-center gap-1">⏱️ قيد المراجعة والتدقيق المالي من المحاسب</span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <div className={`absolute -right-6.5 top-0.5 w-3 h-3 rounded-full ${
                    selectedRequestForDetail.status === 'completed' 
                      ? 'bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-950/50' 
                      : selectedRequestForDetail.status === 'executor_pending'
                      ? 'bg-amber-400 ring-4 ring-amber-50 dark:ring-amber-950/30 animate-pulse'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`} />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-white block">تجهيز المستندات والتنفيذ المكتمل</span>
                    {selectedRequestForDetail.status === 'completed' ? (
                      <span className="text-[10px] text-emerald-650 font-bold mt-0.5 block">✓ تم التنفيذ وتسليم العميل بنجاح</span>
                    ) : selectedRequestForDetail.status === 'executor_pending' ? (
                      <span className="text-[10px] text-amber-500 font-bold mt-0.5 block">⚙️ قيد التنفيذ والمتابعة من الموظف المختص</span>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-0.5 block">في انتظار اعتماد المحاسب أولاً لتسليم المنفذ</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments / Required Documents */}
            {selectedRequestForDetail.docs && selectedRequestForDetail.docs.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">المستندات والمرفقات المقدمة</span>
                <div className="flex flex-wrap gap-2">
                  {selectedRequestForDetail.docs.map((docName, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-650 dark:text-slate-350"
                    >
                      📄 {docName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons inside detail modal */}
            <div className="flex gap-2 border-t border-slate-150 dark:border-slate-800 pt-4">
              {selectedRequestForDetail.status === 'pending_accountant' && (userRole === 'admin' || userRole === 'accountant') && (
                <button
                  onClick={() => {
                    onUpdateStatus(selectedRequestForDetail.id, 'executor_pending');
                    setSelectedRequestForDetail({ ...selectedRequestForDetail, status: 'executor_pending' });
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md text-center"
                >
                  اعتماد ومطابقة المحاسب
                </button>
              )}

              {selectedRequestForDetail.status === 'executor_pending' && (userRole === 'admin' || userRole === 'executor') && (
                <button
                  onClick={() => {
                    onUpdateStatus(selectedRequestForDetail.id, 'completed');
                    setSelectedRequestForDetail({ ...selectedRequestForDetail, status: 'completed' });
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md text-center"
                >
                  إكمال المعاملة وتسليمها
                </button>
              )}

              {selectedRequestForDetail.status === 'completed' && (
                <button
                  onClick={() => {
                    setSelectedRequestForInvoice(selectedRequestForDetail);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span>عرض وطباعة الفاتورة</span>
                </button>
              )}

              <button
                onClick={() => setSelectedRequestForDetail(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {selectedRequestForInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white font-sans">معاينة وتوليد الفاتورة (PDF)</h3>
              </div>
              <button 
                onClick={() => setSelectedRequestForInvoice(null)} 
                className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Area (Scrollable representation of the printed invoice) */}
            <div className="flex-1 overflow-y-auto pr-1 pl-1 space-y-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-6 text-slate-900 dark:text-slate-100" style={{ direction: 'rtl' }}>
                {/* Invoice Header */}
                <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={logoImage} alt="شعار المنصة" className="w-14 h-14 rounded-xl object-cover border border-slate-200/50 dark:border-slate-800" />
                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white font-sans">منصة يزل للخدمات العامة والمعاملات</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">حلول متكاملة للتأشيرات والمعاملات والمبيعات</p>
                    </div>
                  </div>
                  <div className="text-left font-mono text-xs">
                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold w-fit ml-auto mb-1">
                      فاتورة مكتملة
                    </div>
                    <div>رقم الفاتورة: <span className="font-bold">INV-{selectedRequestForInvoice.id.substring(0, 8).toUpperCase()}</span></div>
                    <div>تاريخ الإصدار: <span>{new Date(selectedRequestForInvoice.receiptDate).toLocaleDateString('ar-EG')}</span></div>
                  </div>
                </div>

                {/* Invoice Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">العميل الكريم</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white">{selectedRequestForInvoice.customerName}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono block mt-0.5">جوال: {customers.find(c => c.id === selectedRequestForInvoice.customerId || c.name === selectedRequestForInvoice.customerName)?.phone || '---'}</span>
                    <span className="text-slate-500 dark:text-slate-400 block">الجنسية: {customers.find(c => c.id === selectedRequestForInvoice.customerId || c.name === selectedRequestForInvoice.customerName)?.nationality || 'يمني'}</span>
                  </div>
                  <div className="text-left font-sans text-xs flex flex-col justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">الموظف المسؤول</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{selectedRequestForInvoice.employee}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">طريقة الدفع</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{selectedRequestForInvoice.payType || 'نقداً'}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                        <th className="p-2 rounded-r-lg font-bold">#</th>
                        <th className="p-2 font-bold">تفاصيل الخدمة المطلوبة</th>
                        <th className="p-2 font-bold text-left rounded-l-lg">القيمة الإجمالية</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 dark:border-slate-800/60">
                        <td className="p-3 font-mono">1</td>
                        <td className="p-3">
                          <span className="font-bold block text-slate-800 dark:text-white">{selectedRequestForInvoice.serviceType}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">تاريخ إكمال المعاملة: {new Date(selectedRequestForInvoice.expiryDate).toLocaleDateString('ar-EG')}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-left text-slate-950 dark:text-white">
                          {selectedRequestForInvoice.amount.toLocaleString()} {selectedRequestForInvoice.currency}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Invoice Financial Breakdown Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-full max-w-xs space-y-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-4 rounded-xl">
                    <div className="flex justify-between text-slate-500">
                      <span>إجمالي الرسوم المستحقة</span>
                      <span className="font-mono">{selectedRequestForInvoice.amount.toLocaleString()} {selectedRequestForInvoice.currency}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                      <span>المبلغ المدفوع والمحصل</span>
                      <span className="font-mono">{(selectedRequestForInvoice.paidAmount || 0).toLocaleString()} {selectedRequestForInvoice.currency}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-rose-500">المبلغ المتبقي كدين آجل</span>
                      <span className="font-mono text-rose-500">{(selectedRequestForInvoice.remainingAmount || 0).toLocaleString()} {selectedRequestForInvoice.currency}</span>
                    </div>
                  </div>
                </div>

                {/* Terms Footer */}
                <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center border-t border-slate-200 dark:border-slate-800 pt-4 space-y-1">
                  <p>نشكركم لتعاملكم مع منصة يزل للخدمات العامة والمعاملات.</p>
                  <p>هذه الفاتورة تمثل إثباتاً إلكترونياً لإتمام المعاملة واستلام الخدمة والمبالغ المسجلة.</p>
                </div>

                {/* Stamp/Signatures Row */}
                <div className="grid grid-cols-2 gap-4 pt-6 text-[11px] font-bold">
                  <div className="text-center space-y-12">
                    <span className="text-slate-400 block uppercase">توقيع العميل المستلم</span>
                    <div className="h-[1px] w-24 mx-auto bg-slate-300 dark:bg-slate-700" />
                  </div>
                  <div className="text-center space-y-12">
                    <span className="text-slate-400 block uppercase">توقيع وختم الإدارة</span>
                    <div className="h-[1px] w-24 mx-auto bg-slate-300 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 border-t border-slate-150 dark:border-slate-800 pt-4 mt-4 shrink-0">
              <button
                onClick={handlePrint}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الفاتورة أو الحفظ كـ PDF</span>
              </button>

              <button
                onClick={() => setSelectedRequestForInvoice(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {selectedRequestForInvoice && createPortal(
        <div id="printable-invoice-section" className="hidden text-black bg-white p-12 text-right" style={{ direction: 'rtl', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {/* Style tag injection */}
          <style>{`
            @media print {
              body > :not(#printable-invoice-section) {
                display: none !important;
              }
              #printable-invoice-section {
                display: block !important;
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
                padding: 40px !important;
                box-sizing: border-box;
              }
            }
          `}</style>

          {/* Elegant Double Border Frame */}
          <div className="border-4 border-double border-slate-900 p-8 rounded-2xl space-y-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start gap-4 pb-6 border-b-2 border-slate-900">
              <div className="flex items-center gap-4">
                <img src={logoImage} alt="شعار يزل" className="w-20 h-20 rounded-xl object-cover border border-slate-300" />
                <div>
                  <h1 className="text-2xl font-black text-slate-950">منصة يزل للخدمات العامة والمعاملات</h1>
                  <p className="text-xs text-slate-500 mt-1">المكتب الرئيسي - تأشيرات، معاملات عامة، شحن وتذاكر طيران</p>
                </div>
              </div>
              <div className="text-left font-mono text-sm space-y-1">
                <div className="bg-slate-100 text-slate-850 border border-slate-300 px-3 py-1 rounded-md text-xs font-bold w-fit ml-auto">
                  فاتورة خدمة رسمية
                </div>
                <div>رقم الفاتورة: <span className="font-bold">INV-{selectedRequestForInvoice.id.substring(0, 8).toUpperCase()}</span></div>
                <div>تاريخ الإصدار: <span>{new Date(selectedRequestForInvoice.receiptDate).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</span></div>
              </div>
            </div>

            {/* Invoice Info Grid */}
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-2 border-l border-slate-200 pl-4">
                <span className="text-slate-500 block text-xs uppercase font-bold">معلومات العميل الكريم:</span>
                <div className="text-base font-black text-slate-950">{selectedRequestForInvoice.customerName}</div>
                <div className="text-slate-700 font-mono">رقم الجوال: {customers.find(c => c.id === selectedRequestForInvoice.customerId || c.name === selectedRequestForInvoice.customerName)?.phone || '---'}</div>
                <div className="text-slate-700">الجنسية: {customers.find(c => c.id === selectedRequestForInvoice.customerId || c.name === selectedRequestForInvoice.customerName)?.nationality || 'يمني'}</div>
              </div>
              <div className="text-left flex flex-col justify-between">
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-bold">الموظف المسؤول:</span>
                  <div className="font-bold text-slate-850">{selectedRequestForInvoice.employee}</div>
                </div>
                <div className="mt-4">
                  <span className="text-slate-500 block text-xs uppercase font-bold">طريقة الدفع والتسديد:</span>
                  <div className="font-bold text-slate-850">{selectedRequestForInvoice.payType || 'نقداً'}</div>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="pt-4">
              <table className="w-full text-sm text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-900 text-slate-850">
                    <th className="p-3 font-bold text-center w-12 border border-slate-300">#</th>
                    <th className="p-3 font-bold border border-slate-300">تفاصيل الخدمة المقدمة</th>
                    <th className="p-3 font-bold text-left border border-slate-300 w-44">المبلغ المستحق</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="p-4 text-center font-mono border border-slate-300">1</td>
                    <td className="p-4 border border-slate-300">
                      <span className="font-bold block text-base text-slate-950">{selectedRequestForInvoice.serviceType}</span>
                      <span className="text-xs text-slate-500 block mt-1">تاريخ استلام الطلب: {new Date(selectedRequestForInvoice.receiptDate).toLocaleDateString('ar-EG')} | تاريخ إكمال المعاملة: {new Date(selectedRequestForInvoice.expiryDate).toLocaleDateString('ar-EG')}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-left text-lg text-slate-950 border border-slate-300">
                      {selectedRequestForInvoice.amount.toLocaleString()} {selectedRequestForInvoice.currency}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Invoice Financial Breakdown Summary */}
            <div className="flex justify-end pt-4">
              <table className="w-72 text-sm font-bold border-collapse border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 text-slate-600 bg-slate-50">المجموع المستحق</td>
                    <td className="p-3 font-mono text-left w-36 border-l border-slate-300">{selectedRequestForInvoice.amount.toLocaleString()} {selectedRequestForInvoice.currency}</td>
                  </tr>
                  <tr className="border-b border-slate-200 text-emerald-750">
                    <td className="p-3 bg-emerald-50/50">المبلغ المدفوع محصلاً</td>
                    <td className="p-3 font-mono text-left w-36 border-l border-slate-300">{(selectedRequestForInvoice.paidAmount || 0).toLocaleString()} {selectedRequestForInvoice.currency}</td>
                  </tr>
                  <tr className="text-rose-600 font-black text-base bg-rose-50/30">
                    <td className="p-3">المتبقي كدين آجل</td>
                    <td className="p-3 font-mono text-left w-36 border-l border-slate-300">{(selectedRequestForInvoice.remainingAmount || 0).toLocaleString()} {selectedRequestForInvoice.currency}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment and Confirmation Text */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-600 leading-relaxed">
              أقرت إدارة منصة يزل للخدمات العامة باستلام المبالغ المدفوعة والمذكورة أعلاه من العميل لتنفيذ الخدمة المعنية.
              <br />
              هذه الفاتورة وثيقة رسمية وصالحة للإثبات والتدقيق المحاسبي.
            </div>

            {/* Stamp/Signatures Row */}
            <div className="grid grid-cols-2 gap-4 pt-10 text-xs font-bold">
              <div className="text-center space-y-16">
                <span className="text-slate-500 block uppercase">توقيع العميل الكريم</span>
                <div className="h-[1px] w-40 mx-auto bg-slate-400" />
              </div>
              <div className="text-center space-y-16">
                <span className="text-slate-500 block uppercase">توقيع وختم الإدارة</span>
                <div className="h-[1px] w-40 mx-auto bg-slate-400" />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
