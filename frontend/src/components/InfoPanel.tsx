import { useEffect, useState } from 'react';

interface InfoPanelProps {
  totalCount: number;
  recentNames: string[];
}

export default function InfoPanel({ totalCount, recentNames }: InfoPanelProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [time, setTime] = useState(new Date());

  // Animated counter
  useEffect(() => {
    if (displayCount < totalCount) {
      const timer = setTimeout(() => {
        setDisplayCount(prev => Math.min(prev + 1, totalCount));
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [displayCount, totalCount]);

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: 260,
      height: '100%',
      background: 'linear-gradient(180deg, rgba(10,10,30,0.92) 0%, rgba(15,15,40,0.95) 100%)',
      borderLeft: '2px solid #4ECDC4',
      boxShadow: '-4px 0 20px rgba(78, 205, 196, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 16px',
      gap: 20,
      overflow: 'hidden',
    }}>
      {/* Check-in count */}
      <div style={{
        textAlign: 'center',
        padding: '16px 0',
      }}>
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 10,
          color: '#4ECDC4',
          marginBottom: 8,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          CHECKED IN
        </div>
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 42,
          color: '#FFFFFF',
          textShadow: '0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3)',
          lineHeight: 1,
        }}>
          {displayCount}
        </div>
        <div style={{
          marginTop: 8,
          height: 3,
          background: 'linear-gradient(90deg, transparent, #4ECDC4, transparent)',
          borderRadius: 2,
        }} />
      </div>

      {/* Status */}
      <StatusBlock label="STATUS" value="LIVE" color="#00FF88" />
      <StatusBlock
        label="TIME"
        value={time.toLocaleTimeString('zh-CN', { hour12: false })}
        color="#45B7D1"
      />

      {/* Recent check-ins */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 8,
          color: '#4ECDC4',
          marginBottom: 10,
          letterSpacing: 2,
        }}>
          RECENT
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          {recentNames.slice(-8).reverse().map((name, i) => (
            <div
              key={`${name}-${i}`}
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 8,
                color: i === 0 ? '#FFFFFF' : `rgba(255,255,255,${0.7 - i * 0.07})`,
                padding: '6px 8px',
                background: i === 0
                  ? 'rgba(78, 205, 196, 0.15)'
                  : 'rgba(255,255,255,0.03)',
                borderLeft: i === 0 ? '2px solid #4ECDC4' : '2px solid transparent',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {i === 0 && <span style={{ color: '#4ECDC4', marginRight: 6 }}>▸</span>}
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* QR Placeholder */}
      <div style={{
        padding: 12,
        border: '1px solid rgba(78, 205, 196, 0.3)',
        borderRadius: 4,
        textAlign: 'center',
      }}>
        <div style={{
          width: 80,
          height: 80,
          margin: '0 auto 8px',
          background: '#FFFFFF',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: 64,
            height: 64,
            background: `
              repeating-conic-gradient(#0a0a1a 0% 25%, #fff 0% 50%)
              0 0 / 8px 8px
            `,
            borderRadius: 2,
          }} />
        </div>
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 7,
          color: '#4ECDC4',
          letterSpacing: 1,
        }}>
          SCAN TO CHECK IN
        </div>
      </div>

      {/* Branding */}
      <div style={{
        textAlign: 'center',
        paddingTop: 8,
        borderTop: '1px solid rgba(78, 205, 196, 0.2)',
      }}>
        <span style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 7,
          color: 'rgba(78, 205, 196, 0.5)',
          letterSpacing: 2,
        }}>
          POWERED BY OPENCLAW
        </span>
      </div>
    </div>
  );
}

function StatusBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 10px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 4,
    }}>
      <span style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 7,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 9,
        color,
        textShadow: `0 0 8px ${color}44`,
      }}>
        {value}
      </span>
    </div>
  );
}
