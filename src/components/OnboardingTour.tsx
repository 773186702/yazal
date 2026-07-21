import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  PartyPopper, 
  X, 
  Play, 
  CheckCircle2, 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  TrendingUp, 
  Users, 
  Settings, 
  Search 
} from 'lucide-react';

interface TourStep {
  tab: string;
  title: string;
  description: string;
  highlightIcon: React.ReactNode;
}

interface OnboardingTourProps {
  onComplete: () => void;
  onSelectTab: (tab: string) => void;
}

export default function OnboardingTour({ onComplete, onSelectTab }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 is Welcome dialog

  const steps: TourStep[] = [
    {
      tab: 'dashboard',
      title: 'الرئيسية ومؤشرات الأداء المباشرة',
      description: 'مركز القيادة الموحد لشركتك! يعرض إحصائيات سريعة عن عدد طلبات التأشيرات النشطة، إجمالي الإيرادات، المعاملات بانتظار الاعتماد، وتنبيهات المهام العاجلة.',
      highlightIcon: <LayoutDashboard className="w-6 h-6 text-blue-500" />
    },
    {
      tab: 'customers',
      title: 'سجل العملاء والمسافرين',
      description: 'قاعدة بيانات شاملة وموثقة لعملائك، تتضمن وثائق وجوازات السفر، أرقام التواصل، وسجل جميع المعاملات والتأشيرات السابقة لكل عميل.',
      highlightIcon: <Users className="w-6 h-6 text-purple-500" />
    },
    {
      tab: 'newreq',
      title: 'إصدار وتقديم طلب خدمة جديد',
      description: 'واجهة سريعة لإضافة طلبات الخدمات الجديدة مثل تأشيرات السفر، استخراج الفيزا، أو الخدمات السياحية، وتحديد العميل والموظف المسؤول فوراً.',
      highlightIcon: <Briefcase className="w-6 h-6 text-indigo-500" />
    },
    {
      tab: 'visa',
      title: 'متابعة الفيزا والتأشيرات',
      description: 'تتبع دقيق لمراحل معالجة التأشيرات لدى السفارات والقنصليات، مع تحديث حالات الفيزا (قيد التقديم، جاري المعالجة، تم الإصدار، تم التسليم).',
      highlightIcon: <CheckSquare className="w-6 h-6 text-teal-500" />
    },
    {
      tab: 'accounting',
      title: 'الإدارة المالية والمدفوعات',
      description: 'توثيق دقيق لكل عملية مالية (إيراد أو مصروف) بالعملات المتعددة، مع إمكانية تحديد المستلم أو الدافع وطريقة السداد عبر القوائم القابلة للبحث.',
      highlightIcon: <TrendingUp className="w-6 h-6 text-emerald-500" />
    },
    {
      tab: 'users',
      title: 'فريق العمل والصلاحيات',
      description: 'إدارة متقدمة للمنظومة وتوزيع الصلاحيات بدقة بين الأدوار المختلفة (مدير، محاسب مالي، موظف مبيعات، ومندوب منفذ) للحفاظ على أمان البيانات.',
      highlightIcon: <Search className="w-6 h-6 text-amber-500" />
    },
    {
      tab: 'settings',
      title: 'تخصيص وإعدادات منصة يزل',
      description: 'تخصيص بيانات المنشأة، ضبط مظهر الواجهة (الوضع الداكن أو الفاتح)، ومتابعة حالة المزامنة السحابية عبر خادم Firestore بأعلى درجات الأمان.',
      highlightIcon: <Settings className="w-6 h-6 text-slate-600" />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      onSelectTab(steps[nextIdx].tab);
    } else {
      setCurrentStep(steps.length); // Celebration completion dialog
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      onSelectTab(steps[prevIdx].tab);
    } else if (currentStep === 0) {
      setCurrentStep(-1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <AnimatePresence mode="wait">
        
        {/* Welcome Dialog (-1) */}
        {currentStep === -1 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl space-y-6 text-slate-800 dark:text-slate-100 relative overflow-hidden"
          >
            {/* Visual backdrop decor */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            
            <div className="text-center space-y-4 relative z-10">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 animate-bounce">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-normal">
                مرحباً بك في منصة يزل (Yazal Services)! 🎉
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                يسعدنا انضمامك إلينا! "يزل" هي المنصة الريادية لإدارة شركات ومكاتب السفر، التأشيرات، والخدمات اللوجستية. تتيح لك متابعة طلبات الفيزا، تنظيم السجلات المالية والعملاء، وتنسيق المهام بين فريق العمل بدقة.
              </p>
            </div>

            {/* Quick value props */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-blue-500" />
                <span>متابعة الفيزا والتأشيرات</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-blue-500" />
                <span>إدارة العملاء والمسافرين</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-blue-500" />
                <span>الحسابات والعملات المتعددة</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-blue-500" />
                <span>صلاحيات دقيقة للفريق</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                ابدأ الجولة التفاعلية السريعة
              </button>
              <button
                onClick={handleSkip}
                className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold border border-slate-200 dark:border-slate-700 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-center"
              >
                تخطي والدخول للمنصة
              </button>
            </div>
          </motion.div>
        )}

        {/* Step Guides (0 to length - 1) */}
        {currentStep >= 0 && currentStep < steps.length && (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-5 md:p-6 shadow-2xl relative"
          >
            {/* Quick skip button */}
            <button
              onClick={handleSkip}
              className="absolute left-4 top-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              title="إنهاء الجولة"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step content */}
            <div className="space-y-4">
              
              {/* Header Icon & Tag */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  {steps[currentStep].highlightIcon}
                </div>
                <div>
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 px-2.5 py-0.5 rounded-full font-bold">
                    الخطوة {currentStep + 1} من {steps.length}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white mt-1">
                    {steps[currentStep].title}
                  </h3>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-1.5 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>

              {/* Description */}
              <p className="text-slate-650 dark:text-slate-350 text-xs md:text-sm leading-relaxed">
                {steps[currentStep].description}
              </p>

              {/* Navigation controls */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </button>

                <div className="flex gap-1.5">
                  <button
                    onClick={handleSkip}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold px-3 py-2 cursor-pointer"
                  >
                    تخطي الجولة
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    <span>{currentStep === steps.length - 1 ? 'إنهاء الجولة' : 'التالي'}</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Celebration Dialog (steps.length) */}
        {currentStep === steps.length && (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl text-center space-y-6 text-slate-800 dark:text-slate-100 relative overflow-hidden"
          >
            {/* Visual background decor */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -ml-10 -mt-10"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-normal">
                أنت جاهز تماماً للانطلاق! 🌟
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                لقد أكملت الجولة التعريفية بنجاح وتعرفت على كافة معالم وأسرار يزل. يمكنك العودة والقيام بهذه الجولة في أي وقت تشاء من إعدادات النظام.
              </p>
            </div>

            {/* Acknowledged button */}
            <button
              onClick={handleSkip}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              لنبدأ العمل الآن!
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
