import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
}) => {
  // Clases para diferentes tamaños
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${sizeClasses[size]} p-0 overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-xl`}>
        {/* Header opcional */}
        {(title || description) && (
          <DialogHeader className="px-6 py-4 border-b border-white/20">
            {title && (
              <DialogTitle className="text-xl font-bold text-white">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-sm text-slate-300">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        
        {/* Contenido del modal */}
        <div className="p-0">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;