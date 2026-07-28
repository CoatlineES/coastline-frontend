import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, Users, TrendingUp, Search, Euro, Filter, Download,
  Briefcase, Clock, Calendar, AlertCircle, BarChart2, PieChart as PieChartIcon
} from 'lucide-react';
import { dashboardService } from '../../services/dashboard.service';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid 
} from 'recharts';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface LaborCostsSummary {
  kpis: {
    totalFixedCost: number;
    totalImputedCost: number;
    totalNormalHours: number;
    totalExtraHours: number;
    totalExtraHoursCost: number;
    activeContracts: number;
  };
  costsByProject: {
    projectName: string;
    cost: number;
    hours: number;
  }[];
  users: {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    contractType: string;
    workingHours: number;
    salary: number;
    hourlyRate: number;
    imputedNormalHours: number;
    imputedExtraHours: number;
    imputedCost: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#4287f5'];

export default function CostesLaboralesView() {
  const [data, setData] = useState<LaborCostsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const summary = await dashboardService.getLaborCosts();
      setData(summary);
    } catch (error) {
      console.error('Error fetching labor costs summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = data?.users.filter(u => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(searchLower) || u.email?.toLowerCase().includes(searchLower);
    const roleMatch = u.role?.toLowerCase().includes(searchLower) || '';
    const deptMatch = u.department?.toLowerCase().includes(searchLower) || '';
    return nameMatch || roleMatch || deptMatch;
  }) || [];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  };

  const kpis = data?.kpis;

  const handleExportExcel = async () => {
    if (!filteredUsers || filteredUsers.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Coatline';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Costes Laborales', {
      views: [{ state: 'frozen', ySplit: 1 }] // Congelar la primera fila
    });

    // Definir las columnas
    sheet.columns = [
      { header: 'Empleado', key: 'name', width: 30 },
      { header: 'Departamento', key: 'department', width: 20 },
      { header: 'Rol', key: 'role', width: 25 },
      { header: 'Contrato', key: 'contractType', width: 15 },
      { header: 'Horas/Sem', key: 'workingHours', width: 15 },
      { header: 'Salario Mensual', key: 'salary', width: 20, style: { numFmt: '#,##0.00 €' } },
      { header: 'Coste/Hora', key: 'hourlyRate', width: 15, style: { numFmt: '#,##0.00 €' } },
      { header: 'Horas Normales', key: 'imputedNormalHours', width: 18, style: { numFmt: '0.00"h"' } },
      { header: 'Horas Extra', key: 'imputedExtraHours', width: 15, style: { numFmt: '0.00"h"' } },
      { header: 'Coste Total', key: 'imputedCost', width: 25, style: { numFmt: '#,##0.00 €' } }
    ];

    // Estilizar la fila de cabecera con los colores de Coatline
    const headerRow = sheet.getRow(1);
    headerRow.font = { name: 'Arial', family: 4, size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF001C3A' } // Azul oscuro principal de Coatline
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 30;

    // Rellenar con datos
    filteredUsers.forEach((u, index) => {
      const row = sheet.addRow({
        name: u.name || '-',
        department: u.department || '-',
        role: u.role || '-',
        contractType: u.contractType || '-',
        workingHours: u.workingHours,
        salary: u.salary,
        hourlyRate: u.hourlyRate,
        imputedNormalHours: u.imputedNormalHours,
        imputedExtraHours: u.imputedExtraHours,
        imputedCost: u.imputedCost
      });

      // Bordes tenues y alineación
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'hair', color: { argb: 'FFE2E8F0' } },
          left: { style: 'hair', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
          right: { style: 'hair', color: { argb: 'FFE2E8F0' } }
        };
        
        // Colores alternos (Zebra striping)
        if (index % 2 !== 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' } // Gris muy claro
          };
        }

        // Destacar el Coste Total (Última columna)
        if (colNumber === 10 && u.imputedCost > 0) {
          cell.font = { bold: true, color: { argb: 'FF0EA5E9' } }; // Azul claro para el coste
        }
      });
    });

    // Generar archivo y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Reporte_Costes_Laborales_Coatline_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Chart data
  const comparisonData = kpis ? [
    {
      name: 'Resumen Mensual',
      "Coste Teórico (Contratos)": kpis.totalFixedCost,
      "Coste Real (Imputado en Partes)": kpis.totalImputedCost
    }
  ] : [];

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto min-h-full font-sans pb-20">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-[#001c3a] uppercase tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
              <Calculator size={28} />
            </div>
            Dashboard de Costes
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Análisis de costes laborales teóricos (contratos) vs reales (partes diarios).
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-semibold text-sm w-full md:w-auto justify-center"
          >
            <Download size={16} /> Exportar Excel
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mb-4" />
          <p className="font-semibold">Calculando costes y agregando partes diarios...</p>
        </div>
      ) : !data ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          Error al cargar los datos. Por favor, recarga la página.
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Coste Fijo (Contratos)</p>
                  <h3 className="text-2xl font-black text-[#001c3a]">{formatCurrency(kpis!.totalFixedCost)}</h3>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                  <Briefcase size={20} />
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2">Salarios base de {kpis!.activeContracts} contratos activos.</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Coste Real Imputado</p>
                  <h3 className="text-2xl font-black text-[#001c3a]">{formatCurrency(kpis!.totalImputedCost)}</h3>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Euro size={20} />
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2">Coste de horas reportadas en Partes Diarios.</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Coste Horas Extra</p>
                  <h3 className="text-2xl font-black text-[#001c3a]">{formatCurrency(kpis!.totalExtraHoursCost)}</h3>
                </div>
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <Clock size={20} />
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2">{kpis!.totalExtraHours} horas extra reportadas en total.</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Horas Productivas</p>
                  <h3 className="text-2xl font-black text-[#001c3a]">{Number((kpis!.totalNormalHours + kpis!.totalExtraHours).toFixed(2))} h</h3>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2">Suma de horas imputadas a proyectos activos.</div>
            </motion.div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BarChart2 size={20} className="text-secondary" />
                Eficiencia Mensual (Presupuesto vs Realidad)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value}€`} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value: number) => formatCurrency(value)} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Coste Teórico (Contratos)" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="Coste Real (Imputado en Partes)" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <PieChartIcon size={20} className="text-secondary" />
                Distribución de Costes por Proyecto
              </h3>
              <div className="h-64 flex justify-center">
                {data.costsByProject.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.costsByProject}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="cost"
                        nameKey="projectName"
                      >
                        {data.costsByProject.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-2">
                    <PieChartIcon size={40} className="opacity-20" />
                    No hay imputaciones este mes en partes diarios.
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Main Content (Table) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-slate-400" />
                Detalle por Empleado (Mensual)
              </h2>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar empleado o rol..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#001c3a] transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-bold">Empleado</th>
                    <th className="p-4 font-bold">Contrato</th>
                    <th className="p-4 font-bold text-center">Salario / h</th>
                    <th className="p-4 font-bold text-center">Horas Imputadas</th>
                    <th className="p-4 font-bold text-right">Coste Imputado</th>
                    <th className="p-4 font-bold text-right">Salario Base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No se encontraron empleados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold shadow-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 group-hover:text-secondary transition-colors">
                                {user.name}
                              </div>
                              <div className="text-xs text-slate-500">{user.role || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {user.contractType ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700">{user.contractType}</span>
                              <span className="text-xs text-slate-400">{user.workingHours}h / sem</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm italic">Sin contrato</span>
                          )}
                        </td>
                        <td className="p-4 text-center text-slate-600 font-mono text-sm">
                          {user.hourlyRate > 0 ? `${user.hourlyRate.toFixed(2)}€/h` : '-'}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <span className="font-bold text-slate-700">{user.imputedNormalHours + user.imputedExtraHours}h</span>
                            {user.imputedExtraHours > 0 && (
                              <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                                +{user.imputedExtraHours}h extra
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`font-bold ${user.imputedCost > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {user.imputedCost > 0 ? formatCurrency(user.imputedCost) : '-'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {user.salary > 0 ? (
                            <span className="font-bold text-[#001c3a]">
                              {formatCurrency(user.salary)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
