import React, { useState, useEffect } from 'react';
import { Plus, Receipt, Calendar, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Project } from '../../../../services/types';
import { ExtraExpense, extraExpensesService } from '../../../../services/extra-expenses.service';
import ExtraExpenseModal from './ExtraExpenseModal';

interface ProjectExtraExpensesTabProps {
  project: Project;
}

export default function ProjectExtraExpensesTab({ project }: ProjectExtraExpensesTabProps) {
  const [expenses, setExpenses] = useState<ExtraExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExtraExpense | null>(null);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await extraExpensesService.getByProject(project.id);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading extra expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (project?.id) {
      loadExpenses();
    }
  }, [project.id]);

  const handleOpenModal = (expense?: ExtraExpense) => {
    setSelectedExpense(expense || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const handleSave = () => {
    loadExpenses();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto extra?')) {
      try {
        await extraExpensesService.delete(id);
        loadExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002D5A]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Gastos Extras del Proyecto</h2>
          <p className="text-sm text-slate-500">Registra desembolsos no previstos fuera del presupuesto.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#002D5A] text-white rounded-lg hover:bg-[#002D5A]/90 transition-colors"
        >
          <Plus size={18} />
          Nuevo Gasto Extra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Receipt size={20} className="text-[#002D5A]" />
            <span className="font-medium">Total Gastos Extras</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {totalAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Receipt size={48} className="mb-4 text-slate-300" />
            <p className="text-lg font-medium">No hay gastos extras registrados</p>
            <p className="text-sm">Haz clic en "Nuevo Gasto Extra" para agregar uno.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-medium text-slate-500">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Concepto</th>
                  <th className="px-6 py-4">Importe</th>
                  <th className="px-6 py-4">Notas</th>
                  <th className="px-6 py-4">Comprobante</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        {new Date(expense.date).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {expense.concept}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {expense.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {expense.notes || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {expense.receiptUrl ? (
                        <a 
                          href={expense.receiptUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#002D5A] hover:underline"
                        >
                          Ver comprobante
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(expense)}
                          className="p-1.5 text-slate-400 hover:text-[#002D5A] hover:bg-slate-100 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ExtraExpenseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          expense={selectedExpense}
          project={project}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
