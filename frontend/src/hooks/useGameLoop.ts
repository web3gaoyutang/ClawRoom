import { useRef, useEffect, useCallback } from 'react';

export function useGameLoop(callback: (delta: number) => void) {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const loop = useCallback((time: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = time;
    const delta = Math.min(time - lastTimeRef.current, 50); // cap at 50ms
    lastTimeRef.current = time;
    callbackRef.current(delta);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);
}
