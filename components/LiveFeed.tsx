
import React, { useMemo } from 'react';
import { DataPacket } from '../types';

interface LiveFeedProps {
  packets: DataPacket[];
}

const SOURCES = ['GNSS', 'SEISMIC', 'CLIMATE', 'INSAR'] as const;

const LiveFeed: React.FC<LiveFeedProps> = ({ packets }) => {
  const sourceStatuses = useMemo(() => {
    const now = new Date().getTime();
    return SOURCES.map(source => {
      const lastPacket = packets.find(p => p.source === source);
      if (!lastPacket) return { source, status: 'DISCONNECTED', color: 'bg-red-500' };
      
      const diff = (now - lastPacket.timestamp.getTime()) / 1000;
      if (diff < 12) return { source, status: 'CONNECTED', color: 'bg-green-500' };
      if (diff < 25) return { source, status: 'INTERMITTENT', color: 'bg-yellow-500' };
      return { source, status: 'DISCONNECTED', color: 'bg-red-500' };
    });
  }, [packets]);

  return (
    <div className="flex flex-col h-64 bg-slate-950 border-t border-slate-800 font-mono text-[10px] overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/50 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="font-bold text-slate-400 uppercase tracking-widest">Live Ingestion Pipeline</span>
          </div>
          
          {/* Source Indicators */}
          <div className="hidden md:flex items-center gap-3 border-l border-slate-800 pl-4">
            {sourceStatuses.map((s) => (
              <div key={s.source} className="flex items-center gap-1.5 group cursor-help">
                <div className={`w-1.5 h-1.5 rounded-full ${s.color} transition-colors duration-500`}></div>
                <span className="text-slate-500 group-hover:text-slate-300 transition-colors">{s.source}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-600">SEQ_BUF: {packets.length}/50</span>
          <span className="text-slate-600">v1.2.0-STABLE</span>
        </div>
      </div>
      
      {/* Scrollable Packet Log */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {packets.length === 0 && (
          <div className="text-slate-700 italic h-full flex items-center justify-center">
            Establishing secure uplink to regional monitoring stations...
          </div>
        )}
        {packets.map((packet) => (
          <div key={packet.id} className="flex gap-2 items-start border-b border-slate-900/50 pb-1 hover:bg-slate-900/20 transition-colors">
            <span className="text-slate-600 shrink-0">[{packet.timestamp.toLocaleTimeString()}]</span>
            <span className={`font-bold shrink-0 ${
              packet.source === 'GNSS' ? 'text-blue-400' :
              packet.source === 'SEISMIC' ? 'text-orange-400' :
              packet.source === 'CLIMATE' ? 'text-emerald-400' :
              'text-purple-400'
            }`}>{packet.source}</span>
            <span className="text-slate-500 shrink-0">@ {packet.location}:</span>
            <span className={`flex-1 break-all ${packet.status === 'WARNING' ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
              {packet.value}
            </span>
            <span className={`text-[8px] font-bold shrink-0 px-1 rounded ${
              packet.status === 'SUCCESS' ? 'text-green-500/50 border border-green-900/50' : 'text-red-500/50 border border-red-900/50'
            }`}>
              {packet.status}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile-only status row if needed or just keep it simple */}
      <div className="md:hidden flex justify-around py-1 bg-slate-900/30 border-t border-slate-900">
        {sourceStatuses.map((s) => (
          <div key={s.source} className="flex items-center gap-1">
            <div className={`w-1 h-1 rounded-full ${s.color}`}></div>
            <span className="text-[8px] text-slate-500">{s.source}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveFeed;
