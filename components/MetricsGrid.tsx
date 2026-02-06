
import React from 'react';
import { Metric } from '../types';

interface MetricsGridProps {
  metrics: Metric[];
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 p-4 bg-slate-900 border-t border-slate-800">
      {metrics.map((m, i) => (
        <div key={i} className="bg-slate-800/30 border border-slate-700/50 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate w-full">{m.label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-100 mono">{m.value}</span>
            <span className="text-[10px] text-slate-500 font-medium">{m.unit}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="h-1 bg-slate-700 rounded-full flex-1 mr-2 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                style={{ width: `${m.confidence}%` }}
              ></div>
            </div>
            <span className="text-[8px] text-slate-500 mono">{m.confidence}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid;
