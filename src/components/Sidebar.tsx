import React from 'react';
import { 
  LayoutDashboard, 
  Users,
  PlusCircle,
  Clock,
  CheckSquare,
  Plane,
  Receipt,
  DollarSign,
  ArrowRightLeft,
  ShieldCheck,
  List,
  FileText,
  BarChart,
  Settings,
  LogOut,
  Cloud,
  Sun,
  Moon
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  businessName: string;
  theme: 'light' | 'dark' | 'auto';
  onChangeTheme: (theme: 'light' | 'dark' | 'auto') => void;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  syncing?: boolean;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export default function Sidebar({ 
  activeTab, 
  onSelectTab, 
  businessName,
  theme,
  onChangeTheme,
  user,
  onLogin,
  onLogout,
  syncing = false,
  userRole,
  onChangeRole
}: SidebarProps) {
  const menuItems: any[] = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'customers', label: 'العملاء', icon: Users },
    { id: 'newreq', label: 'طلب جديد', icon: PlusCircle },
    { id: 'approvals', label: 'بانتظار الاعتماد', icon: Clock },
    { id: 'tasks', label: 'مهامي (تنفيذ)', icon: CheckSquare },
    { id: 'visa', label: 'طلبات الفيزا', icon: Plane },
    { id: 'invoices', label: 'الفواتير', icon: Receipt },
    { id: 'accounting', label: 'الحسابات المالية', icon: DollarSign },
    { id: 'workflow', label: 'سير العمل', icon: ArrowRightLeft },
    { id: 'users', label: 'المستخدمون والصلاحيات', icon: ShieldCheck },
    { id: 'services', label: 'الخدمات', icon: List },
    { id: 'docs', label: 'المستندات', icon: FileText, soon: true },
    { id: 'reports', label: 'التقارير', icon: BarChart },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const allowedTabs: Record<UserRole, string[]> = {
    admin: ['dashboard', 'customers', 'newreq', 'approvals', 'tasks', 'visa', 'invoices', 'accounting', 'workflow', 'users', 'services', 'docs', 'reports', 'settings'],
    accountant: ['dashboard', 'customers', 'approvals', 'invoices', 'accounting', 'visa', 'reports', 'settings'],
    sales: ['dashboard', 'customers', 'newreq', 'visa', 'reports', 'settings'],
    executor: ['dashboard', 'tasks', 'visa']
  };

  const filteredMenuItems = menuItems.filter(item => {
    return (allowedTabs[userRole] || []).includes(item.id) || item.soon;
  });

  return (
    <aside className="w-full lg:w-72 bg-slate-900 border-l border-slate-800 flex flex-col justify-between shrink-0 h-auto lg:h-screen sticky top-0 z-35 text-white">
      {/* Brand & Identity Section */}
      <div className="p-6 flex flex-row lg:flex-col items-center lg:items-start justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {/* Elegant sleek Yazal icon badge with blue accent shadow */}
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <span className="text-2xl font-black text-slate-900">ي</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">يزل للأعمال</h2>
            <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Travel & Visa</p>
          </div>
        </div>

        {/* Small desktop corporate tagline */}
        <span className="hidden lg:inline-block text-[10px] bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-750 mt-1 font-semibold">
          {businessName || 'شركة النجم الأزرق'}
        </span>
      </div>

      {/* Cloud Authentication & Sync Status Card */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/20">
        {user ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-blue-500/30 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-slate-900 flex items-center justify-center text-xs font-bold font-mono">
                  {user.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.displayName || 'مستخدم يزل'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${syncing ? 'bg-blue-400 animate-pulse' : 'bg-green-500'}`}></div>
                  <span className="text-[9px] text-slate-400 font-bold">
                    {syncing ? 'جاري المزامنة...' : 'مزامنة سحابية نشطة'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/15 hover:shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer border border-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Cloud className="w-4 h-4 animate-bounce" />
            <span>ربط وتفعيل السحابة المجانية</span>
          </button>
        )}
      </div>

      {/* Nav Menu Links */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-2 flex flex-row lg:flex-col gap-1 lg:gap-0 scrollbar-none">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAllowed = (allowedTabs[userRole] || []).includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => {
                 if(isAllowed) onSelectTab(item.id);
              }}
              disabled={!isAllowed}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all relative group ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              } ${!isAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-105 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>

              {item.soon && (
                <span className="text-[9px] bg-slate-800 text-slate-500 border border-slate-700 px-2 py-0.5 rounded-full font-bold">
                  قريباً
                </span>
              )}
              
              {item.badge && !isActive && (
                <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}

              {/* Elegant active indicator dot */}
              {isActive && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-l-md"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role Switcher */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/10">
        <div className="flex items-center gap-1.5 text-slate-400 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <p className="text-[10px] font-bold">صلاحية العرض والعمل</p>
        </div>
        <select
          value={userRole}
          onChange={(e) => {
            const role = e.target.value as UserRole;
            onChangeRole(role);
            if (!allowedTabs[role].includes(activeTab)) {
                onSelectTab('dashboard');
            }
          }}
          className="w-full bg-slate-900 border border-slate-800 text-[11px] text-slate-200 font-bold rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="admin">👑 مدير النظام (كامل الصلاحيات)</option>
          <option value="accountant">💰 المحاسب (المالية والفواتير)</option>
          <option value="sales">💼 مبيعات (العملاء والطلبات)</option>
          <option value="executor">⚙️ منفذ معاملات (تخليص المهام)</option>
        </select>
      </div>

      {/* Theme Quick Switcher */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/10">
        <p className="text-[10px] text-slate-400 mb-2 font-bold">مظهر المنصة</p>
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onChangeTheme('light')}
            className={`flex flex-col items-center justify-center py-2 rounded text-[10px] font-bold transition-all cursor-pointer ${
              theme === 'light' 
                ? 'bg-blue-600 text-white shadow-sm scale-102 font-extrabold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="الوضع المضيء"
          >
            <Sun className="w-3.5 h-3.5 mb-1" />
            <span>مضيء</span>
          </button>
          
          <button
            onClick={() => onChangeTheme('dark')}
            className={`flex flex-col items-center justify-center py-2 rounded text-[10px] font-bold transition-all cursor-pointer ${
              theme === 'dark' 
                ? 'bg-blue-600 text-white shadow-sm scale-102 font-extrabold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="الوضع المظلم"
          >
            <Moon className="w-3.5 h-3.5 mb-1" />
            <span>مظلم</span>
          </button>

          <button
            onClick={() => onChangeTheme('auto')}
            className={`flex flex-col items-center justify-center py-2 rounded text-[10px] font-bold transition-all cursor-pointer ${
              theme === 'auto' 
                ? 'bg-blue-600 text-white shadow-sm scale-102 font-extrabold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="تلقائي (الوقت والنظام)"
          >
            <Plane className="w-3.5 h-3.5 mb-1" />
            <span>تلقائي</span>
          </button>
        </div>
      </div>

      {/* Footer Branding Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20 hidden lg:flex flex-col gap-2">
        <div className="flex items-center gap-2 text-slate-500 text-[10px]">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span>حالة النظام: ممتاز وعامل بالـ PWA</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-normal">
          حقوق الطبع محفوظة © 2026 يزل.
        </p>
      </div>
    </aside>
  );
}
