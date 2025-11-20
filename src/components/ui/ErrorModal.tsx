import React from 'react';
import { AlertTriangle, X, ExternalLink, Key, Wifi, Brain } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useTranslation } from '@/features/boilerplate/i18n';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: {
    type: 'authentication' | 'network' | 'unknown';
    title: string;
    message: string;
    instructions?: string[];
    links?: Array<{ text: string; url: string }>;
  };
}

export function ErrorModal({ isOpen, onClose, error }: ErrorModalProps) {
  const { t } = useTranslation('ui');

  const getIcon = () => {
    switch (error.type) {
      case 'authentication':
        return <Key className="h-12 w-12 text-blue-500" />;
      case 'network':
        return <Wifi className="h-12 w-12 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-red-500" />;
    }
  };

  const getIconBg = () => {
    switch (error.type) {
      case 'authentication':
        return 'bg-blue-50';
      case 'network':
        return 'bg-yellow-50';
      default:
        return 'bg-red-50';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${getIconBg()} mb-4`}>
          {getIcon()}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {error.title}
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {error.message}
        </p>

        {error.instructions && error.instructions.length > 0 && (
          <div className="text-left bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
              <Brain className="h-4 w-4 mr-2 text-blue-600" />
              {t('errorModal.setupInstructions')}
            </h4>
            <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
              {error.instructions.map((instruction, index) => (
                <li key={index} className="leading-relaxed">{instruction}</li>
              ))}
            </ol>
          </div>
        )}

        {error.links && error.links.length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-gray-900">{t('errorModal.helpfulLinks')}</h4>
            <div className="flex flex-col space-y-2">
              {error.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium py-2 px-4 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <span>{link.text}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t('errorModal.continueWithoutAI')}
          </Button>
          <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
            {t('errorModal.retryAfterSetup')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}