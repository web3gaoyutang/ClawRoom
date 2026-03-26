import { useState } from 'react';

export default function App() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('clawhub install weixiahub');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#06060f',
      color: '#FFFFFF',
      fontFamily: '"Press Start 2P", monospace',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        width: 64,
        height: 64,
        background: 'linear-gradient(135deg, #4ECDC4, #45B7D1)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        color: '#0a0a1a',
        fontWeight: 'bold',
        boxShadow: '0 0 24px rgba(78, 205, 196, 0.5)',
        marginBottom: 32,
      }}>
        C
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 28,
        margin: '0 0 16px 0',
        color: '#4ECDC4',
        textShadow: '0 0 12px rgba(78, 205, 196, 0.4)',
        letterSpacing: 4,
      }}>
        ClawRoom
      </h1>

      <p style={{
        fontSize: 14,
        color: '#8888aa',
        margin: '0 0 48px 0',
        fontFamily: 'monospace',
        letterSpacing: 1,
      }}>
        Pixel check-in display for offline events
      </p>

      {/* Install command */}
      <div
        onClick={handleCopy}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(78, 205, 196, 0.08)',
          border: '2px solid #4ECDC4',
          borderRadius: 12,
          padding: '20px 32px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 0 20px rgba(78, 205, 196, 0.15)',
        }}
      >
        <span style={{
          color: '#4ECDC4',
          fontSize: 14,
          fontFamily: '"Press Start 2P", monospace',
        }}>
          $
        </span>
        <code style={{
          fontSize: 18,
          color: '#FFFFFF',
          fontFamily: '"Fira Code", "Cascadia Code", monospace',
          letterSpacing: 1,
        }}>
          clawhub install weixiahub
        </code>
        <span style={{
          fontSize: 12,
          color: copied ? '#4ECDC4' : '#666',
          fontFamily: 'monospace',
          marginLeft: 8,
          minWidth: 60,
          textAlign: 'center',
        }}>
          {copied ? 'Copied!' : 'Click to copy'}
        </span>
      </div>
    </div>
  );
}
