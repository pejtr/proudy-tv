import { useState, useCallback } from 'react';

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((props: Toast) => {
    // Simple console log for now - can be replaced with actual toast UI
    console.log(`[Toast] ${props.title}${props.description ? `: ${props.description}` : ''}`);
    
    setToasts(prev => [...prev, props]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3000);
  }, []);

  return { toast, toasts };
}
