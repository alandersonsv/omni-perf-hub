import { useState, useEffect } from 'react';

export function useMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Função para verificar o tamanho da tela
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Verificar inicialmente
    checkMobile();

    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkMobile);

    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return { isMobile };
}