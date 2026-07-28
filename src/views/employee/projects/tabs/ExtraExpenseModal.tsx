import React, { useState, useEffect } from 'react';
import { X, Receipt, AlertCircle } from 'lucide-react';
import { Project } from '../../../../services/types';
import { ExtraExpense, extraExpensesService } from '../../../../services/extra-expenses.service';
import { uploadService } from '../../../../services/upload.service';

interface ExtraExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExtraExpense | null;
  project: Project;
  onSave: () => void;
}

export default function ExtraExpenseModal({ isOpen, onClose, expense, project, onSave }: ExtraExpenseModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        setDate(new Date(expense.date).toISOString().split('T')[0]);
        setConcept(expense.concept);
        setAmount(expense.amount);
        setNotes(expense.notes || '');
        setReceiptUrl(expense.receiptUrl || '');
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setConcept('');
        setAmount('');
        setNotes('');
        setReceiptUrl('');
      }
      setError('');
    }
  }, [isOpen, expense]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setUploadingFile(true);
      setError('');
      const url = await uploadService.uploadFile(file);
      setReceiptUrl(url);
    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || amount === '') {
      setError('El concepto y el importe son requeridos.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = {
        date,
        concept,
        amount: Number(amount),
        notes,
        receiptUrl
      };

      if (expense?.id) {
        await extraExpensesService.update(expense.id, data);
      } else {
        await extraExpensesService.create(project.id, data);
      }
      
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al guardar el gasto extra');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <Receipt className="text-[#002D5A]" size={24} />
            <h2 className="text-xl font-bold text-slate-800">
              {expense ? 'Editar Gasto Extra' : 'Nuevo Gasto Extra'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <form id="extra-expense-form" onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Concepto *</label>
                <input
                  type="text"
                  required
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ej. Compra de herramientas urgentes"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A] bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Importe (€) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A] bg-white transition-all"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A] bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Comprobante (opcional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A] bg-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#002D5A] hover:file:bg-blue-100"
                  />
                  {uploadingFile && (
                    <div className="w-5 h-5 border-2 border-[#002D5A]/30 border-t-[#002D5A] rounded-full animate-spin shrink-0"></div>
                  )}
                </div>
                {receiptUrl && (
                  <div className="mt-2 text-sm">
                    <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-[#002D5A] hover:underline flex items-center gap-1">
                      <Receipt size={14} /> Ver archivo adjunto actual
                    </a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles adicionales del gasto..."
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A] bg-white transition-all resize-none"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="extra-expense-form"
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-[#002D5A] rounded-lg hover:bg-[#002D5A]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Gasto'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
