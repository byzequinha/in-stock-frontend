import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutProps {
  onTimeout: () => void;
  timeout: number; // Tempo limite em milissegundos
}

export const useIdleTimeout = ({ onTimeout, timeout }: UseIdleTimeoutProps) => {
  const timerRef = useRef<number | null>(null);

  // Define a função resetTimer com useCallback para estabilizar sua referência
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      onTimeout();
    }, timeout);
  }, [onTimeout, timeout]);

  useEffect(() => {
    // Inicializa o timer
    resetTimer();

    const handleUserActivity = () => {
      resetTimer(); // Reseta o timer em atividade do usuário
    };

    // Adiciona listeners para eventos de atividade do usuário
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      // Remove os listeners e limpa o timer quando o componente é desmontado
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resetTimer]);

  return {
    resetTimer, // Caso você queira resetar o timer manualmente
  };
};
