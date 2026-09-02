import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Search, Plus, Filter, Edit2, Trash2, Box, Save, X, Activity, Layers, AlertCircle, CheckCircle
} from 'lucide-react';
import { inventoryService, InventoryItem } from '../../../services/inventory.service';
import { resourcesService, Resource, ResourceType } from '../../../services/resources.service';
import { useAuth } from '../../../contexts/AuthContext';

export default function AlmacenAdminView() {
  const { user } = useAuth();
  
  const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const defaultFormState = {
    resourceId: null,
    name: '',
    sku: '',
    category: '',
    unit: 'Uds',
    stock: 0,
    minStock: 0,
    location: '',
    status: 'available',
    isReturnable: true,
    mainRisk: '',
    specificMeasures: '',
    associatedPpe: '',
    notes: ''
  };

  const [formData, setFormData] = useState<any>(defaultFormState);

  useEffect(() => {
    fetchItems();
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await resourcesService.getAll();
      
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getItems();
      setItems(data);
    } catch (err) {
      console.error('Error fetching inventory items', err);
      showNotification('Error al cargar inventario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success'|'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const openModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        sku: item.sku || '',
        category: item.category || '',
        unit: item.unit,
        stock: item.stock,
        minStock: item.minStock,
        location: item.location || '',
        status: item.status,
        isReturnable: item.isReturnable ?? true,
        mainRisk: item.mainRisk || '',
        specificMeasures: item.specificMeasures || '',
        associatedPpe: item.associatedPpe || '',
        notes: item.notes || ''
      });
    } else {
      setEditingItem(null);
      setFormData(defaultFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await inventoryService.updateItem(editingItem.id, formData);
        showNotification('Artículo actualizado con éxito', 'success');
      } else {
        await inventoryService.createItem(formData);
        showNotification('Artículo creado con éxito', 'success');
      }
      closeModal();
      fetchItems();
    } catch (err) {
      console.error(err);
      showNotification('Error al guardar el artículo', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar o dar de baja este artículo?')) {
      try {
        await inventoryService.updateItem(id, { status: 'inactive' });
        showNotification('Artículo dado de baja', 'success');
        fetchItems();
      } catch (err) {
        console.error(err);
        showNotification('Error al dar de baja el artículo', 'error');
      }
    }
  };

  const filteredItems = items.filter(i => 
    i.status !== 'inactive' &&
    (i.name.toLowerCase().includes(search.toLowerCase()) || 
    (i.sku && i.sku.toLowerCase().includes(search.toLowerCase())) ||
    (i.category && i.category.toLowerCase().includes(search.toLowerCase())))
  );

  const totalByUnit = filteredItems.reduce((acc, curr) => {
    const u = curr.unit || 'Uds';
    acc[u] = (acc[u] || 0) + curr.stock;
    return acc;
  }, {} as Record<string, number>);

  const totalValueDisplayEntries = Object.entries(totalByUnit).filter(([_, val]) => val > 0);

  const getCalculatedStatus = (item: any) => item.stock <= item.minStock ? 'critical' : 'ok';
  const criticalItems = filteredItems.filter(item => getCalculatedStatus(item) === 'critical').length;

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none transform translate-x-1/3 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none transform -translate-x-1/3 translate-y-1/2"></div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg font-medium flex items-center gap-2 ${
              notification.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-6 md:p-10 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                <Box className="text-indigo-600" size={32} />
                Administración de Almacén
              </h1>
              <p className="text-slate-500 mt-2 font-medium">Gestión integral del inventario, stock y parámetros.</p>
            </div>
            <button 
              onClick={() => openModal()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-2"
            >
              <Plus size={20} /> Nuevo Artículo
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Package size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Artículos Activos</p>
                <p className="text-3xl font-bold text-slate-800">{filteredItems.length}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Layers size={28} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 mb-1">Desglose por Volumen</p>
                <div className="flex flex-wrap gap-1.5">
                  {totalValueDisplayEntries.length > 0 ? totalValueDisplayEntries.map(([u, val]) => (
                    <span key={u} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-200">
                      {val} {u}
                    </span>
                  )) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-200">0</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <Activity size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Stock Crítico</p>
                <p className="text-3xl font-bold text-slate-800">{criticalItems}</p>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por código, nombre o categoría..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-700"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 border-b border-slate-200/60">
                  <tr className="text-slate-500 font-semibold">
                    <th className="px-6 py-4">Artículo</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Ubicación</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Mínimo</th>
                    <th className="px-6 py-4">Retornable</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">Cargando inventario...</td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">No se encontraron artículos activos.</td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 whitespace-normal min-w-[250px] max-w-[400px]">
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{item.sku || 'Sin código'}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {item.category || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {item.location || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded font-bold text-xs ${item.stock <= item.minStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {item.stock} {item.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {item.minStock} {item.unit}
                        </td>
                        <td className="px-6 py-4">
                          {item.isReturnable ? (
                            <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded text-xs">Sí</span>
                          ) : (
                            <span className="text-slate-500 font-semibold bg-slate-100 px-2 py-1 rounded text-xs">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar / Baja">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingItem ? 'Editar Artículo' : 'Nuevo Artículo'}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm hover:shadow transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="itemForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* General Info */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Información General</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del Artículo *</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Código / SKU</label>
                      <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Categoría</label>
                      <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ubicación (Estante/Sección o Destino)</label>
                      <input 
                        type="text" 
                        list="shelf-locations"
                        value={formData.location} 
                        onChange={e => setFormData({...formData, location: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Ej. EST_C_2 o Proyecto Centro..."
                      />
                      <datalist id="shelf-locations">
                        <option value="EST_I_3">IZQ-ARRIBA</option>
                        <option value="EST_I_2">IZQ-MEDIO</option>
                        <option value="EST_I_1">IZQ-SUELO</option>
                        <option value="EST_C_4">CENTRO-TECHO</option>
                        <option value="EST_C_3">CENTRO-ALTO</option>
                        <option value="EST_C_2">CENTRO-BAJO</option>
                        <option value="EST_C_1">CENTRO-SUELO</option>
                        <option value="EST_D_4">DER-TECHO</option>
                        <option value="EST_D_3">DER-ALTO</option>
                        <option value="EST_D_2">DER-BAJO</option>
                        <option value="EST_D_1">DER-SUELO</option>
                        <option value="EXT_IZQ">Zona Izquierda</option>
                        <option value="EXT_DER">Zona Derecha</option>
                        <option value="EXT_FRENTE">Pasillo</option>
                        <option value="EXT_EDIFICIO">Debajo de la escalera</option>
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Inventory Metrics */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Stock y Métrica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Actual *</label>
                      <input type="number" step="0.01" required value={formData.stock === 0 ? '' : formData.stock} placeholder="0" onChange={e => setFormData({...formData, stock: e.target.value === '' ? 0 : Number(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Mínimo *</label>
                      <input type="number" step="0.01" required value={formData.minStock === 0 ? '' : formData.minStock} placeholder="0" onChange={e => setFormData({...formData, minStock: e.target.value === '' ? 0 : Number(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unidad (ej. Uds, Litros)</label>
                      <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Additional Settings */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Configuración Adicional</h3>
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <input 
                      type="checkbox" 
                      id="isReturnable"
                      checked={formData.isReturnable}
                      onChange={e => setFormData({...formData, isReturnable: e.target.checked})}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <div>
                      <label htmlFor="isReturnable" className="text-sm font-semibold text-slate-800 block cursor-pointer">Artículo Retornable</label>
                      <p className="text-xs text-slate-500">Si se marca, el artículo debe ser devuelto al almacén (ej. herramientas, maquinaria).</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Riesgo Principal</label>
                      <input type="text" value={formData.mainRisk} onChange={e => setFormData({...formData, mainRisk: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">EPI Asociado</label>
                      <input type="text" value={formData.associatedPpe} onChange={e => setFormData({...formData, associatedPpe: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notas adicionales</label>
                    <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"></textarea>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200/50 rounded-xl transition-colors">
                Cancelar
              </button>
              <button form="itemForm" type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-2">
                <Save size={18} />
                Guardar Artículo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
