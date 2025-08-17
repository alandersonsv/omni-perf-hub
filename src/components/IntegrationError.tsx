import { useState } from 'react';
import { AlertCircle, XCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface IntegrationErrorProps {
  title: string;
  message: string;
  errorCode?: string;
  errorDetails?: string;
  timestamp: Date;
  platform: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  severity: 'warning' | 'error' | 'critical';
}

export function IntegrationError({
  title,
  message,
  errorCode,
  errorDetails,
  timestamp,
  platform,
  onRetry,
  onDismiss,
  severity = 'error',
}: IntegrationErrorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getSeverityColor = () => {
    switch (severity) {
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'critical':
        return 'border-red-600 bg-red-50';
      case 'error':
      default:
        return 'border-red-500 bg-red-50';
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'error':
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Alert className={`mb-3 sm:mb-4 border-l-4 ${getSeverityColor()} p-3 sm:p-4`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="mt-0.5">
            {getSeverityIcon()}
          </div>
          <div>
            <AlertTitle className="text-gray-900 text-sm sm:text-base">{title}</AlertTitle>
            <AlertDescription className="text-gray-700 mt-0.5 sm:mt-1 text-xs sm:text-sm">
              {message}
            </AlertDescription>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2 text-xs text-gray-500">
              <span className="text-[10px] sm:text-xs">Plataforma: {platform}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-[10px] sm:text-xs">Ocorrido em: {formatTimestamp(timestamp)}</span>
              {errorCode && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-[10px] sm:text-xs">Código: {errorCode}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-start">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-7 sm:h-8 px-1.5 sm:px-2 text-[10px] sm:text-xs"
            >
              <RefreshCw className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1" />
              <span className="sm:inline hidden">Tentar novamente</span>
              <span className="sm:hidden inline">Tentar</span>
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-7 sm:h-8 px-1.5 sm:px-2 text-[10px] sm:text-xs"
            >
              <XCircle className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1" />
              <span className="sm:inline hidden">Dispensar</span>
              <span className="sm:hidden inline">Fechar</span>
            </Button>
          )}
        </div>
      </div>

      {errorDetails && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-1.5 sm:mt-2">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-5 sm:h-6 text-[10px] sm:text-xs text-gray-500">
                {isOpen ? (
                  <>
                    <ChevronUp className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1" />
                    Ocultar detalhes
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1" />
                    Mostrar detalhes
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="mt-1.5 sm:mt-2 p-2 sm:p-3 bg-gray-100 rounded-md text-[10px] sm:text-xs font-mono whitespace-pre-wrap overflow-x-auto">
              {errorDetails}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Alert>
  );
}

export function IntegrationErrorList({
  errors,
  onRetryAll,
  onDismissAll,
}: {
  errors: IntegrationErrorProps[];
  onRetryAll?: () => void;
  onDismissAll?: () => void;
}) {
  if (!errors.length) return null;

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-center sm:text-left">
          Problemas de Integração ({errors.length})
        </h3>
        <div className="flex gap-1 sm:gap-2 justify-center sm:justify-start">
          {onRetryAll && (
            <Button variant="outline" size="sm" onClick={onRetryAll} className="h-7 sm:h-8 text-[10px] sm:text-xs px-1.5 sm:px-2">
              <RefreshCw className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1" />
              <span className="sm:inline hidden">Tentar todos novamente</span>
              <span className="sm:hidden inline">Tentar todos</span>
            </Button>
          )}
          {onDismissAll && (
            <Button variant="ghost" size="sm" onClick={onDismissAll} className="h-7 sm:h-8 text-[10px] sm:text-xs px-1.5 sm:px-2">
              <XCircle className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1" />
              <span className="sm:inline hidden">Dispensar todos</span>
              <span className="sm:hidden inline">Limpar</span>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {errors.map((error, index) => (
          <IntegrationError key={index} {...error} />
        ))}
      </div>
    </div>
  );
}

// Hook para gerenciar erros de integração
export function useIntegrationErrors() {
  const [errors, setErrors] = useState<IntegrationErrorProps[]>([]);

  const addError = (error: Omit<IntegrationErrorProps, 'timestamp'>) => {
    setErrors(prev => [
      ...prev,
      { ...error, timestamp: new Date() }
    ]);
  };

  const removeError = (index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return {
    errors,
    addError,
    removeError,
    clearErrors,
  };
}