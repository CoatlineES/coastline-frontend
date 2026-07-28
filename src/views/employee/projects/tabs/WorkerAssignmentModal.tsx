import React, { useState, useEffect } from 'react';
import { X, Search, Check, Users, Trash2, Loader2 } from 'lucide-react';
import { usersService } from '../../../../services/users.service';
import { projectsService } from '../../../../services/projects.service';
import { projectPlanningService, ProjectTaskComponent, PlannedTaskWorker } from '../../../../services/project-planning.service';
import toast from 'react-hot-toast';

interface WorkerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  component: ProjectTaskComponent | null;
  task?: any | null;
  plan?: any;
  onUpdate: () => void;
}

interface WorkerOption {
  id: string; // React key
  name: string;
  email: string;
  isSub: boolean;
  userId?: string;
  contractorWorkerId?: string;
}

export function WorkerAssignmentModal({ isOpen, onClose, taskId, component, task, plan, onUpdate }: WorkerAssignmentModalProps) {
  const [users, setUsers] = useState<WorkerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      if (plan?.projectId) {
        const project = await projectsService.getById(plan.projectId);
        if (project && project.workers) {
          const options: WorkerOption[] = project.workers.map(pw => {
            if (pw.contractorWorker) {
              return {
                id: pw.contractorWorker.id,
                name: pw.contractorWorker.name,
                email: 'Subcontrata',
                isSub: true,
                contractorWorkerId: pw.contractorWorker.id
              };
            } else if (pw.user) {
              return {
                id: pw.user.id,
                name: pw.user.name,
                email: pw.user.email,
                isSub: false,
                userId: pw.user.id
              };
            }
            return null;
          }).filter(Boolean) as WorkerOption[];
          setUsers(options);
          return;
        }
      }
      
      const res = await usersService.getUsers();
      if (res.data) {
        setUsers(res.data.map(u => ({ id: u.id, name: u.name, email: u.email, isSub: false, userId: u.id })));
      }
    } catch (e) {
      console.error('Error loading users:', e);
    } finally {
      setLoading(false);
    }
  };

  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAssign = async (worker: WorkerOption) => {
    if (!component) return;
    try {
      await projectPlanningService.assignWorkerToComponent(taskId, component.id, { userId: worker.userId, contractorWorkerId: worker.contractorWorkerId });
      onUpdate();
    } catch (e: any) {
      if (e.response?.status === 409 && e.response?.data?.clash) {
        const clashes = e.response.data.clashes.join('\n');
        if (window.confirm(`El operario ya está asignado a otras tareas en estas fechas:\n\n${clashes}\n\n¿Desea asignarlo de todos modos?`)) {
          try {
            await projectPlanningService.assignWorkerToComponent(taskId, component.id, {
              userId: worker.userId,
              contractorWorkerId: worker.contractorWorkerId,
              force: true
            });
            toast.success('Operario asignado forzosamente');
            onUpdate();
          } catch (e2: any) {
            toast.error('Error asignando operario: ' + (e2.response?.data?.error || e2.message));
          }
        }
      } else {
        toast.error('Error asignando operario: ' + (e.response?.data?.error || e.message));
      }
    }
  };

  const handleRemove = async (assignmentId: string) => {
    try {
      setRemovingId(assignmentId);
      await projectPlanningService.removeWorkerFromComponent(assignmentId);
      toast.success('Asignación eliminada');
      onUpdate();
    } catch (e: any) {
      toast.error('Error eliminando asignación: ' + (e.response?.data?.error || e.message));
    } finally {
      setRemovingId(null);
    }
  };

  if (!isOpen || !component) return null;

  const assignedWorkerIds = new Set(component.plannedWorkers?.map(w => w.contractorWorkerId || w.userId) || []);
  
  // Calculate prioritiy maps
  const projectWorkerIds = new Set(plan?.project?.workers?.map((w: any) => w.userId) || []);
  const taskManoObraIds = new Set<string>();
  if (task?.components) {
    task.components.forEach((c: any) => {
      if (c.resourceType === 'MANO_OBRA') {
        c.plannedWorkers?.forEach((w: any) => taskManoObraIds.add(w.userId));
      }
    });
  }

  const filteredUsers = users
    .filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Prioridad 1: Asignados a mano de obra en esta misma tarea
      const aInTask = taskManoObraIds.has(a.id);
      const bInTask = taskManoObraIds.has(b.id);
      if (aInTask && !bInTask) return -1;
      if (!aInTask && bInTask) return 1;

      // Prioridad 2: Equipo del proyecto
      const aInProj = projectWorkerIds.has(a.id);
      const bInProj = projectWorkerIds.has(b.id);
      if (aInProj && !bInProj) return -1;
      if (!aInProj && bInProj) return 1;

      return a.name.localeCompare(b.name);
    });

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Asignar Equipo</h2>
            <p className="text-sm text-slate-500">
              Rol: <span className="font-semibold text-[#002D5A]">{component.concept}</span> 
              {component.quantity > 0 ? ` (Requeridos: ${component.quantity})` : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-4">
            {/* Planned Workers */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Users size={16} /> Planeados ({component.plannedWorkers?.length || 0})
              </h3>
              
              {(!component.plannedWorkers || component.plannedWorkers.length === 0) ? (
                <div className="text-xs text-slate-500 italic py-2 text-center bg-white border border-dashed border-slate-300 rounded-lg">
                  Nadie asignado aún.
                </div>
              ) : (
                <div className="space-y-2">
                  {component.plannedWorkers.map((pw: PlannedTaskWorker) => (
                    <div key={pw.id} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${
                          pw.contractorWorker ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {(pw.contractorWorker?.name || pw.user?.name)?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-slate-700">
                          {pw.contractorWorker?.name || pw.user?.name}
                        </span>
                        {pw.contractorWorker && (
                          <span className="bg-orange-100 text-orange-700 text-[9px] px-1.5 py-0.5 rounded font-medium">Subcontrata</span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleRemove(pw.id)}
                        disabled={removingId === pw.id}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remover"
                      >
                        {removingId === pw.id 
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Trash2 size={12} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Executed Workers - grouped by user to avoid duplicates */}
            <div className="flex-1 border-l border-slate-200 pl-4">
              <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <Check size={16} /> Ejecutaron
              </h3>
              
              {(!component.dailyLogTaskWorkers || component.dailyLogTaskWorkers.length === 0) ? (
                <div className="text-xs text-slate-500 italic py-2 text-center bg-white border border-dashed border-slate-300 rounded-lg">
                  Aún no hay reportes.
                </div>
              ) : (() => {
                // Group by user to avoid duplicates from multiple daily logs
                const grouped = new Map<string, { name: string; initials: string; totalHours: number; entries: number }>();
                component.dailyLogTaskWorkers.forEach((ew: any) => {
                  const name = ew.dailyLogWorker?.user?.name || ew.dailyLogWorker?.externalName || 'Externo';
                  const key = ew.dailyLogWorker?.user?.name
                    ? `user_${name}`
                    : `ext_${name}`;
                  if (!grouped.has(key)) {
                    grouped.set(key, { name, initials: name.substring(0, 2).toUpperCase(), totalHours: 0, entries: 0 });
                  }
                  const g = grouped.get(key)!;
                  g.totalHours += (ew.hours || 0);
                  g.entries++;
                });
                return (
                  <div className="space-y-2">
                    {Array.from(grouped.values()).map((g, i) => (
                      <div key={i} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[9px]">
                            {g.initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-emerald-800">{g.name}</span>
                            <span className="text-[9px] text-emerald-600">
                              {g.totalHours.toFixed(1)} h.{g.entries > 1 ? ` (${g.entries} partes)` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar personal..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
            {loading ? (
              <div className="text-center py-4 text-slate-500 text-sm">Cargando personal...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-sm">No se encontraron resultados.</div>
            ) : (
              filteredUsers.map(user => {
                const isAssigned = assignedWorkerIds.has(user.id);
                return (
                  <button
                    key={user.id}
                    disabled={isAssigned}
                    onClick={() => handleAssign(user)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors border ${
                      isAssigned 
                        ? 'bg-slate-50 border-slate-200 opacity-70 cursor-default' 
                        : 'bg-white border-transparent hover:bg-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isAssigned ? 'bg-slate-200 text-slate-500' : 
                        user.isSub ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className={`text-sm font-medium flex items-center gap-2 ${isAssigned ? 'text-slate-500' : 'text-slate-700'}`}>
                          {user.name}
                          {user.isSub && (
                            <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded font-medium">Subcontrata</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                    {isAssigned && <Check size={16} className="text-emerald-500" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
