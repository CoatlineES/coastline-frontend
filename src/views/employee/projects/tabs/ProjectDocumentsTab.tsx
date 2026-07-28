import React, { useState } from 'react';
import { Project, ProjectDocument, DocumentCategory } from '../../../../services/types';
import { projectsService } from '../../../../services/projects.service';
import { Upload, FileText, Trash2, Map, ShieldAlert, FilePlus, Download } from 'lucide-react';

interface Props {
  project: Project;
  onUpdate: () => void;
}

const CATEGORY_INFO: Record<DocumentCategory, { title: string, icon: React.ReactNode, bgColor: string, textColor: string }> = {
  PLANS: { title: 'Planos', icon: <Map size={18} />, bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  SAFETY_ACTS: { title: 'Actas de Seguridad y Salud', icon: <ShieldAlert size={18} />, bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  ADDITIONAL_DOCS: { title: 'Documentación adicional', icon: <FilePlus size={18} />, bgColor: 'bg-slate-50', textColor: 'text-slate-700' },
  GENERATED: { title: 'Documentos generados por la plataforma', icon: <FileText size={18} />, bgColor: 'bg-slate-50', textColor: 'text-slate-700' }
};

export default function ProjectDocumentsTab({ project, onUpdate }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: DocumentCategory) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(category);
      
      // 1. Upload to Cloudinary
      // Configuración de Cloudinary (el usuario deberá reemplazar esto con sus datos)
      const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'tu-cloud-name';
      const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'tu-upload-preset';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      // Para organizar en carpetas en Cloudinary
      formData.append('folder', `coatline/projects/${project.id}/${category}`);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary upload error:', errorText);
        throw new Error('Error al subir a Cloudinary: ' + errorText);
      }

      const data = await response.json();
      const downloadURL = data.secure_url;

      // 2. Save metadata in Backend
      await projectsService.addDocument(project.id, {
        category,
        name: file.name,
        url: downloadURL,
        size: file.size,
        mimetype: file.type || data.format
      });

      // 3. Refresh project data
      onUpdate();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo');
    } finally {
      setUploading(null);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (doc: ProjectDocument) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar ${doc.name}?`)) return;

    try {
      // Optimizamos: el backend borraría de firebase si estuviera en admin, 
      // pero como estamos en web client, podemos intentar borrarlo de Firebase aquí
      // O podemos simplemente borrar el registro de PostgreSQL, pero el archivo quedará huérfano.
      // Vamos a intentar borrarlo de Firebase si podemos extraer la ruta.
      
      // Llamamos al backend para borrar el registro
      await projectsService.deleteDocument(project.id, doc.id);
      
      // Nota: Para borrar físicamente de Cloudinary desde el frontend de forma segura 
      // se requeriría una API key que no debe exponerse. Por tanto, desde el frontend 
      // solo borramos el registro de la base de datos (PostgreSQL). El archivo quedará huérfano 
      // o se borraría desde el backend si implementamos la lógica allí.

      onUpdate();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error al borrar el documento');
    }
  };

  const renderSection = (category: DocumentCategory) => {
    const info = CATEGORY_INFO[category];
    const docs = project.documents?.filter(d => d.category === category) || [];
    const isUploading = uploading === category;

    return (
      <div key={category} className="mb-8 last:mb-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${info.bgColor} ${info.textColor}`}>
              {info.icon}
            </div>
            {info.title} <span className="text-slate-400 font-normal">({docs.length})</span>
          </h3>
          
          <label className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer
            ${isUploading ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'}
          `}>
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
            ) : (
              <Upload size={14} />
            )}
            <span>{isUploading ? 'Subiendo...' : 'Subir'}</span>
            <input 
              type="file" 
              className="hidden" 
              disabled={isUploading}
              onChange={(e) => handleFileUpload(e, category)}
            />
          </label>
        </div>

        <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-xl p-4">
          {docs.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-400">
              Sin archivos en este bloque.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docs.map(doc => (
                <div key={doc.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-start justify-between shadow-sm">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        {new Date(doc.createdAt).toLocaleDateString()}
                        {doc.size && <span>• {(doc.size / 1024 / 1024).toFixed(2)} MB</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Descargar"
                    >
                      <Download size={16} />
                    </a>
                    <button 
                      onClick={() => handleDelete(doc)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="p-8">
        {(Object.keys(CATEGORY_INFO) as DocumentCategory[]).map(category => renderSection(category))}
      </div>
    </div>
  );
}
