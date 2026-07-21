const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<AIAssistant \n            businessName=\{settings\.businessName\}\n          \/>/,
  `<AIAssistant 
            businessName={settings.businessName}
            projects={[]}
            tasks={[]}
            transactions={transactions}
          />`
);

fs.writeFileSync('src/App.tsx', code);
