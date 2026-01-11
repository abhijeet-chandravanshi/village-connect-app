import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md',
  showClose = true,
}) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-earth-950/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-warm-lg z-10 max-h-[90vh] overflow-hidden flex flex-col`}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-cream-100">
                {title && (
                  <h2 className="text-xl font-display font-semibold text-earth-900">
                    {title}
                  </h2>
                )}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-earth-500 hover:bg-cream-100 hover:text-earth-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="p-4 md:p-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;

