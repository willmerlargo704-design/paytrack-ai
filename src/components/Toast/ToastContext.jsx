import { createContext, useContext, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 9999 }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem',
            background: toast.type === 'error' ? '#fef2f2' : '#ecfdf5',
            color: toast.type === 'error' ? '#991b1b' : '#047857',
            border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
            borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            animation: 'slideInRight 0.3s ease forwards', fontWeight: 600, fontSize: '0.9rem'
          }}>
            {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '1rem' }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);