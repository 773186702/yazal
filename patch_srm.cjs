const fs = require('fs');
let code = fs.readFileSync('src/components/ServiceRequestsManager.tsx', 'utf8');

code = code.replace(
  /export default function ServiceRequestsManager\(\{/,
  `interface ServiceRequestsManagerProps {
  requests: ServiceRequest[];
  customers: Customer[];
  userRole: UserRole;
  onAddRequest: (r: Partial<ServiceRequest>) => void;
  initialFilter?: string;
  isNewRequestOnly?: boolean;
}

export default function ServiceRequestsManager({`
);

code = code.replace(
  /  onAddRequest\n\}: ServiceRequestsManagerProps\)/,
  `  onAddRequest,\n  initialFilter = 'all',\n  isNewRequestOnly = false\n}: ServiceRequestsManagerProps)`
);

code = code.replace(
  /const \[filter, setFilter\] = useState<string>\('all'\);/,
  `const [filter, setFilter] = useState<string>(initialFilter);`
);

// If isNewRequestOnly is true, we should probably just show a form or trigger the add request immediately.
// For now, let's just make the UI adapt to filter.

fs.writeFileSync('src/components/ServiceRequestsManager.tsx', code);
