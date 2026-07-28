import React, { useState } from 'react';
import { ProjectPlan, ProjectTask, projectPlanningService } from '../../../../services/project-planning.service';
import { Save, AlertCircle, ChevronDown, ChevronRight, Layers } from 'lucide-react';

interface BudgetEditorViewProps {
  plan: ProjectPlan;
  onUpdate: () => void;
}

export function BudgetEditorView({ plan, onUpdate }: BudgetEditorViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(plan.tasks?.filter(t => t.type === 'ZONE').map(t => t.id)));
  const [editingValues, setEditingValues] = useState<{ [id: string]: { quantity?: number; unitCost?: number } }>({});
  const [saving, setSaving] = useState(false);

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const handleValueChange = (id: string, field: 'quantity' | 'unitCost', value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditingValues(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: numValue
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Actualizar tareas (partidas)
      const taskUpdates = Object.entries(editingValues)
        .filter(([_, vals]) => vals.quantity !== undefined && !vals.unitCost)
        .map(([id, vals]) => projectPlanningService.updateTask(id, { quantity: vals.quantity }));
        
      // Actualizar componentes (recursos)
      const compUpdates = Object.entries(editingValues)
        .filter(([_, vals]) => vals.unitCost !== undefined || vals.quantity !== undefined) 
        .map(([id, vals]) => {
          // Check if it's a component by seeing if it's in a task's components array
          let isComponent = false;
          plan.tasks?.forEach(zone => zone.children?.forEach(task => {
            if (task.components?.some(c => c.id === id)) isComponent = true;
          }));
          
          if (isComponent) {
            return projectPlanningService.updateTaskComponent(id, { 
              ...(vals.quantity !== undefined ? { quantity: vals.quantity } : {}), 
              ...(vals.unitCost !== undefined ? { unitCost: vals.unitCost } : {}) 
            });
          }
          return Promise.resolve(); // If not a component, handled above
        });
      
      await Promise.all([...taskUpdates, ...compUpdates]);
      
      setEditingValues({});
      onUpdate();
    } catch (error) {
      console.error('Error saving budget values', error);
      alert('Error al guardar el presupuesto');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(editingValues).length > 0;

  // Calculamos totales para el pie de página
  const calculateTotal = () => {
    let total = 0;
    plan.tasks?.forEach(zone => {
      zone.children?.forEach(task => {
        // Obtenemos la cantidad de la tarea (editada o actual)
        const taskQty = editingValues[task.id]?.quantity ?? task.quantity ?? 1;
        
        let taskUnitCost = 0;
        if (task.components && task.components.length > 0) {
          // Si tiene componentes, el costo unitario de la partida es la suma de (cantidad * costounitario) de los componentes
          taskUnitCost = task.components.reduce((sum, comp) => {
            const compQty = editingValues[comp.id]?.quantity ?? comp.quantity ?? 1;
            const compCost = editingValues[comp.id]?.unitCost ?? comp.unitCost ?? 0;
            return sum + (compQty * compCost);
          }, 0);
        } else {
          // Si no tiene componentes, no hay costo de ejecución (o podríamos usar un campo si existiera, pero usamos 0)
          taskUnitCost = 0; 
        }
        
        total += taskQty * taskUnitCost;
      });
    });
    return total;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-between items-center p-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Presupuesto de Ejecución Material (PEM)</h2>
          <p className="text-sm text-slate-500">Ajusta cantidades y costos unitarios de los recursos. Los cambios afectarán la planificación.</p>
        </div>
        <div>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              hasChanges && !saving
                ? 'bg-[#002D5A] text-white hover:bg-[#001F3F] shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 sticky top-0 shadow-sm z-10 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-600">Concepto</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center w-24">Unidad</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right w-32">Cantidad</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right w-32">Costo Unit. (€)</th>
              <th className="px-6 py-3 font-semibold text-slate-600 text-right w-32">Importe (€)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {plan.tasks?.map(zone => (
              <React.Fragment key={zone.id}>
                {/* ZONA (Capítulo) */}
                <tr className="bg-slate-100/50 hover:bg-slate-100 transition-colors">
                  <td className="px-6 py-3 font-bold text-[#002D5A] flex items-center gap-2">
                    <button onClick={() => toggleNode(zone.id)} className="p-1 hover:bg-slate-200 rounded">
                      {expandedNodes.has(zone.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <Layers size={16} />
                    {zone.name}
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-6 py-3"></td>
                </tr>

                {expandedNodes.has(zone.id) && zone.children?.map(task => {
                  const isTaskExpanded = expandedNodes.has(task.id);
                  const taskQty = editingValues[task.id]?.quantity ?? task.quantity ?? 1;
                  
                  // Calculamos el costo unitario de la partida basado en sus componentes
                  let taskUnitCost = 0;
                  if (task.components && task.components.length > 0) {
                    taskUnitCost = task.components.reduce((sum, comp) => {
                      const compQty = editingValues[comp.id]?.quantity ?? comp.quantity ?? 1;
                      const compCost = editingValues[comp.id]?.unitCost ?? comp.unitCost ?? 0;
                      return sum + (compQty * compCost);
                    }, 0);
                  }

                  const taskTotal = taskQty * taskUnitCost;

                  return (
                    <React.Fragment key={task.id}>
                      {/* TAREA (Partida) */}
                      <tr className="hover:bg-slate-50 transition-colors border-l-4 border-l-blue-400">
                        <td className="px-6 py-3 pl-12 font-medium text-slate-800 flex items-center gap-2">
                          <button onClick={() => toggleNode(task.id)} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                            {isTaskExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          {task.name}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-500">{task.unit || 'Ud'}</td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editingValues[task.id]?.quantity ?? task.quantity ?? ''}
                            onChange={(e) => handleValueChange(task.id, 'quantity', e.target.value)}
                            className="w-full text-right bg-white border border-slate-300 rounded px-2 py-1 focus:outline-none focus:border-[#002D5A] focus:ring-1 focus:ring-[#002D5A]"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-600">
                          {taskUnitCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-3 text-right font-bold text-slate-800">
                          {taskTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>

                      {/* COMPONENTES (Recursos) */}
                      {isTaskExpanded && task.components?.map(comp => {
                        const compQty = editingValues[comp.id]?.quantity ?? comp.quantity ?? 1;
                        const compUnitCost = editingValues[comp.id]?.unitCost ?? comp.unitCost ?? 0;
                        const compTotal = compQty * compUnitCost;

                        return (
                          <tr key={comp.id} className="bg-slate-50/50 hover:bg-slate-50 transition-colors border-l-4 border-l-transparent">
                            <td className="px-6 py-2 pl-24 text-slate-600 flex items-center gap-2 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                              {comp.concept}
                            </td>
                            <td className="px-4 py-2 text-center text-slate-500 text-xs">{comp.unit || 'Ud'}</td>
                            <td className="px-4 py-2 text-right">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingValues[comp.id]?.quantity ?? comp.quantity ?? ''}
                                onChange={(e) => handleValueChange(comp.id, 'quantity', e.target.value)}
                                className="w-20 text-right text-xs bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingValues[comp.id]?.unitCost ?? comp.unitCost ?? ''}
                                onChange={(e) => handleValueChange(comp.id, 'unitCost', e.target.value)}
                                className="w-24 text-right text-xs bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                              />
                            </td>
                            <td className="px-6 py-2 text-right text-slate-500 text-xs">
                              {compTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
            {(!plan.tasks || plan.tasks.length === 0) && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">
                  No hay partidas en esta planificación.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-100 border-t-2 border-slate-200 sticky bottom-0">
            <tr>
              <td colSpan={4} className="px-6 py-4 text-right font-bold text-slate-700">
                TOTAL PRESUPUESTO DE EJECUCIÓN (PEM)
              </td>
              <td className="px-6 py-4 text-right font-bold text-xl text-[#002D5A]">
                {calculateTotal().toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
