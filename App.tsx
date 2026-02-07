
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MetricsGrid from './components/MetricsGrid';
import VisualizationCanvas from './components/VisualizationCanvas';
import ChatInterface from './components/ChatInterface';
import LiveFeed from './components/LiveFeed';
import { SidebarView, TopTab, Metric, HazardAlert, DataPacket } from './types';
import { startDataStream } from './services/dataIngestion';

const INITIAL_METRICS: Metric[] = [
  { label: 'Convergence', value: 38.4, unit: 'mm/yr', trend: 'stable', confidence: 94 },
  { label: 'Exhumation', value: 2.1, unit: 'mm/yr', trend: 'up', confidence: 88 },
  { label: 'Shortening', value: 24, unit: '%', trend: 'stable', confidence: 91 },
  { label: 'Strain Balance', value: 'Over-thickened', unit: '', trend: 'stable', confidence: 85 },
  { label: 'Locked Segments', value: 62, unit: '%', trend: 'up', confidence: 96 },
  { label: 'Moho Depth', value: 75, unit: 'km', trend: 'stable', confidence: 82 },
  { label: 'Crustal Thickness', value: 82, unit: 'km', trend: 'stable', confidence: 84 },
  { label: 'Model Confidence', value: 92.5, unit: '%', trend: 'stable', confidence: 99 },
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<SidebarView>(SidebarView.OVERVIEW);
  const [activeTab, setActiveTab] = useState<TopTab>(TopTab.MAP);
  const [metrics, setMetrics] = useState<Metric[]>(INITIAL_METRICS);
  const [livePackets, setLivePackets] = useState<DataPacket[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Start the real-time data ingestion stream
    const stopStream = startDataStream((packet) => {
      setLivePackets(prev => [packet, ...prev].slice(0, 50));
      
      // Dynamically update metrics based on incoming data
      setMetrics(currentMetrics => currentMetrics.map(m => {
        if (packet.source === 'GNSS' && m.label === 'Convergence') {
          const newVal = parseFloat(packet.value.split(': ')[1]);
          return { ...m, value: newVal, trend: newVal > 38.4 ? 'up' : 'down' };
        }
        if (packet.source === 'SEISMIC' && m.label === 'Model Confidence' && packet.status === 'WARNING') {
          return { ...m, confidence: Math.max(0, m.confidence - 0.5) };
        }
        return m;
      }));
    });

    return () => stopStream();
  }, []);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio?.hasSelectedApiKey) {
        // @ts-ignore
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
          <div className="flex gap-4">
            {Object.values(TopTab).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] font-bold tracking-widest px-3 py-1.5 rounded transition-all ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
             {!hasApiKey && (
                <button 
                  onClick={handleSelectKey}
                  className="bg-amber-600/20 text-amber-500 text-[10px] font-bold px-3 py-1 rounded border border-amber-600/30 hover:bg-amber-600/30"
                >
                  ACTIVATE PRO MODELS
                </button>
             )}
             <div className="flex items-center gap-2 text-slate-500">
               <span className="text-[10px] font-bold mono">84.5° E | 28.2° N</span>
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
             </div>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-h-0 relative">
            <VisualizationCanvas activeTab={activeTab} activeView={activeView} />
            <LiveFeed packets={livePackets} />
          </div>
          
          <div className="absolute top-20 right-[400px] w-64 space-y-2 pointer-events-none">
            {metrics.find(m => m.label === 'Locked Segments' && Number(m.value) > 60) && (
              <div className="bg-red-900/80 border border-red-700 p-3 rounded-lg backdrop-blur animate-pulse pointer-events-auto">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm">⚠</span>
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">CRITICAL ALERT</p>
                </div>
                <p className="text-xs text-red-100">Locked segment &gt; 60% detected. Slip deficit accelerating at MHT front.</p>
              </div>
            )}
          </div>

          <ChatInterface />
        </div>

        <MetricsGrid metrics={metrics} />

        <footer className="h-8 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between shrink-0">
          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">
            HIMALAYAN SENTINEL AI // CONCEPT: MUHAMMAD YASIN KHAN
          </p>
          <div className="flex gap-4 text-[9px] font-bold text-slate-500">
             <span>v3.12-OROGENIC-STABLE</span>
             <span>STREAM: ACTIVE</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
