import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (type: 'success' | 'error' | 'info', message: string) => {
      const notification: Notification = {
        id: uuidv4(),
        type,
        message,
      };

      setNotifications((prev) => [...prev, notification]);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback(
    (message: string) => addNotification('success', message),
    [addNotification]
  );

  const error = useCallback(
    (message: string) => addNotification('error', message),
    [addNotification]
  );

  const info = useCallback(
    (message: string) => addNotification('info', message),
    [addNotification]
  );

  return {
    notifications,
    removeNotification,
    success,
    error,
    info,
  };
}
