import React from 'react';

interface SuccessMessageProps {
  title: string;
  description: string;
  primaryButton?: {
    text: string;
    onClick: () => void;
    variant?: 'indigo' | 'slate';
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
    variant?: 'indigo' | 'slate';
  };
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title,
  description,
  primaryButton,
  secondaryButton
}) => {
  const getButtonClasses = (variant: 'indigo' | 'slate' = 'indigo') => {
    const baseClasses = "font-medium py-2 rounded-md text-sm transition";
    
    if (variant === 'indigo') {
      return `${baseClasses} bg-indigo-600 hover:bg-indigo-500 text-white`;
    }
    return `${baseClasses} bg-slate-600 hover:bg-slate-500 text-white`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            <p className="text-slate-300 text-sm">{description}</p>
          </div>
          
          {/* Botones */}
          {(primaryButton || secondaryButton) && (
            <div className={`flex ${primaryButton && secondaryButton ? 'space-x-3' : ''}`}>
              {primaryButton && (
                <button
                  onClick={primaryButton.onClick}
                  className={`${primaryButton && secondaryButton ? 'flex-1' : 'w-full'} ${getButtonClasses(primaryButton.variant)}`}
                >
                  {primaryButton.text}
                </button>
              )}
              
              {secondaryButton && (
                <button
                  onClick={secondaryButton.onClick}
                  className={`${primaryButton && secondaryButton ? 'flex-1' : 'w-full'} ${getButtonClasses(secondaryButton.variant)}`}
                >
                  {secondaryButton.text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;