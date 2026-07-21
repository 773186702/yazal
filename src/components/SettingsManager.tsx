import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Smartphone, 
  CheckCircle, 
  Download, 
  RefreshCw, 
  DollarSign, 
  Bell, 
  ShieldCheck, 
  Heart,
  HelpCircle,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  Info,
  Sparkles,
  Briefcase,
  Clock,
  AlertTriangle,
  Circle,
  Mail,
  MessageSquare,
  FileText,
  Building2,
  Phone,
  Globe,
  Copy,
  Check,
  Send,
  Plus,
  Trash2,
  Zap,
  Shield,
  Layout,
  Layers
} from 'lucide-react';
import { AppSettings } from '../types';
import CurrencyManager from './CurrencyManager';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface NotificationTemplate {
  id: string;
  name: string;
  category: 'visa' | 'invoice' | 'service' | 'debt' | 'welcome';
  subject: string;
  body: string;
  channel: 'email' | 'whatsapp' | 'system';
  active: boolean;
  variables: string[];
}

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tpl-visa-issued',
    name: 'إشعار صدور التأشيرة وجاهزية التسليم',
    category: 'visa',
    channel: 'whatsapp',
    active: true,
    subject: 'مبروك! تم إصدار التأشيرة الخاصة بك {visa_destination}',
    body: 'عزيزي/عزيزتي {customer_name}،\nيسعدنا في {company_name} إبلاغك بصدور التأشيرة الخاصة بك بجهة السفر ({visa_destination}) بنجاح! 🎉\nوثائقك وجواز سفرك جاهزون للتسليم الآن.\nرقم المرجع: {request_id}\nشكراً لثقتكم بنا، ونتمنى لكم رحلة ممتعة وآمنة!',
    variables: ['customer_name', 'visa_destination', 'request_id', 'company_name']
  },
  {
    id: 'tpl-status-update',
    name: 'تحديث حالة طلب الخدمة',
    category: 'service',
    channel: 'whatsapp',
    active: true,
    subject: 'تحديث جديد بشأن طلبك رقم {request_id}',
    body: 'أهلاً {customer_name}،\nنود إحاطتك علماً بتحديث حالة طلب الخدمة ({service_name}) المودع لدينا إلى حالة: [{status}].\nالموظف المسؤول: {employee_name}\nلأي استفسارات إضافية، يرجى التواصل معنا على الرقم: {company_phone}.',
    variables: ['customer_name', 'service_name', 'status', 'request_id', 'employee_name', 'company_phone']
  },
  {
    id: 'tpl-invoice-generated',
    name: 'إشعار إصدار فاتورة / سند جديد',
    category: 'invoice',
    channel: 'email',
    active: true,
    subject: 'فاتورة جديدة رقم {invoice_no} من منصة {company_name}',
    body: 'عزيزي {customer_name}،\nتم إصدار فاتورة رسمية جديدة لك رقم {invoice_no} بمبلغ وقدره {amount} {currency} مقابل خدمة {service_name}.\nطريقة السداد: {payment_method}\nتاريخ الفاتورة: {date}\nنشكركم لاختياركم {company_name}.',
    variables: ['customer_name', 'invoice_no', 'amount', 'currency', 'service_name', 'payment_method', 'date', 'company_name']
  },
  {
    id: 'tpl-debt-reminder',
    name: 'تذكير بموعد استحقاق دفعة / قسط مالي',
    category: 'debt',
    channel: 'whatsapp',
    active: true,
    subject: 'تذكير بموعد استحقاق الدفعة المالية - {company_name}',
    body: 'مرحباً {customer_name}،\nنود تذكيرك باللطف بوجود دفعة مالية مستحقة بقيمة {amount} {currency} بتاريخ {due_date}.\nنرجو التكرم بالسداد عبر أحد حساباتنا أو زيارة الفرع لضمان استمرار متابعة معاملتك بدون تأخير.\nشكراً لتفهمكم وشراكتكم معنا.',
    variables: ['customer_name', 'amount', 'currency', 'due_date', 'company_name']
  },
  {
    id: 'tpl-welcome-customer',
    name: 'رسالة ترحب بخصوص عميل جديد',
    category: 'welcome',
    channel: 'email',
    active: true,
    subject: 'أهلاً بك في منصة {company_name} للخدمات والتأشيرات!',
    body: 'عزيزي {customer_name}،\nيسر فريق {company_name} الترحيب بك كعميل مميز في منظومتنا.\nتم تسجيل ملفك بنجاح تحت الكود المرجعي: {customer_code}.\nنحن هنا لتقديم أفضل خدمات السفر، التأشيرات، واللوجستيات لك دائماً.\nللتواصل المباشر: {company_phone} | {company_email}',
    variables: ['customer_name', 'customer_code', 'company_phone', 'company_email', 'company_name']
  }
];

interface SettingsManagerProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onTriggerOnboarding?: () => void;
  userId: string;
}

export default function SettingsManager({
  settings,
  onUpdateSettings,
  onTriggerOnboarding,
  userId
}: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'templates' | 'system' | 'widgets'>('profile');

  // Corporate Profile State
  const [businessName, setBusinessName] = useState(settings.businessName || 'مكتب يزل للخدمات والتأشيرات والخدمات اللوجستية');
  const [licenseNumber, setLicenseNumber] = useState(settings.licenseNumber || 'YAZ-2026-8890');
  const [companyPhone, setCompanyPhone] = useState(settings.companyPhone || '+966 50 123 4567');
  const [companyEmail, setCompanyEmail] = useState(settings.companyEmail || 'info@yazalservices.com');
  const [companyAddress, setCompanyAddress] = useState(settings.companyAddress || 'الرياض - حي العليا / فرع صنعاء - شارع الزبيري');
  const [currency, setCurrency] = useState(settings.currency || 'SAR');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>(settings.theme || 'light');

  // Notification Preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled ?? true);
  const [autoSave, setAutoSave] = useState(settings.autoSave ?? true);
  const [taskDeadlines, setTaskDeadlines] = useState(settings.notificationPreferences?.taskDeadlines ?? true);
  const [financialReports, setFinancialReports] = useState(settings.notificationPreferences?.financialReports ?? true);
  const [systemUpdates, setSystemUpdates] = useState(settings.notificationPreferences?.systemUpdates ?? false);

  // Email & Notification Templates State
  const [templates, setTemplates] = useState<NotificationTemplate[]>(() => {
    return settings.notificationTemplates && settings.notificationTemplates.length > 0
      ? settings.notificationTemplates
      : DEFAULT_TEMPLATES;
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_TEMPLATES[0].id);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Widget Layout order
  const [widgets, setWidgets] = useState(settings.widgetLayout || [
    { id: 'stats', title: 'بطاقات الإحصائيات السريعة', visible: true },
    { id: 'finance_chart', title: 'مخطط التحليلات المالية الأسبوعية', visible: true },
    { id: 'project_status', title: 'توزيع حالات التأشيرات والخدمات', visible: true },
    { id: 'tasks', title: 'المهام الفورية والطلبات العاجلة', visible: true },
    { id: 'ai_advisor', title: 'مستشار يزل الذكي للأعمال', visible: true },
  ]);

  const [statusColors, setStatusColors] = useState({
    not_started: settings.statusColors?.not_started || '#64748b',
    active: settings.statusColors?.active || '#3b82f6',
    on_hold: settings.statusColors?.on_hold || '#f59e0b',
    completed: settings.statusColors?.completed || '#10b981',
    todo: settings.statusColors?.todo || '#94a3b8',
    in_progress: settings.statusColors?.in_progress || '#3b82f6',
    done: settings.statusColors?.done || '#10b981',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('default');

  // PWA installer support
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Fetch templates from Firestore if available
  useEffect(() => {
    if (userId) {
      const fetchTemplates = async () => {
        try {
          const docRef = doc(db, `users/${userId}/admin_system_settings`, 'templates');
          const snap = await getDoc(docRef);
          if (snap.exists() && snap.data()?.templates) {
            setTemplates(snap.data().templates);
          }
        } catch (e) {
          console.warn('Could not fetch custom templates from Firestore:', e);
        }
      };
      fetchTemplates();
    }
  }, [userId]);

  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleUpdateCurrentTemplate = (updated: Partial<NotificationTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === selectedTemplateId ? { ...t, ...updated } : t));
  };

  const handleInsertVariable = (varName: string) => {
    const formattedVar = `{${varName}}`;
    handleUpdateCurrentTemplate({
      body: currentTemplate.body + ' ' + formattedVar
    });
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('هذا المتصفح لا يدعم التنبيهات المنبثقة.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        new Notification('تم تفعيل التنبيهات بنجاح في منصة يزل! 🔔', {
          body: 'ستتلقى تنبيهات فورية عن المواعيد والطلبات الجديدة.',
          dir: 'rtl'
        });
      }
    } catch (err) {
      console.error('Failed to request permission:', err);
    }
  };

  const handleSendTestNotification = () => {
    if (!('Notification' in window)) return;
    try {
      new Notification('إشعار تجريبي من منصة يزل 🌟', {
        body: 'أهلاً بك! نظام الإشعارات والتنبيهات يعمل بنجاح.',
        dir: 'rtl'
      });
    } catch (err) {
      console.error('Failed to send test notification:', err);
    }
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallSuccess(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;
    const reordered = [...widgets];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setWidgets(reordered);
  };

  const handleToggleWidgetVisibility = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: AppSettings = {
      ...settings,
      businessName,
      licenseNumber,
      companyPhone,
      companyEmail,
      companyAddress,
      currency,
      notificationsEnabled,
      autoSave,
      theme: themeMode,
      notificationPreferences: {
        taskDeadlines,
        financialReports,
        systemUpdates
      },
      widgetLayout: widgets,
      statusColors,
      notificationTemplates: templates
    };

    onUpdateSettings(updatedSettings);

    // Sync templates to Firestore
    if (userId) {
      try {
        await setDoc(doc(db, `users/${userId}/admin_system_settings`, 'templates'), {
          templates,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not save templates to Firestore:', err);
      }
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Generate Live Sample Preview Text for template
  const getPreviewBody = (template: NotificationTemplate) => {
    let result = template.body;
    result = result.replace(/{customer_name}/g, 'أحمد المصري');
    result = result.replace(/{customer_code}/g, 'CUS-1042');
    result = result.replace(/{visa_destination}/g, 'شنغن — فرنسا');
    result = result.replace(/{service_name}/g, 'استخراج فيزا شنغن');
    result = result.replace(/{status}/g, 'تم الإصدار بنجاح');
    result = result.replace(/{request_id}/g, 'REQ-3301');
    result = result.replace(/{invoice_no}/g, 'INV-0231');
    result = result.replace(/{amount}/g, '5,400');
    result = result.replace(/{currency}/g, currency);
    result = result.replace(/{payment_method}/g, 'تحويل بنكي');
    result = result.replace(/{due_date}/g, '2026-08-15');
    result = result.replace(/{date}/g, '2026-07-21');
    result = result.replace(/{employee_name}/g, 'خالد عمر');
    result = result.replace(/{company_name}/g, businessName);
    result = result.replace(/{company_phone}/g, companyPhone);
    result = result.replace(/{company_email}/g, companyEmail);
    return result;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Settings className="w-6 h-6" />
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">إعدادات المنشأة وقوالب التواصل</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            إدارة بيانات الشركة، تخصيص قوالب الرسائل والإشعارات للعملاء، ضبط العملة، والمظهر التفاعلي لمنصة يزل
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
        >
          <CheckCircle className="w-4 h-4" />
          <span>حفظ جميع التغييرات</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-1">
        {[
          { id: 'profile', label: 'بيانات المنشأة والعملة', icon: Building2 },
          { id: 'templates', label: 'قوالب البريد والإشعارات (تواصل)', icon: Mail, highlight: true },
          { id: 'widgets', label: 'المظهر وتنسيق الشاشة', icon: Layout },
          { id: 'system', label: 'تطبيق PWA والتنبيهات', icon: Smartphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.highlight && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              )}
            </button>
          );
        })}
      </div>

      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>تم حفظ تحديثات الإعدادات وقوالب الرسائل بنجاح وتطبيقها على كامل النظام!</span>
        </motion.div>
      )}

      {/* TAB 1: Business Profile & Currencies */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-800 dark:text-white">الهوية والبيانات الرسمية للمنشأة</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">اسم المكتب / المنشأة *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="مثال: مكتب يزل للخدمات والتأشيرات"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-4 pl-9 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">رقم السجل التجاري / الترخيص</label>
                <div className="relative">
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="YAZ-2026-8890"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-4 pl-9 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">هاتف التواصل الرسمي (الواتساب)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-4 pl-9 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">البريد الإلكتروني للشركة</label>
                <div className="relative">
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="info@yazalservices.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-4 pl-9 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">عنوان المكاتب والفروع الرئيسية</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="الرياض - حي العليا / صنعاء - شارع الزبيري"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <CurrencyManager userId={userId} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <DollarSign className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">العملة الرئسية لتقارير الأرباح</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                حدد العملة المعتمدة لعرض إجمالي الإيرادات والمصروفات وصافي الأرباح التراكمية في الشاشة الرئيسية.
              </p>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
              >
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="YER">ريال يمني (YER)</option>
                <option value="AED">درهم إماراتي (AED)</option>
                <option value="EUR">يورو (EUR)</option>
                <option value="EGP">جنيه مصري (EGP)</option>
              </select>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg space-y-3">
              <Sparkles className="w-8 h-8 text-blue-200 animate-pulse" />
              <h3 className="text-sm font-black">منظومة يزل الرقمية</h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                يتم تحديث جميع الفواتير وقوالب التواصل باسم منشأتك المعتمدة أعلاه فوراً للعملاء.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Email & Notification Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Templates Selector Menu (Left / Top) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>قوالب الرسائل المعتمدة ({templates.length})</span>
              </h2>
            </div>

            <div className="space-y-2">
              {templates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`w-full text-right p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500 text-slate-900 dark:text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{tpl.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        tpl.channel === 'whatsapp' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                          : tpl.channel === 'email'
                          ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800'
                      }`}>
                        {tpl.channel === 'whatsapp' ? '💬 واتساب / SMS' : tpl.channel === 'email' ? '✉️ بريد إلكتروني' : '🔔 إشعار'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {tpl.subject}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Editor & Live Preview (Right / Main) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span>تعديل قالب: {currentTemplate.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">خصّص محتوى الرسالة واستخدم المتغيرات الديناميكية لملء البيانات تلقائياً</p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">قناة الإرسال:</label>
                  <select
                    value={currentTemplate.channel}
                    onChange={(e) => handleUpdateCurrentTemplate({ channel: e.target.value as any })}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="whatsapp">واتساب / SMS</option>
                    <option value="email">بريد إلكتروني</option>
                    <option value="system">إشعار نظام داخلي</option>
                  </select>
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">عنوان / موضع الرسالة (Subject):</label>
                <input
                  type="text"
                  value={currentTemplate.subject}
                  onChange={(e) => handleUpdateCurrentTemplate({ subject: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Dynamic Variables Quick Buttons Palette */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>انقر لإدراج متغير ديناميكي في النص:</span>
                  </span>
                  {copiedVar && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold animate-bounce">
                      تم إدراج &#123;{copiedVar}&#125; ✓
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'customer_name', label: 'اسم العميل' },
                    { name: 'customer_code', label: 'كود العميل' },
                    { name: 'visa_destination', label: 'جهة التأشيرة' },
                    { name: 'service_name', label: 'اسم الخدمة' },
                    { name: 'status', label: 'حالة الطلب' },
                    { name: 'request_id', label: 'رقم الطلب' },
                    { name: 'invoice_no', label: 'رقم الفاتورة' },
                    { name: 'amount', label: 'المبلغ' },
                    { name: 'currency', label: 'العملة' },
                    { name: 'due_date', label: 'تاريخ الاستحقاق' },
                    { name: 'company_name', label: 'اسم المنشأة' },
                    { name: 'company_phone', label: 'هاتف المنشأة' },
                  ].map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => handleInsertVariable(v.name)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3 h-3 text-blue-500" />
                      <span>{v.label}</span>
                      <span className="text-[9px] text-slate-400 font-mono">&#123;{v.name}&#125;</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Body Editor */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 dark:text-slate-300 block font-bold">نص القالب (Body Text):</label>
                <textarea
                  rows={6}
                  value={currentTemplate.body}
                  onChange={(e) => handleUpdateCurrentTemplate({ body: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Live Preview Simulated Message Card */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>معاينة حية لشكل الرسالة الموجهة للعميل (Live Preview)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">* عينة ببيانات تجريبية موثقة</span>
                </div>

                <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {currentTemplate.channel === 'whatsapp' ? (
                    <div className="max-w-md mx-auto bg-[#efeae2] dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-emerald-200/50 dark:border-slate-700 space-y-2 dir-rtl">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border-b border-emerald-200/40 dark:border-slate-800 pb-2">
                        <MessageSquare className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                        <span>رسالة الواتساب الرسمية - {businessName}</span>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl rounded-tr-none text-xs font-medium text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed shadow-2xs">
                        {getPreviewBody(currentTemplate)}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-blue-600 text-white p-3 text-xs font-bold flex items-center justify-between">
                        <span>{businessName}</span>
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="p-4 space-y-3 text-xs">
                        <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                          الموضوع: {currentTemplate.subject.replace(/{company_name}/g, businessName).replace(/{visa_destination}/g, 'شنغن — فرنسا').replace(/{request_id}/g, 'REQ-3301').replace(/{invoice_no}/g, 'INV-0231')}
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {getPreviewBody(currentTemplate)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Theme & Widget Layout */}
      {activeTab === 'widgets' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-blue-600">
              <Sun className="w-5 h-5" />
              <h2 className="text-base font-bold text-slate-800 dark:text-white">وضع ألوان الواجهة (Theme)</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'الوضع المضيء', icon: Sun },
                { id: 'dark', label: 'الوضع الداكن', icon: Moon },
                { id: 'auto', label: 'تلقائي', icon: Sparkles }
              ].map((item) => {
                const Icon = item.icon;
                const isSel = themeMode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setThemeMode(item.id as any)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSel
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">ألوان الحالات المخصصة:</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">قيد المعالجة:</span>
                  <input
                    type="color"
                    value={statusColors.active}
                    onChange={(e) => setStatusColors(prev => ({ ...prev, active: e.target.value }))}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">تم الإصدار / مكتمل:</span>
                  <input
                    type="color"
                    value={statusColors.completed}
                    onChange={(e) => setStatusColors(prev => ({ ...prev, completed: e.target.value }))}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Layout className="w-5 h-5" />
              <h2 className="text-base font-bold text-slate-800 dark:text-white">ترتيب ودجات الصفحة الرئيسية</h2>
            </div>
            <p className="text-xs text-slate-500">تحكم بالودجات الظاهرة في الشاشة الرئيسية وأعد ترتيبها حسب الأولوية لعملك.</p>

            <div className="space-y-2">
              {widgets.map((widget, idx) => (
                <div
                  key={widget.id}
                  className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleWidgetVisibility(widget.id)}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        widget.visible ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <span className={`text-xs font-bold ${widget.visible ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 line-through'}`}>
                      {widget.title}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveWidget(idx, 'up')}
                      className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === widgets.length - 1}
                      onClick={() => handleMoveWidget(idx, 'down')}
                      className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: System & PWA */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Smartphone className="w-6 h-6" />
              <h2 className="text-base font-bold text-slate-800 dark:text-white">تطبيق الجوال واللوحي (PWA)</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              يدعم نظام "يزل" تثبيت المنصة على أجهزة الجوال والحواسيب كاختصار سريع للعمل دون الحاجة لفتح المتصفح دائماً.
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>دعم المزايا السحابية والشبكية مفعّل بنجاح</span>
              </div>
            </div>

            {isInstallable && (
              <button
                onClick={handleInstallPWA}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                تثبيت تطبيق يزل الآن
              </button>
            )}

            <button
              type="button"
              onClick={onTriggerOnboarding}
              className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950 text-blue-600 dark:text-blue-400 hover:bg-blue-50 border border-slate-200 dark:border-slate-800 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              تشغيل الجولة التفاعلية الترحيبية 🚀
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Bell className="w-6 h-6" />
              <h2 className="text-base font-bold text-slate-800 dark:text-white">تنبيهات سطح المكتب والجوال</h2>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">حالة ترخيص المتصفح:</span>
                <span className={permissionStatus === 'granted' ? 'text-emerald-500' : 'text-amber-500'}>
                  {permissionStatus === 'granted' ? 'مسموح بها ✓' : 'غير مفعلة'}
                </span>
              </div>

              {permissionStatus !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  طلب الإذن للتنبيهات
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  className="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                >
                  إرسال إشعار تجريبي 🔔
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
