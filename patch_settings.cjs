const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  /export interface AppSettings \{([\s\S]*?)\}/,
  `export interface AppSettings {
  currency: string;
  theme: 'dark' | 'light' | 'auto';
  notificationsEnabled: boolean;
  businessName: string;
  services?: string[];
  autoSave?: boolean;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  widgetLayout?: string[];
  statusColors?: {
    [key: string]: string;
  };
}`
);

fs.writeFileSync('src/types.ts', code);
