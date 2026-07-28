import React, { useState, useEffect } from 'react';
import { Search, Upload, Trash2, Eye, FolderOpen } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { documentsService, EmployeeDocument } from '../../../services/documents.service';
import { uploadService } from '../../../services/upload.service';
import { usersService } from '../../../services/users.service';
import { UserResponse } from '../../../services/types';

const CATEGORY_LABELS: Record<string, string> = {
  CONTRACT: 'Contrato',
  PAYROLL: 'Nómina',
  TAX_CERT: 'Certificado Retenciones',
  MEDICAL_LEAVE: 'Baja Médica',
  SAFETY: 'PRL',
  ID_DOCUMENT: 'DNI/NIE',
  CERTIFICATION: 'Certificaciones',
  OTHER: 'Otros'
};

export default function AdminDocumentsView() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for Admin Upload
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [targetUserId, setTargetUserId] = useState('');
  const [searchAdminQuery, setSearchAdminQuery] = useState('');

  const loadDocumentsAndUsers = async () => {
    try {
      setIsLoading(true);
      const [docsData, usersData] = await Promise.all([
        documentsService.getDocuments(),
        usersService.getUsers()
      ]);
      setDocuments(docsData);
      setUsers(usersData.data);
    } catch (error) {
      console.error('Error loading data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentsAndUsers();
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !targetUserId) return;

    try {
      setIsUploading(true);
      const fileUrl = await uploadService.uploadFile(file);
      await documentsService.uploadDocument({
        name,
        category,
        fileUrl,
        userId: targetUserId
      });
      // Reset form
      setFile(null);
      setName('');
      setCategory('OTHER');
      setTargetUserId('');
      loadDocumentsAndUsers();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Error al subir el documento');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este documento?')) return;
    try {
      await documentsService.deleteDocument(id);
      loadDocumentsAndUsers();
    } catch (error) {
      console.error('Delete failed', error);
      alert('Error al eliminar');
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const adminDocuments = documents.filter(doc => 
    doc.user?.name.toLowerCase().includes(searchAdminQuery.toLowerCase()) || 
    doc.name.toLowerCase().includes(searchAdminQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FolderOpen className="text-secondary" size={32} />
            Administración de Documentos
          </h1>
          <p className="text-slate-500 mt-2">Gestiona y sube documentos para los empleados.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Upload size={20} className="text-secondary" />
                  Subir Documento
                </h2>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Empleado</label>
                    <select 
                      required
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-colors"
                    >
                      <option value="">Selecciona un empleado...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Documento</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Nómina Agosto 2026"
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-colors"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Archivo (PDF, Word, etc.)</label>
                    <input 
                      type="file" 
                      required
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isUploading || !file || !name || !targetUserId}
                    className="w-full bg-secondary hover:bg-[#001c3a] text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Subir Documento
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Todos los Documentos</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar empleado o doc..."
                      value={searchAdminQuery}
                      onChange={(e) => setSearchAdminQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none w-64 transition-shadow"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Empleado</th>
                        <th className="px-6 py-4">Documento</th>
                        <th className="px-6 py-4">Categoría</th>
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminDocuments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                            No se encontraron documentos
                          </td>
                        </tr>
                      ) : (
                        adminDocuments.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-800">
                              {doc.user?.name || 'Desconocido'}
                            </td>
                            <td className="px-6 py-4">{doc.name}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                                {CATEGORY_LABELS[doc.category] || doc.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">{new Date(doc.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleDownload(doc.fileUrl)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded transition-colors"
                                  title="Ver/Descargar"
                                >
                                  <Eye size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(doc.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                                  title="Eliminar"
                                >
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
        )}
      </div>
    </div>
  );
}
