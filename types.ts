
export enum SidebarView {
  OVERVIEW = 'Overview',
  TERRAIN_3D = '3D Terrain',
  GLACIER_HEALTH = 'Glacier Health',
  AVALANCHE_RISK = 'Avalanche Risk',
  PLATE_TECTONICS = 'Plate Tectonics',
  ATMOSPHERIC = 'Atmospheric',
  ECOSYSTEM = 'Ecosystem Model',
  ADVANCED = 'Advanced Analysis'
}

export enum TopTab {
  MAP = 'MAP',
  CRUST = 'CRUST',
  SECTION = 'SECTION',
  DISP = 'DISP',
  PETRO = 'PETRO',
  AGE = 'AGE'
}

export interface Metric {
  label: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

export interface HazardAlert {
  id: string;
  type: 'LOCKED_SEGMENT' | 'SLIP_DEFICIT' | 'GLACIER_THINNING' | 'UPLIFT_PULSE';
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  description: string;
  timestamp: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image' | 'video' | 'thinking';
  mediaUrl?: string;
}

export interface DataPacket {
  id: string;
  source: 'GNSS' | 'SEISMIC' | 'CLIMATE' | 'INSAR';
  timestamp: Date;
  value: string;
  location?: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}
