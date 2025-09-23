import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'bg-success/10 border-success/20 text-success-foreground',
  error: 'bg-destructive/10 border-destructive/20 text-destructive-foreground',
  info: 'bg-info/10 border-info/20 text-info-foreground',
  warning: 'bg-warning/10 border-warning/20 text-warning-foreground',
};

export const Toast = ({ id, type, title, message, duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 min-w-[300px] max-w-md p-4 rounded-lg border shadow-lg transition-all duration-300',
        styles[type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          {message && <p className="text-xs mt-1 opacity-90">{message}</p>}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Manager
interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

class ToastManager {
  private toasts: ToastData[] = [];
  private listeners: ((toasts: ToastData[]) => void)[] = [];

  addToast(toast: Omit<ToastData, 'id'>) {
    const newToast = {
      ...toast,
      id: `toast_${Date.now()}_${Math.random()}`,
    };
    this.toasts = [...this.toasts, newToast];
    this.notifyListeners();
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notifyListeners();
  }

  subscribe(listener: (toasts: ToastData[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

export const toastManager = new ToastManager();

// Helper functions
export const showToast = {
  success: (title: string, message?: string) => 
    toastManager.addToast({ type: 'success', title, message }),
  error: (title: string, message?: string) => 
    toastManager.addToast({ type: 'error', title, message }),
  info: (title: string, message?: string) => 
    toastManager.addToast({ type: 'info', title, message }),
  warning: (title: string, message?: string) => 
    toastManager.addToast({ type: 'warning', title, message }),
};

// Toast Container Component
export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={toastManager.removeToast.bind(toastManager)}
        />
      ))}
    </div>
  );
};