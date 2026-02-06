
import { DataPacket } from '../types';

const SOURCES = ['GNSS', 'SEISMIC', 'CLIMATE', 'INSAR'] as const;
const LOCATIONS = ['Everest Base', 'Kathmandu Valley', 'Lhasa Plateau', 'Annapurna Circuit', 'MHT Front'];

export const generateMockPacket = (): DataPacket => {
  const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  
  let value = '';
  let status: 'SUCCESS' | 'WARNING' | 'ERROR' = 'SUCCESS';

  switch (source) {
    case 'GNSS':
      const conv = (38 + Math.random() * 2).toFixed(2);
      value = `Convergence: ${conv}mm/yr`;
      break;
    case 'SEISMIC':
      const mag = (1 + Math.random() * 4).toFixed(1);
      value = `Event: Mag ${mag}`;
      if (parseFloat(mag) > 4.5) status = 'WARNING';
      break;
    case 'CLIMATE':
      const temp = (Math.random() * 10 - 5).toFixed(1);
      value = `Ambient: ${temp}°C`;
      break;
    case 'INSAR':
      const def = (Math.random() * 5).toFixed(2);
      value = `Deformation: ${def}mm`;
      break;
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    source,
    timestamp: new Date(),
    value,
    location,
    status
  };
};

export const startDataStream = (callback: (packet: DataPacket) => void) => {
  const interval = setInterval(() => {
    callback(generateMockPacket());
  }, 3000 + Math.random() * 4000);

  return () => clearInterval(interval);
};
