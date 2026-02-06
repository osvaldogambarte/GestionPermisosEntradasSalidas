
import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type: 'success' | 'danger' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, type 
}) => {
  if (!isOpen) return null;

  const colors = {
    success: 'bg-green-600 hover:bg-green-700 shadow-green-100',
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-100',
    info: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100',
  };

  const icons = {
    success: <i className="fas fa-check-circle text-green-500 text-4xl mb-4"></i>,
    danger: <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>,
    info: <i className="fas fa-info-circle text-indigo-500 text-4xl mb-4"></i>,
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center transform animate-in zoom-in-95 duration-200">
        {icons[type]}
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          {message}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className={`w-full py-3.5 rounded-2xl text-white font-bold shadow-lg transition-all active:scale-95 ${colors[type]}`}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3.5 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 transition-all"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
