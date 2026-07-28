import React, { useState, useEffect } from 'react';
import { Project, ProjectWorker } from '../../../../services/types';
import { usersService } from '../../../../services/users.service';
import { projectsService } from '../../../../services/projects.service';
import { UserResponse } from '../../../../services/types';
import { User, UserPlus, Trash2, Shield, Search } from 'lucide-react';

interface ProjectTeamTabProps {
  project: Project;
  onUpdate: () => void;
}

export default function ProjectTeamTab({ project, onUpdate }: ProjectTeamTabProps) {
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('Oficial');

  const isContractorWorker = project.responsible?.role?.name === 'CONTRATISTA';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setUsersError(null);
        let allUsersData: any[] = [];

        // Fetch regular users
        const usersResponse = await usersService.getUsers();
        let usersData = usersResponse.data || usersResponse;
        if (Array.isArray((usersData as any)?.data)) {
          usersData = (usersData as any).data;
        }
        if (Array.isArray(usersData)) {
          allUsersData = [...usersData];
        }

        // Fetch sub-users if contractor
        if (isContractorWorker && project.responsible?.id) {
          const subResponse = await usersService.getContractorWorkers(project.responsible.id);
          let subData = subResponse.data || subResponse;
          if (Array.isArray((subData as any)?.data)) {
            subData = (subData as any).data;
          }
          if (Array.isArray(subData)) {
            subData = subData.map(u => ({ ...u, isSub: true }));
            allUsersData = [...allUsersData, ...subData];
          }
        }
        setAllUsers(allUsersData);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        if (error?.response?.status === 403) {
          setUsersError('No tienes permisos para ver la lista de usuarios. Contacta con un administrador.');
        } else {
          setUsersError('Error al cargar la lista de usuarios.');
        }
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [project.responsible?.id, isContractorWorker]);

  const assignedUserIds = project.workers?.map(w => w.userId || w.contractorWorkerId) || [];
  
  // Filter available users (not already assigned) and matching search
  const availableUsers = allUsers.filter(u => 
    !assignedUserIds.includes(u.id) &&
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddWorker = async (u: any) => {
    try {
      setLoading(true);
      const payload = u.isSub 
        ? { contractorWorkerId: u.id }
        : { userId: u.id };
      await projectsService.addWorker(project.id, { ...payload, role: selectedRole });
      onUpdate();
    } catch (error) {
      console.error('Error adding worker:', error);
      alert('Error al asignar el trabajador');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWorker = async (workerId: string) => {
    if (!confirm('¿Estás seguro de eliminar este operario del proyecto?')) return;
    try {
      setLoading(true);
      await projectsService.removeWorker(project.id, workerId);
      onUpdate();
    } catch (error) {
      console.error('Error removing worker:', error);
      alert('Error al eliminar el trabajador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-6 h-[calc(100vh-300px)] min-h-[500px]">
      {/* Assigned Workers List */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-[#002D5A] flex items-center gap-2">
            <Shield size={18} />
            Equipo Asignado
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#002D5A]/10 text-[#002D5A] rounded-full">
            {project.workers?.length || 0} operarios
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {!project.workers || project.workers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <User size={48} className="mx-auto mb-4 opacity-20" />
              <p>No hay operarios asignados a este proyecto.</p>
              <p className="text-sm mt-2">Busca y añade operarios desde el panel lateral para que aparezcan en los Partes Diarios.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {project.workers.map((worker) => {
                const isSub = !!worker.contractorWorker;
                const name = isSub ? worker.contractorWorker?.name : worker.user?.name;
                const email = isSub ? 'Subcontrata' : worker.user?.email;

                return (
                <div key={worker.id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col hover:border-[#002D5A] transition-colors relative group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#002D5A]/10 flex items-center justify-center text-[#002D5A] font-bold">
                        {name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1" title={name}>{name}</p>
                        <p className="text-xs text-slate-500">{email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-end">
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-700 rounded capitalize">
                      {worker.role || 'Sin rol'}
                    </span>
                    
                    <button
                      onClick={() => handleRemoveWorker(worker.id)}
                      disabled={loading}
                      className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 p-1"
                      title="Desasignar del proyecto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add New Worker Panel */}
      <div className="w-full md:w-80 lg:w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-[#002D5A] flex items-center gap-2">
            <UserPlus size={18} />
            Añadir Operario
          </h3>
        </div>
        
        <div className="p-4 border-b border-slate-100 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Buscar usuario</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Nombre del operario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A] outline-none transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Rol a desempeñar</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#002D5A]/20 focus:border-[#002D5A] outline-none transition-all"
            >
              <option value="Oficial de 1ª">Oficial de 1ª</option>
              <option value="Oficial de 2ª">Oficial de 2ª</option>
              <option value="Peón">Peón</option>
              <option value="Ayudante">Ayudante</option>
              <option value="Encargado">Encargado</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Técnico">Técnico</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-[#002D5A] rounded-full animate-spin mb-3" />
              <p className="text-sm">Cargando usuarios...</p>
            </div>
          ) : usersError ? (
            <div className="text-center py-6 px-4">
              <p className="text-sm text-red-500 font-medium">{usersError}</p>
            </div>
          ) : availableUsers.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">No hay más usuarios disponibles para asignar.</p>
          ) : (
            <div className="space-y-1">
              {availableUsers.map(u => (
                <div key={u.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-sm text-slate-800 line-clamp-1">{u.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {u.isSub ? <span className="bg-orange-100 text-orange-700 px-1 py-0.5 rounded text-[10px] font-medium">Subcontrata</span> : (u.department?.name || u.role?.name || '')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddWorker(u)}
                    disabled={loading}
                    className="shrink-0 ml-2 w-8 h-8 rounded-full bg-[#002D5A]/10 text-[#002D5A] flex items-center justify-center hover:bg-[#002D5A] hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Just importing Plus as it was missing from lucide-react imports
import { Plus } from 'lucide-react';
