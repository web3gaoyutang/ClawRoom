import { useRef, useState, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InfoPanel from './components/InfoPanel';
import PixelRoom from './components/PixelRoom';
import { CharacterManager } from './game/CharacterManager';
import { useMockCheckin } from './hooks/useMockCheckin';
import type { CharacterData } from './types';

const EVENT_NAME = 'OpenClaw Meetup 2026';

export default function App() {
  const managerRef = useRef(new CharacterManager());
  const [totalCount, setTotalCount] = useState(0);
  const [recentNames, setRecentNames] = useState<string[]>([]);
  const [latestName, setLatestName] = useState<string | null>(null);

  const handleCheckin = useCallback((character: CharacterData) => {
    managerRef.current.addCharacter(character);
    setRecentNames(prev => [...prev, character.nickname]);
    setLatestName(character.nickname);
  }, []);

  // Mock check-ins for demo
  useMockCheckin({
    onCheckin: handleCheckin,
    intervalMin: 3000,
    intervalMax: 8000,
    initialBurst: 10,
  });

  const handleCountChange = useCallback((count: number) => {
    setTotalCount(count);
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#06060f',
      overflow: 'hidden',
    }}>
      <Header eventName={EVENT_NAME} />

      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* Main pixel room */}
        <div style={{ flex: 1, position: 'relative' }}>
          <PixelRoom
            managerRef={managerRef}
            onCountChange={handleCountChange}
          />

          {/* Vignette overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(6,6,15,0.6) 100%)',
          }} />

          {/* Scanline effect */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          }} />
        </div>

        {/* Info panel */}
        <InfoPanel totalCount={totalCount} recentNames={recentNames} />
      </div>

      <Footer latestName={latestName} />
    </div>
  );
}
