import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

export default function NotificationCenter({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New material added', body: 'A new study material has been uploaded.', read: false },
    { id: 2, title: 'Exam scheduled', body: 'Your practice exam is ready.', read: false },
  ]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <div className={cn('fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity', isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}>
      <div className={cn('absolute right-0 top-0 h-full w-80 bg-white dark:bg-slate-900 shadow-xl transform transition-transform', isOpen ? 'translate-x-0' : 'translate-x-full')}>
        <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold">Notifications</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {notifications.map(n => (
            <div key={n.id} className={cn('p-4 rounded-lg border', n.read ? 'bg-slate-50 dark:bg-slate-800' : 'bg-primary/10 border-primary/20')}>
              <h3 className="font-bold text-sm mb-1">{n.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{n.body}</p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={markAllRead} className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
}
