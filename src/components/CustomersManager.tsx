import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  User,
  Users,
  Eye,
  Download,
  X,
  Calendar,
  MapPin,
  Phone,
  Shield,
  Edit3,
  Check,
  Activity,
  Plus
} from 'lucide-react';
import { Customer, UserRole } from '../types';

interface CustomersManagerProps {
  customers: Customer[];
  onAddCustomer: (c: Partial<Customer>) => void;
  onUpdateCustomer?: (c: Customer) => void;
  userRole: UserRole;
}

export default function CustomersManager({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  userRole
}: CustomersManagerProps) {
  const [search, setSearch] = useState('');
  
  // Add Modal State & Auto-draft
  const [showAddModal, setShowAddModal] = useState(false);
  const [draftCustomer, setDraftCustomer] = useState<{name: string, phone: string, nationality: string}>(() => {
    const saved = localStorage.getItem('customerDraft');
    return saved ? JSON.parse(saved) : { name: '', phone: '', nationality: '' };
  });

  // Selected customer for Profile view modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedNationality, setEditedNationality] = useState('');
  const [editedStatus, setEditedStatus] = useState<'active' | 'inactive' | 'pending'>('active');
  const [editedAssignedTo, setEditedAssignedTo] = useState('');
  const [newTimelineEvent, setNewTimelineEvent] = useState('');

  const [activeProfileSubTab, setActiveProfileSubTab] = useState<'timeline' | 'debts'>('timeline');
  const [payingDebtId, setPayingDebtId] = useState<string | null>(null);
  const [debtPayAmount, setDebtPayAmount] = useState<string>('');
  const [editingDebtDueDateId, setEditingDebtDueDateId] = useState<string | null>(null);
  const [tempDueDate, setTempDueDate] = useState<string>('');

  const handlePayDebt = (debt: any) => {
    if (!selectedCustomer || !onUpdateCustomer) return;
    const amountToPay = parseFloat(debtPayAmount);
    if (isNaN(amountToPay) || amountToPay <= 0 || amountToPay > debt.remainingAmount) {
      alert('الرجاء إدخال مبلغ دفع صالح!');
      return;
    }

    const newRemaining = debt.remainingAmount - amountToPay;
    const newPaid = debt.paidAmount + amountToPay;
    const newStatus = newRemaining === 0 ? 'paid' : 'partial';

    const updatedDebts = (selectedCustomer.debts || []).map(d => {
      if (d.id === debt.id) {
        return {
          ...d,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newStatus
        };
      }
      return d;
    });

    const paymentLog = `تم سداد مبلغ ${amountToPay} ${debt.currency} من دين خدمة ${debt.serviceType} (المتبقي: ${newRemaining} ${debt.currency})`;

    const updatedTimeline = [
      { title: paymentLog, date: 'الآن' },
      ...(selectedCustomer.timeline || [])
    ];

    const updatedCustomer: Customer = {
      ...selectedCustomer,
      debts: updatedDebts,
      timeline: updatedTimeline
    };

    onUpdateCustomer(updatedCustomer);
    setSelectedCustomer(updatedCustomer);
    setPayingDebtId(null);
    setDebtPayAmount('');
  };

  const handleUpdateDebtDueDate = (debtId: string) => {
    if (!selectedCustomer || !onUpdateCustomer) return;
    if (!tempDueDate) {
      alert('الرجاء اختيار تاريخ صالح!');
      return;
    }

    const updatedDebts = (selectedCustomer.debts || []).map(d => {
      if (d.id === debtId) {
        return {
          ...d,
          dueDate: tempDueDate
        };
      }
      return d;
    });

    const currentDebt = selectedCustomer.debts?.find(d => d.id === debtId);
    const serviceType = currentDebt?.serviceType || 'خدمة عامة';
    const changeLog = `تم تعديل تاريخ استحقاق قسط دين خدمة "${serviceType}" إلى ${tempDueDate}`;

    const updatedTimeline = [
      { title: changeLog, date: 'الآن' },
      ...(selectedCustomer.timeline || [])
    ];

    const updatedCustomer: Customer = {
      ...selectedCustomer,
      debts: updatedDebts,
      timeline: updatedTimeline
    };

    onUpdateCustomer(updatedCustomer);
    setSelectedCustomer(updatedCustomer);
    setEditingDebtDueDateId(null);
    setTempDueDate('');
  };

  useEffect(() => {
    localStorage.setItem('customerDraft', JSON.stringify(draftCustomer));
  }, [draftCustomer]);

  const handleQuickAdd = () => {
    setShowAddModal(true);
  };

  const handleViewProfile = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditMode(false);
    setEditedName(customer.name);
    setEditedPhone(customer.phone);
    setEditedNationality(customer.nationality);
    setEditedStatus(customer.status);
    setEditedAssignedTo(customer.assignedTo || '');
    setNewTimelineEvent('');
    setActiveProfileSubTab('timeline');
    setPayingDebtId(null);
    setDebtPayAmount('');
  };

  const handleSaveChanges = () => {
    if (!selectedCustomer || !onUpdateCustomer) return;
    const updated: Customer = {
      ...selectedCustomer,
      name: editedName,
      phone: editedPhone,
      nationality: editedNationality,
      status: editedStatus,
      assignedTo: editedAssignedTo
    };
    onUpdateCustomer(updated);
    setSelectedCustomer(updated);
    setEditMode(false);
  };

  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newTimelineEvent.trim() || !onUpdateCustomer) return;
    const updatedTimeline = [
      { title: newTimelineEvent, date: 'الآن' },
      ...(selectedCustomer.timeline || [])
    ];
    const updated: Customer = {
      ...selectedCustomer,
      timeline: updatedTimeline
    };
    onUpdateCustomer(updated);
    setSelectedCustomer(updated);
    setNewTimelineEvent('');
  };

  const submitAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftCustomer.name) return;
    const code = 'CUS-' + (1000 + Math.floor(Math.random() * 9000));
    onAddCustomer({
      code,
      name: draftCustomer.name,
      phone: draftCustomer.phone || '+966 5_ ___ ____',
      nationality: draftCustomer.nationality || '—',
      status: 'active',
      assignedTo: 'المستخدم الحالي',
      timeline: [{ title: 'تم إنشاء ملف العميل', date: 'الآن' }]
    });
    setDraftCustomer({ name: '', phone: '', nationality: '' }); // Clear draft
    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    // 1. Prepare CSV headers
    const headers = ['الكود', 'الاسم', 'رقم الهاتف', 'الجنسية', 'الحالة', 'الموظف المسؤول'];
    
    // 2. Map data
    const csvRows = filteredCustomers.map(c => [
      c.code,
      `"${c.name}"`, // Quote strings that might contain commas
      c.phone,
      c.nationality,
      c.status === 'active' ? 'نشط' : c.status === 'pending' ? 'قيد الانتظار' : 'غير نشط',
      `"${c.assignedTo}"`
    ]);
    
    // 3. Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    
    // 4. Trigger download
    // Add BOM for Arabic character support in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(c => {
    return c.name.toLowerCase().includes(search.toLowerCase()) || 
           c.phone.includes(search) ||
           c.code.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            إدارة العملاء
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">سجل العملاء، أرقام التواصل والجنسيات</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            تصدير CSV
          </button>
          {(userRole === 'admin' || userRole === 'sales' || userRole === 'accountant') && (
            <button
              onClick={handleQuickAdd}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              + عميل جديد
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center text-slate-800 dark:text-slate-100">
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن اسم، كود، أو رقم الجوال..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pr-10 pl-4 text-xs text-slate-800 dark:text-slate-250 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 text-slate-800 dark:text-slate-100"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight leading-snug">{customer.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>الكود: {customer.code}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold border ${customer.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {customer.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-1">
                  <span className="text-slate-450 block text-[10px]">الجنسية</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{customer.nationality}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-455 block text-[10px]">رقم التواصل</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400 font-mono" dir="ltr">{customer.phone}</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleViewProfile(customer)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-650 dark:text-amber-400 rounded-xl transition-colors border border-amber-100 dark:border-amber-900/30 cursor-pointer text-xs font-bold font-sans"
                  title="عرض التفاصيل"
                >
                  <Eye className="w-4 h-4" />
                  <span>عرض ملف العميل</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 dark:text-slate-500 font-medium">
            لا يوجد عملاء مطابقين للبحث.
          </div>
        )}
      </div>

      {/* Customer Profile Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-white leading-tight">ملف العميل: {selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400">كود العميل: {selectedCustomer.code}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-150 dark:divide-slate-850 overflow-y-auto max-h-[70vh]">
              {/* Right Panel: Information / Editor */}
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-500" />
                    البيانات الشخصية
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditMode(!editMode)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/20"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {editMode ? 'إلغاء التعديل' : 'تعديل البيانات'}
                  </button>
                </div>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">الاسم</label>
                      <input
                        type="text"
                        value={editedName}
                        onChange={e => setEditedName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">الهاتف</label>
                      <input
                        type="text"
                        value={editedPhone}
                        onChange={e => setEditedPhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">الجنسية</label>
                      <input
                        type="text"
                        value={editedNationality}
                        onChange={e => setEditedNationality(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">الموظف المسؤول</label>
                      <input
                        type="text"
                        value={editedAssignedTo}
                        onChange={e => setEditedAssignedTo(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">حالة الحساب</label>
                      <select
                        value={editedStatus}
                        onChange={e => setEditedStatus(e.target.value as 'active' | 'inactive' | 'pending')}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="active">نشط</option>
                        <option value="pending">قيد الانتظار</option>
                        <option value="inactive">غير نشط</option>
                      </select>
                    </div>
                    <button
                      onClick={handleSaveChanges}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      حفظ التعديلات
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">الحالة</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${selectedCustomer.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : selectedCustomer.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {selectedCustomer.status === 'active' ? 'نشط' : selectedCustomer.status === 'pending' ? 'قيد الانتظار' : 'غير نشط'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">رقم الهاتف</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono" dir="ltr">{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">الجنسية</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{selectedCustomer.nationality}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">الموظف المسؤول</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{selectedCustomer.assignedTo || '—'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Left Panel: Follow-up Timeline & Debts */}
              <div className="p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Tab Selector */}
                  <div className="flex border-b border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveProfileSubTab('timeline')}
                      className={`flex-1 pb-2 text-xs font-extrabold border-b-2 transition-all ${
                        activeProfileSubTab === 'timeline'
                          ? 'border-amber-500 text-amber-500'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      الجدول الزمني والمتابعة
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveProfileSubTab('debts')}
                      className={`flex-1 pb-2 text-xs font-extrabold border-b-2 transition-all flex items-center justify-center gap-1 ${
                        activeProfileSubTab === 'debts'
                          ? 'border-amber-500 text-amber-500'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      الديون والآجل
                      {selectedCustomer.debts?.some(d => d.remainingAmount > 0) && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      )}
                    </button>
                  </div>

                  {activeProfileSubTab === 'timeline' ? (
                    <>
                      {/* Add Event Form */}
                      <form onSubmit={handleAddTimelineEvent} className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="إضافة تحديث جديد لملف المتابعة..."
                          value={newTimelineEvent}
                          onChange={e => setNewTimelineEvent(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-white"
                        />
                        <button
                          type="submit"
                          className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold px-3 py-2 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          إضافة
                        </button>
                      </form>

                      {/* Scrollable Timeline */}
                      <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-1">
                        {selectedCustomer.timeline && selectedCustomer.timeline.length > 0 ? (
                          <div className="relative border-r border-slate-200 dark:border-slate-850 mr-2 pr-4 space-y-4 py-2">
                            {selectedCustomer.timeline.map((event, i) => (
                              <div key={i} className="relative">
                                {/* Dot indicator */}
                                <span className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white dark:border-slate-900"></span>
                                <div className="text-xs">
                                  <p className="font-bold text-slate-800 dark:text-slate-250 leading-tight">{event.title}</p>
                                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{event.date}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-xs text-slate-400">
                            لا توجد أحداث في جدول المتابعة حالياً.
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Debts & Arrears Tab */
                    <div className="space-y-4">
                      {/* Debts list */}
                      <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1">
                        {selectedCustomer.debts && selectedCustomer.debts.length > 0 ? (
                          selectedCustomer.debts.map((debt) => {
                            const calculatedDefaultDueDate = new Date(debt.date);
                            calculatedDefaultDueDate.setDate(calculatedDefaultDueDate.getDate() + 30);
                            const activeDueDate = debt.dueDate || calculatedDefaultDueDate.toISOString().split('T')[0];

                            return (
                              <div key={debt.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-2.5 text-slate-800 dark:text-slate-250">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="text-xs font-extrabold text-slate-800 dark:text-white">{debt.serviceType}</h5>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">تاريخ التسجيل: {debt.date}</span>
                                    
                                    {/* Due Date Display & Edit */}
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                      {editingDebtDueDateId === debt.id ? (
                                        <div className="flex items-center gap-1.5 mt-1">
                                          <input
                                            type="date"
                                            value={tempDueDate}
                                            onChange={e => setTempDueDate(e.target.value)}
                                            className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateDebtDueDate(debt.id)}
                                            className="bg-blue-500 text-white text-[9px] px-2 py-1 rounded font-bold"
                                          >
                                            حفظ
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingDebtDueDateId(null)}
                                            className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] px-2 py-1 rounded font-bold"
                                          >
                                            إلغاء
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5 text-[10px]">
                                          <span className="text-slate-500 font-bold">تاريخ الاستحقاق:</span>
                                          <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{activeDueDate}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingDebtDueDateId(debt.id);
                                              setTempDueDate(activeDueDate);
                                            }}
                                            className="text-blue-500 hover:text-blue-600 font-semibold text-[9px] underline"
                                          >
                                            تعديل
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold border ${
                                    debt.status === 'paid' 
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' 
                                      : debt.status === 'partial'
                                      ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900'
                                      : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900'
                                  }`}>
                                    {debt.status === 'paid' ? 'مسدد كامل' : debt.status === 'partial' ? 'مسدد جزئي' : 'غير مسدد'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-[10px] border-t border-slate-200/50 dark:border-slate-800/50 pt-2">
                                  <div>
                                    <span className="block text-slate-400 text-[9px]">الإجمالي</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{debt.totalAmount} {debt.currency}</span>
                                  </div>
                                  <div>
                                    <span className="block text-slate-400 text-[9px]">المدفوع</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{debt.paidAmount} {debt.currency}</span>
                                  </div>
                                  <div>
                                    <span className="block text-slate-400 text-[9px]">المتبقي (دين)</span>
                                    <span className="font-bold text-rose-500">{debt.remainingAmount} {debt.currency}</span>
                                  </div>
                                </div>

                                {debt.remainingAmount > 0 && (
                                  <div className="pt-2">
                                    {payingDebtId === debt.id ? (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          placeholder="المبلغ المدفوع"
                                          value={debtPayAmount}
                                          onChange={e => setDebtPayAmount(e.target.value)}
                                          max={debt.remainingAmount}
                                          className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-white"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handlePayDebt(debt)}
                                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
                                        >
                                          تأكيد
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => { setPayingDebtId(null); setDebtPayAmount(''); }}
                                          className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-1.5 rounded-lg transition-colors shrink-0"
                                        >
                                          إلغاء
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => { setPayingDebtId(debt.id); setDebtPayAmount(debt.remainingAmount.toString()); }}
                                        className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl transition-all border border-amber-500/20"
                                      >
                                        سداد دفعة من الدين
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-10 text-xs text-slate-400">
                            لا توجد أي مديونيات أو التزامات مالية على هذا العميل حالياً. 👍
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    إغلاق الملف
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">إضافة عميل جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">اسم العميل</label>
                <input 
                  type="text" 
                  required
                  value={draftCustomer.name}
                  onChange={e => setDraftCustomer({...draftCustomer, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">رقم التواصل</label>
                <input 
                  type="text" 
                  value={draftCustomer.phone}
                  onChange={e => setDraftCustomer({...draftCustomer, phone: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">الجنسية</label>
                <input 
                  type="text" 
                  value={draftCustomer.nationality}
                  onChange={e => setDraftCustomer({...draftCustomer, nationality: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors">
                  حفظ العميل
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
                  إلغاء
                </button>
              </div>
              <p className="text-xs text-center text-slate-400 mt-2">يتم حفظ البيانات تلقائياً كمسودة</p>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
