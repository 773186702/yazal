import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { VisaApplication } from '../types';

export default function AddVisaModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (v: Partial<VisaApplication>) => void }) {
  const [customerName, setCustomerName] = useState('');
  const [destination, setDestination] = useState('');
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">إضافة تأشيرة جديدة</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onAdd({ customerName, destination, stage: 'draft', docsTotal: 5, docsReceived: 0 }); }} className="space-y-4">
          <input type="text" placeholder="اسم العميل" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800" required />
          <input type="text" placeholder="الوجهة" value={destination} onChange={e => setDestination(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800" required />
          <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold">إضافة</button>
        </form>
      </motion.div>
    </div>
  );
}
