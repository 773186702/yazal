const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(/export interface AppSettings \{ \[key: string\]: any; \};\n  widgetLayout\?: string\[\];\n  statusColors\?: \{\n    \[key: string\]: string;\n  \};\n\}/g, 'export interface AppSettings { [key: string]: any; }');

fs.writeFileSync('src/types.ts', code);
