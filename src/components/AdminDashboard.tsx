import React, { useState, useEffect } from 'react';
import ConfirmationDialog from './ConfirmationDialog';
import { 
  LayoutDashboard, 
  Users, 
  Settings2, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Ban, 
  ShieldCheck, 
  FileText, 
  Globe, 
  RefreshCw, 
  FileUp, 
  Tag, 
  ChevronRight, 
  Sparkles,
  Activity,
  Database,
  Power,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AdminUser, AdminContent, AdminSystemSettings, UserRole, UserRoleDefinition, Permission } from '../types';
import { 
  db, 
  OperationType, 
  handleFirestoreError,
  measurePerformance
} from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';

interface AdminDashboardProps {
  user: any;
  businessName: string;
}

// Default initial mock data to seed Firestore or fallback offline
const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-1',
    name: 'ليث هزاع',
    email: 'laithhazza75@gmail.com',
    role: 'admin',
    status: 'active',
    joinedDate: '2026-01-10',
    avatarUrl: '',
    permissions: ['view_dashboard', 'manage_customers', 'manage_requests', 'manage_visas', 'manage_financials', 'manage_users', 'view_reports', 'system_settings']
  },
  {
    id: 'usr-2',
    name: 'لؤي الحرك',
    email: 'louay.harak@yazal.com',
    role: 'accountant',
    status: 'active',
    joinedDate: '2026-03-15',
    avatarUrl: '',
    permissions: ['view_dashboard', 'manage_customers', 'manage_requests', 'manage_financials', 'view_reports']
  },
  {
    id: 'usr-3',
    name: 'فاطمة صالح',
    email: 'fatima.s@yazal.com',
    role: 'sales',
    status: 'active',
    joinedDate: '2026-05-20',
    avatarUrl: '',
    permissions: ['view_dashboard', 'manage_customers', 'manage_requests', 'manage_visas', 'view_reports']
  },
  {
    id: 'usr-4',
    name: 'أحمد مراد',
    email: 'ahmed.m@yazal.com',
    role: 'executor',
    status: 'offline',
    joinedDate: '2026-06-02',
    avatarUrl: '',
    permissions: ['view_dashboard', 'manage_requests', 'manage_visas']
  },
  {
    id: 'usr-5',
    name: 'رنا يوسف',
    email: 'rana.y@yazal.com',
    role: 'sales',
    status: 'suspended',
    joinedDate: '2026-07-01',
    avatarUrl: '',
    permissions: ['view_dashboard', 'manage_customers', 'manage_requests', 'manage_visas']
  }
];

const INITIAL_ADMIN_CONTENTS: AdminContent[] = [
  {
    id: 'cnt-1',
    title: 'دليل استخدام لوحة يزل الذكية v1.2',
    category: 'guide',
    description: 'شرح تفصيلي ومبسط لكيفية استغلال أدوات لوحة التحكم وإدارة المهام والمزامنة السحابية للشركات والمشرفين.',
    fileSize: '4.8 MB',
    uploadedAt: '2026-07-10',
    downloadUrl: '#',
    uploadedBy: 'ليث هزاع'
  },
  {
    id: 'cnt-2',
    title: 'سياسة الخصوصية وحماية البيانات لمشروع يزل',
    category: 'policy',
    description: 'وثيقة رسمية توضح سياسات حفظ البيانات وحمايتها والتشفير المتبع عبر السحابة الآمنة لمنصة يزل.',
    fileSize: '1.2 MB',
    uploadedAt: '2026-07-12',
    downloadUrl: '#',
    uploadedBy: 'ليث هزاع'
  },
  {
    id: 'cnt-3',
    title: 'قالب عقد تقديم استشارات تطوير PWA للعملاء',
    category: 'template',
    description: 'عقد استرشادي قانوني جاهز للتحميل والملء خاص بالتعاملات وتراخيص البرمجيات والتسويات المالية.',
    fileSize: '650 KB',
    uploadedAt: '2026-07-15',
    downloadUrl: '#',
    uploadedBy: 'لؤي الحرك'
  },
  {
    id: 'cnt-4',
    title: 'مجموعة أيقونات الهوية الرسمية بدقة عالية vector',
    category: 'asset',
    description: 'الحزمة الكاملة للشعار والأيقونات بدقة عالية للاستخدام في الحملات التسويقية والوسائط المتعددة.',
    fileSize: '15.4 MB',
    uploadedAt: '2026-07-18',
    downloadUrl: '#',
    uploadedBy: 'فاطمة صالح'
  }
];

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

const PERMISSION_LABELS: Record<Permission, string> = {
  view_dashboard: 'عرض الرئيسية',
  manage_customers: 'إدارة العملاء',
  manage_requests: 'إدارة الطلبات',
  manage_visas: 'إدارة التأشيرات',
  manage_financials: 'الحسابات المالية',
  manage_users: 'إدارة المستخدمين',
  view_reports: 'عرض التقارير',
  system_settings: 'إعدادات النظام'
};

const DEFAULT_SYSTEM_SETTINGS: AdminSystemSettings = {
  maintenanceMode: false,
  maintenanceMessage: 'منصة يزل للأعمال تخضع الآن لصيانة مجدولة. سنعود للعمل قريباً جداً، نشكر تفهمكم.',
  allowRegistrations: true,
  aiAdvisorModel: 'gemini-2.5-flash',
  backupFrequency: 'daily',
  alertBannerEnabled: true,
  alertBannerText: 'مرحباً بك في لوحة الإشراف الموسعة لمنصة يزل! يمكنك الآن إدارة الهوية، المحتوى، والمستخدمين ومزامنتها لحظياً.',
  tableColumns: ['العميل', 'رقم الجوال', 'نوع الخدمة', 'المبلغ', 'الموظف', 'الحالة']
};

export default function AdminDashboard({ user, businessName }: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'users' | 'content' | 'settings' | 'roles' | 'audit_log'>('analytics');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Real or simulation data states
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('yazal_custom_users');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS;
    } catch (e) {
      return INITIAL_ADMIN_USERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('yazal_custom_users', JSON.stringify(adminUsers));
    } catch (e) {
      console.error("Error saving users to localStorage:", e);
    }
  }, [adminUsers]);

  const [adminContents, setAdminContents] = useState<AdminContent[]>(INITIAL_ADMIN_CONTENTS);
  const [systemSettings, setSystemSettings] = useState<AdminSystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [roleDefinitions, setRoleDefinitions] = useState<UserRoleDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('roleDefinitions');
      return saved ? JSON.parse(saved) : DEFAULT_ROLE_DEFINITIONS;
    } catch (e) {
      return DEFAULT_ROLE_DEFINITIONS;
    }
  });

  // Audit log state
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');

  const logActivity = async (action: string, details: string, type: 'customer' | 'request' | 'visa' | 'financial' | 'system' = 'system') => {
    const act = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      user: user?.displayName || 'مدير النظام',
      role: 'admin',
      action,
      details,
      timestamp: new Date().toISOString(),
      type
    };
    setActivitiesList(prev => [act, ...prev]);
    if (user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/activities`, act.id), act);
      } catch (err) {
        console.error("Failed to log activity in Firestore:", err);
      }
    }
  };
  
  // Modals & form states
  const [userModalOpen, setUserModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userUsername, setUserUsername] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [userRole, setUserRole] = useState<AdminUser['role']>('sales');
  const [userStatus, setUserStatus] = useState<AdminUser['status']>('active');

  const [contentModalOpen, setContentModalOpen] = useState<boolean>(false);
  const [contentTitle, setContentTitle] = useState<string>('');
  const [contentCategory, setContentCategory] = useState<AdminContent['category']>('guide');
  const [contentDescription, setContentDescription] = useState<string>('');
  const [contentFileSize, setContentFileSize] = useState<string>('1.5 MB');

  // Search & filters
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [contentSearchQuery, setContentSearchQuery] = useState<string>('');
  const [contentCategoryFilter, setContentCategoryFilter] = useState<string>('all');

  // Drag & drop state emulation
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Firestore Data Fetching
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Fetch Admin Users
        const usersCol = collection(db, `users/${user.uid}/admin_users`);
        try {
          const usersSnapshot = await measurePerformance('fetch_admin_users_time', () => getDocs(usersCol));
          if (!usersSnapshot.empty) {
            const fetchedUsers: AdminUser[] = [];
            usersSnapshot.forEach((doc) => {
              fetchedUsers.push(doc.data() as AdminUser);
            });
            setAdminUsers(fetchedUsers);
          } else {
            // If Firestore is empty, seed it with the default list to ensure seamless UX
            for (const u of INITIAL_ADMIN_USERS) {
              await setDoc(doc(db, `users/${user.uid}/admin_users`, u.id), u);
            }
            setAdminUsers(INITIAL_ADMIN_USERS);
          }
        } catch (err) {
          console.warn("Failed to get admin users, likely offline. Using local data.", err);
        }

        // 2. Fetch Admin Contents
        const contentsCol = collection(db, `users/${user.uid}/admin_contents`);
        try {
          const contentsSnapshot = await measurePerformance('fetch_admin_contents_time', () => getDocs(contentsCol));
          if (!contentsSnapshot.empty) {
            const fetchedContents: AdminContent[] = [];
            contentsSnapshot.forEach((doc) => {
              fetchedContents.push(doc.data() as AdminContent);
            });
            setAdminContents(fetchedContents);
          } else {
            // Seed initial contents
            for (const c of INITIAL_ADMIN_CONTENTS) {
              await setDoc(doc(db, `users/${user.uid}/admin_contents`, c.id), c);
            }
            setAdminContents(INITIAL_ADMIN_CONTENTS);
          }
        } catch (err) {
          console.warn("Failed to get admin contents, likely offline. Using local data.", err);
        }

        // 3. Fetch Global Settings and Roles Definitions
        try {
          const settingsSnapshot = await measurePerformance('fetch_admin_settings_time', () => getDocs(collection(db, `users/${user.uid}/admin_system_settings`)));
          if (!settingsSnapshot.empty) {
            const fetchedSettings = settingsSnapshot.docs.find(d => d.id === 'global')?.data() as AdminSystemSettings;
            if (fetchedSettings) {
              setSystemSettings(fetchedSettings);
              if (fetchedSettings.tableColumns) {
                localStorage.setItem('tableColumns', JSON.stringify(fetchedSettings.tableColumns));
              }
            }
            const fetchedRolesDoc = settingsSnapshot.docs.find(d => d.id === 'roles')?.data();
            if (fetchedRolesDoc && Array.isArray(fetchedRolesDoc.roles) && fetchedRolesDoc.roles.length > 0) {
              setRoleDefinitions(fetchedRolesDoc.roles);
            } else {
              await setDoc(doc(db, `users/${user.uid}/admin_system_settings`, 'roles'), { roles: DEFAULT_ROLE_DEFINITIONS });
              setRoleDefinitions(DEFAULT_ROLE_DEFINITIONS);
            }
          } else {
            await setDoc(doc(db, `users/${user.uid}/admin_system_settings`, 'global'), DEFAULT_SYSTEM_SETTINGS);
            await setDoc(doc(db, `users/${user.uid}/admin_system_settings`, 'roles'), { roles: DEFAULT_ROLE_DEFINITIONS });
            setSystemSettings(DEFAULT_SYSTEM_SETTINGS);
            setRoleDefinitions(DEFAULT_ROLE_DEFINITIONS);
          }
        } catch (err) {
          console.warn("Failed to get admin settings or roles, likely offline. Using default role definitions.", err);
        }

        // 4. Fetch Activities Audit Log
        try {
          const actCol = collection(db, `users/${user.uid}/activities`);
          const actSnap = await getDocs(actCol);
          if (!actSnap.empty) {
            const fetchedAct: any[] = [];
            actSnap.forEach((doc) => fetchedAct.push(doc.data()));
            fetchedAct.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setActivitiesList(fetchedAct);
          }
        } catch (err) {
          console.warn("Failed to fetch activities audit log, using local empty array.");
        }

      } catch (err) {
        console.error("Failed to load admin dashboard cloud resources:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  // Save Settings to Cloud Firestore
  const handleSaveSettings = async (updatedSettings: AdminSystemSettings) => {
    setSystemSettings(updatedSettings);
    if (updatedSettings.tableColumns) {
      localStorage.setItem('tableColumns', JSON.stringify(updatedSettings.tableColumns));
    }
    if (!user) return;
    setSaving(true);
    const path = `users/${user.uid}/admin_system_settings/global`;
    try {
      await setDoc(doc(db, `users/${user.uid}/admin_system_settings`, 'global'), updatedSettings);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setSaving(false);
    }
  };

  const clearUserForm = () => {
    setUserName('');
    setUserEmail('');
    setUserUsername('');
    setUserPassword('');
    setUserRole('sales');
    setUserStatus('active');
  };

  // Add / Edit User Handler
  const handleRefreshUsers = async () => {
    if (!user) return;
    try {
      const usersCol = collection(db, `users/${user.uid}/admin_users`);
      const usersSnapshot = await getDocs(usersCol);
      const fetchedUsers: AdminUser[] = [];
      usersSnapshot.forEach((doc) => {
        fetchedUsers.push(doc.data() as AdminUser);
      });
      setAdminUsers(fetchedUsers);
      alert("تم تحديث قائمة الأعضاء بنجاح");
    } catch (err) {
      console.error("Error refreshing users:", err);
      alert("حدث خطأ أثناء تحديث البيانات");
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    const roleDef = roleDefinitions.find(r => r.id === userRole);
    const userPayload: AdminUser = {
      id: editingUser ? editingUser.id : `usr-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      name: userName,
      email: userEmail,
      username: userUsername || userEmail.split('@')[0],
      password: userPassword || '123456',
      role: userRole,
      status: userStatus,
      joinedDate: editingUser ? editingUser.joinedDate : new Date().toISOString().split('T')[0],
      avatarUrl: '',
      permissions: roleDef ? roleDef.permissions : ['view_dashboard', 'manage_requests']
    };

    // Optimistic UI update
    if (editingUser) {
      setAdminUsers(prev => prev.map(u => u.id === editingUser.id ? userPayload : u));
      await logActivity('تعديل موظف', `تم تعديل بيانات الموظف ${userPayload.name} - الدور: ${userPayload.role} - الحالة: ${userPayload.status}`, 'system');
    } else {
      setAdminUsers(prev => [userPayload, ...prev]);
      await logActivity('إضافة موظف', `تم إضافة الموظف الجديد ${userPayload.name} - البريد: ${userPayload.email} - الدور: ${userPayload.role}`, 'system');
    }

    setUserModalOpen(false);
    setEditingUser(null);
    clearUserForm();

    if (user) {
      const path = `users/${user.uid}/admin_users/${userPayload.id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/admin_users`, userPayload.id), userPayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentTitle.trim()) return;

    const contentPayload: AdminContent = {
      id: `cnt-${Date.now()}`,
      title: contentTitle,
      category: contentCategory,
      description: contentDescription,
      fileSize: contentFileSize,
      uploadedAt: new Date().toISOString().split('T')[0],
      downloadUrl: '#',
      uploadedBy: user?.displayName || 'مشرف النظام'
    };

    setAdminContents(prev => [contentPayload, ...prev]);
    await logActivity('إضافة ملف للمكتبة', `تم إضافة المستند "${contentPayload.title}"`, 'system');
    setContentModalOpen(false);
    setContentTitle('');
    setContentDescription('');
    alert('تمت إضافة المستند بنجاح');
  };

  const handleEditUserClick = (u: AdminUser) => {
    setEditingUser(u);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserUsername(u.username || '');
    setUserPassword(u.password || '');
    setUserRole(u.role);
    setUserStatus(u.status);
    setUserModalOpen(true);
  };

  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({isOpen: false, title: '', message: '', onConfirm: () => {}});

  const handleDeleteUser = async (id: string) => {
      const targetUser = adminUsers.find(u => u.id === id);
      setDeleteDialog({
          isOpen: true,
          title: 'حذف مستخدم',
          message: 'هل أنت متأكد من رغبتك في حذف هذا المستخدم من منصة يزل؟',
          onConfirm: async () => {
              setAdminUsers(prev => prev.filter(u => u.id !== id));
              await logActivity('حذف موظف', `تم حذف حساب الموظف ${targetUser?.name || id}`, 'system');
              if (user) {
                const path = `users/${user.uid}/admin_users/${id}`;
                try {
                  await deleteDoc(doc(db, `users/${user.uid}/admin_users`, id));
                } catch (err) {
                  handleFirestoreError(err, OperationType.DELETE, path);
                }
              }
          }
      });
  };
  
  const handleDeleteContent = async (id: string) => {
      const targetContent = adminContents.find(c => c.id === id);
      setDeleteDialog({
          isOpen: true,
          title: 'حذف ملف',
          message: 'هل أنت متأكد من رغبتك في حذف هذا الملف من مكتبة المحتوى؟',
          onConfirm: async () => {
              setAdminContents(prev => prev.filter(c => c.id !== id));
              await logActivity('حذف ملف', `تم حذف المستند "${targetContent?.title || id}"`, 'system');
              if (user) {
                const path = `users/${user.uid}/admin_contents/${id}`;
                try {
                  await deleteDoc(doc(db, `users/${user.uid}/admin_contents`, id));
                } catch (err) {
                  handleFirestoreError(err, OperationType.DELETE, path);
                }
              }
          }
      });
  };

  const clearContentForm = () => {
    setContentTitle('');
    setContentCategory('guide');
    setContentDescription('');
    setContentFileSize('1.5 MB');
  };

  // Drag over handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Auto-populate some fields from the dropped file
      setContentTitle(file.name.split('.')[0]);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setContentFileSize(`${sizeMB} MB`);
      setContentModalOpen(true);
    }
  };

  // Filtered lists
  const filteredUsers = adminUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredContents = adminContents.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(contentSearchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(contentSearchQuery.toLowerCase());
    const matchesCategory = contentCategoryFilter === 'all' || c.category === contentCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Recharts Interactive Analytics data
  const chartData = [
    { name: 'السبت', registrations: 12, downloads: 45, apiCalls: 120 },
    { name: 'الأحد', registrations: 19, downloads: 60, apiCalls: 180 },
    { name: 'الاثنين', registrations: 15, downloads: 35, apiCalls: 140 },
    { name: 'الثلاثاء', registrations: 28, downloads: 75, apiCalls: 220 },
    { name: 'الأربعاء', registrations: 35, downloads: 90, apiCalls: 310 },
    { name: 'الخميس', registrations: 45, downloads: 110, apiCalls: 450 },
    { name: 'الجمعة', registrations: 30, downloads: 80, apiCalls: 290 },
  ];

  const roleDistribution = [
    { name: 'مدير (Admin)', value: adminUsers.filter(u => u.role === 'admin').length, color: '#3b82f6' },
    { name: 'محاسب (Accountant)', value: adminUsers.filter(u => u.role === 'accountant').length, color: '#10b981' },
    { name: 'موظف مبيعات (Sales Officer)', value: adminUsers.filter(u => u.role === 'sales').length, color: '#f59e0b' },
    { name: 'مندوب منفذ (Representative)', value: adminUsers.filter(u => u.role === 'executor').length, color: '#8b5cf6' },
  ].filter(r => r.value > 0);

  const categoryLabels = {
    guide: 'دليل الاستخدام',
    policy: 'سياسة العمل',
    template: 'قالب عقد',
    asset: 'أصل إعلامي/هوية'
  };

  const roleLabels: Record<string, string> = {
    admin: 'مدير (Admin)',
    accountant: 'محاسب (Accountant)',
    sales: 'موظف مبيعات (Sales)',
    executor: 'مندوب منفذ (Representative)',
    manager: 'مدير مشروع',
    contributor: 'مساهم فريق',
    partner: 'شريك استراتيجي'
  };

  return (
    <div id="admin-dashboard-container" className="space-y-6">
      {/* Title Header with Glowing Accents */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">بوابة الإشراف الشاملة</h1>
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold">لوحة الأدمن</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إدارة حسابات الأعضاء والتحليلات البيانية والمحتوى العام والتحكم بالنظام لـ {businessName || 'منصة يزل'}
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-1 text-[11px] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>قاعدة بيانات Firestore متصلة ونشطة</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-xl font-bold">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span>محاكاة وضع دون اتصال - سجل للحفظ سحابياً</span>
            </div>
          )}
        </div>
      </div>

      {/* Global alert banner configurable in admin settings */}
      {systemSettings.alertBannerEnabled && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 shadow-md flex items-start gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 -translate-y-8" />
          <Sparkles className="w-5 h-5 shrink-0 text-blue-300 animate-pulse mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wide">إشعار النظام العام للمشرفين</h4>
            <p className="text-xs leading-relaxed mt-1 text-slate-100">{systemSettings.alertBannerText}</p>
          </div>
        </div>
      )}

      {/* Primary Sub-Navigation Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'analytics'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>المؤشرات والتحليلات</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>إدارة المستخدمين والأعضاء</span>
          <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.1 rounded-full">{adminUsers.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'roles'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>الأدوار والصلاحيات</span>
        </button>

        <button
          onClick={() => setActiveSubTab('content')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'content'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>مكتبة المحتوى والتصنيفات</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'settings'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>إعدادات النظام العامة</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit_log')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'audit_log'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>سجل النشاط والعمليات</span>
          {activitiesList.length > 0 && (
            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.1 rounded-full">{activitiesList.length}</span>
          )}
        </button>
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-500">جاري مزامنة وتحميل البيانات السحابية للإشراف...</p>
        </div>
      )}

      {/* Main Tab Content Switch */}
      {!loading && (
        <AnimatePresence mode="wait">
          {/* TAB 1: Analytics and Performance Monitoring */}
          {activeSubTab === 'analytics' && (
            <motion.div
              key="analytics-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">إجمالي المشرفين والأعضاء</span>
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mt-2 text-slate-800 dark:text-white">{adminUsers.length}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold mt-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+12% زيادة هذا الشهر</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">مستندات ومواد المحتوى</span>
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mt-2 text-slate-800 dark:text-white">{adminContents.length}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>4 فئات مصنفة ونشطة</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">معدل استدعاء الذكاء الاصطناعي</span>
                    <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mt-2 text-slate-800 dark:text-white">1,690</h3>
                  <div className="flex items-center gap-1 text-[10px] text-purple-500 font-bold mt-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>زمن استجابة 1.1 ثانية</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">جاهزية خوادم PWA</span>
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Database className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mt-2 text-slate-800 dark:text-white">99.9%</h3>
                  <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold mt-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>يعمل بالكامل دون اتصال</span>
                  </div>
                </div>
              </div>

              {/* Graphics Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">تفاعل النظام وحركة الـ API</h4>
                      <p className="text-[10px] text-slate-400">استخدام المنصة والتسجيلات وتحميلات المحتويات لآخر 7 أيام</p>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg">تحديث تلقائي</span>
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="apiCalls" name="استدعاءات النظام" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCalls)" />
                        <Area type="monotone" dataKey="downloads" name="تحميلات المستندات" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDownloads)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">توزيع أدوار وصلاحيات الأعضاء</h4>
                    <p className="text-[10px] text-slate-400">حسابات الطاقم المسجلة بالمنصة</p>
                  </div>

                  <div className="h-44 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={roleDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {roleDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 mt-2">
                    {roleDistribution.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                        </div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{item.value} مستخدم</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Server Logs and Health Monitoring Panel */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">سجلات ومراقبة النظام والـ PWA</h4>
                    <p className="text-[10px] text-slate-400">رصد حي للعمليات والتفاعلات السحابية الجارية</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-full font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> مستقر تماماً
                  </span>
                </div>

                <div className="font-mono text-[10px] space-y-2 bg-slate-950 text-slate-300 p-4 rounded-xl border border-slate-900 max-h-52 overflow-y-auto">
                  <div className="flex items-start gap-2 text-slate-400">
                    <span className="text-blue-400 font-bold">[INFO]</span>
                    <span>{new Date().toISOString().split('T')[0]} 11:00:08 - تم تفعيل لوحة الإشراف v2.5.0 لمشرف النظام.</span>
                  </div>
                  <div className="flex items-start gap-2 text-emerald-400">
                    <span className="text-emerald-400 font-bold">[SYNC]</span>
                    <span>{new Date().toISOString().split('T')[0]} 10:45:21 - تمت مزامنة إعدادات الهوية والتصنيفات سحابياً مع Firestore بنجاح.</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-400">
                    <span className="text-blue-400 font-bold">[INFO]</span>
                    <span>{new Date().toISOString().split('T')[0]} 09:30:15 - تهيئة واجهة المستخدم PWA والملفات التعريفية على الويب بنجاح.</span>
                  </div>
                  <div className="flex items-start gap-2 text-purple-400">
                    <span className="text-purple-400 font-bold">[AI_AGENT]</span>
                    <span>{new Date().toISOString().split('T')[0]} 08:15:00 - نموذج {systemSettings.aiAdvisorModel} يعمل وجاهز لتزويد المساعد بنصائح آلية.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: User and Admin Member Management */}
          {activeSubTab === 'users' && (
            <motion.div
              key="users-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Users Filter Tools */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-1 flex-col md:flex-row gap-3 w-full">
                  {/* Search bar */}
                  <div className="relative flex-1">
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ابحث عن عضو بالإسم أو البريد..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Role filter */}
                  <div className="w-full md:w-48">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300"
                    >
                      <option value="all">جميع الأدوار</option>
                      <option value="admin">مدير (Admin)</option>
                      <option value="accountant">محاسب (Accountant)</option>
                      <option value="sales">موظف مبيعات (Sales Officer)</option>
                      <option value="executor">مندوب منفذ (Representative)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleRefreshUsers}
                  className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 cursor-pointer hover:scale-[1.02]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>تحديث البيانات</span>
                </button>
                <button
                  onClick={() => {
                    clearUserForm();
                    setEditingUser(null);
                    setUserModalOpen(true);
                  }}
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عضو جديد</span>
                </button>
              </div>

              {/* Users Directory Table list */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-4">العضو والمستخدم</th>
                        <th className="p-4">الدور الوظيفي</th>
                        <th className="p-4">تاريخ الانضمام</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4 text-left">التحكم والعمليات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-xs text-slate-400">
                            لا يوجد أعضاء يطابقون خيارات البحث الحالية.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                  {u.name.charAt(0)}
                                </div>
                                <div>
                                  <h5 className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                                    {u.name}
                                    {u.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                                  </h5>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-medium text-slate-600 dark:text-slate-300">
                                {roleLabels[u.role]}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-500">{u.joinedDate}</span>
                            </td>
                            <td className="p-4">
                              {u.status === 'active' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                                  <UserCheck className="w-3 h-3" /> نشط
                                </span>
                              ) : u.status === 'suspended' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full font-bold">
                                  <Ban className="w-3 h-3" /> معلق
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold">
                                  <Clock className="w-3 h-3" /> غير متصل
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-left">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    const newStatus = u.status === 'active' ? 'suspended' : 'active';
                                    setAdminUsers(prev => prev.map(item => item.id === u.id ? { ...item, status: newStatus } : item));
                                    if (user) {
                                      setDoc(doc(db, `users/${user.uid}/admin_users`, u.id), { ...u, status: newStatus }, { merge: true }).catch(err => console.error(err));
                                    }
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold ${u.status === 'active' ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}
                                  title={u.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                                >
                                  {u.status === 'active' ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleEditUserClick(u)}
                                  className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                                  title="تعديل العضو"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                  title="حذف العضو"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: Roles & Permissions Management */}
          {activeSubTab === 'roles' && (
            <motion.div
              key="roles-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      إدارة الأدوار الوظيفية والصلاحيات المتقدمة
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      قم بتخصيص الصلاحيات بدقة لكل دور وظيفي في التطبيق. يتم تطبيق القيود الفورية على الشاشات وأزرار التحكم.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!user) return;
                      setSaving(true);
                      try {
                        await setDoc(doc(db, `users/${user.uid}/admin_system_settings`, 'roles'), { roles: roleDefinitions });
                        localStorage.setItem('roleDefinitions', JSON.stringify(roleDefinitions));
                        alert('تم حفظ تحديثات الصلاحيات والأدوار بنجاح');
                      } catch (err) {
                        console.error("Error saving roles:", err);
                        alert('حدث خطأ أثناء حفظ الصلاحيات');
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ تعديلات الصلاحيات'}</span>
                  </button>
                </div>

                {/* Permissions Matrix Table */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                        <th className="p-4 w-64">الدور الوظيفي / الوصف</th>
                        {Object.entries(PERMISSION_LABELS).map(([permKey, permLabel]) => (
                          <th key={permKey} className="p-3 text-center whitespace-nowrap">
                            <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">{permLabel}</span>
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">{permKey}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {roleDefinitions.map((roleDef) => (
                        <tr key={roleDef.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                          <td className="p-4">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-white block text-sm">
                                {roleDef.label}
                              </span>
                              <span className="text-[11px] text-slate-500 block mt-0.5">
                                {roleDef.description}
                              </span>
                            </div>
                          </td>
                          {Object.keys(PERMISSION_LABELS).map((permKey) => {
                            const hasPermission = roleDef.permissions.includes(permKey as Permission);
                            return (
                              <td key={permKey} className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={hasPermission}
                                  disabled={roleDef.id === 'admin' && permKey === 'system_settings'}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setRoleDefinitions(prev => prev.map(r => {
                                      if (r.id !== roleDef.id) return r;
                                      const newPerms = checked 
                                        ? [...r.permissions, permKey as Permission]
                                        : r.permissions.filter(p => p !== permKey);
                                      return { ...r, permissions: newPerms };
                                    }));
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                    <span className="font-bold block mb-1">تعليمات أمان الصلاحيات:</span>
                    عند إلغاء تفعيل صلاحية معينة لدور وظيفي، سيتم فوراً إخفاء الأزرار المرتبطة بها وتقييد الوصول للشاشة الخاصة بها مع ظهور تنبيه أمني فوري للمستخدم عند محاولة الدخول.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Content Library and Resources Upload */}
          {activeSubTab === 'content' && (
            <motion.div
              key="content-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Drag and Drop Upload Emulation Zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 shadow-sm ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50/10 scale-101' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">اسحب ملفات الدليل أو الوثائق وأفلتها هنا للرفع</h4>
                  <p className="text-[10px] text-slate-400 mt-1">تنسيقات الملفات المقبولة: PDF, DOCX, PNG, ZIP بحجم أقصى 50 ميجابايت</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      clearContentForm();
                      setContentModalOpen(true);
                    }}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                  >
                    اختر ملفاً يدوياً
                  </button>
                </div>
              </div>

              {/* Categorized Library Lists */}
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white">قائمة المحتويات والملفات النشطة</h3>
                    <p className="text-[10px] text-slate-400">إتاحة تنزيل وإيجاد موارد الدعم لفرق يزل</p>
                  </div>

                  {/* Search and Category filter */}
                  <div className="flex gap-2 w-full md:w-auto">
                    <input
                      type="text"
                      placeholder="ابحث في مكتبة الملفات..."
                      value={contentSearchQuery}
                      onChange={(e) => setContentSearchQuery(e.target.value)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-800 dark:text-slate-100 w-full md:w-48"
                    />

                    <select
                      value={contentCategoryFilter}
                      onChange={(e) => setContentCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <option value="all">جميع الفئات</option>
                      <option value="guide">دليل الاستخدام</option>
                      <option value="policy">سياسة العمل</option>
                      <option value="template">قالب عقد</option>
                      <option value="asset">أصل إعلامي</option>
                    </select>
                  </div>
                </div>

                {/* Grid items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredContents.length === 0 ? (
                    <div className="col-span-2 text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                      لا يوجد ملفات مطابقة للفئة المحددة.
                    </div>
                  ) : (
                    filteredContents.map((c) => (
                      <div key={c.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:border-blue-500/30 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <span className="inline-flex items-center gap-1 text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                              <Tag className="w-3 h-3" />
                              {categoryLabels[c.category]}
                            </span>

                            <button
                              onClick={() => handleDeleteContent(c.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-snug">{c.title}</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{c.description}</p>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-3 text-[10px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <span>الحجم: <strong className="text-slate-600 dark:text-slate-300">{c.fileSize}</strong></span>
                            <span className="w-1 h-1 bg-slate-250 dark:bg-slate-700 rounded-full" />
                            <span>بواسطة: <strong className="text-slate-600 dark:text-slate-300">{c.uploadedBy}</strong></span>
                          </div>
                          
                          <a 
                            href={c.downloadUrl}
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`تحميل الملف: "${c.title}" قيد التنفيذ بشكل آمن ومحمي.`);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>تحميل</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: Global System Configurations */}
          {activeSubTab === 'settings' && (
            <motion.div
              key="settings-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">مفاتيح التهيئة والتحكم بالنظام</h3>
                  <p className="text-[10px] text-slate-400">خصص إعدادات التشغيل العامة والذكاء الاصطناعي والصيانة الشاملة لمنصة يزل</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    {/* Maintenance mode */}
                    <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                          <Power className="w-4 h-4 text-rose-500" /> وضع الصيانة الشاملة
                        </label>
                        <p className="text-[10px] text-slate-400">تحويل المنصة لوضع غير متاح للعامة للقيام بالترقيات</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.maintenanceMode}
                        onChange={(e) => handleSaveSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                    </div>

                    {/* Registrations Switch */}
                    <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-500" /> تفعيل التسجيلات الجديدة
                        </label>
                        <p className="text-[10px] text-slate-400">السماح لشركاء يزل الجدد بإنشاء حساباتهم ذاتياً</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.allowRegistrations}
                        onChange={(e) => handleSaveSettings({ ...systemSettings, allowRegistrations: e.target.checked })}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                    </div>

                    {/* AI Advisor Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-500" /> نموذج مساعد يزل الذكي المعتمد
                      </label>
                      <select
                        value={systemSettings.aiAdvisorModel}
                        onChange={(e) => handleSaveSettings({ ...systemSettings, aiAdvisorModel: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
                      >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (سرعة فائقة وتحليلات فورية)</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (استبصار وحلول مالية دقيقة)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (النسخة الكلاسيكية المستقرة)</option>
                      </select>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    {/* Alert banner trigger */}
                    <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-blue-500 animate-pulse" /> تفعيل شريط الإشعار العام
                        </label>
                        <p className="text-[10px] text-slate-400">إظهار لافتة زرقاء مضيئة أعلى اللوحة لنشر الأخبار</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.alertBannerEnabled}
                        onChange={(e) => handleSaveSettings({ ...systemSettings, alertBannerEnabled: e.target.checked })}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                    </div>

                    {/* Backup frequency */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">تردد النسخ الاحتياطي لقاعدة البيانات</label>
                      <select
                        value={systemSettings.backupFrequency}
                        onChange={(e) => handleSaveSettings({ ...systemSettings, backupFrequency: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
                      >
                        <option value="daily">نسخ احتياطي يومي مجدول تلقائي (توصية)</option>
                        <option value="weekly">نسخ احتياطي أسبوعي دوري</option>
                        <option value="manual">نسخ يدوي بالكامل عند رغبة المشرف</option>
                      </select>
                    </div>

                    {/* Notification message input text */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">محتوى شريط الإشعار العام</label>
                      <input
                        type="text"
                        value={systemSettings.alertBannerText}
                        onChange={(e) => setSystemSettings({ ...systemSettings, alertBannerText: e.target.value })}
                        onBlur={() => handleSaveSettings(systemSettings)}
                        maxLength={250}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                        placeholder="اكتب الإعلان هنا..."
                      />
                    </div>
                    
                    {/* Custom Columns Setting */}
                    <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الأعمدة المعروضة في جدول الطلبات (للموظفين)</label>
                      <div className="flex flex-wrap gap-2">
                        {['العميل', 'رقم الجوال', 'نوع الخدمة', 'المبلغ', 'الموظف', 'الحالة'].map(col => (
                          <label key={col} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <input 
                              type="checkbox" 
                              checked={systemSettings.tableColumns?.includes(col) ?? true}
                              onChange={(e) => {
                                const current = systemSettings.tableColumns || ['العميل', 'رقم الجوال', 'نوع الخدمة', 'المبلغ', 'الموظف', 'الحالة'];
                                const next = e.target.checked ? [...current, col] : current.filter((c: string) => c !== col);
                                handleSaveSettings({ ...systemSettings, tableColumns: next });
                              }}
                              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                            /> {col}
                          </label>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400">سيتم تطبيق هذا العرض لجميع الموظفين بشكل تلقائي (محفوظة في Firebase)</p>
                    </div>
                  </div>
                </div>

                {/* Save details prompt */}
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-5 text-[10px] text-slate-400">
                  <span>المعدل الأخير للنظام: {new Date().toISOString().split('T')[0]}</span>
                  {saving && (
                    <span className="text-blue-500 font-bold flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> جاري حفظ التغييرات سحابياً...
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: Audit Log (سجل النشاط والعمليات) */}
          {activeSubTab === 'audit_log' && (
            <motion.div
              key="audit-log-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span>سجل النشاط والعمليات الموثقة (Audit Log)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      تسجيل تلقائي زمني لكل العمليات الحساسة مع اسم المستخدم والتوقيت لمنع التغييرات غير المصرح بها
                    </p>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ابحث في سجل العمليات..."
                      value={auditSearchQuery}
                      onChange={(e) => setAuditSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-9 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 font-semibold"
                    />
                  </div>
                </div>

                {activitiesList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold">لا يوجد سجل عمليات مسجل حتى الآن.</p>
                    <p className="text-[11px] text-slate-500">يتم تدوين العمليات فور قيام المشرفين والموظفين بحفظ أو تعديل أو حذف أي بيانات.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold">
                          <th className="p-3">التوقيت والتاريخ</th>
                          <th className="p-3">المستخدم / الموظف</th>
                          <th className="p-3">نوع العملية</th>
                          <th className="p-3">تفاصيل الإجراء الحساس</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {activitiesList
                          .filter(a => 
                            !auditSearchQuery || 
                            a.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) || 
                            a.details.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                            a.user.toLowerCase().includes(auditSearchQuery.toLowerCase())
                          )
                          .map((act) => (
                            <tr key={act.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 dir-ltr text-right">
                                {new Date(act.timestamp).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}
                              </td>
                              <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                                <div className="flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                  <span>{act.user}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                  {act.action}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                                {act.details}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* USER MODAL DIALOG */}
      <AnimatePresence>
        {userModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md shadow-xl text-slate-800 dark:text-white"
            >
              <div className="pb-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingUser ? 'تعديل بيانات العضو' : 'إضافة عضو مشرف جديد'}
                </h3>
                <button
                  onClick={() => setUserModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  إغلاق
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4 mt-4 text-xs font-medium">
                {/* User Name */}
                <div className="space-y-1.5">
                  <label className="text-slate-600 dark:text-slate-350 font-bold">الاسم الكامل للعضو</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    maxLength={70}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="مثال: ليث هزاع"
                  />
                </div>

                {/* User Email */}
                <div className="space-y-1.5">
                  <label className="text-slate-600 dark:text-slate-350 font-bold">البريد الإلكتروني المعتمد</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    maxLength={200}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="example@yazal.com"
                  />
                </div>

                {/* Username and Password for Login */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-350 font-bold">اسم المستخدم للدخول</label>
                    <input
                      type="text"
                      required
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      maxLength={50}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                      placeholder="username"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-350 font-bold">كلمة المرور الأمنية</label>
                    <input
                      type="password"
                      required
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      maxLength={50}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Role and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-350 font-bold">الدور والصلاحيات</label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as any)}
                      className="w-full px-3 py-1.8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="admin">مدير (Admin)</option>
                      <option value="accountant">محاسب (Accountant)</option>
                      <option value="sales">موظف مبيعات (Sales Officer)</option>
                      <option value="executor">مندوب منفذ (Representative)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-350 font-bold">حالة الحساب</label>
                    <select
                      value={userStatus}
                      onChange={(e) => setUserStatus(e.target.value as any)}
                      className="w-full px-3 py-1.8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="active">نشط (Active)</option>
                      <option value="suspended">معلق (Suspended)</option>
                      <option value="offline">غير متصل (Offline)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setUserModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer"
                  >
                    {editingUser ? 'حفظ التعديلات' : 'إضافة العضو'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTENT MODAL DIALOG */}
      <AnimatePresence>
        {contentModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md shadow-xl text-slate-800 dark:text-white"
            >
              <div className="pb-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">إضافة محتوى / مستند جديد</h3>
                <button
                  onClick={() => setContentModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  إغلاق
                </button>
              </div>

              <form onSubmit={handleSaveContent} className="space-y-4 mt-4 text-xs font-medium">
                {/* Content Title */}
                <div className="space-y-1.5">
                  <label className="text-slate-600 dark:text-slate-350 font-bold">عنوان المستند / المادة</label>
                  <input
                    type="text"
                    required
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    maxLength={100}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="مثال: دليل سياسات أمن المعلومات"
                  />
                </div>

                {/* Category and Estimated file size */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-350 font-bold">فئة وتصنيف المستند</label>
                    <select
                      value={contentCategory}
                      onChange={(e) => setContentCategory(e.target.value as any)}
                      className="w-full px-3 py-1.8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="guide">دليل الاستخدام (Guide)</option>
                      <option value="policy">سياسة العمل (Policy)</option>
                      <option value="template">قالب عقد (Template)</option>
                      <option value="asset">أصل إعلامي/هوية (Asset)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-350 font-bold">حجم الملف التقديري</label>
                    <input
                      type="text"
                      required
                      value={contentFileSize}
                      onChange={(e) => setContentFileSize(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                      placeholder="مثال: 4.2 MB"
                    />
                  </div>
                </div>

                {/* Content Description */}
                <div className="space-y-1.5">
                  <label className="text-slate-600 dark:text-slate-350 font-bold">نبذة أو ملخص المستند</label>
                  <textarea
                    required
                    value={contentDescription}
                    onChange={(e) => setContentDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="اكتب وصفاً مختصراً يفيد المستخدمين..."
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setContentModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer"
                  >
                    إضافة المستند
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog(prev => ({...prev, isOpen: false}))}
        onConfirm={deleteDialog.onConfirm}
        title={deleteDialog.title}
        message={deleteDialog.message}
      />
    </div>
  );
}
