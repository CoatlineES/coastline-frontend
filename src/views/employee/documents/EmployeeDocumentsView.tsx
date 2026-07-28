import React, { useState, useEffect } from 'react';
import { FileText, FolderOpen, Download } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { documentsService, EmployeeDocument } from '../../../services/documents.service';

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

export default function EmployeeDocumentsView() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await documentsService.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const myDocuments = documents.filter(doc => doc.userId === user?.id);

  return (
    <div className="p-4 lg:p-8 bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FolderOpen className="text-secondary" size={32} />
            Mis Documentos
          </h1>
          <p className="text-slate-500 mt-2">Consulta y descarga tus documentos laborales y corporativos.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myDocuments.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-xl text-center border border-slate-200 shadow-sm">
                <FolderOpen className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-slate-700">No hay documentos</h3>
                <p className="text-slate-500 mt-2">Actualmente no tienes documentos disponibles en tu portal.</p>
              </div>
            ) : (
              myDocuments.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 text-blue-700 p-3 rounded-lg">
                      <FileText size={24} />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                      {CATEGORY_LABELS[doc.category] || doc.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2" title={doc.name}>{doc.name}</h3>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => handleDownload(doc.fileUrl)}
                      className="text-secondary hover:text-[#001c3a] bg-secondary/10 p-2 rounded-lg transition-colors flex items-center gap-1"
                      title="Descargar"
                    >
                      <Download size={16} />
                      <span className="text-sm font-medium">Descargar</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
