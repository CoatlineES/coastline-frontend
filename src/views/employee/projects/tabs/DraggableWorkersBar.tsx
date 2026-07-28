import React, { useState, useEffect } from 'react';
import { usersService } from '../../../../services/users.service';
import { projectsService } from '../../../../services/projects.service';
import { GripHorizontal } from 'lucide-react';

interface DraggableWorker {
  id: string; // React key
  name: string;
  isSub: boolean;
  userId?: string;
  contractorWorkerId?: string;
}

interface DraggableWorkersBarProps {
  projectId?: string; // If provided, fetches project workers. If not, fetches all users.
}

export function DraggableWorkersBar({ projectId }: DraggableWorkersBarProps) {
  const [workers, setWorkers] = useState<DraggableWorker[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWorkers();
  }, [projectId]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      if (projectId) {
        const project = await projectsService.getById(projectId);
        if (project && project.workers) {
          const options: DraggableWorker[] = project.workers.map((pw: any) => {
            if (pw.contractorWorker) {
              return {
                id: pw.contractorWorker.id,
                name: pw.contractorWorker.name,
                isSub: true,
                contractorWorkerId: pw.contractorWorker.id
              };
            } else if (pw.user) {
              return {
                id: pw.user.id,
                name: pw.user.name,
                isSub: false,
                userId: pw.user.id
              };
            }
            return null;
          }).filter(Boolean) as DraggableWorker[];
          setWorkers(options);
          return;
        }
      }
      
      // If no project ID or failed to get project workers, get all users
      const res = await usersService.getUsers();
      if (res.data && Array.isArray(res.data)) {
        setWorkers(res.data.map((u: any) => ({ 
          id: u.id, 
          name: u.name, 
          isSub: false, 
          userId: u.id 
        })));
      }
    } catch (e) {
      console.error('Error loading workers for drag and drop:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, worker: DraggableWorker) => {
    const payload = worker.isSub 
      ? JSON.stringify({ type: 'worker', contractorWorkerId: worker.contractorWorkerId })
      : JSON.stringify({ type: 'worker', userId: worker.userId });
    
    e.dataTransfer.setData('application/json', payload);
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (loading) {
    return <div className="h-10 flex items-center px-4 text-xs text-slate-500 bg-slate-50 border-b border-slate-200">Cargando personal...</div>;
  }

  if (workers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto custom-scrollbar shrink-0 h-12">
      <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0 mr-2 flex items-center gap-1">
        <GripHorizontal size={14} /> Arrastrar Operarios:
      </span>
      {workers.map((worker) => (
        <div
          key={worker.id}
          draggable
          onDragStart={(e) => handleDragStart(e, worker)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-grab active:cursor-grabbing border shadow-sm transition-all hover:-translate-y-0.5 ${
            worker.isSub 
              ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-300 hover:shadow-md' 
              : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
          }`}
          title={`Arrastrar a ${worker.name} hacia una tarea`}
        >
          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white ${
            worker.isSub ? 'bg-orange-500' : 'bg-blue-600'
          }`}>
            {(worker.name || 'U').substring(0, 2).toUpperCase()}
          </div>
          <span className="whitespace-nowrap">{worker.name || 'Usuario'}</span>
        </div>
      ))}
    </div>
  );
}
