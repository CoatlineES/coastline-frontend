import React, { useState } from 'react';
import { X, Users, Package, Tractor, CheckCircle2, AlertTriangle, User as UserIcon, Trash2 } from 'lucide-react';
import { projectPlanningService, ProjectTaskComponent, ProjectTask } from '../../../../services/project-planning.service';
import toast from 'react-hot-toast';

interface ResourceAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  component: ProjectTaskComponent | null;
  task: ProjectTask | null;
  plan?: any;
  onUpdate: () => void;
}

export function ResourceAssignmentModal({ isOpen, onClose, taskId, component, task, plan, onUpdate }: ResourceAssignmentModalProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  if (!isOpen || !component || !task) return null;

  // Extraer operarios asignados en MANO_OBRA para esta tarea (Prioridad 1)
  const manoObraComponents = task.components?.filter(c => c.resourceType === 'MANO_OBRA') || [];
  const taskWorkersMap = new Map<string, any>();
  manoObraComponents.forEach(c => {
    c.plannedWorkers?.forEach(w => {
      const id = w.contractorWorkerId || w.userId;
      if (id && !taskWorkersMap.has(id)) {
        taskWorkersMap.set(id, { 
          id, 
          name: w.contractorWorker?.name || w.user?.name, 
          email: w.contractorWorker ? 'Subcontrata' : w.user?.email, 
          isSub: !!w.contractorWorker,
          userId: w.userId,
          contractorWorkerId: w.contractorWorkerId
        });
      }
    });
  });
  
  // Agregar el resto de operarios del equipo del proyecto (Prioridad 2)
  const projectWorkers = plan?.project?.workers || [];
  projectWorkers.forEach((pw: any) => {
    const id = pw.contractorWorker?.id || pw.user?.id;
    if (id && !taskWorkersMap.has(id)) {
      taskWorkersMap.set(id, {
        id, 
        name: pw.contractorWorker?.name || pw.user?.name, 
        email: pw.contractorWorker ? 'Subcontrata' : pw.user?.email, 
        isSub: !!pw.contractorWorker,
        userId: pw.user?.id,
        contractorWorkerId: pw.contractorWorker?.id
      });
    }
  });

  const taskWorkers = Array.from(taskWorkersMap.values());

  const assignedWorkerIds = new Set(component.plannedWorkers?.map(w => w.contractorWorkerId || w.userId) || []);
  const availableWorkers = taskWorkers.filter(w => !assignedWorkerIds.has(w.id));

  // Calcular retiros de almacén
  let executedQuantity = 0;
  const withdrawals: Array<{ id: string; userName: string; qty: number; date: Date }> = [];
  
  // Collect both task-specific requests and project-level requests
  const requests = [...(task.inventoryRequests || [])];
  
  // Add project-level requests if plan and project exist
  if (plan?.project?.inventoryRequests) {
    for (const req of plan.project.inventoryRequests) {
      // Solo consideramos las que NO están asociadas a una tarea específica 
      // (ya que las asociadas a tareas ya vienen en task.inventoryRequests)
      if (!req.projectTaskId || req.projectTaskId === task.id) {
        let isDateMatch = true;
        // Si no está vinculada a la tarea, verificamos que la fecha coincida
        if (!req.projectTaskId && task.startDate) {
          const reqDate = new Date(req.dateReviewed || req.dateRequested);
          const tStart = new Date(task.startDate);
          tStart.setDate(tStart.getDate() - 2); // 2 días de margen antes
          const tEnd = task.endDate ? new Date(task.endDate) : new Date(task.startDate);
          tEnd.setDate(tEnd.getDate() + 2); // 2 días de margen después
          
          if (reqDate < tStart || reqDate > tEnd) {
            isDateMatch = false;
          }
        }

        // avoid duplicates if somehow they overlap
        if (isDateMatch && !requests.some(r => r.id === req.id)) {
          requests.push(req);
        }
      }
    }
  }

  for (const req of requests) {
    if (req.status === 'APPROVED' || req.status === 'approved') {
      const items = req.items || [];
      for (const reqItem of items) {
        if (reqItem.item?.resourceId === component.resourceId) {
          const qty = reqItem.qtyApproved || reqItem.quantity;
          executedQuantity += qty;
          withdrawals.push({
            id: req.id,
            userName: req.requestedBy?.name || 'Usuario desconocido',
            qty: qty,
            date: new Date(req.dateReviewed || req.dateRequested)
          });
        }
      }
    }
  }

  const isFulfilled = component.quantity > 0 && executedQuantity >= component.quantity;
  const isPartial = executedQuantity > 0 && executedQuantity < component.quantity;

  const handleAssign = async (worker: any) => {
    try {
      setIsAssigning(true);
      await projectPlanningService.assignWorkerToComponent(taskId, component.id, { userId: worker.userId, contractorWorkerId: worker.contractorWorkerId });
      onUpdate();
    } catch (e: any) {
      toast.error('Error asignando responsable: ' + (e.response?.data?.error || e.message));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (assignmentId: string) => {
    try {
      setRemovingId(assignmentId);
      await projectPlanningService.removeWorkerFromComponent(assignmentId);
      toast.success('Responsable removido');
      onUpdate();
    } catch (e: any) {
      toast.error('Error removiendo responsable: ' + (e.response?.data?.error || e.message));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {component.resourceType === 'MAQUINARIA' ? <Tractor size={20} className="text-yellow-600"/> : <Package size={20} className="text-purple-600"/>}
              Asignación y Almacén
            </h2>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{component.concept}</span> 
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4 items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Planeado</p>
            <p className="text-lg font-bold text-slate-700">{component.quantity} {component.unit}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase">Retirado de Almacén</p>
            <div className="flex items-center gap-2 justify-end">
              {isFulfilled ? <CheckCircle2 size={16} className="text-emerald-500" /> : isPartial ? <AlertTriangle size={16} className="text-orange-500" /> : null}
              <p className={`text-lg font-bold ${isFulfilled ? 'text-emerald-600' : isPartial ? 'text-orange-600' : 'text-slate-700'}`}>
                {executedQuantity} {component.unit}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <UserIcon size={16} /> Responsables ({component.plannedWorkers?.length || 0})
            </h3>
            
            {(!component.plannedWorkers || component.plannedWorkers.length === 0) ? (
              <div className="text-xs text-slate-500 italic py-2 text-center bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                Ningún responsable asignado aún.
              </div>
            ) : (
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {component.plannedWorkers.map(w => (
                  <div key={w.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${w.contractorWorker ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {(w.contractorWorker?.name || w.user?.name)?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                           {w.contractorWorker?.name || w.user?.name || 'Usuario'}
                           {w.contractorWorker && <span className="bg-orange-100 text-orange-700 text-[9px] px-1.5 py-0.5 rounded font-medium">Subcontrata</span>}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemove(w.id)}
                      disabled={removingId === w.id}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Quitar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Package size={16} /> Historial de Retiros de Almacén
            </h3>
            
            {withdrawals.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-2 text-center border border-dashed border-slate-300 rounded-lg">
                Nadie ha retirado esto del almacén todavía.
              </div>
            ) : (
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {withdrawals.map((w, idx) => (
                  <div key={`${w.id}-${idx}`} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{w.userName}</span>
                      <span className="text-xs text-slate-500">{w.date.toLocaleDateString()} {w.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {w.qty} {component.unit}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 overflow-y-auto flex-1 bg-white">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Users size={16} /> Operarios Disponibles en la Partida
            </h3>
            
            {availableWorkers.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-4">
                No hay operarios planificados en esta partida, o todos ya están asignados.
              </div>
            ) : (
              <div className="space-y-2">
                {availableWorkers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-2 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg transition-colors group">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${u.isSub ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                           {u.name}
                           {u.isSub && <span className="bg-orange-100 text-orange-700 text-[9px] px-1.5 py-0.5 rounded font-medium">Subcontrata</span>}
                        </span>
                        <span className="text-xs text-slate-500">{u.email}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAssign(u)}
                      disabled={isAssigning}
                      className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-100 transition-all disabled:opacity-50"
                    >
                      Asignar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
