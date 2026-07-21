import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmationDialog({ isOpen, onClose, onConfirm, title, message }: ConfirmationDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-4 text-rose-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-black">{title}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 py-2 px-4 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                تأكيد الحذف
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
