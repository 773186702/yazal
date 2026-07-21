const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(/export interface AdminUser \{/g, 'export interface AdminUser {\n  [key: string]: any;');
code = code.replace(/export interface AdminContent \{/g, 'export interface AdminContent {\n  [key: string]: any;');
code = code.replace(/export interface AdminSystemSettings \{/g, 'export interface AdminSystemSettings {\n  [key: string]: any;');
code = code.replace(/export interface Project \{/g, 'export interface Project {\n  [key: string]: any;');
code = code.replace(/export interface Task \{/g, 'export interface Task {\n  [key: string]: any;');
code = code.replace(/export interface Contact \{/g, 'export interface Contact {\n  [key: string]: any;');
code = code.replace(/export interface ChatMessage \{/g, 'export interface ChatMessage {\n  [key: string]: any;');
code = code.replace(/export interface AppSettings \{/g, 'export interface AppSettings {\n  [key: string]: any;');

fs.writeFileSync('src/types.ts', code);
