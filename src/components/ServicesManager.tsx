import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  Briefcase, 
  CreditCard, 
  ArrowRightLeft, 
  Info, 
  TrendingUp,
  Coins,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { AppSettings } from '../types';

interface ServicesManagerProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

interface PricedService {
  id: string;
  name: string;
  priceUSD: number;
  priceSAR: number;
  priceYER: number;
}

interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rateToUSD: number; // 1 USD = rateToUSD currency units
}

export default function ServicesManager({
  settings,
  onUpdateSettings
}: ServicesManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'currencies' | 'payments'>('services');

  // Load state or use fallback
  const currenciesList: CurrencyRate[] = settings.currenciesList || [
    { code: 'USD', name: 'دولار أمريكي', symbol: '$', rateToUSD: 1.0 },
    { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rateToUSD: 3.75 },
    { code: 'YER', name: 'ريال يمني', symbol: 'ر.ي', rateToUSD: 1650.0 },
    { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rateToUSD: 3.67 },
    { code: 'EUR', name: 'يورو', symbol: '€', rateToUSD: 0.92 }
  ];

  const pricedServices: PricedService[] = settings.pricedServices || [
    { id: 'ser-1', name: 'فيزا شنغن', priceUSD: 120, priceSAR: 450, priceYER: 198000 },
    { id: 'ser-2', name: 'فيزا أمريكا', priceUSD: 185, priceSAR: 690, priceYER: 305250 },
    { id: 'ser-3', name: 'فيزا بريطانيا', priceUSD: 150, priceSAR: 560, priceYER: 247500 },
    { id: 'ser-4', name: 'حجز فندق', priceUSD: 50, priceSAR: 185, priceYER: 82500 },
    { id: 'ser-5', name: 'تذكرة طيران', priceUSD: 300, priceSAR: 1125, priceYER: 495000 }
  ];

  const paymentMethods: string[] = settings.paymentMethods || [
    'نقداً', 
    'محفظة جيب', 
    'محفظة الكريمي', 
    'محفظة جوالي', 
    'محفظة فلوسك',
    'حساب الكريمي',
    'شبكة'
  ];

  // Rates shorthand for calculation
  const getRate = (code: string) => {
    return currenciesList.find(c => c.code === code)?.rateToUSD || 1.0;
  };

  const usdToYerRate = getRate('YER');
  const sarToYerRate = getRate('SAR');

  // Tab 1: Services Form State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePriceUSD, setNewServicePriceUSD] = useState('');
  const [newServicePriceSAR, setNewServicePriceSAR] = useState('');
  const [serviceFeedback, setServiceFeedback] = useState<string | null>(null);

  // Tab 2: Currencies Form State
  const [newCurrCode, setNewCurrCode] = useState('');
  const [newCurrName, setNewCurrName] = useState('');
  const [newCurrSymbol, setNewCurrSymbol] = useState('');
  const [newCurrRate, setNewCurrRate] = useState('');
  const [currencyFeedback, setCurrencyFeedback] = useState<string | null>(null);

  // Tab 3: Payment Method Form State
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [paymentFeedback, setPaymentFeedback] = useState<string | null>(null);

  // Exchange Calculator Tool State
  const [calcAmount, setCalcAmount] = useState('100');
  const [calcFromCurrency, setCalcFromCurrency] = useState('USD');

  // Sync to AppSettings
  const saveAllSettings = (updated: Partial<AppSettings>) => {
    onUpdateSettings({
      ...settings,
      ...updated
    });
  };

  // 1. Service handlers
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const usdVal = parseFloat(newServicePriceUSD) || 0;
    const sarVal = parseFloat(newServicePriceSAR) || 0;

    // YER price calculated automatically using USD rate
    const yerVal = Math.round(usdVal * usdToYerRate);

    const newService: PricedService = {
      id: `ser-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      name: newServiceName.trim(),
      priceUSD: usdVal,
      priceSAR: sarVal,
      priceYER: yerVal
    };

    const updatedPriced = [...pricedServices, newService];

    // Keep legacy settings.services in sync for complete backward compatibility!
    // We map services as rich objects { id, name, price, priceUSD, priceSAR, priceYER } 
    // so that the ServiceRequestsManager can read s.price and we prevent any bugs.
    const updatedLegacy = updatedPriced.map(s => ({
      id: s.id,
      name: s.name,
      price: s.priceSAR, // default to SAR as baseline
      priceUSD: s.priceUSD,
      priceSAR: s.priceSAR,
      priceYER: s.priceYER
    }));

    saveAllSettings({
      pricedServices: updatedPriced,
      services: updatedLegacy
    });

    setNewServiceName('');
    setNewServicePriceUSD('');
    setNewServicePriceSAR('');
    setServiceFeedback('تم إضافة الخدمة الجديدة وحساب سعر الصرف بنجاح!');
    setTimeout(() => setServiceFeedback(null), 3000);
  };

  const handleDeleteService = (id: string) => {
    const updatedPriced = pricedServices.filter(s => s.id !== id);
    const updatedLegacy = updatedPriced.map(s => ({
      id: s.id,
      name: s.name,
      price: s.priceSAR,
      priceUSD: s.priceUSD,
      priceSAR: s.priceSAR,
      priceYER: s.priceYER
    }));

    saveAllSettings({
      pricedServices: updatedPriced,
      services: updatedLegacy
    });
  };

  // 2. Currency handlers
  const handleAddCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurrCode.trim() || !newCurrName.trim() || !newCurrRate.trim()) return;

    const rate = parseFloat(newCurrRate) || 1.0;
    const codeUpper = newCurrCode.trim().toUpperCase();

    const newCurrency: CurrencyRate = {
      code: codeUpper,
      name: newCurrName.trim(),
      symbol: newCurrSymbol.trim() || codeUpper,
      rateToUSD: rate
    };

    const updatedCurrenciesList = [...currenciesList.filter(c => c.code !== codeUpper), newCurrency];
    const updatedLegacyCurrencies = updatedCurrenciesList.map(c => c.name);

    saveAllSettings({
      currenciesList: updatedCurrenciesList,
      currencies: updatedLegacyCurrencies
    });

    setNewCurrCode('');
    setNewCurrName('');
    setNewCurrSymbol('');
    setNewCurrRate('');
    setCurrencyFeedback(`تم إضافة العملة ${codeUpper} بنجاح وضبط سعر الصرف مقابل الدولار!`);
    setTimeout(() => setCurrencyFeedback(null), 3000);
  };

  const handleDeleteCurrency = (code: string) => {
    if (code === 'USD' || code === 'SAR' || code === 'YER') {
      alert('لا يمكن حذف العملات الأساسية للنظام (الدولار، السعودي، اليمني).');
      return;
    }
    const updatedList = currenciesList.filter(c => c.code !== code);
    const updatedLegacy = updatedList.map(c => c.name);

    saveAllSettings({
      currenciesList: updatedList,
      currencies: updatedLegacy
    });
  };

  // 3. Payment methods handlers
  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentMethod.trim()) return;

    const method = newPaymentMethod.trim();
    if (paymentMethods.includes(method)) {
      alert('طريقة الدفع هذه موجودة بالفعل.');
      return;
    }

    const updatedPayments = [...paymentMethods, method];
    saveAllSettings({
      paymentMethods: updatedPayments
    });

    setNewPaymentMethod('');
    setPaymentFeedback('تم إضافة طريقة الدفع الجديدة بنجاح!');
    setTimeout(() => setPaymentFeedback(null), 3000);
  };

  const handleDeletePaymentMethod = (method: string) => {
    const updatedPayments = paymentMethods.filter(p => p !== method);
    saveAllSettings({
      paymentMethods: updatedPayments
    });
  };

  // Live calculated YER previews for the form
  const inputUsd = parseFloat(newServicePriceUSD) || 0;
  const inputSar = parseFloat(newServicePriceSAR) || 0;
  const calculatedYerFromUSD = Math.round(inputUsd * usdToYerRate);
  const calculatedYerFromSAR = Math.round((inputSar / (sarToYerRate || 1)) * usdToYerRate);

  return (
    <div className="space-y-6">
      {/* Tab bar header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-500" />
            إدارة الخدمات والتسعير والمالية
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">تهيئة الخدمات مع التسعير بالعملات، إضافة أسعار الصرف، وطرق دفع مخصصة</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 self-stretch md:self-auto justify-between">
          <button
            onClick={() => setActiveSubTab('services')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'services' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            الخدمات والتسعير
          </button>
          <button
            onClick={() => setActiveSubTab('currencies')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'currencies' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            العملات وأسعار الصرف
          </button>
          <button
            onClick={() => setActiveSubTab('payments')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'payments' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            طرق الدفع
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Tab 1: Services */}
        {activeSubTab === 'services' && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Add Service Card */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Plus className="w-5 h-5" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">إضافة خدمة جديدة</h2>
              </div>

              <form onSubmit={handleAddService} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-550 dark:text-slate-400 font-semibold block">اسم الخدمة</label>
                  <input
                    type="text"
                    required
                    value={newServiceName}
                    onChange={e => setNewServiceName(e.target.value)}
                    placeholder="مثال: فيزا كندا سياحية"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-550 dark:text-slate-400 font-semibold block">السعر بالدولار ($)</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={newServicePriceUSD}
                        onChange={e => setNewServicePriceUSD(e.target.value)}
                        placeholder="150"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold dark:text-white"
                      />
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">$</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-550 dark:text-slate-400 font-semibold block">السعر بالسعودي (ر.س)</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={newServicePriceSAR}
                        onChange={e => setNewServicePriceSAR(e.target.value)}
                        placeholder="560"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold dark:text-white"
                      />
                      <span className="absolute left-2.5 top-2.5 text-slate-400 font-bold text-[10px]">ر.س</span>
                    </div>
                  </div>
                </div>

                {/* Live Exchange rates calculation preview */}
                {(inputUsd > 0 || inputSar > 0) && (
                  <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/30 rounded-xl space-y-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>الحساب التلقائي لليمني (سعر الصرف الحالي)</span>
                    </div>

                    <div className="space-y-1.5 text-slate-650 dark:text-slate-300 font-semibold leading-relaxed">
                      {inputUsd > 0 && (
                        <div className="flex justify-between border-b border-blue-100/50 dark:border-blue-900/10 pb-1.5">
                          <span>بناءً على سعر الدولار ({usdToYerRate} يمني/$):</span>
                          <span className="text-emerald-650 dark:text-emerald-400 font-bold">{calculatedYerFromUSD.toLocaleString()} ريال يمني</span>
                        </div>
                      )}
                      {inputSar > 0 && (
                        <div className="flex justify-between pt-0.5">
                          <span>بناءً على السعودي ({Math.round(usdToYerRate / sarToYerRate)} يمني/ر.س):</span>
                          <span className="text-amber-600 dark:text-amber-400 font-bold">{calculatedYerFromSAR.toLocaleString()} ريال يمني</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 pt-1.5 leading-normal border-t border-slate-200 dark:border-slate-800">
                      * يتم اعتماد سعر الدولار كمعيار أساسي لحساب السعر باليمني لحفظ القيمة من التغيرات.
                    </p>
                  </div>
                )}

                {serviceFeedback && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{serviceFeedback}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-650 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  إضافة الخدمة وحفظ السعر
                </button>
              </form>
            </div>

            {/* Services Table Card */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  <h2 className="text-sm font-bold">قائمة الخدمات الفعّالة والتسعير المتعدد</h2>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full font-bold">
                  {pricedServices.length} خدمات
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="pb-3 pt-1">الخدمة</th>
                      <th className="pb-3 pt-1 text-center">سعر الدولار ($)</th>
                      <th className="pb-3 pt-1 text-center">سعر السعودي (ر.س)</th>
                      <th className="pb-3 pt-1 text-center">سعر اليمني المحتسب</th>
                      <th className="pb-3 pt-1 w-10">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300 font-bold">
                    {pricedServices.map(service => (
                      <tr key={service.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                        <td className="py-3.5 pr-1">{service.name}</td>
                        <td className="py-3.5 text-center font-mono text-blue-600 dark:text-blue-400">${service.priceUSD.toLocaleString()}</td>
                        <td className="py-3.5 text-center font-mono text-amber-600 dark:text-amber-400">{service.priceSAR.toLocaleString()} ر.س</td>
                        <td className="py-3.5 text-center font-mono text-emerald-600 dark:text-emerald-400">{service.priceYER.toLocaleString()} ر.ي</td>
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                            title="حذف الخدمة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Currencies */}
        {activeSubTab === 'currencies' && (
          <motion.div
            key="currencies"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Add Currency */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Plus className="w-5 h-5" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">إضافة عملة جديدة</h2>
              </div>

              <form onSubmit={handleAddCurrency} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-550 dark:text-slate-400 font-semibold block">رمز العملة (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثل: QAR, KWD"
                    value={newCurrCode}
                    onChange={e => setNewCurrCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-550 dark:text-slate-400 font-semibold block">اسم العملة</label>
                    <input
                      type="text"
                      required
                      placeholder="مثل: دينار كويتي"
                      value={newCurrName}
                      onChange={e => setNewCurrName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-550 dark:text-slate-400 font-semibold block">الرمز/العلامة</label>
                    <input
                      type="text"
                      placeholder="مثل: د.ك"
                      value={newCurrSymbol}
                      onChange={e => setNewCurrSymbol(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-550 dark:text-slate-400 font-semibold block">سعر الصرف مقابل 1 دولار أمريكي</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      step="0.00001"
                      placeholder="مثل 0.30 (أو 1650 لليمني)"
                      value={newCurrRate}
                      onChange={e => setNewCurrRate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold dark:text-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 leading-normal">
                    * كم قيمة هذه العملة مقابل $1 دولار. (مثال: $1 = 3.75 ريال سعودي، فتكتب 3.75).
                  </p>
                </div>

                {currencyFeedback && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{currencyFeedback}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-650 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  إضافة العملة والتحويل
                </button>
              </form>
            </div>

            {/* Currencies Rates list & Conversion calculator */}
            <div className="lg:col-span-2 space-y-6">
              {/* Currencies table */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                    <Coins className="w-5 h-5 text-slate-400" />
                    <h2 className="text-sm font-bold">أسعار صرف العملات مقابل الدولار ($)</h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                        <th className="pb-3">رمز العملة</th>
                        <th className="pb-3">الاسم</th>
                        <th className="pb-3 text-center">الرمز المختصر</th>
                        <th className="pb-3 text-center">سعر صرفه مقابل $1</th>
                        <th className="pb-3 w-10">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300 font-bold">
                      {currenciesList.map(curr => (
                        <tr key={curr.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                          <td className="py-3.5 text-blue-600 dark:text-blue-400 font-mono">{curr.code}</td>
                          <td className="py-3.5">{curr.name}</td>
                          <td className="py-3.5 text-center font-mono">{curr.symbol}</td>
                          <td className="py-3.5 text-center font-mono">1 USD = {curr.rateToUSD.toLocaleString()} {curr.code}</td>
                          <td className="py-3.5 text-center">
                            {['USD', 'SAR', 'YER'].includes(curr.code) ? (
                              <span className="text-[10px] text-slate-400 italic font-medium bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded-md">أساسي</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteCurrency(curr.code)}
                                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                                title="حذف العملة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Conversion Calculator Tool */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-850 dark:text-white font-bold">
                  <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm">آلة حاسبة سريعة لمطابقة ومقارنة الصرف</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">القيمة المراد تحويلها</label>
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={e => setCalcAmount(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-750 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-mono font-bold dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">من عملة</label>
                    <select
                      value={calcFromCurrency}
                      onChange={e => setCalcFromCurrency(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-750 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold dark:text-slate-700"
                    >
                      {currenciesList.map(c => (
                        <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    <div className="p-3 bg-blue-100/30 dark:bg-blue-950/25 border border-blue-200/50 rounded-xl w-full text-center text-xs font-bold text-blue-650 dark:text-blue-400">
                      1 {calcFromCurrency} = {((1 / (getRate(calcFromCurrency) || 1)) * getRate('YER')).toLocaleString()} ريال يمني
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {currenciesList.map(c => {
                    if (c.code === calcFromCurrency) return null;
                    const amountNum = parseFloat(calcAmount) || 0;
                    // convert calcFromCurrency amount to USD first, then to currency c
                    const usdAmount = amountNum / (getRate(calcFromCurrency) || 1);
                    const convertedAmount = usdAmount * c.rateToUSD;

                    return (
                      <div key={c.code} className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-750 rounded-xl text-center shadow-xs">
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-bold">{c.name}</span>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-white mt-1 block">
                          {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 3 })} {c.symbol}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Payment methods */}
        {activeSubTab === 'payments' && (
          <motion.div
            key="payments"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Add Payment Method */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Plus className="w-5 h-5" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">إضافة طريقة دفع جديدة</h2>
              </div>

              <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-550 dark:text-slate-400 font-semibold block">اسم طريقة الدفع</label>
                  <input
                    type="text"
                    required
                    placeholder="مثل: بنك اليمن الكويتي، كاش عدن"
                    value={newPaymentMethod}
                    onChange={e => setNewPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold dark:text-white"
                  />
                </div>

                {paymentFeedback && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{paymentFeedback}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-650 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  حفظ طريقة الدفع
                </button>
              </form>
            </div>

            {/* List Payment methods */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <h2 className="text-sm font-bold">طرق الدفع والتحصيل المهيأة</h2>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full font-bold">
                  {paymentMethods.length} طرق تحصيل
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentMethods.map(method => (
                  <div 
                    key={method} 
                    className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-750 rounded-xl flex items-center justify-between hover:border-blue-400/40 hover:bg-blue-50/5 dark:hover:bg-blue-950/5 transition-all font-bold text-xs"
                  >
                    <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-blue-100/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span>{method}</span>
                    </div>

                    <button
                      onClick={() => handleDeletePaymentMethod(method)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                      title="حذف طريقة الدفع"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
