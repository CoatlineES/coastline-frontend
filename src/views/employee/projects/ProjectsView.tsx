import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Briefcase, Calendar, MapPin, Clock, Building2, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Project } from '../../../services/types';
import { projectsService } from '../../../services/projects.service';
import ProjectCreateModal from './ProjectCreateModal';

export default function ProjectsView() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'reales' | 'demos'>('reales');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleGroup = (company: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [company]: prev[company] === false ? true : false
    }));
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Está seguro de que desea eliminar este proyecto? Esta acción no se puede deshacer.')) {
      try {
        await projectsService.delete(id);
        setProjects(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error al eliminar el proyecto.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'PENDING_PLANNING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONSTRUCTION_PLANNING': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'INSPECTION_DONE': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'COMPLETION': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CERT_INVOICING': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatPhase = (phase: string) => {
    const labels: Record<string, string> = {
      'PENDING_PLANNING': 'Pdte. Planificación',
      'CONSTRUCTION_PLANNING': 'En Planificación',
      'INSPECTION_DONE': 'Inspeccionado',
      'COMPLETION': 'Finalización',
      'CERT_INVOICING': 'Certif. y Facturación'
    };
    return labels[phase] || phase;
  };

  const filteredProjects = projects.filter(p => {
    // 1. Filter by Tab and Active Status
    if (activeTab === 'reales') {
      if (p.projectOrigin === 'DEMO') return false;
      if (showOnlyActive && p.status !== 'ACTIVE') return false;
    }
    if (activeTab === 'demos' && p.projectOrigin !== 'DEMO') return false;

    // 2. Filter by search term
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.account?.name && p.account.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const groupedProjects = useMemo(() => {
    const groups: Record<string, Project[]> = {};
    filteredProjects.forEach(project => {
      const company = project.account?.name || 'Sin Empresa';
      if (!groups[company]) {
        groups[company] = [];
      }
      groups[company].push(project);
    });
    
    // Opcional: ordenar alfabéticamente las empresas
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as Record<string, Project[]>);
  }, [filteredProjects]);

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#002D5A] flex items-center gap-2">
              <Briefcase className="text-blue-500" />
              Gestión de Proyectos
            </h1>
            <p className="text-slate-500 mt-1">
              Control y seguimiento de todas las obras y proyectos en curso.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              <Filter size={18} />
              Filtros
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#002D5A] text-white px-4 py-2 rounded-lg hover:bg-[#001F3F] transition-colors text-sm font-medium shadow-sm"
            >
              <Plus size={18} />
              Nuevo Proyecto
            </button>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 gap-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('reales')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Proyectos
            </button>
            <button
              onClick={() => setActiveTab('demos')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'demos'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Demos / Plantillas
            </button>
          </div>

          {activeTab === 'reales' && (
            <div className="flex items-center gap-2 px-4 pb-2 sm:pb-0">
              <input
                type="checkbox"
                id="showOnlyActive"
                checked={showOnlyActive}
                onChange={(e) => setShowOnlyActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="showOnlyActive" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                Mostrar solo activos
              </label>
            </div>
          )}
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002D5A]"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No hay proyectos</h3>
            <p className="text-slate-500">No se encontraron proyectos activos.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedProjects).map(([company, companyProjects]) => {
              const isExpanded = expandedGroups[company] === true;
              
              return (
                <div key={company} className="space-y-4 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-4">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors select-none"
                    onClick={() => toggleGroup(company)}
                  >
                    {isExpanded ? <ChevronDown className="text-slate-400" size={20} /> : <ChevronRight className="text-slate-400" size={20} />}
                    <Building2 className="text-[#002D5A]" size={20} />
                    <h2 className="text-lg font-bold text-slate-800">{company}</h2>
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium ml-2">
                      {companyProjects.length} {companyProjects.length === 1 ? 'proyecto' : 'proyectos'}
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                          {companyProjects.map((project, index) => (
                            <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => navigate(`/app/empleado/proyectos/${project.id}`)}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col group"
                      >
                      <div className="p-5 border-b border-slate-100 flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-wrap gap-2">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                            
                          </div>
                          <button
                            onClick={(e) => handleDeleteProject(e, project.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors flex-shrink-0"
                            title="Eliminar proyecto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {project.name}
                          </h3>
                          {project.alias && (
                            <div className="text-xs text-slate-400 font-medium italic truncate mb-1">
                              Alias: {project.alias}
                            </div>
                          )}
                        <div className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                          {project.divisionName && (
                            <span className="truncate flex items-center gap-1">
                              <span className="text-slate-400">División:</span> {project.divisionName}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 mt-auto">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Calendar size={14} className="text-slate-400" />
                            <span>Inicio: {project.plannedStart ? new Date(project.plannedStart).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'No definido'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Clock size={14} className="text-slate-400" />
                            <span>Creado: {project.createdAt ? new Date(project.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'No disponible'}</span>
                          </div>
                          {project.city && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <MapPin size={14} className="text-slate-400" />
                              <span>{project.city}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 px-5 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {project.responsible?.name ? project.responsible.name.substring(0, 2).toUpperCase() : '?'}
                          </div>
                          <span className="text-xs text-slate-600 font-medium truncate w-24">
                            {project.responsible?.name || 'Sin asignar'}
                          </span>
                        </div>
                        {project.businessLine && (
                          <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded truncate max-w-[120px]">
                            {project.businessLine.name}
                          </span>
                        )}
                      </div>
                    </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ProjectCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newProject) => {
          // Add to local state
          setProjects(prev => [newProject, ...prev]);
        }}
      />
    </div>
  );
}
