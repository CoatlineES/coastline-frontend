import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, Trash2, X, Activity, Briefcase, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as notificationsService from '../../services/notifications.service';
import { Notification } from '../../services/notifications.service';

interface NotificationsDropdownProps {
  onClose?: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationsService.getNotifications(20);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationsService.clearAll();
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await notificationsService.markAsRead(notif.id);
    }

    if (onClose) onClose();

    // Navigate based on type
    if (notif.type === 'DEAL' && notif.referenceId) {
      // Pass the referenceId so the CRM dashboard can potentially open the 360 view
      navigate(`/app/empleado/crm?tab=dashboard&dealId=${notif.referenceId}`);
    } else if (notif.type === 'ACTIVITY') {
      navigate(`/app/empleado/crm?tab=activities`);
    } else {
      // Fallback
      navigate('/app/empleado/crm');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'DEAL': return <Briefcase size={16} className="text-blue-500" />;
      case 'ACTIVITY': return <Activity size={16} className="text-orange-500" />;
      default: return <Info size={16} className="text-slate-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Si es hoy, mostrar hora
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si fue ayer
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Más de 1 día
    return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[80vh]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Bell size={18} className="text-slate-600" />
          Notificaciones
        </h3>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              title="Marcar todas como leídas"
            >
              Leídas
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Limpiar todas"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Bell size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 flex gap-3 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
              >
                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm truncate pr-2 ${!notif.isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`text-xs line-clamp-2 ${!notif.isRead ? 'text-slate-600' : 'text-slate-500'}`}>
                    {notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                  <button 
                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors self-center opacity-0 group-hover:opacity-100"
                    title="Marcar como leída"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
