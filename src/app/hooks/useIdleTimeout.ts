import { useEffect, useRef } from 'react';

interface UseIdleTimeoutProps {
    timeout: number; // Tempo limite em milissegundos
    onTimeout: () => void; // Função chamada ao atingir o limite
}

const useIdleTimeout = ({ timeout, onTimeout }: UseIdleTimeoutProps) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(onTimeout, timeout);
    };

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'click'];

        const handleActivity = () => resetTimer();

        events.forEach((event) => window.addEventListener(event, handleActivity));

        resetTimer(); // Inicia o timer ao montar

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach((event) => window.removeEventListener(event, handleActivity));
        };
    }, [timeout, onTimeout]);

    return resetTimer;
};

export default useIdleTimeout;
