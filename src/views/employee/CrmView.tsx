import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Users, Search, Plus, Edit2, Trash2, 
  AlertCircle, CheckCircle, RefreshCw, X, Mail, Phone, Briefcase,
  LayoutGrid, TrendingUp, FileText, BarChart2, Book, Clock, Calendar, PhoneCall, CheckSquare, Wand2, ChevronDown, Download
} from 'lucide-react';
import { accountsService, contactsService, Account, Contact } from '../../services/crm.service';
import { activitiesService, Activity, ActivityType, ActivityResult, ActivityStatus } from '../../services/activities.service';
import { dealsService, Deal, DealStage } from '../../services/deals.service';
import { usersService } from '../../services/users.service';
import { projectsService } from '../../services/projects.service';
import { UserResponse } from '../../services/types';
import api from '../../services/api';
import { exportActivitiesToExcel } from '../../utils/exportActivityReport';
import { exportAccountsKpiToExcel } from '../../utils/exportAccountsKpiReport';
import { exportContactsKpiToExcel } from '../../utils/exportContactsKpiReport';
import { exportDealsKpiToExcel } from '../../utils/exportDealsKpiReport';
import { ActivityKpiPdfReport } from '../../components/ActivityKpiPdfReport';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

import QuotationListView from './quotations/QuotationListView';
import QuotationDetailView from './quotations/QuotationDetailView';
import CreateQuotationModal from './quotations/CreateQuotationModal';

import LibraryView from './library/LibraryView';
import Record360Modal from './Record360Modal';
import CrmReportsView from './reports/CrmReportsView';
import { BulkActivityModal, BulkActivityTemplate } from '../../components/common/BulkActivityModal';
import { SectorAutocomplete } from '../../components/common/SectorAutocomplete';
import { useAuth } from '../../contexts/AuthContext';

type Tab = 'dashboard' | 'accounts' | 'contacts' | 'deals' | 'quotations' | 'reports' | 'library';

const DEAL_STAGES: { value: DealStage; label: string; color: string }[] = [
  { value: DealStage.LEAD, label: 'Lead', color: 'bg-blue-400' },
  { value: DealStage.QUALIFIED, label: 'Cualificado', color: 'bg-indigo-400' },
  { value: DealStage.PROPOSAL, label: 'Propuesta', color: 'bg-amber-400' },
  { value: DealStage.NEGOTIATION, label: 'Negociación', color: 'bg-orange-400' },
  { value: DealStage.WON, label: 'Ganado', color: 'bg-emerald-400' },
  { value: DealStage.LOST, label: 'Perdido', color: 'bg-red-400' },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function SearchableAccountSelect({ 
  accounts, 
  value, 
  onChange, 
  disabled = false,
  placeholder = "Buscar o seleccionar empresa..."
}: { 
  accounts: Account[], 
  value: string, 
  onChange: (id: string) => void,
  disabled?: boolean,
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const selectedAccount = accounts.find(a => a.id === value);
  const filteredAccounts = accounts.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    (a.cif && a.cif.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative">
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm flex items-center justify-between cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus-within:ring-2 focus-within:ring-[#001c3a]/50'}`}
      >
        <span className={selectedAccount ? "text-slate-800" : "text-slate-400"}>
          {selectedAccount ? selectedAccount.name : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      <AnimatePresence>
        {isOpen && !disabled && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-[110] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden"
            >
              <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <Search size={16} className="text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar por nombre o CIF..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm bg-transparent outline-none text-slate-700"
                />
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {filteredAccounts.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500 text-center">No se encontraron empresas</div>
                ) : (
                  filteredAccounts.map(acc => (
                    <div
                      key={acc.id}
                      onClick={() => {
                        onChange(acc.id);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`px-4 py-3 text-sm cursor-pointer hover:bg-slate-50 flex flex-col border-b border-slate-50 last:border-none transition-colors ${value === acc.id ? 'bg-blue-50/50 text-[#001c3a] font-bold' : 'text-slate-700'}`}
                    >
                      <span>{acc.name}</span>
                      {acc.cif && <span className="text-xs text-slate-400 mt-0.5 font-medium">CIF: {acc.cif}</span>}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CrmView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'dashboard';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Sync tab state with URL
  useEffect(() => {
    if (activeTab !== searchParams.get('tab')) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  // Handle direct links (from notifications)
  useEffect(() => {
    const dealId = searchParams.get('dealId');
    if (dealId) {
      dealsService.getById(dealId)
        .then(d => {
          setViewingDeal(d);
        })
        .catch(err => console.error('Error fetching linked deal:', err))
        .finally(() => {
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('dealId');
          setSearchParams(newParams, { replace: true });
        });
    }
  }, [searchParams, setSearchParams]);
  
  // Master Data State
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [businessLines, setBusinessLines] = useState<{id: string, name: string}[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const reader = new FileReader();
      
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);

          if (data.length === 0) {
            toast.error('El archivo está vacío');
            return;
          }

          let response;
          if (activeTab === 'accounts') {
            // Map headers for Accounts (Empresas)
            // Esperamos: Nombre, CIF, Sector, Email, Teléfono, Ciudad
            const mappedData = data.map((row: any) => ({
              name: row['Nombre'] || row['name'] || row['NAME'],
              cif: row['CIF'] || row['cif'],
              sector: row['Sector'] || row['sector'],
              email: row['Email'] || row['email'] || row['Correo'],
              phone: String(row['Teléfono'] || row['Telefono'] || row['phone'] || ''),
              city: row['Ciudad'] || row['city'],
            })).filter(item => !!item.name); // Filter out empty rows

            response = await accountsService.bulkCreate(mappedData);
          } else if (activeTab === 'contacts') {
            // Map headers for Contacts (Contactos)
            // Esperamos: Empresa, Nombre, Email, Teléfono, Cargo
            const mappedData = data.map((row: any) => ({
              accountName: row['Empresa'] || row['empresa'],
              name: row['Nombre'] || row['name'],
              email: row['Email'] || row['email'] || row['Correo'],
              phone: String(row['Teléfono'] || row['Telefono'] || row['phone'] || ''),
              position: row['Cargo'] || row['cargo'] || row['position'],
            })).filter(item => !!item.accountName && !!item.name);

            response = await contactsService.bulkCreate(mappedData);
          }
          
          if (response?.errors?.length > 0) {
            toast.error(`Se importaron ${response.count} registros con ${response.errors.length} errores. Revisa la consola.`);
            console.error('Errores en importación:', response.errors);
          } else {
            toast.success(`Se importaron ${response.count} registros correctamente`);
          }
          
          // Refresh data
          loadData();
        } catch (err: any) {
          console.error('Error parseando excel:', err);
          toast.error(err.response?.data?.message || 'Error al procesar el archivo');
        } finally {
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      
      reader.readAsBinaryString(file);
    } catch (err) {
      setIsLoading(false);
      console.error('Error importando excel:', err);
      toast.error('Error al iniciar la importación');
    }
  };
  
  // Advanced Filters State
  const [accountsFilters, setAccountsFilters] = useState({ name: '', cif: '', sector: '', activityStatus: 'ALL', city: '', email: '', phone: '', startDate: '', endDate: '', orderBy: 'createdAt', orderDir: 'desc' });
  const debouncedAccountsFilters = useDebounce(accountsFilters, 500);

  const [contactsFilters, setContactsFilters] = useState({ name: '', email: '', phone: '', position: '', accountId: '', activityStatus: 'ALL', startDate: '', endDate: '', orderBy: 'createdAt', orderDir: 'desc' });
  const debouncedContactsFilters = useDebounce(contactsFilters, 500);

  const [dealsFilters, setDealsFilters] = useState({ name: '', amountMin: '', amountMax: '', stage: '', userId: '', accountId: '', contactId: '', startDate: '', endDate: '', closeDateFrom: '', closeDateTo: '' });
  const debouncedDealsFilters = useDebounce(dealsFilters, 500);

  const [activitiesFilters, setActivitiesFilters] = useState({ subject: '', notes: '', activityType: '', result: '', userId: '', dealId: '', accountId: '', contactId: '', parentActivityId: '', startDate: '', endDate: '', completedAtFrom: '', completedAtTo: '' });
  const debouncedActivitiesFilters = useDebounce(activitiesFilters, 500);

  const [dashboardActivityStatusFilter, setDashboardActivityStatusFilter] = useState('ALL');
  const [dashboardActivityUserFilter, setDashboardActivityUserFilter] = useState('ALL');

  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [exportingTarget, setExportingTarget] = useState<'excel' | 'pdf' | null>(null);
  const pdfRef = React.useRef<HTMLDivElement>(null);
  const [pdfData, setPdfData] = useState<any>(null);

  const handleExportDashboardActivities = async (format: 'excel' | 'pdf') => {
    setExportingTarget(format);
    try {
      let filtersInfo = 'Panel de Control - Mis actividades pendientes';
      if (dashboardActivityStatusFilter !== 'ALL') filtersInfo += ` | Estado: ${dashboardActivityStatusFilter}`;
      if (dashboardActivityUserFilter !== 'ALL') {
        const u = users.find(x => x.id === dashboardActivityUserFilter);
        if (u) filtersInfo += ` | Responsable: ${u.display_name || u.name}`;
      }

      const params = new URLSearchParams();
      if (dashboardActivityUserFilter !== 'ALL') params.append('userId', dashboardActivityUserFilter);
      
      const res = await api.get(`/activities/export-report?${params.toString()}`);
      
      if (format === 'excel') {
        await exportActivitiesToExcel(res.data, filtersInfo);
      } else if (format === 'pdf') {
        setPdfData({ data: res.data, filtersInfo });
        setTimeout(() => {
          if (pdfRef.current) {
            html2pdf().from(pdfRef.current).set({
              margin: 10,
              filename: `Informe_Dashboard_${new Date().getTime()}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).save().then(() => setPdfData(null));
          }
        }, 500);
      }
    } catch (err) {
      console.error(err);
      alert('Error al exportar el reporte');
    } finally {
      if (format === 'excel') setExportingTarget(null);
      if (format === 'pdf') {
        setTimeout(() => setExportingTarget(null), 1500);
      }
    }
  };

  // Modal State
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  const [creatingQuotationForDeal, setCreatingQuotationForDeal] = useState<Deal | null>(null);
  const [creatingDealForActivityId, setCreatingDealForActivityId] = useState<string | null>(null);
  const [dealsView, setDealsView] = useState<'kanban' | 'list'>('kanban');
  const [viewingDeal, setViewingDeal] = useState<Deal | null>(null);
  const [highlightedActivityId, setHighlightedActivityId] = useState<string | null>(null);
  const [highlightedDealId, setHighlightedDealId] = useState<string | null>(null);
  const [viewingQuotationId, setViewingQuotationId] = useState<string | null>(null);
  const [dealActivities, setDealActivities] = useState<Activity[]>([]);
  const [deletingId, setDeletingId] = useState<{ id: string, type: 'account' | 'contact' | 'activity' | 'deal' } | null>(null);
  const [record360, setRecord360] = useState<{ id: string, type: 'account' | 'contact' | 'deal' | 'activity' | 'quotation', accountId: string } | null>(null);
  
  // Bulk Selection State
  const [showBulkActivityModal, setShowBulkActivityModal] = useState(false);
  const [isBulkSelectionMode, setIsBulkSelectionMode] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  
  const [isBulkSelectionModeContacts, setIsBulkSelectionModeContacts] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  const toggleBulkSelectionMode = () => {
    if (activeTab === 'contacts') {
      setIsBulkSelectionModeContacts(!isBulkSelectionModeContacts);
      setSelectedContacts(new Set());
    } else {
      setIsBulkSelectionMode(!isBulkSelectionMode);
      setSelectedAccounts(new Set());
    }
  };

  const toggleAccountSelection = (id: string) => {
    const newSelection = new Set(selectedAccounts);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedAccounts(newSelection);
  };

  const toggleAllFilteredAccounts = () => {
    if (selectedAccounts.size === filteredAccounts.length && filteredAccounts.length > 0) {
      setSelectedAccounts(new Set());
    } else {
      setSelectedAccounts(new Set(filteredAccounts.map(a => a.id)));
    }
  };

  const toggleContactSelection = (id: string) => {
    const newSelection = new Set(selectedContacts);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedContacts(newSelection);
  };

  const toggleAllFilteredContacts = () => {
    if (selectedContacts.size === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const handleBulkSubmit = async (templates: BulkActivityTemplate[]) => {
    try {
      if (activeTab === 'contacts') {
        await api.post('/activities/bulk-create', {
          contactIds: Array.from(selectedContacts),
          activities: templates
        });
      } else {
        await api.post('/activities/bulk-create', {
          accountIds: Array.from(selectedAccounts),
          activities: templates
        });
      }
      showNotification('Actividades generadas exitosamente');
      setShowBulkActivityModal(false);
      toggleBulkSelectionMode();
      fetchData();
    } catch (error: any) {
      showNotification(error?.response?.data?.message || 'Error al generar actividades', 'error');
    }
  };
  
  // Form State
  const [editingAccount, setEditingAccount] = useState<Partial<Account> | null>(null);
  const [editingContact, setEditingContact] = useState<Partial<Contact> | null>(null);
  const [editingActivity, setEditingActivity] = useState<Partial<Activity> | null>(null);
  const [editingDeal, setEditingDeal] = useState<Partial<Deal> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingSectors = Array.from(new Set(accounts.map(a => a.sector).filter(Boolean))) as string[];

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const search = debouncedSearchQuery || undefined;
      
      const dealsParams = { search, ...debouncedDealsFilters };
      if (dealsParams.amountMin) dealsParams.amountMin = Number(dealsParams.amountMin) as any;
      if (dealsParams.amountMax) dealsParams.amountMax = Number(dealsParams.amountMax) as any;

      const [accountsData, contactsData, activitiesData, dealsData, usersData, businessLinesRes, projectsData] = await Promise.all([
        accountsService.getAll({ search, ...debouncedAccountsFilters }),
        contactsService.getAll({ search, ...debouncedContactsFilters }),
        activitiesService.getAll({ search, ...debouncedActivitiesFilters }),
        dealsService.getAll(dealsParams as any),
        usersService.getUsers(),
        api.get('/business-lines').catch(() => ({ data: [] })),
        projectsService.getAll()
      ]);
      setAccounts(accountsData);
      setContacts(contactsData);
      setActivities(activitiesData);
      setDeals(dealsData);
      setUsers(usersData.data || []);
      setBusinessLines(businessLinesRes.data || []);
      setProjects(projectsData || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al obtener los datos del CRM');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSortAccounts = (field: string) => {
    setAccountsFilters(prev => ({
      ...prev,
      orderBy: field,
      orderDir: prev.orderBy === field && prev.orderDir === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSortContacts = (field: string) => {
    setContactsFilters(prev => ({
      ...prev,
      orderBy: field,
      orderDir: prev.orderBy === field && prev.orderDir === 'asc' ? 'desc' : 'asc'
    }));
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000); // Sincronización automática cada minuto
    return () => clearInterval(intervalId);
  }, [debouncedSearchQuery, debouncedAccountsFilters, debouncedContactsFilters, debouncedDealsFilters, debouncedActivitiesFilters]);

  useEffect(() => {
    if (viewingDeal) {
      activitiesService.getAll({ dealId: viewingDeal.id })
        .then(setDealActivities)
        .catch(console.error);
    } else {
      setDealActivities([]);
    }
  }, [viewingDeal]);

  useEffect(() => {
    if (highlightedDealId) {
      setTimeout(() => {
        const el = document.getElementById(`deal-card-${highlightedDealId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      }, 100);
    }
  }, [highlightedDealId, activeTab, dealsView]);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 5000);
    }
  };

  // --- Handlers para Accounts ---
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount?.name) return;
    
    setIsSubmitting(true);
    try {
      const payload: Partial<Account> = {
        name: editingAccount.name,
        cif: editingAccount.cif || undefined,
        sector: editingAccount.sector || undefined,
        email: editingAccount.email || undefined,
        phone: editingAccount.phone || undefined,
        city: editingAccount.city || undefined,
      };

      if (editingAccount.id) {
        await accountsService.update(editingAccount.id, payload);
        showNotification('Empresa actualizada correctamente');
      } else {
        await accountsService.create(payload);
        showNotification('Empresa creada correctamente');
      }
      setShowAccountModal(false);
      setEditingAccount(null);
      fetchData();
    } catch (err: any) {
      showNotification(err?.response?.data?.message || 'Error al guardar empresa', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers para Contacts ---
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact?.accountId) {
      showNotification('Debes seleccionar una Empresa asociada', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        accountId: editingContact.accountId,
        name: editingContact.name || undefined,
        email: editingContact.email || undefined,
        phone: editingContact.phone || undefined,
        position: editingContact.position || undefined,
      };

      if (editingContact.id) {
        await contactsService.update(editingContact.id, payload);
        showNotification('Contacto actualizado correctamente');
      } else {
        await contactsService.create(payload);
        showNotification('Contacto creado correctamente');
      }
      setShowContactModal(false);
      setEditingContact(null);
      fetchData();
    } catch (err: any) {
      showNotification(err?.response?.data?.message || 'Error al guardar contacto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers para Activities ---
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity?.subject || !editingActivity?.activityType || !editingActivity?.accountId) {
      showNotification('Faltan campos obligatorios', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Activity> = {
        subject: editingActivity.subject,
        activityType: editingActivity.activityType,
        accountId: editingActivity.accountId,
        contactId: editingActivity.contactId || null,
        dealId: editingActivity.dealId || null,
        userId: editingActivity.userId || null,
        parentActivityId: editingActivity.parentActivityId || null,
        result: editingActivity.result || null,
        notes: editingActivity.notes || null,
        completedAt: editingActivity.completedAt || null,
      };

      if (editingActivity.id) {
        await activitiesService.update(editingActivity.id, payload);
        showNotification('Actividad actualizada correctamente');
      } else {
        await activitiesService.create(payload);
        showNotification('Actividad creada correctamente');
      }
      setShowActivityModal(false);
      setEditingActivity(null);
      fetchData();
    } catch (err: any) {
      showNotification(err?.response?.data?.message || 'Error al guardar actividad', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers para Deals ---
  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal?.name || !editingDeal?.accountId || !editingDeal?.stage) {
      showNotification('Faltan campos obligatorios', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Deal> = {
        name: editingDeal.name,
        accountId: editingDeal.accountId,
        contactId: editingDeal.contactId || null,
        stage: editingDeal.stage,
        amount: editingDeal.amount || null,
        closeDate: editingDeal.closeDate || null,
        probability: editingDeal.probability !== undefined ? editingDeal.probability : null,
        businessLineId: editingDeal.businessLineId || null,
        userId: editingDeal.userId || null,
      };

      let savedDealId = editingDeal.id;

      if (editingDeal.id) {
        await dealsService.update(editingDeal.id, payload);
        showNotification('Negocio actualizado correctamente');
      } else {
        const newDeal = await dealsService.create(payload);
        savedDealId = newDeal.id;
        if (creatingDealForActivityId) {
          await activitiesService.update(creatingDealForActivityId, { dealId: newDeal.id });
        }
        showNotification('Negocio creado correctamente');
      }

      if (payload.stage === DealStage.WON && savedDealId) {
        const createProject = window.confirm('Este negocio ha sido marcado como Ganado. ¿Desea crear un proyecto para este negocio?');
        if (createProject) {
          try {
            await projectsService.createFromDeal(savedDealId);
            showNotification('Proyecto creado exitosamente');
          } catch (err: any) {
            showNotification(err?.response?.data?.message || 'Error al crear el proyecto', 'error');
          }
        }
      }

      setShowDealModal(false);
      setEditingDeal(null);
      setCreatingDealForActivityId(null);
      fetchData();
    } catch (err: any) {
      showNotification(err?.response?.data?.message || 'Error al guardar negocio', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDealDrop = async (dealId: string, newStage: DealStage) => {
    try {
      // Optimistic update
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
      await dealsService.update(dealId, { stage: newStage });
    } catch (err) {
      showNotification('Error al mover el negocio', 'error');
      fetchData(); // revert
    }
  };

  // --- Deletions ---
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    
    setIsSubmitting(true);
    try {
      if (deletingId.type === 'account') {
        await accountsService.delete(deletingId.id);
        showNotification('Empresa eliminada permanentemente');
      } else if (deletingId.type === 'contact') {
        await contactsService.delete(deletingId.id);
        showNotification('Contacto eliminado permanentemente');
      } else if (deletingId.type === 'activity') {
        await activitiesService.delete(deletingId.id);
        showNotification('Actividad eliminada permanentemente');
      } else if (deletingId.type === 'deal') {
        await dealsService.delete(deletingId.id);
        showNotification('Negocio eliminado permanentemente');
        if (viewingDeal?.id === deletingId.id) setViewingDeal(null);
      }
      setDeletingId(null);
      fetchData();
    } catch (err: any) {
      showNotification(err?.response?.data?.message || 'Error al eliminar', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filters (Ahora delegados al Backend, excepto los locales)
  const filteredAccounts = accounts.filter(acc => {
    if (accountsFilters.activityStatus && accountsFilters.activityStatus !== 'ALL') {
      const accActivities = activities.filter(a => a.accountId === acc.id);
      if (accountsFilters.activityStatus === 'NO_ACTIVITIES') {
        return accActivities.length === 0;
      }
      if (accountsFilters.activityStatus === 'PLANNED') {
        return accActivities.some(a => a.status === ActivityStatus.PLANNED && !a.completedAt);
      }
      if (accountsFilters.activityStatus === 'COMPLETED') {
        return accActivities.some(a => a.status === ActivityStatus.COMPLETED || !!a.completedAt);
      }
    }
    return true;
  });
  const filteredContacts = contacts.filter(contact => {
    if (contactsFilters.activityStatus && contactsFilters.activityStatus !== 'ALL') {
      const contactActivities = activities.filter(a => a.contactId === contact.id);
      if (contactsFilters.activityStatus === 'NO_ACTIVITIES') {
        return contactActivities.length === 0;
      }
      if (contactsFilters.activityStatus === 'PLANNED') {
        return contactActivities.some(a => a.status === ActivityStatus.PLANNED && !a.completedAt);
      }
      if (contactsFilters.activityStatus === 'COMPLETED') {
        return contactActivities.some(a => a.status === ActivityStatus.COMPLETED || !!a.completedAt);
      }
    }
    return true;
  });
  let filteredActivities = activities;

  if (dashboardActivityStatusFilter === 'PLANNED') {
    filteredActivities = filteredActivities.filter(a => a.status === ActivityStatus.PLANNED && !a.completedAt && a.plannedDate);
  } else if (dashboardActivityStatusFilter === 'NO_DATE') {
    filteredActivities = filteredActivities.filter(a => a.status === ActivityStatus.PLANNED && !a.completedAt && !a.plannedDate);
  } else if (dashboardActivityStatusFilter === 'COMPLETED') {
    filteredActivities = filteredActivities.filter(a => a.status === ActivityStatus.COMPLETED || !!a.completedAt);
  }
  if (dashboardActivityUserFilter !== 'ALL') {
    filteredActivities = filteredActivities.filter(a => a.userId === dashboardActivityUserFilter);
  }

  const getActivityIcon = (type: ActivityType) => {
    switch(type) {
      case ActivityType.CALL: return <PhoneCall size={14} />;
      case ActivityType.EMAIL: return <Mail size={14} />;
      case ActivityType.TASK: return <CheckSquare size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getActivityTypeLabel = (type: ActivityType) => {
    switch(type) {
      case ActivityType.CALL: return 'Llamada';
      case ActivityType.EMAIL: return 'Email';
      case ActivityType.TASK: return 'Tarea';
      default: return type;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch(type) {
      case ActivityType.CALL: return 'text-red-600 bg-red-100';
      case ActivityType.EMAIL: return 'text-blue-600 bg-blue-100';
      case ActivityType.TASK: return 'text-amber-600 bg-amber-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const TabButton = ({ id, icon, label }: { id: Tab, icon: React.ReactNode, label: string }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 pb-3 border-b-2 text-sm font-semibold transition-colors whitespace-nowrap px-1 ${
          isActive 
            ? 'border-[#001c3a] text-[#001c3a]' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        }`}
      >
        {icon} {label}
      </button>
    );
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto min-h-full relative font-sans">
      
      {/* Header & Controls */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-[#001c3a] uppercase tracking-tight">
              CRM
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Gestión comercial de clientes y oportunidades.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${showFilters ? 'bg-[#001c3a] text-white border-[#001c3a]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm'}`}
            >
              <LayoutGrid size={16} /> Filtros
            </button>
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar en CRM..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-4 shadow-sm">
                {activeTab === 'contacts' && (
                  <>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                      <input type="text" value={contactsFilters.name} onChange={(e) => setContactsFilters({...contactsFilters, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                      <input type="text" value={contactsFilters.email} onChange={(e) => setContactsFilters({...contactsFilters, email: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
                      <input type="text" value={contactsFilters.phone} onChange={(e) => setContactsFilters({...contactsFilters, phone: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Empresa</label>
                      <select value={contactsFilters.accountId} onChange={(e) => setContactsFilters({...contactsFilters, accountId: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm">
                        <option value="">Todas</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Cargo</label>
                      <input type="text" placeholder="Ej: Gerente" value={contactsFilters.position} onChange={(e) => setContactsFilters({...contactsFilters, position: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                    </div>

                    <div className="space-y-1.5 w-full md:w-64">
                      <label className="text-xs font-bold text-slate-500 uppercase">Creación (Desde - Hasta)</label>
                      <div className="flex items-center gap-2">
                        <input type="date" value={contactsFilters.startDate} onChange={(e) => setContactsFilters({...contactsFilters, startDate: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={contactsFilters.endDate} onChange={(e) => setContactsFilters({...contactsFilters, endDate: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'deals' && (
                  <>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                      <input type="text" value={dealsFilters.name} onChange={(e) => setDealsFilters({...dealsFilters, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Responsable</label>
                      <select value={dealsFilters.userId} onChange={(e) => setDealsFilters({...dealsFilters, userId: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm">
                        <option value="">Cualquiera</option>
                        {users.map(u => <option key={u.id} value={u.id}>{(u as any).display_name || u.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
                      <select value={dealsFilters.stage} onChange={(e) => setDealsFilters({...dealsFilters, stage: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm">
                        <option value="">Cualquiera</option>
                        {DEAL_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Monto Mínimo</label>
                      <input type="number" value={dealsFilters.amountMin} onChange={(e) => setDealsFilters({...dealsFilters, amountMin: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Monto Máximo</label>
                      <input type="number" value={dealsFilters.amountMax} onChange={(e) => setDealsFilters({...dealsFilters, amountMax: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                    </div>
                    <div className="space-y-1.5 w-full md:w-64">
                      <label className="text-xs font-bold text-slate-500 uppercase">Creación (Desde - Hasta)</label>
                      <div className="flex items-center gap-2">
                        <input type="date" value={dealsFilters.startDate} onChange={(e) => setDealsFilters({...dealsFilters, startDate: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={dealsFilters.endDate} onChange={(e) => setDealsFilters({...dealsFilters, endDate: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5 w-full md:w-64">
                      <label className="text-xs font-bold text-slate-500 uppercase">Cierre Estimado (Desde - Hasta)</label>
                      <div className="flex items-center gap-2">
                        <input type="date" value={dealsFilters.closeDateFrom} onChange={(e) => setDealsFilters({...dealsFilters, closeDateFrom: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={dealsFilters.closeDateTo} onChange={(e) => setDealsFilters({...dealsFilters, closeDateTo: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'dashboard' && (
                  <>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Responsable</label>
                      <select value={activitiesFilters.userId} onChange={(e) => setActivitiesFilters({...activitiesFilters, userId: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm">
                        <option value="">Cualquiera</option>
                        {users.map(u => <option key={u.id} value={u.id}>{(u as any).display_name || u.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                      <select value={activitiesFilters.activityType} onChange={(e) => setActivitiesFilters({...activitiesFilters, activityType: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm">
                        <option value="">Cualquiera</option>
                        <option value={ActivityType.LLAMADA}>Llamada</option>
                        <option value={ActivityType.REUNION_COMERCIAL}>Reunión Comercial</option>
                        <option value={ActivityType.REUNION_SEGUIMIENTO}>Reunión Seguimiento</option>
                        <option value={ActivityType.COTIZACION}>Cotización</option>
                        <option value={ActivityType.SEGUIMIENTO}>Seguimiento</option>
                        <option value={ActivityType.EMAIL}>Email</option>
                        <option value={ActivityType.TASK}>Tarea Genérica</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Resultado</label>
                      <select value={activitiesFilters.result} onChange={(e) => setActivitiesFilters({...activitiesFilters, result: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm">
                        <option value="">Cualquiera</option>
                        <option value={ActivityResult.CALL_BACK}>Llamar más tarde</option>
                        <option value={ActivityResult.INTERESTED}>Interesado</option>
                        <option value={ActivityResult.NO_ANSWER}>No contesta</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 w-full md:w-64">
                      <label className="text-xs font-bold text-slate-500 uppercase">Creación (Desde - Hasta)</label>
                      <div className="flex items-center gap-2">
                        <input type="date" value={activitiesFilters.startDate} onChange={(e) => setActivitiesFilters({...activitiesFilters, startDate: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={activitiesFilters.endDate} onChange={(e) => setActivitiesFilters({...activitiesFilters, endDate: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5 w-full md:w-64">
                      <label className="text-xs font-bold text-slate-500 uppercase">Completado (Desde - Hasta)</label>
                      <div className="flex items-center gap-2">
                        <input type="date" value={activitiesFilters.completedAtFrom} onChange={(e) => setActivitiesFilters({...activitiesFilters, completedAtFrom: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={activitiesFilters.completedAtTo} onChange={(e) => setActivitiesFilters({...activitiesFilters, completedAtTo: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                      </div>
                    </div>
                  </>
                )}
                
                {activeTab === 'accounts' && (
                  <>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                      <input type="text" value={accountsFilters.name} onChange={(e) => setAccountsFilters({...accountsFilters, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">CIF</label>
                      <input type="text" value={accountsFilters.cif} onChange={(e) => setAccountsFilters({...accountsFilters, cif: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Sector</label>
                      <SectorAutocomplete
                        value={accountsFilters.sector}
                        onChange={(val) => setAccountsFilters({...accountsFilters, sector: val})}
                        existingSectors={existingSectors}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Estado Actividades</label>
                      <select value={accountsFilters.activityStatus} onChange={(e) => setAccountsFilters({...accountsFilters, activityStatus: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm">
                        <option value="ALL">Todas</option>
                        <option value="NO_ACTIVITIES">Sin actividades</option>
                        <option value="PLANNED">En planeación</option>
                        <option value="COMPLETED">Completadas</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Ciudad</label>
                      <input type="text" value={accountsFilters.city} onChange={(e) => setAccountsFilters({...accountsFilters, city: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                      <input type="text" value={accountsFilters.email} onChange={(e) => setAccountsFilters({...accountsFilters, email: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                    </div>
                    <div className="space-y-1.5 w-full md:w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
                      <input type="text" value={accountsFilters.phone} onChange={(e) => setAccountsFilters({...accountsFilters, phone: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                    </div>
                    <div className="space-y-1.5 w-full md:w-64">
                      <label className="text-xs font-bold text-slate-500 uppercase">Creación (Desde - Hasta)</label>
                      <div className="flex items-center gap-2">
                        <input type="date" value={accountsFilters.startDate} onChange={(e) => setAccountsFilters({...accountsFilters, startDate: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={accountsFilters.endDate} onChange={(e) => setAccountsFilters({...accountsFilters, endDate: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001c3a] shadow-sm" />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="w-full flex justify-end">
                  <button 
                    onClick={() => {
                      setAccountsFilters({ name: '', cif: '', sector: '', city: '', email: '', phone: '', startDate: '', endDate: '' });
                      setContactsFilters({ name: '', email: '', phone: '', position: '', accountId: '', startDate: '', endDate: '' });
                      setDealsFilters({ name: '', amountMin: '', amountMax: '', stage: '', userId: '', accountId: '', contactId: '', startDate: '', endDate: '', closeDateFrom: '', closeDateTo: '' });
                      setActivitiesFilters({ subject: '', notes: '', activityType: '', result: '', userId: '', dealId: '', accountId: '', contactId: '', parentActivityId: '', startDate: '', endDate: '', completedAtFrom: '', completedAtTo: '' });
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TABS (Como en el mockup) */}
        <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar gap-8">
          <TabButton id="dashboard" icon={<LayoutGrid size={16}/>} label="Panel" />
          <TabButton id="accounts" icon={<Building2 size={16}/>} label="Empresas" />
          <TabButton id="contacts" icon={<Users size={16}/>} label="Contactos" />
          <TabButton id="deals" icon={<TrendingUp size={16}/>} label="Negocios" />
          <TabButton id="quotations" icon={<FileText size={16}/>} label="Cotizaciones" />
          <TabButton id="reports" icon={<BarChart2 size={16}/>} label="Informes CRM" />
          <TabButton id="library" icon={<Book size={16}/>} label="Biblioteca" />
        </div>
      </motion.div>

      {/* Alertas */}
      <div className="fixed top-20 right-4 md:right-8 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 shadow-xl max-w-sm pointer-events-auto"
            >
              <AlertCircle size={20} className="shrink-0" />
              <span className="font-medium text-sm">{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3 shadow-xl max-w-sm pointer-events-auto"
            >
              <CheckCircle size={20} className="shrink-0" />
              <span className="font-medium text-sm">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'dashboard' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden relative z-10"
        >
          {/* Dashboard Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-[#001c3a]" size={20} />
              <h2 className="text-lg font-bold text-slate-800">
                Mis actividades pendientes
              </h2>
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{activities.length}</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
              <select 
                value={dashboardActivityStatusFilter}
                onChange={(e) => setDashboardActivityStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 cursor-pointer shadow-sm"
              >
                <option value="ALL">Todas las actividades</option>
                <option value="PLANNED">Planeadas (Con fecha)</option>
                <option value="NO_DATE">Planeadas (Sin fecha)</option>
                <option value="COMPLETED">Completadas</option>
              </select>

              <select 
                value={dashboardActivityUserFilter}
                onChange={(e) => setDashboardActivityUserFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 cursor-pointer shadow-sm"
              >
                <option value="ALL">Cualquier responsable</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.display_name || u.name}</option>
                ))}
              </select>

              <button 
                onClick={fetchData} 
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all bg-white border border-slate-200 text-slate-600 hover:text-[#001c3a] hover:bg-slate-50 shadow-sm active:scale-95"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>

              <button
                onClick={() => handleExportDashboardActivities('excel')}
                disabled={exportingTarget !== null}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 shadow-sm active:scale-95 disabled:opacity-50"
                title="Exportar a Excel"
              >
                {exportingTarget === 'excel' ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />}
              </button>

              <button
                onClick={() => handleExportDashboardActivities('pdf')}
                disabled={exportingTarget !== null}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:text-red-800 shadow-sm active:scale-95 disabled:opacity-50"
                title="Exportar a PDF"
              >
                {exportingTarget === 'pdf' ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />}
              </button>
              
              <button
                onClick={() => {
                  if (accounts.length === 0) {
                    showNotification('Debes crear al menos una empresa antes', 'error');
                    return;
                  }
                  setEditingActivity({ 
                    subject: '', 
                    activityType: ActivityType.CALL,
                    accountId: accounts[0].id
                  });
                  setShowActivityModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-[#001c3a] text-white hover:bg-slate-800 shadow-md active:scale-95"
              >
                <Plus size={16} /> Nueva actividad
              </button>
            </div>
          </div>

          {/* Activities List */}
          {isLoading && activities.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw size={32} className="animate-spin mb-4 text-[#001c3a]/50" />
              <p className="font-medium text-sm">Cargando actividades...</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="p-4 border-b border-slate-200 w-10"></th>
                    <th className="p-4 border-b border-slate-200">Tipo</th>
                    <th className="p-4 border-b border-slate-200">Asunto</th>
                    <th className="p-4 border-b border-slate-200">Contacto</th>
                    <th className="p-4 border-b border-slate-200">Empresa</th>
                    <th className="p-4 border-b border-slate-200">Fecha Creada</th>
                    <th className="p-4 border-b border-slate-200">Completado</th>
                    <th className="p-4 border-b border-slate-200">Resultado</th>
                    <th className="p-4 border-b border-slate-200 text-right sticky right-0 bg-slate-50 z-20 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {filteredActivities.length > 0 ? (
                      filteredActivities.filter(a => !a.parentActivityId).map((act) => {
                        const children = activities.filter(c => c.parentActivityId === act.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                        return (
                          <React.Fragment key={act.id}>
                            <motion.tr 
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                              onDoubleClick={(e) => { e.stopPropagation(); setRecord360({ id: act.id, type: 'activity', accountId: act.accountId }); }}
                            >
                              <td className="p-4 relative align-middle">
                                <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center bg-white relative z-10">
                                  {act.completedAt && <CheckCircle size={14} className="text-emerald-500" />}
                                </div>
                                {children.length > 0 && (
                                  <div className="absolute left-[25px] top-10 bottom-0 w-px bg-slate-200 z-0"></div>
                                )}
                              </td>
                              <td className="p-4 align-middle">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${getActivityColor(act.activityType)}`}>
                                  {getActivityIcon(act.activityType)}
                                  {getActivityTypeLabel(act.activityType)}
                                </span>
                              </td>
                              <td className="p-4 text-sm font-bold text-slate-800 align-middle">
                                {act.subject}
                                {act.notes && <p className="text-xs font-normal text-slate-500 mt-1 whitespace-pre-wrap leading-relaxed line-clamp-3">{act.notes}</p>}
                                {act.dealId && (
                                  <button 
                                    onClick={() => {
                                      setActiveTab('deals');
                                      const deal = deals.find(d => d.id === act.dealId);
                                      if (deal) {
                                        setViewingDeal(deal);
                                        setHighlightedDealId(deal.id);
                                        setHighlightedActivityId(act.id);
                                        setTimeout(() => setHighlightedActivityId(null), 3000);
                                      }
                                    }}
                                    className="mt-1 text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                  >
                                    <Briefcase size={12} className="text-slate-400" />
                                    <span>Negocio: {deals.find(d => d.id === act.dealId)?.name || 'Desconocido'}</span>
                                  </button>
                                )}
                              </td>
                              <td className="p-4 align-middle">
                                {act.contact?.name ? (
                                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <Users size={14} className="text-slate-400 shrink-0" />
                                    {act.contact.name}
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-400 italic">Sin contacto</div>
                                )}
                              </td>
                              <td className="p-4 align-middle">
                                {act.account?.name ? (
                                  <div className="flex items-center gap-2 text-sm font-medium text-[#001c3a]">
                                    <Building2 size={14} className="text-slate-400 shrink-0" />
                                    {act.account.name}
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-400 italic">Desconocida</div>
                                )}
                              </td>
                              <td className="p-4 text-slate-500 text-sm align-middle">
                                {new Date(act.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-slate-500 text-sm align-middle">
                                {act.completedAt ? new Date(act.completedAt).toLocaleDateString() : '-'}
                              </td>
                              <td className="p-4 align-middle">
                                {act.result ? (
                                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                    {act.result}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">-</span>
                                )}
                              </td>
                              <td className="p-4 text-right sticky right-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                  {!act.dealId && (
                                    <button onClick={() => { 
                                      const acc = accounts.find(a => a.id === act.accountId);
                                      setCreatingDealForActivityId(act.id); 
                                      setEditingDeal({ 
                                        name: acc ? `Nuevo Negocio - ${acc.name}` : act.subject, 
                                        accountId: act.accountId, 
                                        contactId: act.contactId || '', 
                                        stage: DealStage.LEAD 
                                      }); 
                                      setShowDealModal(true); 
                                    }} className="p-2 text-slate-400 hover:text-purple-600 bg-white border border-slate-200 rounded-lg hover:shadow active:scale-95" title="Convertir a Negocio">
                                      <Briefcase size={16} />
                                    </button>
                                  )}
                                  <button onClick={() => { setEditingActivity({ accountId: act.accountId, dealId: act.dealId, parentActivityId: act.id, activityType: ActivityType.SEGUIMIENTO }); setShowActivityModal(true); }} className="p-2 text-slate-400 hover:text-secondary bg-white border border-slate-200 rounded-lg hover:shadow active:scale-95" title="Añadir Seguimiento">
                                    <Plus size={16} />
                                  </button>
                                  <button onClick={() => { setEditingActivity(act); setShowActivityModal(true); }} className="p-2 text-slate-400 hover:text-secondary bg-white border border-slate-200 rounded-lg hover:shadow active:scale-95" title="Editar">
                                    <Edit2 size={16} />
                                  </button>
                                  <button onClick={() => setDeletingId({ id: act.id, type: 'activity' })} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg hover:bg-red-50 active:scale-95" title="Eliminar">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                            
                            {children.map((child, index) => (
                              <motion.tr 
                                key={child.id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="hover:bg-slate-50/80 transition-colors group bg-slate-50/40 cursor-pointer"
                                onDoubleClick={(e) => { e.stopPropagation(); setRecord360({ id: child.id, type: 'activity', accountId: child.accountId }); }}
                              >
                                <td className="p-4 relative align-middle">
                                  <div className={`absolute left-[25px] -top-4 ${index === children.length - 1 ? 'bottom-1/2' : '-bottom-4'} w-px bg-slate-200 z-0`}></div>
                                  <div className="absolute left-[25px] top-1/2 w-4 h-px bg-slate-200 z-0"></div>
                                  <div className="w-4 h-4 ml-8 rounded border-2 border-slate-300 flex items-center justify-center bg-white relative z-10">
                                    {child.completedAt && <CheckCircle size={10} className="text-emerald-500" />}
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-wider font-bold ${getActivityColor(child.activityType)}`}>
                                    <CheckSquare size={10}/>
                                    Respuesta
                                  </span>
                                </td>
                                <td className="p-4 text-sm font-bold text-slate-700 align-middle">
                                  {child.subject}
                                  {child.notes && <p className="text-xs font-normal text-slate-500 mt-1 whitespace-pre-wrap leading-relaxed line-clamp-3">{child.notes}</p>}
                                  {child.dealId && (
                                    <button 
                                      onClick={() => {
                                        setActiveTab('deals');
                                        const deal = deals.find(d => d.id === child.dealId);
                                        if (deal) {
                                          setViewingDeal(deal);
                                          setHighlightedDealId(deal.id);
                                          setHighlightedActivityId(child.id);
                                          setTimeout(() => setHighlightedActivityId(null), 3000);
                                        }
                                      }}
                                      className="mt-1 text-[10px] font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                    >
                                      <Briefcase size={10} className="text-slate-400" />
                                      <span>Ver en negocio</span>
                                    </button>
                                  )}
                                </td>
                                <td className="p-4 align-middle">
                                  {child.contact?.name ? (
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                      <Users size={12} className="text-slate-400 shrink-0" />
                                      {child.contact.name}
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-slate-400 italic">Sin contacto</div>
                                  )}
                                </td>
                                <td className="p-4 align-middle">
                                  {child.account?.name ? (
                                    <div className="flex items-center gap-2 text-xs font-medium text-[#001c3a]">
                                      <Building2 size={12} className="text-slate-400 shrink-0" />
                                      {child.account.name}
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-slate-400 italic">Desconocida</div>
                                  )}
                                </td>
                                <td className="p-4 text-slate-500 text-xs align-middle">
                                  {new Date(child.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-slate-500 text-xs align-middle">
                                  {child.completedAt ? new Date(child.completedAt).toLocaleDateString() : '-'}
                                </td>
                                <td className="p-4 align-middle">
                                  {child.result && <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-lg">{child.result}</span>}
                                </td>
                                <td className="p-4 text-right sticky right-0 bg-slate-50/40 group-hover:bg-slate-50 transition-colors z-10 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    {!child.dealId && (
                                      <button onClick={() => { 
                                        const acc = accounts.find(a => a.id === child.accountId);
                                        setCreatingDealForActivityId(child.id); 
                                        setEditingDeal({ 
                                          name: acc ? `Nuevo Negocio - ${acc.name}` : child.subject, 
                                          accountId: child.accountId, 
                                          contactId: child.contactId || '', 
                                          stage: DealStage.LEAD 
                                        }); 
                                        setShowDealModal(true); 
                                      }} className="p-2 text-slate-400 hover:text-purple-600 bg-white border border-slate-200 rounded-lg hover:shadow active:scale-95" title="Convertir a Negocio">
                                        <Briefcase size={14} />
                                      </button>
                                    )}
                                    <button onClick={() => { setEditingActivity(child); setShowActivityModal(true); }} className="p-2 text-slate-400 hover:text-secondary bg-white border border-slate-200 rounded-lg hover:shadow active:scale-95" title="Editar">
                                      <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => setDeletingId({ id: child.id, type: 'activity' })} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg hover:bg-red-50 active:scale-95">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr><td colSpan={7} className="p-10 text-center text-slate-400 text-sm">No se encontraron actividades pendientes.</td></tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'deals' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">Pipeline de Negocios</h2>
              <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{deals.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                <button
                  onClick={() => setDealsView('kanban')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    dealsView === 'kanban' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid size={14} /> Kanban
                </button>
                <button
                  onClick={() => setDealsView('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    dealsView === 'list' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText size={14} /> Lista
                </button>
              </div>
              <button
                onClick={async () => {
                  try {
                    // Fetch ALL data without any filters for the export
                    const [allDeals, allActivities] = await Promise.all([
                      dealsService.getAll({} as any),
                      activitiesService.getAll({})
                    ]);

                    const exportData = allDeals.map(deal => {
                      const dealActivities = allActivities.filter(a => a.dealId === deal.id);
                      const completed = dealActivities.filter(a => a.status === ActivityStatus.COMPLETED || !!a.completedAt);
                      
                      return {
                        ...deal,
                        totalActivities: dealActivities.length,
                        completedActivities: completed.length
                      };
                    });

                    const filtersInfo = 'Todos (Total histórico)';
                    await exportDealsKpiToExcel(exportData, filtersInfo);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-md active:scale-95"
              >
                <Download size={16} /> Excel
              </button>
              <button onClick={() => { setEditingDeal({ stage: DealStage.LEAD }); setShowDealModal(true); }} className="px-4 py-2 bg-secondary text-white rounded-xl font-bold text-sm hover:bg-secondary-container flex items-center gap-2">
                <Plus size={16} />
                Nuevo Negocio
              </button>
            </div>
          </div>

          {/* KANBAN VIEW */}
          {dealsView === 'kanban' && (
            <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-4 overflow-x-auto hide-scrollbar min-h-[600px]" onClick={() => setHighlightedDealId(null)}>
              <div className="flex gap-4 h-full min-w-max pb-4">
                {DEAL_STAGES.map(stage => (
                  <div 
                    key={stage.value} 
                    className="w-80 shrink-0 flex flex-col bg-slate-100/80 rounded-xl p-3 border border-slate-200/50"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const dealId = e.dataTransfer.getData('dealId');
                      if (dealId) handleDealDrop(dealId, stage.value);
                    }}
                  >
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${stage.color}`}></div> {stage.label}
                      </h3>
                      <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {deals.filter(d => d.stage === stage.value).length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-3 min-h-[100px]">
                      {deals.filter(d => d.stage === stage.value).map(deal => (
                        <div 
                          key={deal.id}
                          id={`deal-card-${deal.id}`}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('dealId', deal.id)}
                          onClick={(e) => { e.stopPropagation(); setViewingDeal(deal); setHighlightedDealId(deal.id); }}
                          onDoubleClick={(e) => { e.stopPropagation(); setRecord360({ id: deal.id, type: 'deal', accountId: deal.accountId }); }}
                          className={`bg-white p-4 rounded-xl border transition-all duration-300 cursor-grab active:cursor-grabbing group ${
                            highlightedDealId === deal.id 
                              ? 'border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.3)] bg-amber-50/40 ring-1 ring-amber-400 z-10 relative'
                              : `border-slate-200 shadow-sm hover:shadow-md ${stage.value === DealStage.WON ? 'bg-emerald-50 border-emerald-200' : stage.value === DealStage.LOST ? 'bg-red-50 border-red-200' : ''}`
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="text-xs font-bold text-blue-600 truncate mr-2">{deal.account?.name || 'Empresa Desconocida'}</div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white shadow-sm border border-slate-100 rounded-lg p-1">
                              {deal.quotations && deal.quotations.length > 0 ? (
                                <button onClick={(e) => { e.stopPropagation(); setActiveTab('quotations'); setViewingQuotationId(deal.quotations![0].id); }} className="p-1 text-purple-600 hover:text-purple-700 rounded hover:bg-purple-50" title="Ver Cotización"><FileText size={12} /></button>
                              ) : (
                                <button onClick={(e) => { e.stopPropagation(); setCreatingQuotationForDeal(deal); setShowQuotationModal(true); }} className="p-1 text-slate-400 hover:text-purple-600 rounded hover:bg-purple-50" title="Crear Cotización Manual"><FileText size={12} /></button>
                              )}

                              <button onClick={(e) => { e.stopPropagation(); setEditingDeal(deal); setShowDealModal(true); }} className="p-1 text-slate-400 hover:text-secondary rounded hover:bg-red-50"><Edit2 size={12} /></button>
                              <button onClick={(e) => { e.stopPropagation(); setDeletingId({ id: deal.id, type: 'deal' }); }} className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50"><Trash2 size={12} /></button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-slate-800 text-sm break-all">{deal.name}</h4>
                            {deal.quotations && deal.quotations.length > 0 && (
                              <div className="shrink-0 flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md font-bold" title="Cotización creada">
                                <FileText size={10} />
                                Cotizado
                              </div>
                            )}
                          </div>
                          {deal.businessLine && (
                            <div className="mb-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                                {deal.businessLine.name}
                              </span>
                            </div>
                          )}
                          <div className="text-xs text-slate-500 flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                              <span className={`font-bold ${stage.value === DealStage.WON ? 'text-emerald-600' : stage.value === DealStage.LOST ? 'text-red-600' : ''}`}>
                                {deal.amount != null ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(deal.amount) : '-'}
                              </span>
                              {deal.probability != null && (
                                <span className="text-[10px] font-medium flex items-center gap-1 text-slate-500">
                                  🎯 {deal.probability}% Prob.
                                </span>
                              )}
                            </div>
                            {deal.closeDate && (
                              <span className="flex items-center gap-1 mt-0.5"><Clock size={12}/> {new Date(deal.closeDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIST VIEW */}
          {dealsView === 'list' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" onClick={() => setHighlightedDealId(null)}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wide">Negocio</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wide">Empresa</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wide">Contacto</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wide">Etapa</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wide">Monto</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wide">Prob.</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wide">Responsable</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wide">Línea de Negocio</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wide">Cierre</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wide text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {deals.length > 0 ? deals.map((deal) => {
                      const stageInfo = DEAL_STAGES.find(s => s.value === deal.stage);
                      return (
                        <motion.tr
                          key={deal.id}
                          id={`deal-card-${deal.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`border-b border-slate-100 group cursor-pointer transition-all duration-300 ${
                            highlightedDealId === deal.id
                              ? 'bg-amber-50 shadow-[inset_4px_0_0_0_rgba(251,191,36,1)] relative z-10'
                              : 'hover:bg-slate-50'
                          }`}
                          onClick={(e) => { e.stopPropagation(); setViewingDeal(deal); setHighlightedDealId(deal.id); }}
                          onDoubleClick={(e) => { e.stopPropagation(); setRecord360({ id: deal.id, type: 'deal', accountId: deal.accountId }); }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2 font-bold text-slate-800">
                              {deal.name}
                              {deal.quotations && deal.quotations.length > 0 && (
                                <div className="shrink-0 flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md font-bold" title="Cotización creada">
                                  <FileText size={10} />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-blue-600 font-medium">{deal.account?.name || '-'}</td>
                          <td className="p-4 text-sm text-slate-500">{deal.contact?.name || '-'}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100">
                              <div className={`w-1.5 h-1.5 rounded-full ${stageInfo?.color || 'bg-slate-400'}`}></div>
                              <span className="text-slate-700">{stageInfo?.label || deal.stage}</span>
                            </span>
                          </td>
                          <td className="p-4 text-sm font-bold">
                            <span className={`${deal.stage === DealStage.WON ? 'text-emerald-600' : deal.stage === DealStage.LOST ? 'text-red-500' : 'text-slate-800'}`}>
                              {deal.amount != null ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(deal.amount) : '-'}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-500">
                            {deal.probability != null ? (
                              <span className="flex items-center gap-1 font-medium">🎯 {deal.probability}%</span>
                            ) : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="p-4 text-sm text-slate-500 font-medium">
                            {deal.user ? deal.user.name : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="p-4">
                            {deal.businessLine ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                                {deal.businessLine.name}
                              </span>
                            ) : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="p-4 text-xs text-slate-500">
                            {deal.closeDate ? (
                              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(deal.closeDate).toLocaleDateString()}</span>
                            ) : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              {deal.quotations && deal.quotations.length > 0 ? (
                                <button onClick={(e) => { e.stopPropagation(); setActiveTab('quotations'); setViewingQuotationId(deal.quotations![0].id); }} className="p-2 text-purple-600 hover:text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:shadow active:scale-95 transition-all" title="Ver Cotización">
                                  <FileText size={16} />
                                </button>
                              ) : (
                                <button onClick={(e) => { e.stopPropagation(); setCreatingQuotationForDeal(deal); setShowQuotationModal(true); }} className="p-2 text-slate-400 hover:text-purple-600 bg-white border border-slate-200 rounded-lg hover:shadow hover:border-purple-200 active:scale-95 transition-all" title="Crear Cotización Manual">
                                  <FileText size={16} />
                                </button>
                              )}

                              <button onClick={(e) => { e.stopPropagation(); setViewingDeal(deal); setHighlightedDealId(deal.id); }} className="p-2 text-slate-400 hover:text-secondary bg-white border border-slate-200 rounded-lg hover:shadow active:scale-95" title="Ver historial">
                                <Calendar size={14} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setEditingDeal(deal); setShowDealModal(true); }} className="p-2 text-slate-400 hover:text-secondary bg-white border border-slate-200 rounded-lg hover:shadow active:scale-95" title="Editar">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setDeletingId({ id: deal.id, type: 'deal' }); }} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg hover:bg-red-50 active:scale-95" title="Eliminar">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={9} className="p-10 text-center text-slate-400 text-sm">No se encontraron negocios.</td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'quotations' && (
        viewingQuotationId ? (
          <QuotationDetailView
            quotationId={viewingQuotationId}
            onBack={() => setViewingQuotationId(null)}
            onDeleted={() => {
              setViewingQuotationId(null);
              fetchData();
            }}
            businessLines={businessLines}
            users={users}
          />
        ) : (
          <QuotationListView 
            businessLines={businessLines}
            users={users}
            onViewDetail={setViewingQuotationId}
            onCreateNew={() => { setCreatingQuotationForDeal(null); setShowQuotationModal(true); }}
            onDoubleClickQuotation={(id, accountId) => setRecord360({ id, type: 'quotation', accountId })}
          />
        )
      )}

      {activeTab === 'reports' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[600px]">
          <CrmReportsView users={users} />
        </motion.div>
      )}

      {activeTab === 'library' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[600px]">
          <LibraryView />
        </motion.div>
      )}

      {(activeTab === 'accounts' || activeTab === 'contacts') && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden relative z-10"
        >
          {/* Header Action Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1 w-full">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                {activeTab === 'accounts' ? <Building2 size={20} className="text-blue-600"/> : <Users size={20} className="text-blue-600"/>}
                {activeTab === 'accounts' ? 'Listado de Empresas' : 'Directorio de Contactos'}
              </h2>
              
              {activeTab === 'accounts' && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Sector:</span>
                    <SectorAutocomplete 
                        value={accountsFilters.sector} 
                        onChange={(val) => setAccountsFilters({...accountsFilters, sector: val})} 
                        existingSectors={existingSectors}
                        className="text-sm font-medium text-slate-700 bg-transparent border-none focus:outline-none w-28 placeholder-slate-300" 
                      />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Actividades:</span>
                    <select 
                      value={accountsFilters.activityStatus} 
                      onChange={(e) => setAccountsFilters({...accountsFilters, activityStatus: e.target.value})} 
                      className="text-sm font-medium text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer pr-2"
                    >
                      <option value="ALL">Todas</option>
                      <option value="NO_ACTIVITIES">Sin actividades</option>
                      <option value="PLANNED">En planeación</option>
                      <option value="COMPLETED">Completadas</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Actividades:</span>
                    <select 
                      value={contactsFilters.activityStatus} 
                      onChange={(e) => setContactsFilters({...contactsFilters, activityStatus: e.target.value})} 
                      className="text-sm font-medium text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer pr-2"
                    >
                      <option value="ALL">Todas</option>
                      <option value="NO_ACTIVITIES">Sin actividades</option>
                      <option value="PLANNED">En planeación</option>
                      <option value="COMPLETED">Completadas</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0 justify-start xl:justify-end">
              {activeTab === 'accounts' && (
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase hidden sm:inline">Ordenar por:</span>
                  <select 
                    value={`${accountsFilters.orderBy}-${accountsFilters.orderDir}`}
                    onChange={(e) => {
                      const [orderBy, orderDir] = e.target.value.split('-');
                      setAccountsFilters(prev => ({ ...prev, orderBy, orderDir: orderDir as 'asc' | 'desc' }));
                    }}
                    className="text-sm font-medium text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value="createdAt-desc">Más recientes</option>
                    <option value="createdAt-asc">Más antiguas</option>
                    <option value="name-asc">Nombre (A-Z)</option>
                    <option value="name-desc">Nombre (Z-A)</option>
                  </select>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase hidden sm:inline">Ordenar por:</span>
                  <select 
                    value={`${contactsFilters.orderBy}-${contactsFilters.orderDir}`}
                    onChange={(e) => {
                      const [orderBy, orderDir] = e.target.value.split('-');
                      setContactsFilters(prev => ({ ...prev, orderBy, orderDir: orderDir as 'asc' | 'desc' }));
                    }}
                    className="text-sm font-medium text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value="createdAt-desc">Más recientes</option>
                    <option value="createdAt-asc">Más antiguos</option>
                    <option value="name-asc">Nombre (A-Z)</option>
                    <option value="name-desc">Nombre (Z-A)</option>
                  </select>
                </div>
              )}

              {activeTab === 'accounts' && (
                <button
                  onClick={async () => {
                    try {
                      // Fetch ALL data without any filters for the export
                      const [allAccounts, allActivities, allDeals, allProjects] = await Promise.all([
                        accountsService.getAll({}),
                        activitiesService.getAll({}),
                        dealsService.getAll({} as any),
                        projectsService.getAll()
                      ]);

                      const exportData = allAccounts.map(acc => {
                        const accActivities = allActivities.filter(a => a.accountId === acc.id);
                        const planned = accActivities.filter(a => a.status === ActivityStatus.PLANNED && !a.completedAt);
                        const completed = accActivities.filter(a => a.status === ActivityStatus.COMPLETED || !!a.completedAt);
                        const accDeals = allDeals.filter(d => d.accountId === acc.id);
                        
                        return {
                          id: acc.id,
                          name: acc.name,
                          sector: acc.sector || 'Sin Sector',
                          isContacted: accActivities.length > 0,
                          totalActivities: accActivities.length,
                          completedActivities: completed.length,
                          plannedWithDate: planned.filter(a => a.date).length,
                          plannedWithoutDate: planned.filter(a => !a.date).length,
                          breakdown: {
                            calls: accActivities.filter(a => a.activityType === ActivityType.CALL || a.activityType === ActivityType.LLAMADA).length,
                            emails: accActivities.filter(a => a.activityType === ActivityType.EMAIL).length,
                            meetings: accActivities.filter(a => a.activityType === ActivityType.REUNION_COMERCIAL || a.activityType === ActivityType.REUNION_SEGUIMIENTO).length
                          },
                          activeProjects: (allProjects || []).filter(p => p.accountId === acc.id && p.status !== 'COMPLETED').length,
                          totalQuoted: accDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
                          activeDeals: accDeals.filter(d => d.stage !== DealStage.WON && d.stage !== DealStage.LOST).length,
                          pipelineAmount: accDeals.filter(d => d.stage !== DealStage.WON && d.stage !== DealStage.LOST).reduce((sum, d) => sum + (d.amount || 0), 0),
                          lastContactDate: accActivities.length ? accActivities.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt : null,
                          nextContactDate: planned.length ? planned.sort((a,b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime())[0].date : null,
                          contactsFollowedUp: acc.contacts?.map(c => c.name) || []
                        };
                      });

                      const filtersInfo = 'Todos (Total histórico)';
                      await exportAccountsKpiToExcel(exportData, filtersInfo);
                    } catch (err) {
                      console.error(err);
                      showNotification('Error al exportar el informe de empresas', 'error');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-md active:scale-95"
                >
                  <Download size={16} /> Excel
                </button>
              )}

              {activeTab === 'contacts' && (
                <button
                  onClick={async () => {
                    try {
                      // Fetch ALL data without any filters for the export
                      const [allContacts, allActivities] = await Promise.all([
                        contactsService.getAll({}),
                        activitiesService.getAll({})
                      ]);

                      const exportData = allContacts.map(contact => {
                        const contactActivities = allActivities.filter(a => a.contactId === contact.id);
                        const planned = contactActivities.filter(a => a.status === ActivityStatus.PLANNED && !a.completedAt);
                        const completed = contactActivities.filter(a => a.status === ActivityStatus.COMPLETED || !!a.completedAt);
                        
                        return {
                          id: contact.id,
                          name: contact.name,
                          email: contact.email,
                          position: contact.position || 'Sin Cargo',
                          phone: contact.phone,
                          accountName: contact.account?.name || 'Desconocida',
                          totalActivities: contactActivities.length,
                          completedActivities: completed.length,
                          plannedWithDate: planned.filter(a => a.date).length,
                          plannedWithoutDate: planned.filter(a => !a.date).length,
                          breakdown: {
                            calls: contactActivities.filter(a => a.activityType === ActivityType.CALL || a.activityType === ActivityType.LLAMADA).length,
                            emails: contactActivities.filter(a => a.activityType === ActivityType.EMAIL).length,
                            meetings: contactActivities.filter(a => a.activityType === ActivityType.REUNION_COMERCIAL || a.activityType === ActivityType.REUNION_SEGUIMIENTO).length
                          },
                          lastContactDate: contactActivities.length ? contactActivities.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt : null,
                          nextContactDate: planned.length ? planned.sort((a,b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime())[0].date : null
                        };
                      });

                      const filtersInfo = 'Todos (Total histórico)';
                      await exportContactsKpiToExcel(exportData, filtersInfo);
                    } catch (err) {
                      console.error(err);
                      showNotification('Error al exportar el informe de contactos', 'error');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-md active:scale-95"
                >
                  <Download size={16} /> Excel
                </button>
              )}

              {(activeTab === 'accounts' || activeTab === 'contacts') && (
                <>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleExcelImport}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-[#001c3a] text-white hover:bg-blue-900 shadow-md active:scale-95 ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <Download size={16} className="rotate-180" /> Importar
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  if (activeTab === 'accounts') {
                    setEditingAccount({ name: '' });
                    setShowAccountModal(true);
                  } else {
                    if (accounts.length === 0) {
                      showNotification('Debes crear al menos una empresa antes', 'error');
                      return;
                    }
                    setEditingContact({ accountId: accounts[0].id, name: '', email: '', phone: '' });
                    setShowContactModal(true);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-[#001c3a] text-white hover:bg-slate-800 shadow-md active:scale-95"
              >
                <Plus size={16} /> Nuevo {activeTab === 'accounts' ? 'Registro' : 'Contacto'}
              </button>
              {activeTab === 'accounts' && (
                <button
                  onClick={toggleBulkSelectionMode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                    isBulkSelectionMode 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckSquare size={16} /> 
                  {isBulkSelectionMode ? 'Cancelar Selección' : 'Selección Múltiple'}
                </button>
              )}

              {isBulkSelectionMode && selectedAccounts.size > 0 && activeTab === 'accounts' && (
                <button
                  onClick={() => setShowBulkActivityModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-md active:scale-95"
                >
                  <Wand2 size={16} /> Crear Plan ({selectedAccounts.size})
                </button>
              )}

              {activeTab === 'contacts' && (
                <button
                  onClick={toggleBulkSelectionMode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                    isBulkSelectionModeContacts 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckSquare size={16} /> 
                  {isBulkSelectionModeContacts ? 'Cancelar Selección' : 'Selección Múltiple'}
                </button>
              )}

              {isBulkSelectionModeContacts && selectedContacts.size > 0 && activeTab === 'contacts' && (
                <button
                  onClick={() => setShowBulkActivityModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-md active:scale-95"
                >
                  <Wand2 size={16} /> Crear Plan ({selectedContacts.size})
                </button>
              )}
            </div>
          </div>

          {/* LOADING STATE */}
          {isLoading && (accounts.length === 0 || contacts.length === 0) ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw size={32} className="animate-spin mb-4 text-[#001c3a]/50" />
              <p className="font-medium text-sm">Cargando datos comerciales...</p>
            </div>
          ) : (
          <div className="overflow-x-auto custom-scrollbar">
            
            {/* DATA TABLE: ACCOUNTS */}
            {activeTab === 'accounts' && (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    {isBulkSelectionMode && (
                      <th className="p-5 border-b border-slate-200 w-12 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded text-[#001c3a] focus:ring-[#001c3a] border-slate-300 cursor-pointer"
                          checked={filteredAccounts.length > 0 && selectedAccounts.size === filteredAccounts.length}
                          onChange={toggleAllFilteredAccounts}
                        />
                      </th>
                    )}
                    <th 
                      className="p-5 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSortAccounts('name')}
                    >
                      <div className="flex items-center gap-2">
                        Razón Social / Empresa
                        {accountsFilters.orderBy === 'name' && (
                          <ChevronDown size={14} className={`transform transition-transform ${accountsFilters.orderDir === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th className="p-5 border-b border-slate-200 text-center">Contactos Asociados</th>
                    <th className="p-5 border-b border-slate-200 text-center">Total Actividades</th>
                    <th className="p-5 border-b border-slate-200 text-center">En Planeación</th>
                    <th className="p-5 border-b border-slate-200 text-center">Completadas</th>
                    <th 
                      className="p-5 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSortAccounts('createdAt')}
                    >
                      <div className="flex items-center gap-2">
                        Alta en Sistema
                        {accountsFilters.orderBy === 'createdAt' && (
                          <ChevronDown size={14} className={`transform transition-transform ${accountsFilters.orderDir === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th className="p-5 border-b border-slate-200 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((acc, idx) => {
                        const accActivities = activities.filter(a => a.accountId === acc.id);
                        const plannedCount = accActivities.filter(a => a.status === ActivityStatus.PLANNED && !a.completedAt).length;
                        const completedCount = accActivities.filter(a => a.status === ActivityStatus.COMPLETED || !!a.completedAt).length;
                        
                        return (
                        <motion.tr 
                          key={acc.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          onClick={() => isBulkSelectionMode ? toggleAccountSelection(acc.id) : null}
                          className={`transition-colors group ${isBulkSelectionMode ? 'cursor-pointer hover:bg-slate-100' : 'hover:bg-slate-50/80'} ${selectedAccounts.has(acc.id) ? 'bg-[#001c3a]/5' : ''}`}
                          onDoubleClick={() => !isBulkSelectionMode && setRecord360({ id: acc.id, type: 'account', accountId: acc.id })}
                        >
                          {isBulkSelectionMode && (
                            <td className="p-5 text-center" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" className="w-4 h-4 rounded text-[#001c3a] focus:ring-[#001c3a] border-slate-300 cursor-pointer"
                                checked={selectedAccounts.has(acc.id)}
                                onChange={() => toggleAccountSelection(acc.id)}
                              />
                            </td>
                          )}
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                {acc.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-slate-800 font-bold">{acc.name}</span>
                            </div>
                          </td>
                          <td className="p-5 text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                              <Users size={12} /> {acc.contacts?.length || 0}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                              <LayoutGrid size={12} /> {accActivities.length}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                            {plannedCount > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
                                <Clock size={12} /> {plannedCount}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="p-5 text-center">
                            {completedCount > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                                <CheckCircle size={12} /> {completedCount}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="p-5 text-slate-500 text-sm">
                            {new Date(acc.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => { setEditingAccount(acc); setShowAccountModal(true); }} className="p-2 text-slate-400 hover:text-secondary bg-white border border-slate-200 rounded-lg hover:shadow active:scale-95">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => setDeletingId({ id: acc.id, type: 'account' })} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg hover:bg-red-50 active:scale-95">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan={4} className="p-10 text-center text-slate-400 text-sm">No se encontraron empresas.</td></tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            )}

            {/* DATA TABLE: CONTACTS */}
            {activeTab === 'contacts' && (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    {isBulkSelectionModeContacts && (
                      <th className="p-5 border-b border-slate-200 w-12 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded text-[#001c3a] focus:ring-[#001c3a] border-slate-300 cursor-pointer"
                          checked={filteredContacts.length > 0 && selectedContacts.size === filteredContacts.length}
                          onChange={toggleAllFilteredContacts}
                        />
                      </th>
                    )}
                    <th 
                      className="p-5 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSortContacts('name')}
                    >
                      <div className="flex items-center gap-2">
                        Contacto
                        {contactsFilters.orderBy === 'name' && (
                          <ChevronDown size={14} className={`transform transition-transform ${contactsFilters.orderDir === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th className="p-5 border-b border-slate-200">Email</th>
                    <th className="p-5 border-b border-slate-200 text-center">Actividades</th>
                    <th className="p-5 border-b border-slate-200">Cargo</th>
                    <th className="p-5 border-b border-slate-200">Teléfono</th>
                    <th className="p-5 border-b border-slate-200">Empresa (Cuenta)</th>
                    <th className="p-5 border-b border-slate-200 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {filteredContacts.length > 0 ? (
                      filteredContacts.map((contact) => {
                        const contactActivitiesCount = activities.filter(a => a.contactId === contact.id).length;
                        return (
                        <motion.tr 
                          key={contact.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          onClick={() => isBulkSelectionModeContacts ? toggleContactSelection(contact.id) : null}
                          className={`transition-colors group ${isBulkSelectionModeContacts ? 'cursor-pointer hover:bg-slate-100' : 'hover:bg-slate-50/80'} ${selectedContacts.has(contact.id) ? 'bg-[#001c3a]/5' : ''}`}
                          onDoubleClick={() => !isBulkSelectionModeContacts && setRecord360({ id: contact.id, type: 'contact', accountId: contact.accountId })}
                        >
                          {isBulkSelectionModeContacts && (
                            <td className="p-5 text-center" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" className="w-4 h-4 rounded text-[#001c3a] focus:ring-[#001c3a] border-slate-300 cursor-pointer"
                                checked={selectedContacts.has(contact.id)}
                                onChange={() => toggleContactSelection(contact.id)}
                              />
                            </td>
                          )}
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                                {(contact.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-slate-800 font-bold">{contact.name || 'Sin Nombre'}</span>
                            </div>
                          </td>
                          <td className="p-5 text-slate-500 text-sm flex items-center gap-2">
                            <Mail size={14} className="text-slate-400"/> {contact.email || '-'}
                          </td>
                          <td className="p-5 text-center">
                            <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                              {contactActivitiesCount}
                            </span>
                          </td>
                          <td className="p-5 text-slate-500 text-sm">
                            {contact.position || '-'}
                          </td>
                          <td className="p-5 text-slate-500 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-slate-400"/> {contact.phone || '-'}
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-[#001c3a]">
                              <Briefcase size={14} className="text-slate-400" />
                              {contact.account?.name || 'Desconocida'}
                            </div>
                          </td>
                          <td className="p-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => { setEditingContact(contact); setShowContactModal(true); }} className="p-2 text-slate-400 hover:text-secondary bg-white border border-slate-200 rounded-lg hover:shadow active:scale-95">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => setDeletingId({ id: contact.id, type: 'contact' })} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg hover:bg-red-50 active:scale-95">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan={7} className="p-10 text-center text-slate-400 text-sm">No se encontraron contactos.</td></tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        )}
        </motion.div>
      )}

      {/* --- MODAL: EMPRESA --- */}
      <AnimatePresence>
        {showAccountModal && editingAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAccountModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative z-10 border border-slate-200">
              <h2 className="text-xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Building2 className="text-[#001c3a]" />
                {editingAccount.id ? 'Editar Empresa' : 'Nueva Empresa'}
              </h2>
              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Razón Social o Nombre <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={editingAccount.name || ''}
                    onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    placeholder="Ej. Coastline S.L."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">CIF / Documento</label>
                    <input
                      type="text"
                      value={editingAccount.cif || ''}
                      onChange={(e) => setEditingAccount({...editingAccount, cif: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                      placeholder="Ej. B12345678"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sector</label>
                    <SectorAutocomplete
                      value={editingAccount.sector || ''}
                      onChange={(val) => setEditingAccount({...editingAccount, sector: val})}
                      existingSectors={existingSectors}
                      className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                      placeholder="Ej. Constructoras"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email General</label>
                    <input
                      type="email"
                      value={editingAccount.email || ''}
                      onChange={(e) => setEditingAccount({...editingAccount, email: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Teléfono</label>
                    <input
                      type="tel"
                      value={editingAccount.phone || ''}
                      onChange={(e) => setEditingAccount({...editingAccount, phone: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ciudad</label>
                  <input
                    type="text"
                    value={editingAccount.city || ''}
                    onChange={(e) => setEditingAccount({...editingAccount, city: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowAccountModal(false)} className="px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all active:scale-95">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-secondary text-white hover:bg-secondary-container rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg">
                    {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: CONTACTO --- */}
      <AnimatePresence>
        {showContactModal && editingContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowContactModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative z-10 border border-slate-200">
              <h2 className="text-xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Users className="text-secondary" />
                {editingContact.id ? 'Editar Contacto' : 'Nuevo Contacto'}
              </h2>
              <form onSubmit={handleSaveContact} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Empresa Asociada</label>
                  <SearchableAccountSelect
                    accounts={accounts}
                    value={editingContact.accountId || ''}
                    onChange={(id) => setEditingContact({...editingContact, accountId: id})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre Completo</label>
                  <input
                    required
                    type="text"
                    value={editingContact.name || ''}
                    onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cargo</label>
                  <input
                    type="text"
                    value={editingContact.position || ''}
                    onChange={(e) => setEditingContact({...editingContact, position: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
                  <input
                    required
                    type="email"
                    value={editingContact.email || ''}
                    onChange={(e) => setEditingContact({...editingContact, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Teléfono (Opcional)</label>
                  <input
                    type="tel"
                    value={editingContact.phone || ''}
                    onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowContactModal(false)} className="px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all active:scale-95">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-secondary text-white hover:bg-secondary-container rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg">
                    {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: ACTIVIDAD --- */}
      <AnimatePresence>
        {showActivityModal && editingActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowActivityModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative z-10 border border-slate-200 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="text-[#001c3a]" />
                {editingActivity.id ? 'Editar Actividad' : 'Nueva Actividad'}
              </h2>
              <form onSubmit={handleSaveActivity} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Asunto</label>
                  <input
                    required
                    type="text"
                    value={editingActivity.subject || ''}
                    onChange={(e) => setEditingActivity({...editingActivity, subject: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    placeholder="Ej. Llamada de seguimiento"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tipo de Actividad</label>
                    <select
                      required
                      value={editingActivity.activityType || ''}
                      onChange={(e) => setEditingActivity({...editingActivity, activityType: e.target.value as ActivityType})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    >
                      <option value={ActivityType.LLAMADA}>Llamada</option>
                      <option value={ActivityType.REUNION_COMERCIAL}>Reunión Comercial</option>
                      <option value={ActivityType.REUNION_SEGUIMIENTO}>Reunión Seguimiento</option>
                      <option value={ActivityType.COTIZACION}>Cotización</option>
                      <option value={ActivityType.SEGUIMIENTO}>Seguimiento</option>
                      <option value={ActivityType.EMAIL}>Email</option>
                      <option value={ActivityType.TASK}>Tarea Genérica</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Empresa</label>
                    <SearchableAccountSelect
                      accounts={accounts}
                      value={editingActivity.accountId || ''}
                      onChange={(id) => setEditingActivity({...editingActivity, accountId: id, contactId: ''})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Contacto (Opcional)</label>
                    <select
                      value={editingActivity.contactId || ''}
                      onChange={(e) => setEditingActivity({...editingActivity, contactId: e.target.value})}
                      disabled={!editingActivity.accountId}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 disabled:opacity-50"
                    >
                      <option value="">Sin contacto</option>
                      {contacts.filter(c => c.accountId === editingActivity.accountId).map(contact => (
                        <option key={contact.id} value={contact.id}>{contact.name || contact.email}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Negocio (Opcional)</label>
                    <select
                      value={editingActivity.dealId || ''}
                      onChange={(e) => setEditingActivity({...editingActivity, dealId: e.target.value})}
                      disabled={!editingActivity.accountId}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 disabled:opacity-50"
                    >
                      <option value="">Sin negocio asociado</option>
                      {deals.filter(d => d.accountId === editingActivity.accountId).map(deal => (
                        <option key={deal.id} value={deal.id}>{deal.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Responsable</label>
                    <select
                      value={editingActivity.userId || ''}
                      onChange={(e) => setEditingActivity({...editingActivity, userId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    >
                      <option value="">Sin asignar</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{(user as any).display_name || user.name || user.email}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Notas (Opcional)</label>
                  <textarea
                    rows={3}
                    value={editingActivity.notes || ''}
                    onChange={(e) => setEditingActivity({...editingActivity, notes: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 custom-scrollbar"
                    placeholder="Añade notas sobre la actividad..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Resultado (Opcional)</label>
                    <select
                      value={editingActivity.result || ''}
                      onChange={(e) => setEditingActivity({...editingActivity, result: e.target.value as ActivityResult || null})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    >
                      <option value="">Sin resultado</option>
                      <option value={ActivityResult.CALL_BACK}>Llamar más tarde</option>
                      <option value={ActivityResult.INTERESTED}>Interesado</option>
                      <option value={ActivityResult.NO_ANSWER}>No responde</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Fecha de Completado</label>
                    <input
                      type="date"
                      value={editingActivity.completedAt ? editingActivity.completedAt.split('T')[0] : ''}
                      onChange={(e) => setEditingActivity({...editingActivity, completedAt: e.target.value ? new Date(e.target.value).toISOString() : null})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowActivityModal(false)} className="px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all active:scale-95">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-secondary text-white hover:bg-secondary-container rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg">
                    {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: DEAL (NEGOCIO) --- */}
      <AnimatePresence>
        {showDealModal && editingDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowDealModal(false); setCreatingDealForActivityId(null); }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative z-10 border border-slate-200">
              <h2 className="text-xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Briefcase className="text-[#001c3a]" />
                {editingDeal.id ? 'Editar Negocio' : 'Nuevo Negocio'}
              </h2>
              <form onSubmit={handleSaveDeal} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre del Negocio</label>
                  <input
                    required
                    type="text"
                    value={editingDeal.name || ''}
                    onChange={(e) => setEditingDeal({...editingDeal, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    placeholder="Ej. Proyecto Climatización"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Empresa</label>
                    <SearchableAccountSelect
                      accounts={accounts}
                      value={editingDeal.accountId || ''}
                      onChange={(id) => {
                        const currentName = editingDeal.name || '';
                        const acc = accounts.find(a => a.id === id);
                        const bl = businessLines.find(b => b.id === editingDeal.businessLineId);
                        
                        const getBlCode = (name: string) => {
                          const words = name.trim().split(/\s+/);
                          return words.length > 1 ? words.map(w => w[0]).join('').toUpperCase().substring(0, 4) : name.substring(0, 4).toUpperCase();
                        };

                        let autoName = currentName;
                        if (!currentName || currentName.startsWith('Nuevo Negocio ') || currentName.includes(' - ')) {
                          if (acc && bl) autoName = `${getBlCode(bl.name)} - ${acc.name}`;
                          else if (acc) autoName = `Nuevo Negocio - ${acc.name}`;
                        }
                        setEditingDeal({...editingDeal, accountId: id, contactId: '', name: autoName});
                      }}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Contacto (Opcional)</label>
                    <select
                      value={editingDeal.contactId || ''}
                      onChange={(e) => setEditingDeal({...editingDeal, contactId: e.target.value})}
                      disabled={!editingDeal.accountId}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50 disabled:opacity-50"
                    >
                      <option value="">Sin contacto</option>
                      {contacts.filter(c => c.accountId === editingDeal.accountId).map(contact => (
                        <option key={contact.id} value={contact.id}>{contact.name || contact.email}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Monto Estimado (€)</label>
                    <input
                      type="number"
                      value={editingDeal.amount || ''}
                      onChange={(e) => setEditingDeal({...editingDeal, amount: e.target.value ? parseFloat(e.target.value) : null})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Probabilidad (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingDeal.probability || ''}
                      onChange={(e) => setEditingDeal({...editingDeal, probability: e.target.value ? parseFloat(e.target.value) : null})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                      placeholder="Ej: 50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Etapa</label>
                    <select
                      required
                      value={editingDeal.stage || DealStage.LEAD}
                      onChange={(e) => setEditingDeal({...editingDeal, stage: e.target.value as DealStage})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    >
                      {DEAL_STAGES.map(stage => (
                        <option key={stage.value} value={stage.value}>{stage.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Línea de Negocio</label>
                    <select
                      required
                      value={editingDeal.businessLineId || ''}
                      onChange={(e) => {
                        const newBlId = e.target.value;
                        const currentName = editingDeal.name || '';
                        const acc = accounts.find(a => a.id === editingDeal.accountId);
                        const bl = businessLines.find(b => b.id === newBlId);

                        const getBlCode = (name: string) => {
                          const words = name.trim().split(/\s+/);
                          return words.length > 1 ? words.map(w => w[0]).join('').toUpperCase().substring(0, 4) : name.substring(0, 4).toUpperCase();
                        };

                        let autoName = currentName;
                        if (!currentName || currentName.startsWith('Nuevo Negocio ') || currentName.includes(' - ')) {
                          if (acc && bl) autoName = `${getBlCode(bl.name)} - ${acc.name}`;
                          else if (bl) autoName = `${getBlCode(bl.name)}`;
                        }
                        setEditingDeal({...editingDeal, businessLineId: newBlId, name: autoName});
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    >
                      <option value="" disabled>Seleccionar...</option>
                      {businessLines.map(bl => (
                        <option key={bl.id} value={bl.id}>{bl.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Fecha de Cierre Estimada / Real</label>
                    <input
                      type="date"
                      value={editingDeal.closeDate ? editingDeal.closeDate.split('T')[0] : ''}
                      onChange={(e) => setEditingDeal({...editingDeal, closeDate: e.target.value ? new Date(e.target.value).toISOString() : null})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Responsable</label>
                    <select
                      value={editingDeal.userId || ''}
                      onChange={(e) => setEditingDeal({...editingDeal, userId: e.target.value || null})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/50"
                    >
                      <option value="">Sin asignar</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => { setShowDealModal(false); setCreatingDealForActivityId(null); }} className="px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all active:scale-95">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-secondary text-white hover:bg-secondary-container rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg">
                    {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PANEL LATERAL: DEAL TIMELINE --- */}
      <AnimatePresence>
        {viewingDeal && (
          <div className="fixed inset-0 z-[55] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingDeal(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white shadow-2xl w-full max-w-lg relative z-10 h-full flex flex-col border-l border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{viewingDeal.name}</h2>
                  <p className="text-sm text-slate-500">{viewingDeal.account?.name} • {viewingDeal.amount ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(viewingDeal.amount) : 'Sin monto'}</p>
                </div>
                <button onClick={() => setViewingDeal(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar relative">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Calendar size={18} className="text-secondary" /> Historial de Actividades
                </h3>
                
                <div className="space-y-6 relative z-10">
                  {dealActivities.filter(a => !a.parentActivityId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(act => {
                    const children = dealActivities.filter(child => child.parentActivityId === act.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    
                    return (
                    <div key={act.id} className="relative">
                      {/* Parent Activity */}
                      <div className="flex gap-4">
                        <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white shadow-sm z-10 ${getActivityColor(act.activityType).replace('text-', 'bg-').replace('bg-', 'bg-').replace('100', '500')}`}>
                           {getActivityIcon(act.activityType)}
                        </div>
                        <div className={`bg-white border ${act.id === highlightedActivityId ? 'border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.2)] bg-amber-50/50' : 'border-slate-200'} rounded-xl p-4 flex-1 relative z-10 transition-all duration-700`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800 text-sm">{act.subject}</h4>
                            <span className="text-xs text-slate-400">{new Date(act.createdAt).toLocaleDateString()}</span>
                          </div>
                          {act.notes && <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap leading-relaxed">{act.notes}</p>}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{getActivityTypeLabel(act.activityType)}</span>
                              {act.result && <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{act.result}</span>}
                            </div>
                            <button onClick={() => {
                              setEditingActivity({ accountId: viewingDeal.accountId, dealId: viewingDeal.id, parentActivityId: act.id, activityType: ActivityType.SEGUIMIENTO });
                              setShowActivityModal(true);
                            }} className="text-xs font-bold text-secondary hover:underline flex items-center gap-1">
                              <Plus size={12}/> Responder
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Nested Children Activities (Replies) */}
                      {children.length > 0 && (
                        <div className="ml-[15px] pl-6 border-l-2 border-slate-200 mt-4 space-y-4">
                          {children.map(child => (
                            <div key={child.id} className="flex gap-3 relative">
                              <div className="absolute -left-6 top-4 w-6 h-0.5 bg-slate-200 rounded-r"></div>
                              <div className="w-6 h-6 mt-1 shrink-0 rounded-full flex items-center justify-center text-white shadow-sm bg-slate-400 z-10">
                                 <CheckSquare size={10}/>
                              </div>
                              <div className={`bg-slate-50 border ${child.id === highlightedActivityId ? 'border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.2)] bg-amber-50/50' : 'border-slate-200'} rounded-xl p-3 flex-1 transition-all duration-700`}>
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-slate-700 text-sm">{child.subject}</h4>
                                  <span className="text-xs text-slate-400">{new Date(child.createdAt).toLocaleDateString()}</span>
                                </div>
                                {child.notes && <p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap">{child.notes}</p>}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{getActivityTypeLabel(child.activityType)}</span>
                                  {child.result && <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{child.result}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )})}
                  
                  {dealActivities.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-10 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                      No hay actividades registradas en este negocio.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-white">
                <button onClick={() => {
                  setEditingActivity({ accountId: viewingDeal.accountId, dealId: viewingDeal.id });
                  setShowActivityModal(true);
                }} className="w-full py-3 bg-[#001c3a] text-white rounded-xl font-bold text-sm hover:bg-slate-800 flex justify-center items-center gap-2">
                  <Plus size={16} /> Añadir Actividad
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: CONFIRMAR BORRADO --- */}
      <AnimatePresence>
        {deletingId && (
          <div key="delete-modal" className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setDeletingId(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-sm relative z-10 border border-slate-200">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-display font-bold text-center text-slate-800 mb-2">
                ¿Eliminar {deletingId.type === 'account' ? 'Empresa' : deletingId.type === 'activity' ? 'Actividad' : deletingId.type === 'deal' ? 'Negocio' : 'Contacto'}?
              </h3>
              <p className="text-sm text-center text-slate-500 mb-6 leading-relaxed">
                Esta acción es permanente y no se puede deshacer. {deletingId.type === 'account' && 'Se eliminarán también todos los contactos asociados a esta empresa.'}
              </p>
              
              <div className="flex items-center gap-3 w-full">
                <button onClick={() => setDeletingId(null)} disabled={isSubmitting} className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95">Cancelar</button>
                <button onClick={handleDeleteConfirm} disabled={isSubmitting} className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 flex justify-center items-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg">
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : 'Sí, eliminar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showQuotationModal && (
          <CreateQuotationModal
            key="quotation-modal"
            deal={creatingQuotationForDeal}
            deals={deals}
            onClose={() => { setShowQuotationModal(false); setCreatingQuotationForDeal(null); }}
            onSuccess={(id) => {
              setShowQuotationModal(false);
              setCreatingQuotationForDeal(null);
              fetchData();
              setActiveTab('quotations');
              setViewingQuotationId(id);
            }}

          />
        )}
        <Record360Modal
          key="record360-modal"
          focus={record360}
          onClose={() => setRecord360(null)}
          onNavigate={(type, id) => {
            const prevRecord = record360;
            setRecord360(null);
            switch (type) {
              case 'account':
                setActiveTab('accounts');
                break;
              case 'contact':
                setActiveTab('contacts');
                break;
              case 'deal':
                setActiveTab('deals');
                const deal = deals.find(d => d.id === id);
                if (deal) {
                  setViewingDeal(deal);
                  setHighlightedDealId(deal.id);
                  if (prevRecord?.type === 'activity') {
                    setHighlightedActivityId(prevRecord.id);
                    setTimeout(() => setHighlightedActivityId(null), 3000);
                  }
                }
                break;
              case 'quotation':
                setActiveTab('quotations');
                setViewingQuotationId(id);
                break;
              case 'activity':
                setActiveTab('dashboard');
                break;
            }
          }}
        />

        <BulkActivityModal
          key="bulk-activity-modal"
          isOpen={showBulkActivityModal}
          onClose={() => setShowBulkActivityModal(false)}
          onSubmit={handleBulkSubmit}
          users={users}
          currentUserId={user?.id || ''}
        />
      </AnimatePresence>
      <div className="hidden">
        <ActivityKpiPdfReport ref={pdfRef} data={pdfData?.data} filtersInfo={pdfData?.filtersInfo || ''} />
      </div>
    </div>
  );
}
