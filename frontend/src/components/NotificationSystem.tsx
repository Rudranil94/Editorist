import React, { createContext, useCallback, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const showNotification = {
  success: (message: string, duration = 5000, action?: Notification['action']) => {
    const event = new CustomEvent('showNotification', {
      detail: { message, type: 'success', duration, action }
    });
    window.dispatchEvent(event);
  },
  error: (message: string, duration = 0, action?: Notification['action']) => {
    const event = new CustomEvent('showNotification', {
      detail: { message, type: 'error', duration, action }
    });
    window.dispatchEvent(event);
  },
  warning: (message: string, duration = 5000, action?: Notification['action']) => {
    const event = new CustomEvent('showNotification', {
      detail: { message, type: 'warning', duration, action }
    });
    window.dispatchEvent(event);
  },
  info: (message: string, duration = 5000, action?: Notification['action']) => {
    const event = new CustomEvent('showNotification', {
      detail: { message, type: 'info', duration, action }
    });
    window.dispatchEvent(event);
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Notification[]>([]);
  const maxHistoryItems = 50;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, newNotification]);
    setHistory(prev => [newNotification, ...prev].slice(0, maxHistoryItems));

    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    const handleShowNotification = (event: CustomEvent) => {
      addNotification(event.detail);
    };

    window.addEventListener('showNotification', handleShowNotification as EventListener);
    return () => {
      window.removeEventListener('showNotification', handleShowNotification as EventListener);
    };
  }, []);

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearNotifications }}>
      {children}
      {createPortal(
        <div className="fixed bottom-0 right-0 z-50 p-4">
          {/* Notification History Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="fixed bottom-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
          >
            <ClockIcon className="h-6 w-6 text-gray-600" />
          </button>

          {/* Active Notifications */}
          <div className="space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`${getNotificationColor(notification.type)} text-white rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300 ease-in-out`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm">{notification.message}</p>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="ml-4 text-white hover:text-gray-200"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                {notification.action && (
                  <button
                    onClick={() => {
                      notification.action?.onClick();
                      removeNotification(notification.id);
                    }}
                    className="mt-2 text-sm underline hover:text-gray-200"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Notification History Panel */}
          {showHistory && (
            <div className="fixed bottom-16 right-4 w-96 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Notification History</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="divide-y">
                {history.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 ${getNotificationColor(notification.type)} bg-opacity-10`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      <div className={`h-2 w-2 rounded-full ${getNotificationColor(notification.type)}`} />
                    </div>
                    {notification.action && (
                      <button
                        onClick={() => notification.action?.onClick()}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        {notification.action.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
}; 