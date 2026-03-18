import { useEffect, useRef } from 'react';
import { generateMockCheckin } from '../utils/mock';
import type { CharacterData } from '../types';

interface UseMockCheckinOptions {
  onCheckin: (character: CharacterData) => void;
  intervalMin?: number; // ms
  intervalMax?: number;
  initialBurst?: number; // how many to add immediately
}

export function useMockCheckin({
  onCheckin,
  intervalMin = 2000,
  intervalMax = 6000,
  initialBurst = 8,
}: UseMockCheckinOptions) {
  const onCheckinRef = useRef(onCheckin);
  onCheckinRef.current = onCheckin;

  useEffect(() => {
    // Initial burst
    for (let i = 0; i < initialBurst; i++) {
      setTimeout(() => {
        const { character } = generateMockCheckin();
        onCheckinRef.current(character);
      }, i * 400);
    }

    // Ongoing random checkins
    let timeout: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = intervalMin + Math.random() * (intervalMax - intervalMin);
      timeout = setTimeout(() => {
        const { character } = generateMockCheckin();
        onCheckinRef.current(character);
        scheduleNext();
      }, delay);
    };
    setTimeout(() => scheduleNext(), initialBurst * 400 + 1000);

    return () => clearTimeout(timeout);
  }, [intervalMin, intervalMax, initialBurst]);
}
