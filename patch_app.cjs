const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the router switch statement
const newRouter = `    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardHome 
            customers={customers}
            requests={requests}
            visas={visas}
            invoices={invoices}
            activities={activities}
            onNavigate={(tab) => setActiveTab(tab)}
            currency={settings.currency}
            settings={settings}
            userRole={userRole}
          />
        );
      case 'newreq':
        return (
          <ServiceRequestsManager 
            requests={requests}
            customers={customers}
            userRole={userRole}
            initialFilter="all"
            isNewRequestOnly={true}
            onAddRequest={(req) => {
              const newReq: ServiceRequest = {
                id: \`REQ-\${Date.now()}\`,
                customerId: req.customerId || '',
                customerName: req.customerName || '',
                serviceType: req.serviceType || '',
                amount: req.amount || 0,
                currency: req.currency || 'SAR',
                payType: req.payType || 'pay_cash',
                receiptDate: req.receiptDate || new Date().toISOString().split('T')[0],
                expiryDate: req.expiryDate || new Date().toISOString().split('T')[0],
                employee: req.employee || '',
                status: req.status || 'pending_accountant',
                docs: req.docs || [],
                history: req.history || []
              } as ServiceRequest;
              setRequests([newReq, ...requests]);
            }}
          />
        );
      case 'approvals':
        return (
          <ServiceRequestsManager 
            requests={requests}
            customers={customers}
            userRole={userRole}
            initialFilter="pending_accountant"
            onAddRequest={(req) => {}}
          />
        );
      case 'tasks':
        return (
          <ServiceRequestsManager 
            requests={requests}
            customers={customers}
            userRole={userRole}
            initialFilter="executor_pending"
            onAddRequest={(req) => {}}
          />
        );
      case 'requests':
        // Fallback or full list
        return (
          <ServiceRequestsManager 
            requests={requests}
            customers={customers}
            userRole={userRole}
            onAddRequest={(req) => {}}
          />
        );
      case 'visa':
        return (
          <VisaManager 
            visas={visas}
            userRole={userRole}
            onAddVisa={(v) => {
              const newVisa: VisaApplication = {
                id: \`VA-\${Date.now()}\`,
                customerName: v.customerName || '',
                destination: v.destination || '',
                stage: v.stage || 'draft',
                docsTotal: v.docsTotal || 5,
                docsReceived: v.docsReceived || 0
              };
              setVisas([newVisa, ...visas]);
            }}
          />
        );
      case 'invoices':
      case 'accounting':
      case 'financial':
        return (
          <FinancialManager 
            transactions={transactions}
            projects={[]}
            currency={settings.currency}
            onAddTransaction={(t) => {
              const newTransaction: Transaction = {
                id: \`tx-\${Date.now()}\`,
                type: t.type,
                amount: t.amount,
                currency: t.currency || 'SAR',
                description: t.description || '',
                date: t.date || new Date().toISOString().split('T')[0],
                by: 'المستخدم الحالي'
              };
              setTransactions([newTransaction, ...transactions]);
            }}
            onDeleteTransaction={(id) => {
              setTransactions(transactions.filter(t => t.id !== id));
            }}
          />
        );
      case 'customers':
        return (
          <CustomersManager 
            customers={customers}
            userRole={userRole}
            onAddCustomer={(c) => {
              const newCustomer: Customer = {
                id: \`c-\${Date.now()}\`,
                code: c.code || '',
                name: c.name || '',
                phone: c.phone || '',
                nationality: c.nationality || '',
                status: c.status || 'active',
                assignedTo: c.assignedTo || '',
                timeline: c.timeline || []
              };
              setCustomers([newCustomer, ...customers]);
            }}
          />
        );
      case 'workflow':
        return (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">محرك سير العمل</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">مبيعات ← اعتماد المحاسب ← تنفيذ ← فاتورة تلقائية ← أرشفة</p>
            <div className="flex items-center gap-0 overflow-x-auto pb-4">
              {[['مبيعات', 'done'], ['اعتماد المحاسب', 'done'], ['تنفيذ', 'active'], ['فاتورة تلقائية', ''], ['أرشفة', '']].map(([label, state], i, arr) => (
                <div key={label} className={\`flex flex-col items-center gap-2 min-w-[120px] relative flex-1 \${state}\`}>
                  {i < arr.length - 1 && (
                    <div className={\`absolute top-4 h-0.5 w-full left-1/2 z-0 \${state === 'done' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}\`}></div>
                  )}
                  <div className={\`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm z-10 border-2 \${
                    state === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                    state === 'active' ? 'bg-amber-500 border-amber-500 text-white' : 
                    'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }\`}>
                    {state === 'done' ? '✓' : i + 1}
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">{label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'users':
      case 'admin':
        return (
          <AdminDashboard 
            user={user} 
            businessName={settings.businessName} 
          />
        );
      case 'services':
        return (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">إدارة الخدمات</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">أضف أو عدّل أنواع الخدمات المتاحة</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {settings.services?.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-sm">
                  {s}
                  <button className="text-rose-500 font-bold hover:text-rose-600">✕</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="اسم الخدمة الجديدة" className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" />
              <button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold">
                إضافة خدمة
              </button>
            </div>
          </div>
        );
      case 'ai':
      case 'chat':
        return <AIAssistant userRole={userRole} />;
      case 'settings':
        return (
          <SettingsManager 
            settings={settings}
            onUpdateSettings={setSettings}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🛠️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">قيد الإنشاء</h2>
            <p className="text-slate-500 dark:text-slate-400">هذا الموديول ضمن خارطة الطريق وسيتم إطلاقه قريباً.</p>
          </div>
        );
    }`;

code = code.replace(/    switch \(activeTab\) \{([\s\S]*?)    \}/, newRouter);

fs.writeFileSync('src/App.tsx', code);
