import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AlertModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',  
  autoClose = true,
  autoCloseDelay = 3000 
}) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const bgColor = {
    success: 'bg-emerald-500/10 border-emerald-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    info: 'bg-blue-500/10 border-blue-500/30'
  }[type];

  const iconColor = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    info: 'text-blue-400'
  }[type];

  const Icon = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative w-full max-w-sm mx-4 p-6 rounded-lg border ${bgColor} bg-[#0a0e17]/95`}>
        <div className="flex items-start gap-4">
          <Icon className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-white font-bold mb-2">{title}</h3>
            )}
            <p className="text-sm text-gray-300 break-words">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded transition-colors text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function useAlert() {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (message, type = 'info', title = '') => {
    setAlertState({
      isOpen: true,
      title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice'),
      message,
      type
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  return { alertState, showAlert, closeAlert };
}