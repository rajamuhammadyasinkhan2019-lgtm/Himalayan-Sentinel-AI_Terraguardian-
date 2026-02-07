
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TopTab, SidebarView } from '../types';

interface VisualizationCanvasProps {
  activeTab: TopTab;
  activeView: SidebarView;
}

const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({ activeTab, activeView }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 3D View States
  const [layers, setLayers] = useState({
    plates: true,
    faults: true,
    subsurface: true
  });
  const [demName, setDemName] = useState<string | null>(null);

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleDemUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDemName(file.name);
      // Logic would normally parse DEM binary data here
    }
  };

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    try {
      // Serialize SVG
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgRef.current);

      // Add namespaces if missing
      if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!source.match(/^<svg[^>]+xmlns\:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }

      // Add xml declaration
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

      // Convert to blob and download
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `himalayan_section_${new Date().getTime()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error('Failed to export SVG', e);
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 60, right: 60, bottom: 80, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    if (activeView === SidebarView.TERRAIN_3D) {
      // INTERACTIVE 3D BLOCK DIAGRAM (Isometric Projection)
      const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2 + 50})`);

      // Isometric math
      const project = (x: number, y: number, z: number) => {
        const isoX = (x - y) * Math.cos(Math.PI / 6);
        const isoY = (x + y) * Math.sin(Math.PI / 6) - z;
        return [isoX, isoY];
      };

      const size = 180;
      const depth = 80;

      // Draw Subsurface Block (If enabled)
      if (layers.subsurface) {
        // Bottom Face
        const p1 = project(-size, size, -depth);
        const p2 = project(size, size, -depth);
        const p3 = project(size, -size, -depth);
        const p4 = project(-size, -size, -depth);
        
        g.append("path")
          .attr("d", `M${p1}L${p2}L${p3}L${p4}Z`)
          .attr("fill", "#0f172a")
          .attr("stroke", "#1e293b");

        // Front Face (Fault zone)
        const p5 = project(-size, size, 0);
        const p6 = project(size, size, 0);
        g.append("path")
          .attr("d", `M${p1}L${p2}L${p6}L${p5}Z`)
          .attr("fill", "#1e293b")
          .attr("opacity", 0.8)
          .attr("stroke", "#334155");

        // Side Face
        const p7 = project(size, -size, 0);
        g.append("path")
          .attr("d", `M${p2}L${p3}L${p7}L${p6}Z`)
          .attr("fill", "#111827")
          .attr("stroke", "#334155");
      }

      // Draw Top Terrain Surface
      const generateTerrain = () => {
        const points = [];
        const res = 12;
        const step = (size * 2) / res;
        for (let i = 0; i <= res; i++) {
          for (let j = 0; j <= res; j++) {
            const x = -size + i * step;
            const y = -size + j * step;
            // Simulated orogenic topography (High peaks at center-north)
            const dist = Math.sqrt(x*x + y*y);
            let z = Math.exp(-dist/100) * 80 + (Math.sin(x/20) * Math.cos(y/20)) * 10;
            if (y > 0) z += y/2; // Orogenic tilt
            points.push({ x, y, z, i, j });
          }
        }
        return points;
      };

      const terrainData = generateTerrain();
      const res = 12;

      // Draw surface meshes
      for (let i = 0; i < res; i++) {
        for (let j = 0; j < res; j++) {
          const pt1 = terrainData[i * (res + 1) + j];
          const pt2 = terrainData[(i + 1) * (res + 1) + j];
          const pt3 = terrainData[(i + 1) * (res + 1) + (j + 1)];
          const pt4 = terrainData[i * (res + 1) + (j + 1)];

          const poly = [
            project(pt1.x, pt1.y, pt1.z),
            project(pt2.x, pt2.y, pt2.z),
            project(pt3.x, pt3.y, pt3.z),
            project(pt4.x, pt4.y, pt4.z)
          ];

          g.append("path")
            .attr("d", `M${poly.join("L")}Z`)
            .attr("fill", pt1.z > 80 ? "#f8fafc" : "#334155")
            .attr("stroke", "#475569")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.9);
        }
      }

      // Draw Tectonic Plates Boundary (If enabled)
      if (layers.plates) {
        const platePts = [
          project(-size, -10, 10),
          project(size, -10, 10)
        ];
        g.append("line")
          .attr("x1", platePts[0][0])
          .attr("y1", platePts[0][1])
          .attr("x2", platePts[1][0])
          .attr("y2", platePts[1][1])
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "5,5");
        
        g.append("text")
          .attr("x", platePts[0][0] - 80)
          .attr("y", platePts[0][1] - 20)
          .attr("fill", "#3b82f6")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text("INDIAN PLATE →");
      }

      // Draw Fault Lines (If enabled)
      if (layers.faults) {
        const faultX = 40;
        const faultPath = [
          project(-size, faultX, 0),
          project(size, faultX, 0)
        ];
        g.append("line")
          .attr("x1", faultPath[0][0])
          .attr("y1", faultPath[0][1])
          .attr("x2", faultPath[1][0])
          .attr("y2", faultPath[1][1])
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 2);
        
        g.append("text")
          .attr("x", faultPath[1][0] + 10)
          .attr("y", faultPath[1][1])
          .attr("fill", "#ef4444")
          .attr("font-size", "9px")
          .attr("font-weight", "bold")
          .text("MCT PLANE");
      }

      // Compass Rose
      const compass = svg.append("g").attr("transform", `translate(100, ${height - 100})`);
      const n = project(0, -40, 0);
      compass.append("line").attr("x1", 0).attr("y1", 0).attr("x2", n[0]).attr("y2", n[1]).attr("stroke", "#94a3b8").attr("stroke-width", 2).attr("marker-end", "url(#arrowhead-gray)");
      compass.append("text").attr("x", n[0]).attr("y", n[1] - 5).attr("fill", "#94a3b8").attr("font-size", "12px").attr("font-weight", "bold").attr("text-anchor", "middle").text("N");

      svg.append("defs").append("marker")
        .attr("id", "arrowhead-gray")
        .attr("viewBox", "0 -5 10 10").attr("refX", 8).attr("refY", 0).attr("markerWidth", 4).attr("markerHeight", 4).attr("orient", "auto")
        .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "#94a3b8");

    } else {
      // STANDARD TAB-BASED VIEWS
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      if (activeTab === TopTab.AGE) {
        // Geochronological View
        const data = [
          { dist: 15, age: 14.2, type: 'AFT' }, { dist: 35, age: 8.4, type: 'AFT' },
          { dist: 60, age: 1.2, type: 'AHe' }, { dist: 78, age: 16.5, type: 'ZHe' },
          { dist: 135, age: 0.6, type: 'AHe' },
        ];
        const xScale = d3.scaleLinear().domain([0, 200]).range([0, chartWidth]);
        const yScale = d3.scaleLinear().domain([0, 30]).range([chartHeight, 0]);
        const colorScale = d3.scaleOrdinal<string>().domain(['AHe', 'AFT', 'ZHe']).range(['#fbbf24', '#f87171', '#60a5fa']);
        
        g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(xScale));
        g.append("g").call(d3.axisLeft(yScale));

        g.append("text")
          .attr("x", chartWidth / 2)
          .attr("y", chartHeight + 40)
          .attr("text-anchor", "middle")
          .attr("fill", "#94a3b8")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text("DISTANCE (KM)");

        g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -chartHeight / 2)
          .attr("y", -40)
          .attr("text-anchor", "middle")
          .attr("fill", "#94a3b8")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text("AGE (Ma)");
        
        g.selectAll("circle").data(data).enter().append("circle")
          .attr("cx", d => xScale(d.dist)).attr("cy", d => yScale(d.age)).attr("r", 6).attr("fill", d => colorScale(d.type));

        // Advanced Explanatory Legend
        const legendData = [
          { type: 'AHe', label: 'Apatite (U-Th)/He (~70°C)' },
          { type: 'AFT', label: 'Apatite Fission Track (~110°C)' },
          { type: 'ZHe', label: 'Zircon (U-Th)/He (~180°C)' }
        ];
        
        const legend = g.append("g").attr("transform", `translate(${chartWidth - 210}, 10)`);
        
        // Legend background
        legend.append("rect")
          .attr("width", 200)
          .attr("height", legendData.length * 20 + 30)
          .attr("fill", "#0f172a")
          .attr("stroke", "#1e293b")
          .attr("rx", 4)
          .attr("opacity", 0.9);

        legend.append("text")
          .attr("x", 10)
          .attr("y", 18)
          .attr("fill", "#60a5fa")
          .attr("font-size", "9px")
          .attr("font-weight", "bold")
          .attr("text-decoration", "underline")
          .text("THERMOCHRONOMETERS");

        legendData.forEach((d, i) => {
          const entry = legend.append("g").attr("transform", `translate(10, ${i * 20 + 35})`);
          entry.append("circle").attr("r", 4).attr("fill", colorScale(d.type));
          entry.append("text")
            .attr("x", 14)
            .attr("y", 4)
            .attr("fill", "#94a3b8")
            .attr("font-size", "9px")
            .attr("font-weight", "500")
            .text(d.label);
        });
      } else if (activeTab === TopTab.MAP) {
         const vectors = [{ x: width * 0.3, y: height * 0.7, dx: 0, dy: -60, label: '38 mm/yr' }];
         vectors.forEach(v => {
           svg.append("line").attr("x1", v.x).attr("y1", v.y).attr("x2", v.x).attr("y2", v.y + v.dy).attr("stroke", "#3b82f6").attr("stroke-width", 4).attr("marker-end", "url(#arrowhead)");
           svg.append("text").attr("x", v.x + 10).attr("y", v.y + v.dy/2).attr("fill", "#3b82f6").attr("font-size", "12px").text(v.label);
         });
         svg.append("defs").append("marker").attr("id", "arrowhead").attr("viewBox", "0 -5 10 10").attr("refX", 8).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "#3b82f6");
      } else if (activeTab === TopTab.SECTION) {
        // Lithospheric Section Visualization
        const layers = [
          { name: 'Tethyan Himalaya', color: '#64748b', y: 100 },
          { name: 'Greater Himalaya', color: '#475569', y: 220 },
          { name: 'Lesser Himalaya', color: '#334155', y: 380 },
          { name: 'Sub-Himalaya', color: '#1e293b', y: 480 },
        ];

        layers.forEach((layer, i) => {
          const nextY = layers[i+1] ? layers[i+1].y : height;
          g.append("rect")
            .attr("x", 0)
            .attr("y", layer.y - margin.top)
            .attr("width", chartWidth)
            .attr("height", nextY - layer.y)
            .attr("fill", layer.color)
            .attr("opacity", 0.4);
          
          g.append("text")
            .attr("x", 20)
            .attr("y", layer.y - margin.top + 20)
            .attr("fill", "#94a3b8")
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .text(layer.name.toUpperCase());
        });

        // MCT path
        const line = d3.line<[number, number]>().curve(d3.curveBasis);
        const mctPath: [number, number][] = Array.from({length: 10}, (_, i) => [
          (i / 9) * chartWidth,
          180 + Math.sin(i) * 30 + (i/9) * 100 - margin.top
        ]);

        g.append("path")
          .attr("d", line(mctPath))
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 3)
          .attr("fill", "none")
          .attr("stroke-dasharray", "5,5")
          .attr("opacity", 0.8);

        g.append("text")
          .attr("x", chartWidth * 0.6)
          .attr("y", 280 - margin.top)
          .attr("fill", "#ef4444")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text("MAIN CENTRAL THRUST (MCT)");
      }
    }
  }, [activeTab, activeView, layers, demName]);

  return (
    <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <svg ref={svgRef} className="w-full h-full" />
      
      {activeView === SidebarView.TERRAIN_3D && (
        <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Orogenic Layer Controls</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={layers.plates} onChange={() => toggleLayer('plates')} className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0" />
                <span className={`text-xs font-medium transition-colors ${layers.plates ? 'text-slate-200' : 'text-slate-500'}`}>Tectonic Plates</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={layers.faults} onChange={() => toggleLayer('faults')} className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-red-600 focus:ring-0" />
                <span className={`text-xs font-medium transition-colors ${layers.faults ? 'text-slate-200' : 'text-slate-500'}`}>Fault Networks</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={layers.subsurface} onChange={() => toggleLayer('subsurface')} className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-0" />
                <span className={`text-xs font-medium transition-colors ${layers.subsurface ? 'text-slate-200' : 'text-slate-500'}`}>Subsurface Litostructure</span>
              </label>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto">
             <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Custom DEM Ingestion</h4>
             <input type="file" ref={fileInputRef} onChange={handleDemUpload} className="hidden" accept=".tif,.dem,.asc" />
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold py-2 rounded border border-slate-700 transition-all uppercase tracking-wider"
             >
                {demName ? `ACTIVE: ${demName}` : 'Load Regional DEM'}
             </button>
          </div>
        </div>
      )}

      {/* Action Overlay for Tabs */}
      {! (activeView === SidebarView.TERRAIN_3D) && (
        <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none">
          {activeTab === TopTab.SECTION && (
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto">
              <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Visualization Tools</h4>
              <button 
                onClick={handleExportSVG}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-[10px] font-bold py-2 px-4 rounded border border-slate-700 transition-all uppercase tracking-wider"
              >
                <span>󰚙</span>
                Export Cross-Section (SVG)
              </button>
            </div>
          )}
        </div>
      )}

      <div className="absolute top-6 right-6 bg-slate-900/80 border border-slate-800 p-3 rounded-lg backdrop-blur text-[10px] space-y-2 max-w-[220px]">
        <p className="font-bold text-slate-400 mb-1 border-b border-slate-800 pb-1 uppercase">Visual Intelligence</p>
        <div className="space-y-1">
          {activeView === SidebarView.TERRAIN_3D ? (
            <p className="text-slate-300">View: Interactive 3D Block Model. Projecting MHT coupling and orogenic exhumation.</p>
          ) : (
            <p className="text-slate-300">View: Multi-proxy geological integration.</p>
          )}
          <p className="text-slate-500 italic">Reference: Sentinel Orogenic Engine v3.1</p>
        </div>
      </div>
    </div>
  );
};

export default VisualizationCanvas;
