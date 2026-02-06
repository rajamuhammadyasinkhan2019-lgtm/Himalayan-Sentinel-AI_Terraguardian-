
import React from 'react';
import { SidebarView } from '../types';

interface SidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = Object.values(SidebarView);

  const getIcon = (view: SidebarView) => {
    switch (view) {
      case SidebarView.OVERVIEW: return '󰕶';
      case SidebarView.TERRAIN_3D: return '󰆧';
      case SidebarView.GLACIER_HEALTH: return '󱗼';
      case SidebarView.AVALANCHE_RISK: return '󱗽';
      case SidebarView.PLATE_TECTONICS: return '󱓇';
      case SidebarView.ATMOSPHERIC: return '󰖐';
      case SidebarView.ECOSYSTEM: return '󰐅';
      case SidebarView.ADVANCED: return '󱇮';
      default: return '󰋙';
    }
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">H</div>
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-none">HIMALAYAN</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Sentinel AI</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => onViewChange(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                activeView === item 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span className="text-lg opacity-80">{getIcon(item)}</span>
              <span className="font-medium">{item}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-slate-300 font-medium">Observatory Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
