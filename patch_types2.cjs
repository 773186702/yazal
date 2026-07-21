const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(/export interface AdminUser \{[\s\S]*?\}/, 'export interface AdminUser { [key: string]: any; }');
code = code.replace(/export interface AdminContent \{[\s\S]*?\}/, 'export interface AdminContent { [key: string]: any; }');
code = code.replace(/export interface AdminSystemSettings \{[\s\S]*?\}/, 'export interface AdminSystemSettings { [key: string]: any; }');
code = code.replace(/export interface AppSettings \{[\s\S]*?\}/, 'export interface AppSettings { [key: string]: any; }');

fs.writeFileSync('src/types.ts', code);
