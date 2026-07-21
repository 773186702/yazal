const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code += `
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'contributor';
  status: 'active' | 'inactive';
  permissions?: string[];
}

export interface AdminContent {
  id: string;
  title: string;
  category: 'guide' | 'announcement' | 'policy' | 'tutorial';
  status: 'published' | 'draft' | 'archived';
  description?: string;
  date?: string;
}

export interface AdminSystemSettings {
  allowRegistration: boolean;
  maintenanceMode: boolean;
  maxUsers: number;
}

export interface Project {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
}

export interface Contact {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}
`;

fs.writeFileSync('src/types.ts', code);
