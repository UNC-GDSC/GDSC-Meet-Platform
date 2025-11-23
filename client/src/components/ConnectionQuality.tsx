import { useState, useEffect } from 'react';
import { Signal, SignalHigh, SignalLow, SignalMedium } from 'lucide-react';

interface ConnectionQualityProps {
  participantId?: string;
}

export default function ConnectionQuality({ participantId }: ConnectionQualityProps) {
  const [quality, setQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('excellent');
  const [stats, setStats] = useState({ latency: 0, packetLoss: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const randomLatency = Math.random() * 100;
      const randomPacketLoss = Math.random() * 5;

      setStats({
        latency: randomLatency,
        packetLoss: randomPacketLoss,
      });

      if (randomLatency < 50 && randomPacketLoss < 1) {
        setQuality('excellent');
      } else if (randomLatency < 100 && randomPacketLoss < 2) {
        setQuality('good');
      } else {
        setQuality('poor');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [participantId]);

  const getIcon = () => {
    switch (quality) {
      case 'excellent':
        return <SignalHigh className="w-4 h-4 text-green-500" />;
      case 'good':
        return <SignalMedium className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <SignalLow className="w-4 h-4 text-red-500" />;
      default:
        return <Signal className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-1 bg-gray-800/80 rounded-full"
      title={`Latency: ${stats.latency.toFixed(0)}ms, Packet Loss: ${stats.packetLoss.toFixed(1)}%`}
    >
      {getIcon()}
      <span className="text-xs text-white capitalize">{quality}</span>
    </div>
  );
}
