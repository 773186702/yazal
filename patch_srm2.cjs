const fs = require('fs');
let code = fs.readFileSync('src/components/ServiceRequestsManager.tsx', 'utf8');

code = code.replace(
  /interface ServiceRequestsManagerProps \{\n  requests: ServiceRequest\[\];\n  customers: Customer\[\];\n  userRole: UserRole;\n  onAddRequest: \(r: Partial<ServiceRequest>\) => void;\n\}\n\ninterface ServiceRequestsManagerProps \{/,
  `interface ServiceRequestsManagerProps {`
);

fs.writeFileSync('src/components/ServiceRequestsManager.tsx', code);
