import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import ServiceRequestsManager from './components/ServiceRequestsManager';
import VisaManager from './components/VisaManager';
import FinancialManager from './components/FinancialManager';
import CustomersManager from './components/CustomersManager';
import AIAssistant from './components/AIAssistant';
import SettingsManager from './components/SettingsManager';
import ServicesManager from './components/ServicesManager';
import AdvancedSearch from './components/AdvancedSearch';
import OnboardingTour from './components/OnboardingTour';
import AdminDashboard from './components/AdminDashboard';
import PerformanceDashboard from './components/PerformanceDashboard';
import LoginScreen from './components/LoginScreen';
import CalendarManager from './components/CalendarManager';
import { Customer, ServiceRequest, VisaApplication, Invoice, Transaction, AppSettings, Activity, UserRole, UserRoleDefinition } from './types';
import { Sparkles, Menu, X, Smartphone, Download, Calendar, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from './context/ThemeContext';

// Firebase imports for client-side Auth and Cloud Firestore sync
import { 
  auth, 
  db, 
  OperationType, 
  handleFirestoreError,
  appLoadTrace,
  measurePerformance
} from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  deleteDoc, 
  collection 
} from 'firebase/firestore';

// Initial Mock Data to populate Travel ERP
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c-1',
    code: 'CUS-1042',
    name: 'أحمد المصري',
    phone: '+20 100 123 4567',
    nationality: 'مصر',
    status: 'active',
    assignedTo: 'خالد عمر',
    timeline: [
      { title: 'طلب فيزا شنغن جديد', date: 'منذ يومين' },
      { title: 'تم استلام دفعة 5,000 ج.م', date: 'منذ 4 أيام' }
    ]
  },
  {
    id: 'c-2',
    code: 'CUS-1041',
    name: 'ليلى حسن',
    phone: '+966 55 987 6543',
    nationality: 'السعودية',
    status: 'active',
    assignedTo: 'خالد عمر',
    timeline: [
      { title: 'تم تسليم الفيزا', date: 'أمس' },
      { title: 'فاتورة #INV-0231 مسددة', date: 'منذ 3 أيام' }
    ]
  },
  {
    id: 'c-3',
    code: 'CUS-1040',
    name: 'Michael Chen',
    phone: '+1 415 555 0192',
    nationality: 'USA',
    status: 'pending',
    assignedTo: 'سارة يوسف',
    timeline: [
      { title: 'Document review requested', date: '2 days ago' }
    ]
  },
  {
    id: 'c-4',
    code: 'CUS-1039',
    name: 'فاطمة الزهراء',
    phone: '+212 6 12 34 56',
    nationality: 'المغرب',
    status: 'inactive',
    assignedTo: 'خالد عمر',
    timeline: [
      { title: 'تم أرشفة الملف', date: 'منذ شهر' }
    ]
  },
  {
    id: 'c-5',
    code: 'CUS-1038',
    name: 'Omar Al-Rashid',
    phone: '+971 50 111 2233',
    nationality: 'UAE',
    status: 'active',
    assignedTo: 'نور خليفة',
    timeline: [
      { title: 'New investment inquiry', date: '1 day ago' }
    ]
  }
];

const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'REQ-3301',
    customerId: 'c-1',
    customerName: 'أحمد المصري',
    serviceType: 'فيزا شنغن',
    amount: 5000,
    currency: 'EGP',
    payType: 'pay_cash',
    receiptDate: '2026-07-15',
    expiryDate: '2026-08-15',
    employee: 'خالد عمر',
    status: 'executor_pending',
    docs: ['Passport.pdf'],
    history: [{ title: 'تم الاعتماد من قبل سارة يوسف', date: 'أمس' }]
  },
  {
    id: 'REQ-3302',
    customerId: 'c-3',
    customerName: 'Michael Chen',
    serviceType: 'UK Business Visa',
    amount: 1200,
    currency: 'USD',
    payType: 'pay_card',
    receiptDate: '2026-07-18',
    expiryDate: '2026-08-01',
    employee: 'سارة يوسف',
    status: 'pending_accountant',
    docs: ['Bank_Statement.pdf', 'Invitation.pdf'],
    history: [{ title: 'تم إنشاء الطلب', date: 'اليوم' }]
  }
];

const INITIAL_VISAS: VisaApplication[] = [
  {
    id: 'VA-3301',
    customerName: 'أحمد المصري',
    destination: 'شنغن — فرنسا',
    stage: 'submitted',
    docsTotal: 8,
    docsReceived: 6
  },
  {
    id: 'VA-3298',
    customerName: 'Michael Chen',
    destination: 'UK Business Visa',
    stage: 'review',
    docsTotal: 6,
    docsReceived: 6
  },
  {
    id: 'VA-3295',
    customerName: 'ليلى حسن',
    destination: 'أمريكا — سياحية',
    stage: 'approved',
    docsTotal: 7,
    docsReceived: 7
  },
  {
    id: 'VA-3290',
    customerName: 'Omar Al-Rashid',
    destination: 'Canada — Investor',
    stage: 'draft',
    docsTotal: 10,
    docsReceived: 3
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-0231',
    customerName: 'ليلى حسن',
    amount: 5400,
    currency: 'SAR',
    status: 'paid',
    date: '2026-07-08',
    method: 'pay_card'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'expense',
    amount: 3000,
    currency: 'EGP',
    description: 'إيجار المكتب',
    date: '2026-07-01',
    by: 'سارة يوسف'
  },
  {
    id: 'tx-2',
    type: 'income',
    amount: 5400,
    currency: 'SAR',
    description: 'دفعة عميل CUS-1041',
    date: '2026-07-08',
    by: 'سارة يوسف'
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'ريال سعودي',
  theme: 'light',
  notificationsEnabled: true,
  businessName: 'يزل',
  services: [
    { name: 'فيزا شنغن', price: 450, priceUSD: 120, priceSAR: 450, priceYER: 198000 },
    { name: 'فيزا أمريكا', price: 690, priceUSD: 185, priceSAR: 690, priceYER: 305250 },
    { name: 'فيزا بريطانيا', price: 560, priceUSD: 150, priceSAR: 560, priceYER: 247500 },
    { name: 'حجز فندق', price: 185, priceUSD: 50, priceSAR: 185, priceYER: 82500 },
    { name: 'تذكرة طيران', price: 1125, priceUSD: 300, priceSAR: 1125, priceYER: 495000 },
    { name: 'شحن بضائع', price: 2500, priceUSD: 660, priceSAR: 2500, priceYER: 1089000 },
    { name: 'تحويل أموال', price: 100, priceUSD: 25, priceSAR: 100, priceYER: 41250 },
    { name: 'استثمار', price: 5000, priceUSD: 1300, priceSAR: 5000, priceYER: 2145000 }
  ],
  pricedServices: [
    { id: 'ser-1', name: 'فيزا شنغن', priceUSD: 120, priceSAR: 450, priceYER: 198000 },
    { id: 'ser-2', name: 'فيزا أمريكا', priceUSD: 185, priceSAR: 690, priceYER: 305250 },
    { id: 'ser-3', name: 'فيزا بريطانيا', priceUSD: 150, priceSAR: 560, priceYER: 247500 },
    { id: 'ser-4', name: 'حجز فندق', priceUSD: 50, priceSAR: 185, priceYER: 82500 },
    { id: 'ser-5', name: 'تذكرة طيران', priceUSD: 300, priceSAR: 1125, priceYER: 495000 }
  ],
  currenciesList: [
    { code: 'USD', name: 'دولار أمريكي', symbol: '$', rateToUSD: 1.0 },
    { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rateToUSD: 3.75 },
    { code: 'YER', name: 'ريال يمني', symbol: 'ر.ي', rateToUSD: 1650.0 },
    { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rateToUSD: 3.67 },
    { code: 'EUR', name: 'يورو', symbol: '€', rateToUSD: 0.92 }
  ],
  paymentMethods: [
    'نقداً', 
    'محفظة جيب', 
    'محفظة الكريمي', 
    'محفظة جوالي', 
    'محفظة فلوسك',
    'حساب الكريمي',
    'شبكة'
  ]
};

const DEFAULT_ROLE_DEFINITIONS: UserRoleDefinition[] = [
  {
    id: 'admin',
    label: 'مدير (Admin)',
    description: 'صلاحيات كاملة لجميع الشاشات وإدارة النظام والأعضاء والمالية',
    permissions: ['view_dashboard', 'manage_customers', 'manage_requests', 'manage_visas', 'manage_financials', 'manage_users', 'view_reports', 'system_settings']
  },
  {
    id: 'accountant',
    label: 'محاسب (Accountant)',
    description: 'إدارة الفواتير، المعاملات المالية، السندات، والتقارير المالية',
    permissions: ['view_dashboard', 'manage_customers', 'manage_requests', 'manage_financials', 'view_reports']
  },
  {
    id: 'sales',
    label: 'موظف مبيعات (Sales Officer)',
    description: 'إدارة العملاء، إدخال طلبات الخدمات الجديدة والتأشيرات',
    permissions: ['view_dashboard', 'manage_customers', 'manage_requests', 'manage_visas', 'view_reports']
  },
  {
    id: 'executor',
    label: 'مندوب منفذ (Field Exec / Representative)',
    description: 'متابعة وتحديث حالات المعاملات، التأشيرات، والطلبات الموكلة إليه',
    permissions: ['view_dashboard', 'manage_requests', 'manage_visas']
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Core App states loaded dynamically
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [visas, setVisas] = useState<VisaApplication[]>(INITIAL_VISAS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('yazal_settings_v3');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('yazal_settings_v3', JSON.stringify(settings));
  }, [settings]);

  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [roleDefinitions, setRoleDefinitions] = useState<UserRoleDefinition[]>(DEFAULT_ROLE_DEFINITIONS);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Authentication & Cloud Sync states
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState(false);

  // Network Online/Offline Status Monitoring
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast('تم استعادة الاتصال بخدمات Firestore وبشبكة الإنترنت بنجاح', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast('⚠️ انقطع الاتصال بـ Firestore والشبكة - تم تعطيل عمليات الحفظ والتعديل مؤقتاً لحماية البيانات من الفقدان', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-Logout on User Inactivity
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      // Auto logout after 15 minutes of inactivity
      idleTimerRef.current = setTimeout(() => {
        signOut(auth);
        setUser(null);
        addToast('🔒 تم تسجيل الخروج تلقائياً لضمان أمان البيانات بسبب خمول الجهاز لفترة طويلة', 'error');
      }, 15 * 60 * 1000);
    };

    resetIdleTimer();

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, resetIdleTimer));

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(ev => window.removeEventListener(ev, resetIdleTimer));
    };
  }, [user]);

  // Authorization and Firestore Check Middleware
  const checkPermission = (action: 'write' | 'delete' | 'manage_users' | 'manage_financials', targetName?: string) => {
    if (!isOnline) {
      addToast('⚠️ يتعذر إتمام العملية بسبب انقطاع الاتصال بشبكة الإنترنت وخادم Firestore', 'error');
      return false;
    }

    if (userRole === 'admin') return true;

    const currentRoleDef = roleDefinitions.find(r => r.id === userRole);

    if (action === 'manage_users') {
      const hasPerm = currentRoleDef?.permissions?.includes('manage_users');
      if (!hasPerm) {
        addToast('عذراً، إدارة الأعضاء والمستخدمين والصلاحيات مقصورة على مدير النظام فقط', 'error');
        return false;
      }
    }

    if (action === 'manage_financials') {
      const hasPerm = currentRoleDef?.permissions?.includes('manage_financials');
      if (!hasPerm && userRole !== 'accountant') {
        addToast('عذراً، يتطلب تنفيذ العمليات الحسابية والمالية صلاحيات المحاسب المالي أو مدير النظام', 'error');
        return false;
      }
    }

    if (action === 'delete') {
      if (userRole !== 'admin') {
        addToast('عذراً، حمايةً للبيانات فإن صلاحية حذف السجلات والبيانات الحساسة مقصورة على مدير النظام فقط', 'error');
        return false;
      }
    }

    if (action === 'write') {
      return true;
    }

    return true;
  };

  const logGlobalActivity = async (action: string, details: string, type: 'customer' | 'request' | 'visa' | 'financial' | 'system' = 'system') => {
    const act: Activity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      user: user?.displayName || 'المستخدم',
      role: userRole || 'admin',
      action,
      details,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type
    };
    setActivities(prev => [act, ...prev]);
    if (user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/activities`, act.id), act);
      } catch (err) {
        console.error("Failed to sync activity to Firestore:", err);
      }
    }
  };

  // Auto-archive requests > 90 days on startup and sync to archived_requests
  useEffect(() => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    setRequests(prev => {
      let updated = false;
      const archivedList: any[] = [];
      const newReqs = prev.map(req => {
        if (req.receiptDate) {
          const rDate = new Date(req.receiptDate);
          if (rDate < ninetyDaysAgo && req.status !== 'archived') {
            updated = true;
            const archivedItem = { ...req, status: 'archived' as const, archivedAt: new Date().toISOString() };
            archivedList.push(archivedItem);
            return archivedItem;
          }
        }
        if (req.status === 'archived') {
          archivedList.push(req);
        }
        return req;
      });

      if (updated || archivedList.length > 0) {
        try {
          localStorage.setItem('yazal_archived_requests', JSON.stringify(archivedList));
        } catch (e) {}
      }
      return newReqs;
    });
  }, []);

  // Toast Notifications
  const [toasts, setToasts] = useState<{id: string, message: string, type: 'success' | 'info' | 'error'}[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000); // 5 seconds display for easier reading
  };

  const notifiedDebtsRef = useRef<Set<string>>(new Set());

  // Automatically scan for approaching debt installments
  useEffect(() => {
    if (customers && customers.length > 0) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      customers.forEach((customer) => {
        if (customer.debts && customer.debts.length > 0) {
          customer.debts.forEach((debt) => {
            if (debt.remainingAmount > 0) {
              const toastKey = `${customer.id}-${debt.id}-${debt.remainingAmount}`;
              if (!notifiedDebtsRef.current.has(toastKey)) {
                // Default to 30 days if no explicit dueDate is set yet
                let debtDateStr = debt.dueDate;
                if (!debtDateStr) {
                  const regDate = new Date(debt.date);
                  regDate.setDate(regDate.getDate() + 30);
                  debtDateStr = regDate.toISOString().split('T')[0];
                }

                const dueDate = new Date(debtDateStr);
                dueDate.setHours(0, 0, 0, 0);

                const timeDiff = dueDate.getTime() - now.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                let message = '';
                let type: 'info' | 'error' | 'success' = 'info';

                if (daysDiff < 0) {
                  message = `⚠️ دين متأخر: قسط العميل "${customer.name}" بقيمة ${debt.remainingAmount} ${debt.currency} كان مستحقاً منذ ${Math.abs(daysDiff)} يوم! (الاستحقاق: ${debtDateStr})`;
                  type = 'error';
                } else if (daysDiff === 0) {
                  message = `⏰ مستحق اليوم: قسط العميل "${customer.name}" بقيمة ${debt.remainingAmount} ${debt.currency} مستحق السداد اليوم!`;
                  type = 'info';
                } else if (daysDiff <= 7) {
                  message = `📅 اقتراب استحقاق: قسط العميل "${customer.name}" بقيمة ${debt.remainingAmount} ${debt.currency} مستحق خلال ${daysDiff} أيام (تاريخ: ${debtDateStr})`;
                  type = 'info';
                }

                if (message) {
                  addToast(message, type);
                  notifiedDebtsRef.current.add(toastKey);
                }
              }
            }
          });
        }
      });
    }
  }, [customers]);

  const { isDark, toggleTheme, classes, setMode } = useTheme();

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl or Cmd is pressed
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveTab('dashboard');
            addToast('تم الانتقال إلى لوحة التحكم', 'info');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('requests');
            addToast('تم الانتقال إلى الطلبات', 'info');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('customers');
            addToast('تم الانتقال إلى العملاء', 'info');
            break;
          case '4':
            e.preventDefault();
            setActiveTab('visa');
            addToast('تم الانتقال إلى الفيزا', 'info');
            break;
          case '5':
            e.preventDefault();
            setActiveTab('finance');
            addToast('تم الانتقال إلى المالية', 'info');
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Stop the initial app load performance trace when the shell has mounted
  useEffect(() => {
    if (appLoadTrace) {
      try {
        appLoadTrace.stop();
        console.log("Firebase Performance: 'app_load_time' trace completed successfully.");
      } catch (err) {
        console.warn("Firebase Performance Info: App load trace was already stopped or not running:", err);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (!localStorage.getItem('yazal_tour_completed')) {
          setShowTour(true);
        }
        setSyncing(true);
        try {
          const userId = currentUser.uid;

          const userDocRef = doc(db, 'users', userId);
          // Measure user document retrieval performance
          let userSnap;
          try {
            userSnap = await measurePerformance('fetch_user_data_time', () => getDoc(userDocRef));
          } catch (err: any) {
            console.warn("Failed to get user document, likely offline.", err);
          }
          
          if (!userSnap || !userSnap.exists()) {
            await measurePerformance('create_new_user_time', () => setDoc(userDocRef, {
              uid: userId,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'مستخدم يزل',
              role: 'sales', // Default role for new users
              status: 'pending', // Default status for new users
              createdAt: new Date().toISOString()
            }));
            setUserRole('sales'); // Set default role
          } else {
            const userData = userSnap.data();
            if (userData.status !== 'approved') {
              console.warn("User account pending approval.");
              setUserRole('sales'); // Or block access
              // Optionally: signOut(auth);
            } else {
              setUserRole(userData.role || 'sales');
            }
          }

          // Fetch Role Definitions from Firestore
          try {
            const rolesDocRef = doc(db, `users/${userId}/admin_system_settings`, 'roles');
            const rolesSnap = await getDoc(rolesDocRef);
            if (rolesSnap.exists() && Array.isArray(rolesSnap.data().roles) && rolesSnap.data().roles.length > 0) {
              setRoleDefinitions(rolesSnap.data().roles);
            }
          } catch (err) {
            console.warn("Could not fetch roles from Firestore, using defaults:", err);
          }
          
          const customersColRef = collection(db, 'users', userId, 'customers');
          
          let customersSnap;
          try {
            customersSnap = await measurePerformance('fetch_customers_time', () => getDocs(customersColRef));
          } catch (err: any) {
            console.warn("Failed to get customers, likely offline. Using initial local data:", err);
            customersSnap = { empty: true };
          }
          
          if (customersSnap.empty) {
            // Seed the collection with INITIAL_CUSTOMERS
            const seedPromises = INITIAL_CUSTOMERS.map(async (customer) => {
              const docRef = doc(db, 'users', userId, 'customers', customer.id);
              await setDoc(docRef, customer);
            });
            await measurePerformance('seed_customers_time', () => Promise.all(seedPromises));
            setCustomers(INITIAL_CUSTOMERS);
          } else {
            const fetchedCustomers: Customer[] = [];
            customersSnap.forEach((doc) => {
              fetchedCustomers.push(doc.data() as Customer);
            });
            setCustomers(fetchedCustomers);
          }
        } catch (err) {
          console.error("Failed to load user cloud data from Firestore:", err);
        } finally {
          setSyncing(false);
          setAuthLoading(false);
        }
      } else {
        setUser(null);
        setUserRole('sales');
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Measure Google login roundtrip duration
      await measurePerformance('google_login_time', () => signInWithPopup(auth, provider));
    } catch (err) {
      console.error("Failed to login with Google:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('yazal_settings_v3', JSON.stringify(newSettings));
    } catch (e) {}

    if (user && user.uid) {
      try {
        await setDoc(doc(db, `users/${user.uid}/admin_system_settings`, 'global'), newSettings);
      } catch (err) {
        console.warn("Could not sync global settings to Firestore:", err);
      }
    }
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    if (!checkPermission('write')) return;

    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    addToast('تم تحديث ملف العميل بنجاح', 'success');
    await logGlobalActivity('تعديل ملف عميل', `تحديث بيانات العميل ${updatedCustomer.name} (${updatedCustomer.code})`, 'customer');

    if (user) {
      try {
        const customerDocRef = doc(db, 'users', user.uid, 'customers', updatedCustomer.id);
        await measurePerformance('update_customer_time', () => setDoc(customerDocRef, updatedCustomer));
      } catch (err) {
        console.error("Failed to update customer in Firestore:", err);
        addToast('حدث خطأ في مزامنة تحديث العميل', 'error');
      }
    }
  };

  const handleCompleteTour = () => {
    localStorage.setItem('yazal_tour_completed', 'true');
    setShowTour(false);
  };

  // Render proper view based on activeTab
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardHome 
            customers={customers}
            requests={requests}
            visas={visas}
            invoices={invoices}
            transactions={transactions}
            activities={activities}
            onNavigate={(tab) => setActiveTab(tab)}
            currency={settings.currency}
            settings={settings}
            userRole={userRole}
          />
        );
      case 'newreq':
        return (
          <ServiceRequestsManager 
            requests={requests}
            customers={customers}
            userRole={userRole}
            initialFilter="all"
            isNewRequestOnly={true}
            settings={settings}
            onUpdateCustomer={handleUpdateCustomer}
            onAddRequest={(req) => {
              const newReq = {
                id: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                customerId: req.customerId || '',
                customerName: req.customerName || '',
                serviceType: req.serviceType || '',
                amount: req.amount || 0,
                paidAmount: req.paidAmount,
                remainingAmount: req.remainingAmount,
                currency: req.currency || 'SAR',
                payType: req.payType || 'نقداً',
                receiptDate: req.receiptDate || new Date().toISOString().split('T')[0],
                expiryDate: req.expiryDate || new Date().toISOString().split('T')[0],
                employee: req.employee || '',
                status: req.status || 'pending_accountant',
                docs: req.docs || [],
                history: req.history || []
              } as ServiceRequest;
              setRequests([newReq, ...requests]);
              addToast('تمت إضافة الطلب بنجاح', 'success');
            }}
            onUpdateStatus={(id, status) => {
              setRequests(requests.map(r => r.id === id ? {...r, status} : r));
              addToast(`تم تحديث حالة الطلب إلى ${status}`, 'success');
            }}
          />
        );
      case 'approvals':
        return (
          <ServiceRequestsManager 
            requests={requests}
            customers={customers}
            userRole={userRole}
            initialFilter="pending_accountant"
            settings={settings}
            onUpdateCustomer={handleUpdateCustomer}
            onAddRequest={(req) => {}}
            onUpdateStatus={(id, status) => {
              setRequests(requests.map(r => r.id === id ? {...r, status} : r));
              addToast(`تم تحديث حالة الطلب إلى ${status}`, 'success');
            }}
          />
        );
      case 'tasks':
        return (
          <ServiceRequestsManager 
            requests={requests}
            customers={customers}
            userRole={userRole}
            initialFilter="executor_pending"
            settings={settings}
            onUpdateCustomer={handleUpdateCustomer}
            onAddRequest={(req) => {}}
            onUpdateStatus={(id, status) => {
              setRequests(requests.map(r => r.id === id ? {...r, status} : r));
              addToast(`تم تحديث حالة الطلب إلى ${status}`, 'success');
            }}
          />
        );
      case 'requests':
        return (
          <ServiceRequestsManager 
            requests={requests}
            customers={customers}
            userRole={userRole}
            settings={settings}
            onUpdateCustomer={handleUpdateCustomer}
            onAddRequest={(req) => {
              const newReq = {
                id: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                customerId: req.customerId || '',
                customerName: req.customerName || '',
                serviceType: req.serviceType || '',
                amount: req.amount || 0,
                paidAmount: req.paidAmount,
                remainingAmount: req.remainingAmount,
                currency: req.currency || 'SAR',
                payType: req.payType || 'نقداً',
                receiptDate: req.receiptDate || new Date().toISOString().split('T')[0],
                expiryDate: req.expiryDate || new Date().toISOString().split('T')[0],
                employee: req.employee || '',
                status: req.status || 'pending_accountant',
                docs: req.docs || [],
                history: req.history || []
              } as ServiceRequest;
              setRequests([newReq, ...requests]);
              addToast('تمت إضافة الطلب بنجاح', 'success');
            }}
            onUpdateStatus={(id, status) => {
              setRequests(requests.map(r => r.id === id ? {...r, status} : r));
              addToast(`تم تحديث حالة الطلب إلى ${status}`, 'success');
            }}
          />
        );
      case 'visa':
        return (
          <VisaManager 
            visas={visas}
            userRole={userRole}
            onAddVisa={(v) => {
              const newVisa = {
                id: `VA-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                customerName: v.customerName || '',
                destination: v.destination || '',
                stage: v.stage || 'draft',
                docsTotal: v.docsTotal || 5,
                docsReceived: v.docsReceived || 0
              } as VisaApplication;
              setVisas([newVisa, ...visas]);
              addToast('تمت إضافة طلب الفيزا بنجاح', 'success');
            }}
            onUpdateVisa={(v) => {
              setVisas(visas.map(visa => visa.id === v.id ? v : visa));
              addToast('تم تحديث بيانات التأشيرة بنجاح', 'success');
            }}
            onDeleteVisa={(id) => {
              setVisas(visas.filter(visa => visa.id !== id));
              addToast('تم حذف التأشيرة بنجاح', 'success');
            }}
          />
        );
      case 'invoices':
      case 'accounting':
      case 'financial':
        return (
          <FinancialManager 
            transactions={transactions}
            projects={[]}
            customers={customers}
            currency={settings.currency}
            onAddTransaction={async (t) => {
              if (!checkPermission('manage_financials')) return;

              const newTransaction = {
                id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                type: t.type,
                amount: t.amount,
                currency: t.currency || 'SAR',
                category: t.category,
                paymentMethod: t.paymentMethod,
                recipientOrPayer: t.recipientOrPayer,
                description: t.description || '',
                date: t.date || new Date().toISOString().split('T')[0],
                by: t.by || user?.displayName || 'المستخدم الحالي'
              } as Transaction;
              setTransactions([newTransaction, ...transactions]);
              addToast('تمت إضافة المعاملة المالية بنجاح', 'success');
              await logGlobalActivity('إضافة معاملة مالية', `تسجيل ${t.type === 'income' ? 'إيراد' : 'مصروف'} بقيمة ${t.amount} ${t.currency || 'SAR'} - البند: ${t.category || ''} - المستلم/الدافع: ${t.recipientOrPayer || ''}`, 'financial');
            }}
            onDeleteTransaction={async (id) => {
              if (!checkPermission('manage_financials')) return;
              if (!checkPermission('delete')) return;

              const targetTx = transactions.find(t => t.id === id);
              setTransactions(transactions.filter(t => t.id !== id));
              addToast('تم حذف المعاملة المالية', 'info');
              await logGlobalActivity('حذف معاملة مالية', `حذف سند بقيمة ${targetTx?.amount || id} ${targetTx?.currency || ''}`, 'financial');
            }}
          />
        );
      case 'customers':
        return (
          <CustomersManager 
            customers={customers}
            userRole={userRole}
            onAddCustomer={async (c) => {
              if (!checkPermission('write')) return;

              const newCustomer = {
                id: `c-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                code: c.code || '',
                name: c.name || '',
                phone: c.phone || '',
                nationality: c.nationality || '',
                status: c.status || 'active',
                assignedTo: c.assignedTo || user?.displayName || 'المستخدم الحالي',
                timeline: c.timeline || []
              } as Customer;
              
              setCustomers([newCustomer, ...customers]);
              addToast('تمت إضافة العميل بنجاح', 'success');
              await logGlobalActivity('إضافة عميل جديد', `إضافة العميل ${newCustomer.name} (${newCustomer.phone})`, 'customer');

              if (user) {
                try {
                  const customerDocRef = doc(db, 'users', user.uid, 'customers', newCustomer.id);
                  await measurePerformance('save_customer_time', () => setDoc(customerDocRef, newCustomer));
                } catch (err) {
                  console.error("Failed to save customer to Firestore:", err);
                  addToast('حدث خطأ في حفظ العميل في السحابة', 'error');
                }
              }
            }}
            onUpdateCustomer={handleUpdateCustomer}
          />
        );
      case 'workflow':
        return (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">محرك سير العمل</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">مبيعات ← اعتماد المحاسب ← تنفيذ ← فاتورة تلقائية ← أرشفة</p>
            <div className="flex items-center gap-0 overflow-x-auto pb-4">
              {[['مبيعات', 'done'], ['اعتماد المحاسب', 'done'], ['تنفيذ', 'active'], ['فاتورة تلقائية', ''], ['أرشفة', '']].map(([label, state], i, arr) => (
                <div key={label} className={`flex flex-col items-center gap-2 min-w-[120px] relative flex-1 ${state}`}>
                  {i < arr.length - 1 && (
                    <div className={`absolute top-4 h-0.5 w-full left-1/2 z-0 ${state === 'done' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  )}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm z-10 border-2 ${
                    state === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                    state === 'active' ? 'bg-amber-500 border-amber-500 text-white' : 
                    'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}>
                    {state === 'done' ? '✓' : i + 1}
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">{label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'users':
      case 'admin':
        return (
          <AdminDashboard 
            user={user} 
            businessName={settings.businessName} 
          />
        );
      case 'services':
        return (
          <ServicesManager 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      case 'ai':
      case 'chat':
        return (
          <AIAssistant 
            businessName={settings.businessName}
            projects={[]}
            tasks={[]}
            transactions={transactions}
          />
        );
      case 'reports':
        return (
          <PerformanceDashboard 
            customers={customers}
            requests={requests}
            visas={visas}
            invoices={invoices}
            transactions={transactions}
            currency={settings.currency}
          />
        );
      case 'settings':
        return (
          <SettingsManager 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onTriggerOnboarding={() => setShowTour(true)}
            userId={user?.uid || ''}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🛠️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">قيد الإنشاء</h2>
            <p className="text-slate-500 dark:text-slate-400">هذا الموديول ضمن خارطة الطريق وسيتم إطلاقه قريباً.</p>
          </div>
        );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4 font-sans" dir="rtl">
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-500/30 animate-bounce">
          ي
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-slate-200">منصة يزل للخدمات والتأشيرات</h2>
          <p className="text-xs text-slate-400">جاري التحقق من هوية ومصادقة المستخدم...</p>
        </div>
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen 
        onGoogleLogin={handleGoogleLogin} 
        onDemoLogin={(role, email, name) => {
          setUser({ uid: 'demo-usr-' + role, email, displayName: name });
          setUserRole(role);
          addToast(`مرحباً بك ${name} (${role}) بنجاح`, 'success');
          if (!localStorage.getItem('yazal_tour_completed')) {
            setShowTour(true);
          }
        }}
        syncing={syncing}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ease-in-out ${isDark ? 'dark' : ''} ${classes.bg} ${classes.text} flex flex-col lg:flex-row font-sans relative`} dir="rtl">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-xl z-50">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
            <span>⚠️ انقطع الاتصال بـ Firestore والشبكة! تم تعطيل عمليات الحفظ والتعديل مؤقتاً لحماية البيانات من الفقدان.</span>
          </div>
          <span className="text-[10px] bg-amber-900/80 px-2.5 py-0.5 rounded-full border border-amber-400/30">وضع الحماية Offline</span>
        </div>
      )}

      {showTour && (
        <OnboardingTour 
          onComplete={handleCompleteTour}
          onSelectTab={(tab) => setActiveTab(tab)}
        />
      )}

      {showCalendarModal && (
        <CalendarManager 
          requests={requests}
          visas={visas}
          customers={customers}
          onClose={() => setShowCalendarModal(false)}
        />
      )}

      <header className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
            <span>ي</span>
          </div>
          <span className="font-bold text-sm text-white">يزل للأعمال</span>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`
        fixed lg:static top-16 lg:top-0 right-0 bottom-0 z-30
        w-72 lg:w-auto transform lg:transform-none transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          activeTab={activeTab}
          onSelectTab={(tab) => {
            const tabPermissions: Record<string, string> = {
              dashboard: 'view_dashboard',
              customers: 'manage_customers',
              newreq: 'manage_requests',
              approvals: 'manage_requests',
              tasks: 'manage_requests',
              visa: 'manage_visas',
              invoices: 'manage_financials',
              accounting: 'manage_financials',
              workflow: 'manage_requests',
              users: 'manage_users',
              services: 'system_settings',
              reports: 'view_reports',
              settings: 'system_settings'
            };

            const defaultRolePermissions: Record<UserRole, string[]> = {
              admin: ['view_dashboard', 'manage_customers', 'manage_requests', 'manage_visas', 'manage_financials', 'manage_users', 'view_reports', 'system_settings'],
              accountant: ['view_dashboard', 'manage_customers', 'manage_requests', 'manage_financials', 'view_reports'],
              sales: ['view_dashboard', 'manage_customers', 'manage_requests', 'manage_visas', 'view_reports'],
              executor: ['view_dashboard', 'manage_requests', 'manage_visas']
            };

            let allowedPerms = defaultRolePermissions[userRole] || [];
            try {
              const savedRoles = localStorage.getItem('roleDefinitions');
              if (savedRoles) {
                const parsed: UserRoleDefinition[] = JSON.parse(savedRoles);
                const found = parsed.find(r => r.id === userRole);
                if (found) {
                  allowedPerms = found.permissions;
                }
              }
            } catch (e) {}

            const requiredPerm = tabPermissions[tab] || 'view_dashboard';
            if (!allowedPerms.includes(requiredPerm as any) && tab !== 'dashboard') {
              addToast('تنبيه أمني: عذراً، ليس لديك الصلاحية للوصول إلى هذه الشاشة وفقاً لدورك الوظيفي الحالي.', 'error');
              return;
            }
            setActiveTab(tab);
            setSidebarOpen(false);
          }}
          businessName={settings.businessName}
          theme={settings.theme}
          onChangeTheme={async (newTheme) => {
            const newSettings = { ...settings, theme: newTheme };
            setSettings(newSettings);
            setMode(newTheme as any);
          }}
          user={user}
          onLogin={handleGoogleLogin}
          onLogout={handleLogout}
          syncing={syncing}
          userRole={userRole}
          onChangeRole={(role) => setUserRole(role)}
        />
      </div>

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-4rem)] lg:h-screen">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-sm font-bold min-w-[250px] ${
                toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                toast.type === 'error' ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400' :
                'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                toast.type === 'success' ? 'bg-emerald-500' :
                toast.type === 'error' ? 'bg-rose-500' :
                'bg-blue-500'
              }`} />
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
