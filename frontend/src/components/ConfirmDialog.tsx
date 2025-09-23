import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: 'text-red-600 dark:text-red-400',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 13.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 13.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };
      case 'info':
        return {
          iconColor: 'text-blue-600 dark:text-blue-400',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      default:
        return {
          iconColor: 'text-gray-600 dark:text-gray-400',
          confirmButton: 'bg-gray-600 hover:bg-gray-700 text-white',
          icon: null
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="p-6 sm:p-8">
          {/* Header com ícone */}
          <div className="flex items-center mb-6">
            <div className={`flex-shrink-0 ${styles.iconColor}`}>
              {styles.icon}
            </div>
            <h3 className="ml-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          </div>

          {/* Mensagem */}
          <div className="mb-8">
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onCancel}
              className="w-full sm:flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`w-full sm:flex-1 ${styles.confirmButton} py-3 px-6 rounded-lg font-medium transition-colors duration-200`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;