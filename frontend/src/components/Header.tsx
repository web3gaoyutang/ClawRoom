interface HeaderProps {
  eventName: string;
}

export default function Header({ eventName }: HeaderProps) {
  return (
    <header style={{
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, rgba(10,10,30,0.95) 0%, rgba(10,10,30,0.7) 100%)',
      borderBottom: '2px solid #4ECDC4',
      boxShadow: '0 0 20px rgba(78, 205, 196, 0.3)',
      position: 'relative',
      zIndex: 10,
      padding: '0 24px',
    }}>
      {/* Logo */}
      <div style={{
        position: 'absolute',
        left: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 36,
          height: 36,
          background: 'linear-gradient(135deg, #4ECDC4, #45B7D1)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 14,
          color: '#0a0a1a',
          fontWeight: 'bold',
          boxShadow: '0 0 12px rgba(78, 205, 196, 0.5)',
        }}>
          C
        </div>
        <span style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 12,
          color: '#4ECDC4',
          letterSpacing: 2,
          textShadow: '0 0 8px rgba(78, 205, 196, 0.5)',
        }}>
          ClawRoom
        </span>
      </div>

      {/* Event Name */}
      <h1 style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 16,
        color: '#FFFFFF',
        margin: 0,
        textShadow: '0 0 10px rgba(255,255,255,0.3)',
        letterSpacing: 3,
      }}>
        {eventName}
      </h1>

      {/* Time */}
      <div style={{
        position: 'absolute',
        right: 24,
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#4ECDC4',
      }}>
        <ClockDisplay />
      </div>
    </header>
  );
}

function ClockDisplay() {
  const now = new Date();
  const time = now.toLocaleTimeString('zh-CN', { hour12: false });
  return <span>{time}</span>;
}
