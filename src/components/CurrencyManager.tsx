import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, DollarSign, X, Save, RefreshCw } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';

interface Currency {
  id: string;
  name: string;
  code: string;
  exchangeRate: number;
}

export default function CurrencyManager({ userId }: { userId: string }) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');

  useEffect(() => {
    if (!userId) return;
    try {
      const q = query(collection(db, `users/${userId}/currencies`));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Currency));
        setCurrencies(data);
      }, (err) => {
        console.warn("Firestore CurrencyManager listener error (handled):", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Failed to subscribe to currencies:", e);
    }
  }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(exchangeRate);
    if (!name || !code || isNaN(rate)) return;

    try {
      await addDoc(collection(db, `users/${userId}/currencies`), {
        name,
        code,
        exchangeRate: rate
      });
      setIsModalOpen(false);
      setName('');
      setCode('');
      setExchangeRate('');
    } catch (err) {
      console.error('Error adding currency:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, `users/${userId}/currencies`, id));
    } catch (err) {
      console.error('Error deleting currency:', err);
    }
  };

  const handleRefreshRates = async () => {
    try {
      const response = await fetch('/api/exchange-rates');
      const rates = await response.json();
      
      for (const curr of currencies) {
        if (rates[curr.code]) {
          await updateDoc(doc(db, `users/${userId}/currencies`, curr.id), {
            exchangeRate: rates[curr.code]
          });
        }
      }
    } catch (err) {
      console.error('Error refreshing rates:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">إدارة العملات</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefreshRates}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> تحديث الأسعار
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> إضافة عملة جديدة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currencies.map(curr => (
          <div key={curr.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-800">{curr.name} ({curr.code})</p>
              <p className="text-xs text-slate-500">سعر الصرف مقابل الدولار: {curr.exchangeRate}</p>
            </div>
            <button onClick={() => handleDelete(curr.id)} className="text-rose-500 hover:text-rose-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">إضافة عملة</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <input type="text" placeholder="اسم العملة" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2" required />
                <input type="text" placeholder="رمز العملة (مثال: SAR)" value={code} onChange={e => setCode(e.target.value)} className="w-full border rounded-lg p-2" required />
                <input type="number" step="any" placeholder="سعر الصرف مقابل الدولار" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} className="w-full border rounded-lg p-2" required />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">حفظ</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
