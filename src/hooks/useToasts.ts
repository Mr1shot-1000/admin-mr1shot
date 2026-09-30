import { useState, useCallback } from 'react';
import type { ToastAlert } from '@/types';

export function useToasts() {
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const addToast = useCallback((type: ToastAlert['type'], message: string) => {
    const id = Date.now().toString() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
