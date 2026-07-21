import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { ServiceRequest, VisaApplication, Customer } from '../types';

interface CalendarManagerProps {
  requests: ServiceRequest[];
  visas: VisaApplication[];
  customers: Customer[];
  onClose: () => void;
}

export default function CalendarManager({ requests, visas, customers, onClose }: CalendarManagerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Extract dates from requests (expiryDate or receiptDate)
  const events: { date: string; title: string; type: 'visa' | 'debt' | 'general'; color: string }[] = [];

  requests.forEach(req => {
    if (req.expiryDate) {
      events.push({
        date: req.expiryDate,
        title: `استحقاق طلب ${req.serviceType} (${req.customerName})`,
        type: 'general',
        color: 'bg-blue-500'
      });
    }
  });

  visas.forEach(v => {
    events.push({
      date: new Date().toISOString().split('T')[0],
      title: `متابعة تأشيرة ${v.destination} للعميل ${v.customerName}`,
      type: 'visa',
      color: 'bg-amber-500'
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-6 text-right"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">تقويم المواعيد ومتابعة الاستحقاقات</h3>
              <p className="text-xs text-slate-400">مواعيد انتهاء الفيزا، أقساط الديون، واستحقاقات الطلبات</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-sm text-slate-800 dark:text-white">المواعيد والأحداث المسجلة في النظام:</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-600 px-2.5 py-1 rounded-full font-bold">{events.length} حدث نشط</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">لا توجد مواعيد أو استحقاقات مسجلة حالياً</div>
            ) : (
              events.map((ev, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${ev.color}`} />
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">{ev.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">التاريخ المستهدف: {ev.date}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md font-bold">نشط</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            إغلاق التقويم
          </button>
        </div>
      </motion.div>
    </div>
  );
}
