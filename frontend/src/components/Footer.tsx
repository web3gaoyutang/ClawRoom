import { useEffect, useState } from 'react';

interface FooterProps {
  latestName: string | null;
}

const WELCOME_MESSAGES = [
  'Welcome to ClawRoom!',
  '欢迎来到 OpenClaw 社区',
  'Let\'s build something amazing together',
  '一起开源，一起创造',
  'Open Source × Community × Fun',
];

export default function Footer({ latestName }: FooterProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setMessageIndex(i => (i + 1) % WELCOME_MESSAGES.length);
        setShow(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer style={{
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'linear-gradient(0deg, rgba(10,10,30,0.95) 0%, rgba(10,10,30,0.7) 100%)',
      borderTop: '2px solid #4ECDC4',
      boxShadow: '0 0 20px rgba(78, 205, 196, 0.2)',
      padding: '0 24px',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Latest check-in */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        {latestName && (
          <>
            <span style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 7,
              color: '#4ECDC4',
              letterSpacing: 1,
            }}>
              LATEST
            </span>
            <span style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 9,
              color: '#FFFFFF',
              animation: 'fadeInSlide 0.5s ease',
            }}>
              {latestName}
            </span>
          </>
        )}
      </div>

      {/* Scrolling welcome message */}
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 8,
        color: 'rgba(78, 205, 196, 0.7)',
        letterSpacing: 2,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(8px)',
        transition: 'all 0.4s ease',
      }}>
        {WELCOME_MESSAGES[messageIndex]}
      </div>

      {/* Decorative dots */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: i === 0 ? '#FF6B6B' : i === 1 ? '#FFD700' : '#00FF88',
            boxShadow: `0 0 4px ${i === 0 ? '#FF6B6B' : i === 1 ? '#FFD700' : '#00FF88'}`,
          }} />
        ))}
      </div>
    </footer>
  );
}
