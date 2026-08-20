const fs = require('fs');
const path = 'src/views/employee/quotations/QuotationListView.tsx';
let c = fs.readFileSync(path, 'utf8');

// Replace state and fetch logic
const stateRegex = /const \[searchTerm, setSearchTerm\] = useState\(''\);\s*const \[statusFilter, setStatusFilter\] = useState<QuotationStatus \| ''>\(''\);\s*const \[blFilter, setBlFilter\] = useState\(''\);\s*const fetchQuotations = async \(\) => \{\s*try \{\s*setLoading\(true\);\s*const filters: Record<string, string> = \{\};\s*if \(statusFilter\) filters\.status = statusFilter;\s*if \(blFilter\) filters\.businessLineId = blFilter;\s*if \(searchTerm\) filters\.search = searchTerm;\s*const data = await quotationsService\.getAll\(filters\);\s*setQuotations\(data as QuotationSummary\[\]\);\s*\} catch \(err\) \{\s*toast\.error\('Error al cargar cotizaciones'\);\s*\} finally \{\s*setLoading\(false\);\s*\}\s*\};\s*useEffect\(\(\) => \{\s*fetchQuotations\(\);\s*\}, \[statusFilter, blFilter\]\);/;

const newState = `const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | ''>('');
  const [blFilter, setBlFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getFilters = () => {
    const filters: Record<string, string> = {};
    if (statusFilter) filters.status = statusFilter;
    if (blFilter) filters.businessLineId = blFilter;
    if (searchTerm) filters.search = searchTerm;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    return filters;
  };

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await quotationsService.getAll(getFilters());
      setQuotations(data as QuotationSummary[]);
    } catch (err) {
      toast.error('Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter, blFilter, startDate, endDate]);`;

if (stateRegex.test(c)) {
    c = c.replace(stateRegex, newState);
    console.log("Replaced state successfully");
} else {
    console.log("State regex failed!");
}

// Replace Export Button
const exportRegex = /const data = await quotationsService\.getAll\(\{\}\);\s*await exportQuotationsKpiToExcel\(data as QuotationSummary\[\], 'Todos \(Total hist[^\']*?\)'\);/;
const newExport = `const data = await quotationsService.getAll(getFilters());
                  let filtersInfo = '';
                  if (searchTerm) filtersInfo += \`Búsqueda: "\${searchTerm}" | \`;
                  if (statusFilter) filtersInfo += \`Estado: \${statusFilter} | \`;
                  if (blFilter) {
                     const blName = businessLines.find(b => b.id === blFilter)?.name;
                     if (blName) filtersInfo += \`Línea: \${blName} | \`;
                  }
                  if (startDate || endDate) filtersInfo += \`Fecha: \${startDate || '*'} a \${endDate || '*'} | \`;
                  filtersInfo = filtersInfo ? filtersInfo.slice(0, -3) : 'Todos (Total hist\u00f3rico)';
                  
                  await exportQuotationsKpiToExcel(data as QuotationSummary[], filtersInfo);`;

if (exportRegex.test(c)) {
    c = c.replace(exportRegex, newExport);
    console.log("Replaced export successfully");
} else {
    console.log("Export regex failed!");
}

// Replace UI Filters
const uiRegex = /<div className="relative flex-1">\s*<Search className="absolute left-3 top-1\/2 -translate-y-1\/2 text-slate-400" size=\{18\} \/>\s*<input\s*type="text"[\s\S]*?\/>\s*<\/div>\s*<div className="flex items-center gap-2">/;
const newUi = `<div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por n\u00FAmero o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="py-2 px-2 border border-slate-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-primary" />
              <span className="text-slate-400">-</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="py-2 px-2 border border-slate-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-primary" />
            </div>`;

if (uiRegex.test(c)) {
    c = c.replace(uiRegex, newUi);
    console.log("Replaced UI successfully");
} else {
    console.log("UI regex failed!");
}

fs.writeFileSync(path, c, 'utf8');
