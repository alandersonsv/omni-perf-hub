import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseOAuthPopupReturn {
  openPopup: (url: string, name?: string) => Window | null;
  closePopup: () => void;
  isOpen: boolean;
  error: string | null;
}

export function useOAuthPopup(): UseOAuthPopupReturn {
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Limpar o estado quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }
    };
  }, [popupWindow]);

  // Verificar periodicamente se o popup foi fechado
  useEffect(() => {
    if (!popupWindow) return;

    const checkPopupClosed = setInterval(() => {
      if (!popupWindow || popupWindow.closed) {
        setIsOpen(false);
        setPopupWindow(null);
        clearInterval(checkPopupClosed);
      }
    }, 500);

    return () => clearInterval(checkPopupClosed);
  }, [popupWindow]);

  // Abrir o popup OAuth
  const openPopup = useCallback((url: string, name = 'oauth-popup'): Window | null => {
    try {
      setError(null);

      // Fechar qualquer popup existente
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }

      // Configurar dimensões e posição do popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;

      // Abrir o popup
      const popup = window.open(
        url,
        name,
        `width=${width},height=${height},left=${left},top=${top},toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0`
      );

      if (!popup) {
        throw new Error('Popup bloqueado pelo navegador. Por favor, permita popups para este site.');
      }

      // Tentar focar no popup
      popup.focus();

      // Atualizar o estado
      setPopupWindow(popup);
      setIsOpen(true);

      return popup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao abrir popup';
      setError(errorMessage);
      toast({
        title: 'Erro ao abrir popup',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [popupWindow, toast]);

  // Fechar o popup manualmente
  const closePopup = useCallback(() => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }
    setPopupWindow(null);
    setIsOpen(false);
  }, [popupWindow]);

  return {
    openPopup,
    closePopup,
    isOpen,
    error,
  };
}

// Hook para lidar com a comunicação entre o popup e a janela principal
export function useOAuthPopupListener<T = any>(messageType: string): {
  addMessageListener: (callback: (data: T) => void) => void;
  removeMessageListener: () => void;
} {
  const messageCallback = useCallback((callback: (data: T) => void) => {
    const handleMessage = (event: MessageEvent) => {
      // Verificar origem da mensagem para segurança
      if (event.origin !== window.location.origin) return;
      
      // Verificar se a mensagem é do tipo esperado
      if (event.data?.type === messageType) {
        callback(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [messageType]);

  const addMessageListener = useCallback((callback: (data: T) => void) => {
    return messageCallback(callback);
  }, [messageCallback]);

  const removeMessageListener = useCallback(() => {
    // Esta função será substituída pelo retorno de addMessageListener
    // quando for chamada, então é apenas um placeholder
  }, []);

  return {
    addMessageListener,
    removeMessageListener,
  };
}

// Função auxiliar para enviar mensagem da janela popup para a janela principal
export function sendMessageToParent(data: any) {
  if (window.opener && window.opener !== window) {
    window.opener.postMessage(data, window.location.origin);
  }
}