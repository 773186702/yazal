import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  X,
  Eye,
  FileCheck,
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plane,
  FileText,
  Trash2
} from 'lucide-react';
import { VisaApplication, UserRole } from '../types';
import AddVisaModal from './AddVisaModal';

interface VisaManagerProps {
  visas: VisaApplication[];
  userRole: UserRole;
  onAddVisa: (v: Partial<VisaApplication>) => void;
  onUpdateVisa: (v: VisaApplication) => void;
  onDeleteVisa: (id: string) => void;
}

export default function VisaManager({
  visas,
  userRole = 'admin',
  onAddVisa,
  onUpdateVisa,
  onDeleteVisa
}: VisaManagerProps) {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<VisaApplication | null>(null);
  const [visaToDelete, setVisaToDelete] = useState<VisaApplication | null>(null);

  const canModify = userRole === 'admin';
  const canCreate = userRole === 'admin' || userRole === 'sales';
  const canExecute = userRole === 'admin' || userRole === 'executor';

  const handleUpdateStatus = (visa: VisaApplication, newStage: VisaApplication['stage']) => {
    onUpdateVisa({ ...visa, stage: newStage });
  };

  const filteredVisas = visas.filter(visa => {
    const matchesFilter = filter === 'all' || visa.stage === filter;
    const matchesSearch = visa.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          visa.destination.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStageBadge = (stage: VisaApplication['stage']) => {
    switch (stage) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold border bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> موافق عليه
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold border bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> تحت المراجعة
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold border bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800">
            <Plane className="w-3.5 h-3.5" /> مُقدَّم للجهة
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold border bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5" /> مرفوض
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold border bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/30 dark:border-slate-700">
            <FileText className="w-3.5 h-3.5" /> مسودة
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-600" />
            إدارة التأشيرات (الفيزا)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">تتبع حالات التأشيرات والمستندات المطلوبة للعملاء</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" /> تأشيرة جديدة
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center text-slate-800 dark:text-slate-100">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {(['all', 'draft', 'review', 'submitted', 'approved', 'rejected'] as const).map((tab) => {
            const labels: Record<string, string> = {
              all: 'الكل',
              draft: 'مسودة',
              review: 'مراجعة',
              submitted: 'مُقدم',
              approved: 'موافق',
              rejected: 'مرفوض'
            };
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-emerald-600 text-white shadow-sm'
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
            placeholder="ابحث عن اسم العميل، الوجهة..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pr-10 pl-4 text-xs text-slate-800 dark:text-slate-250 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredVisas.map((visa) => (
            <motion.div
              key={visa.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 text-slate-800 dark:text-slate-100"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight leading-snug">{visa.customerName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Plane className="w-3.5 h-3.5 text-slate-400" />
                    <span>الوجهة: {visa.destination}</span>
                  </div>
                </div>
                {getStageBadge(visa.stage)}
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">المستندات المستلمة</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{visa.docsReceived} / {visa.docsTotal}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${(visa.docsReceived / visa.docsTotal) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setSelectedVisa(visa)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-400 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer text-xs font-bold font-sans"
                  title="عرض التفاصيل"
                >
                  <Eye className="w-4 h-4" />
                  <span>عرض</span>
                </button>
                
                {canModify && (
                  <button
                    onClick={() => setVisaToDelete(visa)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl transition-colors border border-rose-200 dark:border-rose-800"
                    title="حذف التأشيرة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                {(canExecute || canModify) && (
                  <select
                    className="bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-xl px-2 border border-emerald-200 focus:outline-none"
                    onChange={(e) => handleUpdateStatus(visa, e.target.value as VisaApplication['stage'])}
                    value={visa.stage}
                  >
                    <option value="draft">مسودة</option>
                    <option value="review">مراجعة</option>
                    <option value="submitted">مُقدم</option>
                    <option value="approved">موافق</option>
                    <option value="rejected">مرفوض</option>
                  </select>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredVisas.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 dark:text-slate-500 font-medium">
            لا توجد تأشيرات مطابقة للبحث أو الفلترة حالياً.
          </div>
        )}
      </div>
      
      {/* Visa Details Modal */}
      <AnimatePresence>
        {selectedVisa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">تفاصيل التأشيرة - {selectedVisa.customerName}</h3>
                <button onClick={() => setSelectedVisa(null)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p><strong>الوجهة:</strong> {selectedVisa.destination}</p>
                <p><strong>الحالة:</strong> {getStageBadge(selectedVisa.stage)}</p>
                <p><strong>المستندات:</strong> {selectedVisa.docsReceived} / {selectedVisa.docsTotal}</p>
                {selectedVisa.appointmentDate && <p><strong>تاريخ الموعد:</strong> {selectedVisa.appointmentDate}</p>}
                {selectedVisa.submissionDate && <p><strong>تاريخ التقديم:</strong> {selectedVisa.submissionDate}</p>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {visaToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-xl"
            >
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">تأكيد الحذف</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">هل أنت متأكد من حذف تأشيرة العميل "{visaToDelete.customerName}"؟ هذا الإجراء لا يمكن التراجع عنه.</p>
              <div className="flex gap-3">
                <button onClick={() => setVisaToDelete(null)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold">إلغاء</button>
                <button onClick={() => { onDeleteVisa(visaToDelete.id); setVisaToDelete(null); }} className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold">حذف</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddVisaModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onAdd={(v) => { onAddVisa(v); setIsAddModalOpen(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
