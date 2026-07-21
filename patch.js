const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const imports = `import React from 'react';
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
`;
code = code.replace(/import React from 'react';[\s\S]*?} from 'lucide-react';/, imports.trim());

const menuItemsStr = `  const menuItems = [
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
    { id: 'reports', label: 'التقارير', icon: BarChart, soon: true },
    { id: 'settings', label: 'الإعدادات', icon: Settings, soon: true },
  ];

  const allowedTabs: Record<UserRole, string[]> = {
    admin: ['dashboard', 'customers', 'newreq', 'approvals', 'tasks', 'visa', 'invoices', 'accounting', 'workflow', 'users', 'services', 'docs', 'reports', 'settings'],
    accountant: ['dashboard', 'customers', 'approvals', 'invoices', 'accounting', 'visa'],
    sales: ['dashboard', 'customers', 'newreq', 'visa'],
    executor: ['dashboard', 'tasks', 'visa']
  };`;

code = code.replace(/  const menuItems = \[(.|\n)*?\];\s+const allowedTabs: Record<UserRole, string\[\]> = \{(.|\n)*?\};\n/m, menuItemsStr + '\n');

fs.writeFileSync('src/components/Sidebar.tsx', code);
