const fs = require('fs');

// --- 1. Modify CrmView.tsx ---
const crmPath = 'src/views/employee/CrmView.tsx';
let crm = fs.readFileSync(crmPath, 'utf8');

// Add state
const stateRegex = /const \[dealsFilters, setDealsFilters\] = useState\(\{[\s\S]*?\}\);\s*const debouncedDealsFilters = useDebounce\(dealsFilters, 500\);/;
const stateReplacement = `const [dealsFilters, setDealsFilters] = useState({ name: '', amountMin: '', amountMax: '', stage: '', userId: '', accountId: '', contactId: '', startDate: '', endDate: '', closeDateFrom: '', closeDateTo: '' });
  const debouncedDealsFilters = useDebounce(dealsFilters, 500);

  const [quotationsFilters, setQuotationsFilters] = useState({ status: '', businessLineId: '', startDate: '', endDate: '' });
  const debouncedQuotationsFilters = useDebounce(quotationsFilters, 500);`;

if (stateRegex.test(crm)) {
    crm = crm.replace(stateRegex, stateReplacement);
} else {
    console.log("Failed to insert quotations state in CrmView");
}

// Add UI in showFilters
const dealsUiRegex = /\{activeTab === 'deals' && \([\s\S]*?<\/div>\s*<\/>\s*\)\}/;
if (dealsUiRegex.test(crm)) {
    const dealsUiMatch = crm.match(dealsUiRegex)[0];
    const uiReplacement = `${dealsUiMatch}

                {activeTab === 'quotations' && (
                  <>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
                      <select value={quotationsFilters.status} onChange={(e) => setQuotationsFilters({...quotationsFilters, status: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm">
                        <option value="">Todos los estados</option>
                        <option value="DRAFT">Borrador</option>
                        <option value="SENT">Enviada</option>
                        <option value="PENDING_SIGNATURE">Pendiente Firma</option>
                        <option value="SIGNED">Firmado</option>
                        <option value="ACCEPTED">Aceptada</option>
                        <option value="REJECTED">Rechazada</option>
                        <option value="EXPIRED">Caducada</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Línea</label>
                      <select value={quotationsFilters.businessLineId} onChange={(e) => setQuotationsFilters({...quotationsFilters, businessLineId: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm">
                        <option value="">Todas las líneas</option>
                        {businessLines.map(bl => (
                          <option key={bl.id} value={bl.id}>{bl.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5 w-full md:w-64">
                      <label className="text-xs font-bold text-slate-500 uppercase">Fecha (Desde - Hasta)</label>
                      <div className="flex items-center gap-2">
                        <input type="date" value={quotationsFilters.startDate} onChange={(e) => setQuotationsFilters({...quotationsFilters, startDate: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={quotationsFilters.endDate} onChange={(e) => setQuotationsFilters({...quotationsFilters, endDate: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                      </div>
                    </div>
                  </>
                )}`;
    crm = crm.replace(dealsUiRegex, uiReplacement);
} else {
    console.log("Failed to insert quotations UI in CrmView");
}

// Add to reset filters
const resetRegex = /setDealsFilters\(\{ name: '', amountMin: '', amountMax: '', stage: '', userId: '', accountId: '', contactId: '', startDate: '', endDate: '', closeDateFrom: '', closeDateTo: '' \}\);/;
const resetReplacement = `setDealsFilters({ name: '', amountMin: '', amountMax: '', stage: '', userId: '', accountId: '', contactId: '', startDate: '', endDate: '', closeDateFrom: '', closeDateTo: '' });
                      setQuotationsFilters({ status: '', businessLineId: '', startDate: '', endDate: '' });`;
if (resetRegex.test(crm)) {
    crm = crm.replace(resetRegex, resetReplacement);
} else {
    console.log("Failed to insert quotations reset in CrmView");
}

// Pass props to QuotationListView
const listRegex = /<QuotationListView\s*businessLines=\{businessLines\}\s*users=\{users\}\s*onViewDetail=\{setViewingQuotationId\}\s*onCreateNew=\{\(\) => \{ setCreatingQuotationForDeal\(null\); setShowQuotationModal\(true\); \}\}\s*onDoubleClickQuotation=\{\(id, accountId\) => setRecord360\(\{ id, type: 'quotation', accountId \}\)\}\s*\/>/;
const listReplacement = `<QuotationListView 
              businessLines={businessLines}
              users={users}
              onViewDetail={setViewingQuotationId}
              onCreateNew={() => { setCreatingQuotationForDeal(null); setShowQuotationModal(true); }}
              onDoubleClickQuotation={(id, accountId) => setRecord360({ id, type: 'quotation', accountId })}
              searchQuery={debouncedSearchQuery}
              filters={debouncedQuotationsFilters}
            />`;
if (listRegex.test(crm)) {
    crm = crm.replace(listRegex, listReplacement);
} else {
    console.log("Failed to pass props to QuotationListView in CrmView");
}

fs.writeFileSync(crmPath, crm, 'utf8');
console.log("Modified CrmView.tsx");


// --- 2. Modify QuotationListView.tsx ---
const qPath = 'src/views/employee/quotations/QuotationListView.tsx';
let q = fs.readFileSync(qPath, 'utf8');

// Replace props interface
q = q.replace(/onDoubleClickQuotation\?: \(id: string, accountId: string\) => void;\s*\}/, `onDoubleClickQuotation?: (id: string, accountId: string) => void;
  searchQuery?: string;
  filters?: { status: string; businessLineId: string; startDate: string; endDate: string; };
}`);

// Change component definition
q = q.replace(/export default function QuotationListView\(\{ businessLines, users, onViewDetail, onCreateNew, onDoubleClickQuotation \}: QuotationListViewProps\) \{/, `export default function QuotationListView({ businessLines, users, onViewDetail, onCreateNew, onDoubleClickQuotation, searchQuery, filters }: QuotationListViewProps) {`);

// Replace state and fetch logic
const qStateRegex = /const \[searchTerm, setSearchTerm\] = useState\(''\);\s*const \[statusFilter, setStatusFilter\] = useState<QuotationStatus \| ''>\(''\);\s*const \[blFilter, setBlFilter\] = useState\(''\);\s*const \[startDate, setStartDate\] = useState\(''\);\s*const \[endDate, setEndDate\] = useState\(''\);\s*const getFilters = \(\) => \{\s*const filters: Record<string, string> = \{\};\s*if \(statusFilter\) filters\.status = statusFilter;\s*if \(blFilter\) filters\.businessLineId = blFilter;\s*if \(searchTerm\) filters\.search = searchTerm;\s*if \(startDate\) filters\.startDate = startDate;\s*if \(endDate\) filters\.endDate = endDate;\s*return filters;\s*\};\s*const fetchQuotations = async \(\) => \{\s*try \{\s*setLoading\(true\);\s*const data = await quotationsService\.getAll\(getFilters\(\)\);\s*setQuotations\(data as QuotationSummary\[\]\);\s*\} catch \(err\) \{\s*toast\.error\('Error al cargar cotizaciones'\);\s*\} finally \{\s*setLoading\(false\);\s*\}\s*\};\s*useEffect\(\(\) => \{\s*fetchQuotations\(\);\s*\}, \[statusFilter, blFilter, startDate, endDate\]\);/;

const qStateReplacement = `const fetchQuotations = async () => {
    try {
      setLoading(true);
      const apiFilters: Record<string, string> = {};
      if (filters?.status) apiFilters.status = filters.status;
      if (filters?.businessLineId) apiFilters.businessLineId = filters.businessLineId;
      if (filters?.startDate) apiFilters.startDate = filters.startDate;
      if (filters?.endDate) apiFilters.endDate = filters.endDate;
      if (searchQuery) apiFilters.search = searchQuery;
      
      const data = await quotationsService.getAll(apiFilters);
      setQuotations(data as QuotationSummary[]);
    } catch (err) {
      toast.error('Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [filters, searchQuery]);`;

if (qStateRegex.test(q)) {
    q = q.replace(qStateRegex, qStateReplacement);
} else {
    console.log("Failed to replace state logic in QuotationListView");
}

// Replace export button data source
const qExportRegex = /const data = await quotationsService\.getAll\(getFilters\(\)\);\s*let filtersInfo = '';\s*if \(searchTerm\) filtersInfo \+= `Búsqueda: "\$\{searchTerm\}" \| `;\s*if \(statusFilter\) filtersInfo \+= `Estado: \$\{statusFilter\} \| `;\s*if \(blFilter\) \{\s*const blName = businessLines\.find\(b => b\.id === blFilter\)\?\.name;\s*if \(blName\) filtersInfo \+= `Línea: \$\{blName\} \| `;\s*\}\s*if \(startDate \|\| endDate\) filtersInfo \+= `Fecha: \$\{startDate \|\| '\*'\} a \$\{endDate \|\| '\*'\} \| `;\s*filtersInfo = filtersInfo \? filtersInfo\.slice\(0, -3\) : 'Todos \(Total hist\u00f3rico\)';\s*await exportQuotationsKpiToExcel\(data as QuotationSummary\[\], filtersInfo\);/;

const qExportReplacement = `const apiFilters: Record<string, string> = {};
                  if (filters?.status) apiFilters.status = filters.status;
                  if (filters?.businessLineId) apiFilters.businessLineId = filters.businessLineId;
                  if (filters?.startDate) apiFilters.startDate = filters.startDate;
                  if (filters?.endDate) apiFilters.endDate = filters.endDate;
                  if (searchQuery) apiFilters.search = searchQuery;
                  const data = await quotationsService.getAll(apiFilters);
                  
                  let filtersInfo = '';
                  if (searchQuery) filtersInfo += \`Búsqueda: "\${searchQuery}" | \`;
                  if (filters?.status) filtersInfo += \`Estado: \${filters.status} | \`;
                  if (filters?.businessLineId) {
                     const blName = businessLines.find(b => b.id === filters.businessLineId)?.name;
                     if (blName) filtersInfo += \`Línea: \${blName} | \`;
                  }
                  if (filters?.startDate || filters?.endDate) filtersInfo += \`Fecha: \${filters?.startDate || '*'} a \${filters?.endDate || '*'} | \`;
                  filtersInfo = filtersInfo ? filtersInfo.slice(0, -3) : 'Todos (Total hist\u00f3rico)';

                  await exportQuotationsKpiToExcel(data as QuotationSummary[], filtersInfo);`;

if (qExportRegex.test(q)) {
    q = q.replace(qExportRegex, qExportReplacement);
} else {
    console.log("Failed to replace export logic in QuotationListView");
}

// Remove the local `<form>` filter UI!
const qUiRegex = /<form onSubmit=\{handleSearch\} className="flex gap-4">[\s\S]*?<\/form>/;
if (qUiRegex.test(q)) {
    q = q.replace(qUiRegex, '');
} else {
    console.log("Failed to remove form from QuotationListView");
}

// Remove `const handleSearch = ...`
const qSearchRegex = /\/\/ Handle search with simple debounce manually or just button\s*const handleSearch = \(e: React\.FormEvent\) => \{\s*e\.preventDefault\(\);\s*fetchQuotations\(\);\s*\};/;
if (qSearchRegex.test(q)) {
    q = q.replace(qSearchRegex, '');
} else {
    console.log("Failed to remove handleSearch from QuotationListView");
}

fs.writeFileSync(qPath, q, 'utf8');
console.log("Modified QuotationListView.tsx");
