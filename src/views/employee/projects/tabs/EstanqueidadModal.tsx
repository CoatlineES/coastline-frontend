import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Calendar, ChevronDown, ChevronRight, Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Project } from '../../../../services/types';
import { WaterproofingCertificate, waterproofingService, WaterproofingZone } from '../../../../services/waterproofing.service';
import { uploadService } from '../../../../services/upload.service';
import { projectPlanningService, ProjectTask } from '../../../../services/project-planning.service';
import { authService, User } from '../../../../services/auth.service';
import { usersService } from '../../../../services/users.service';

interface EstanqueidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  cert: WaterproofingCertificate | null;
  project: Project;
  onSave: () => void;
}

export function EstanqueidadModal({ isOpen, onClose, cert, project, onSave }: EstanqueidadModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [technicianId, setTechnicianId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState('');
  const [generalPhotos, setGeneralPhotos] = useState<string[]>([]);
  const [zones, setZones] = useState<Partial<WaterproofingZone>[]>([]);
  
  const [expandedZoneIndex, setExpandedZoneIndex] = useState<number | null>(null);
  
  const [availableProjectTasks, setAvailableProjectTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
      if (cert) {
        setDate(cert.date.split('T')[0]);
        setNotes(cert.notes || '');
        setGeneralPhotos(cert.generalPhotos || []);
        setZones(cert.zones);
        if (cert.technicianId) {
          setTechnicianId(cert.technicianId);
        }
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setGeneralPhotos([]);
        // Default technician to current user (simulated, ideally passed from context)
        const currentUserStr = localStorage.getItem('user');
        if (currentUserStr) {
          try {
            const currentUser = JSON.parse(currentUserStr);
            if (currentUser.id) setTechnicianId(currentUser.id);
          } catch (e) {
          }
        }
      }
    }
  }, [isOpen, cert]);

  const loadDependencies = async () => {
    try {
      const allUsers = await usersService.getUsers();
      if (allUsers.data) {
        setUsers(allUsers.data as any);
      }
      
      // Fetch chapters/subzones from the project plan
      const plans = await projectPlanningService.getPlansByProjectId(project.id);
      const activePlan = plans.find(p => p.isActive);
      if (activePlan) {
        // We only want top level chapters or second level subzones
        const zonesFromPlan: ProjectTask[] = [];
        activePlan.tasks.forEach(t => {
          if (t.type === 'CHAPTER' || t.type === 'SUBZONE' || t.type === 'ZONE') {
             zonesFromPlan.push(t);
          }
        });
        setAvailableProjectTasks(zonesFromPlan);

        // If it's a new cert, auto-populate zones
        if (!cert && zonesFromPlan.length > 0) {
           // No autollenamos todas las zonas, permitimos que el usuario las agregue.
        }
      }
    } catch (err) {
      console.error('Error loading dependencies', err);
    }
  };

  const handleAddZone = () => {
    setZones([...zones, {
      projectTaskId: undefined,
      customZoneName: '',
      status: 'PENDING',
      notes: '',
      photos: []
    }]);
    setExpandedZoneIndex(zones.length); // auto expand new zone
  };

  const handleUpdateZone = (index: number, field: string, value: any) => {
    setZones(prev => {
      const newZones = [...prev];
      newZones[index] = { ...newZones[index], [field]: value };
      return newZones;
    });
  };

  // Photo upload handlers
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUploadZonePhoto = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploadingImage(true);
      const newUrls: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const url = await uploadService.uploadImage(e.target.files[i]);
        newUrls.push(url);
      }
      setZones(prev => {
        const newZones = [...prev];
        newZones[index] = {
          ...newZones[index],
          photos: [...(newZones[index].photos || []), ...newUrls]
        };
        return newZones;
      });
    } catch (error) {
      console.error('Error uploading zone photo:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleUploadGeneralPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploadingImage(true);
      const newUrls: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const url = await uploadService.uploadImage(e.target.files[i]);
        newUrls.push(url);
      }
      setGeneralPhotos(prev => [...prev, ...newUrls]);
    } catch (error) {
      console.error('Error uploading general photo:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Auto-calculate global status: if any zone is rejected -> REJECTED. Else if all approved -> APPROVED. Else PENDING.
      let globalStatus = 'PENDING';
      if (zones.some(z => z.status === 'REJECTED')) {
        globalStatus = 'REJECTED';
      } else if (zones.length > 0 && zones.every(z => z.status === 'APPROVED')) {
        globalStatus = 'APPROVED';
      }

      const data = {
        date,
        notes,
        projectId: project.id,
        technicianId: technicianId || undefined,
        generalPhotos,
        status: globalStatus,
        zones: zones.map(z => ({
          projectTaskId: z.projectTaskId,
          customZoneName: z.customZoneName,
          status: z.status,
          notes: z.notes,
          photos: z.photos
        }))
      };

      if (cert?.id) {
        await waterproofingService.update(cert.id, data);
      } else {
        await waterproofingService.create(data);
      }
      
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al guardar el certificado');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-[#002D5A]" size={24} />
            <h2 className="text-xl font-bold text-slate-800">
              {cert ? 'Editar Certificado de estanqueidad' : 'Certificado de estanqueidad'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Form */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form id="waterproofing-form" onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha del certificado</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Técnico responsable</label>
                <select
                  value={technicianId}
                  onChange={(e) => setTechnicianId(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A]"
                >
                  <option value="">Selecciona un técnico...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Zones Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Inspección por zonas y subzonas</h3>
                  <p className="text-xs text-slate-500 mt-1">Indica el estado de estanqueidad y sube fotos para cada zona/subzona.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddZone}
                  className="text-xs font-bold text-[#002D5A] px-3 py-1.5 bg-[#002D5A]/10 hover:bg-[#002D5A]/20 rounded transition-colors flex items-center gap-1"
                >
                  + Agregar Zona a Inspeccionar
                </button>
              </div>

              <div className="space-y-3">
                {zones.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-lg text-center text-sm text-slate-400">
                    Aún no se ha añadido ninguna zona de inspección.
                  </div>
                ) : (
                  zones.map((zone, index) => {
                    const isExpanded = expandedZoneIndex === index;
                    const zoneTitle = zone.projectTaskId 
                      ? availableProjectTasks.find(t => t.id === zone.projectTaskId)?.name 
                      : zone.customZoneName || 'Nueva Zona (Sin Nombre)';
                    return (
                      <div key={index} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <div 
                          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => setExpandedZoneIndex(isExpanded ? null : index)}
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown size={18} className="text-slate-400"/> : <ChevronRight size={18} className="text-slate-400"/>}
                            <span className="font-medium text-slate-800 text-sm">
                              {zoneTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              {zone.status === 'APPROVED' && <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-medium">Aprobado</span>}
                              {zone.status === 'REJECTED' && <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md font-medium">Rechazado</span>}
                              {zone.status === 'PENDING' && <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">Pendiente</span>}
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setZones(zones.filter((_, i) => i !== index));
                              }}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Nombre de la Zona o Área de Inspección</label>
                                <input
                                  list={`tasks-datalist-${index}`}
                                  type="text"
                                  placeholder="Ej: Borde de la piscina, o selecciona del plan..."
                                  value={zone.projectTaskId 
                                    ? availableProjectTasks.find(t => t.id === zone.projectTaskId)?.name || ''
                                    : zone.customZoneName || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const matchedTask = availableProjectTasks.find(t => t.name === value);
                                    
                                    if (matchedTask) {
                                      handleUpdateZone(index, 'projectTaskId', matchedTask.id);
                                      handleUpdateZone(index, 'customZoneName', '');
                                    } else {
                                      handleUpdateZone(index, 'projectTaskId', undefined);
                                      handleUpdateZone(index, 'customZoneName', value);
                                    }
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#002D5A] focus:border-[#002D5A] bg-white"
                                />
                                <datalist id={`tasks-datalist-${index}`}>
                                  {availableProjectTasks.map(t => (
                                    <option key={t.id} value={t.name} />
                                  ))}
                                </datalist>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-2">Estado de la inspección</label>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateZone(index, 'status', 'APPROVED')}
                                  className={`px-4 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                                    zone.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  Aprobado
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateZone(index, 'status', 'REJECTED')}
                                  className={`px-4 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                                    zone.status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  Rechazado
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateZone(index, 'status', 'PENDING')}
                                  className={`px-4 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                                    zone.status === 'PENDING' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  Pendiente
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-2">Observaciones de zona (opcional)</label>
                              <input 
                                type="text"
                                value={zone.notes || ''}
                                onChange={(e) => handleUpdateZone(index, 'notes', e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A]"
                                placeholder="Detalles de la inspección de esta zona..."
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-2">Fotografías de evidencia</label>
                              <div className="flex flex-wrap gap-2">
                                {zone.photos?.map((photoUrl, i) => (
                                  <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-slate-200 group">
                                    <img src={photoUrl} alt="Evidencia" className="w-full h-full object-cover" />
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newPhotos = [...(zone.photos || [])];
                                        newPhotos.splice(i, 1);
                                        handleUpdateZone(index, 'photos', newPhotos);
                                      }}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                                <label className="w-16 h-16 flex flex-col items-center justify-center gap-1 bg-white border border-dashed border-slate-300 text-slate-400 rounded-md hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer">
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    multiple 
                                    onChange={(e) => handleUploadZonePhoto(index, e)} 
                                    disabled={uploadingImage}
                                  />
                                  <Camera size={16} />
                                  <span className="text-[10px] text-center px-1">
                                    {uploadingImage ? 'Subiendo...' : 'Añadir'}
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* General Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Observaciones generales</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Observaciones generales del certificado..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A] resize-none"
              ></textarea>
            </div>

            {/* General Photos */}
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Camera size={16} className="text-slate-500" />
                  Fotografías generales de la inspección
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Sube fotos generales o adicionales que no correspondan a una zona específica.</p>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <label className={`flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium transition-colors cursor-pointer ${uploadingImage ? 'bg-slate-100 text-slate-400' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handleUploadGeneralPhoto} 
                    disabled={uploadingImage}
                  />
                  <Camera size={14} /> {uploadingImage ? 'Subiendo...' : 'Añadir Fotos'}
                </label>
              </div>
              
              {generalPhotos.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {generalPhotos.map((photoUrl, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border border-slate-200 group">
                      <img src={photoUrl} alt="General" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setGeneralPhotos(generalPhotos.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-white shrink-0">
          <button
            type="submit"
            form="waterproofing-form"
            disabled={loading}
            className="w-full bg-[#002D5A] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-[#003b7a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck size={18} />
            {loading ? 'Guardando...' : 'Guardar Certificado de estanqueidad'}
          </button>
        </div>
      </div>
    </div>
  );
}
