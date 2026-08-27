import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all transform duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
        isSuccess 
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
          : 'bg-rose-50 text-rose-800 border-rose-200'
      }`}>
        {isSuccess ? (
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
        )}
        <p className="text-sm font-medium pr-2">{message}</p>
        <button 
          onClick={onClose} 
          className={`p-1 rounded-md transition-colors ${
            isSuccess 
              ? 'hover:bg-emerald-100 text-emerald-600' 
              : 'hover:bg-rose-100 text-rose-600'
          }`}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
