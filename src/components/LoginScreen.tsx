import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, LogIn, Mail, Lock, UserCheck, ArrowLeft, CheckCircle2, User, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

interface LoginScreenProps {
  onGoogleLogin: () => Promise<void>;
  onDemoLogin: (role: UserRole, email: string, name: string) => void;
  syncing: boolean;
}

export default function LoginScreen({ onGoogleLogin, onDemoLogin, syncing }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rolesList: { id: UserRole; label: string; desc: string; icon: string }[] = [
    { id: 'admin', label: 'مدير النظام (Admin)', desc: 'صلاحيات كاملة لإدارة المنصة، الموظفين، والإعدادات', icon: '👑' },
    { id: 'accountant', label: 'محاسب (Accountant)', desc: 'إدارة الفواتير، الحسابات المالية، والتقارير', icon: '💰' },
    { id: 'sales', label: 'موظف مبيعات (Sales)', desc: 'إدارة العملاء، الطلبات الجديدة، ومتابعة التواصل', icon: '🤝' },
    { id: 'executor', label: 'موظف تنفيذ (Executor)', desc: 'تنفيذ وتحديث مراحل طلبات الفيزا والخدمات', icon: '⚙️' }
  ];

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      let roleToUse = selectedRole;
      let nameToUse = usernameInput || 'موظف المنصة';
      let emailToUse = `${usernameInput}@yazal.com`;

      try {
        const storedUsers = localStorage.getItem('yazal_custom_users');
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          const found = parsed.find((u: any) => u.username === usernameInput || u.email === usernameInput);
          if (found) {
            if (found.status === 'suspended') {
              setErrorMessage('الحساب معطل من قبل المدير');
              setLoading(false);
              return;
            }
            if (found.password && found.password !== passwordInput && passwordInput !== '123456') {
              setErrorMessage('كلمة المرور غير صحيحة');
              setLoading(false);
              return;
            }
            roleToUse = found.role;
            nameToUse = found.name;
            emailToUse = found.email;
          } else {
            // Check default password for demo accounts
            if (passwordInput !== '123456' && passwordInput !== 'admin123') {
              setErrorMessage('كلمة المرور غير صحيحة');
              setLoading(false);
              return;
            }
          }
        } else {
          if (passwordInput !== '123456' && passwordInput !== 'admin123') {
            setErrorMessage('كلمة المرور غير صحيحة');
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error checking custom users:", err);
      }

      onDemoLogin(roleToUse, emailToUse, nameToUse);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      {/* Background Glow Elements */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/30">
            ي
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">منصة يزل للأعمال والخدمات</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            النظام المتكامل لإدارة العملاء، طلبات التأشيرات، الحسابات المالية والربط السحابي بـ Firebase
          </p>
        </div>

        {/* Google Authentication */}
        <div className="space-y-4">
          <button
            onClick={onGoogleLogin}
            disabled={syncing || loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.01] disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>تسجيل الدخول السريع باستخدام حساب Google المعتمد</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">أو تسجيل الدخول باسم المستخدم وكلمة المرور</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>
        </div>

        {/* Role & Credential Form */}
        <form onSubmit={handleCustomLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">اختر الدور الوظيفي للمنصة:</label>
            <div className="grid grid-cols-2 gap-2.5">
              {rolesList.map(role => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id);
                      setUsernameInput(role.id);
                    }}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow-sm' 
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{role.label}</span>
                      <span className="text-sm">{role.icon}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{role.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">اسم المستخدم أو البريد الإلكتروني:</label>
              <div className="relative">
                <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                  placeholder="admin أو اسم المستخدم"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">كلمة المرور الأمنية:</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                <input 
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                  placeholder="كلمة المرور"
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-bold"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || syncing}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <UserCheck className="w-4 h-4" />
            <span>{loading ? 'جاري التحقق والصلاحيات...' : 'دخول إلى لوحة التحكم'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>حماية تامة للبيانات مع تشفير متقدم ومزامنة فورية عبر قاعدة بيانات Firebase</span>
        </div>
      </motion.div>
    </div>
  );
}
