export type UserRole = 'admin' | 'accountant' | 'sales' | 'executor';

export type Permission = 
  | 'view_dashboard' 
  | 'manage_customers' 
  | 'manage_requests' 
  | 'manage_visas' 
  | 'manage_financials' 
  | 'manage_users' 
  | 'view_reports' 
  | 'system_settings';

export interface UserRoleDefinition {
  id: UserRole;
  label: string;
  description: string;
  permissions: Permission[];
}

export interface CustomerDebt {
  id: string;
  requestId?: string;
  serviceType: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  date: string;
  currency: string;
  status: 'unpaid' | 'partial' | 'paid';
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  nationality: string;
  status: 'active' | 'inactive' | 'pending';
  assignedTo: string;
  timeline: { title: string; date: string }[];
  debts?: CustomerDebt[];
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  serviceType: string;
  amount: number;
  currency: string;
  category?: string;
  payType: string;
  paidAmount?: number;
  remainingAmount?: number;
  receiptDate: string;
  expiryDate: string;
  employee: string;
  status: 'pending_accountant' | 'executor_pending' | 'completed' | 'rejected';
  docs: string[];
  history?: { title: string; date: string }[];
}

export interface VisaApplication {
  id: string;
  customerName: string;
  destination: string;
  stage: 'draft' | 'submitted' | 'review' | 'approved' | 'rejected';
  docsTotal: number;
  docsReceived: number;
  appointmentDate?: string;
  submissionDate?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  amount: number;
  currency: string;
  category?: string;
  status: 'paid' | 'unpaid' | 'partial';
  date: string;
  method: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category?: string;
  description: string;
  date: string;
  by: string;
  paymentMethod?: string;
  recipientOrPayer?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending' | 'approved';
  permissions?: Permission[];
}

export interface Activity {
  id: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string;
  type: 'customer' | 'request' | 'visa' | 'financial' | 'system';
}

export interface AppSettings { [key: string]: any; }

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  permissions: Permission[];
  status?: string;
  joinedDate?: string;
  avatarUrl?: string;
}

export interface AdminContent { [key: string]: any; }

export interface AdminSystemSettings { [key: string]: any; }

export interface Project {
  [key: string]: any;
  id: string;
  name: string;
}

export interface Task {
  [key: string]: any;
  id: string;
  title: string;
}

export interface Contact {
  [key: string]: any;
  id: string;
  name: string;
}

export interface ChatMessage {
  [key: string]: any;
  id: string;
  content: string;
  role: 'user' | 'assistant';
}
