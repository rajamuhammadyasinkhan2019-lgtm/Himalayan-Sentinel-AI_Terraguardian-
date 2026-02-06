
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TopTab } from '../types';

interface VisualizationCanvasProps {
  activeTab: TopTab;
}

const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({ activeTab }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Generate simulated geological layers based on Tab
    if (activeTab === TopTab.SECTION) {
      const layers = [
        { name: 'Tethyan Himalaya', color: '#64748b', y: 100 },
        { name: 'Higher Himalaya', color: '#475569', y: 200 },
        { name: 'Lesser Himalaya', color: '#334155', y: 350 },
        { name: 'Sub-Himalaya', color: '#1e293b', y: 450 },
      ];

      // Draw crustal layers
      layers.forEach((layer, i) => {
        const nextY = layers[i+1] ? layers[i+1].y : height;
        svg.append("rect")
          .attr("x", 0)
          .attr("y", layer.y)
          .attr("width", width)
          .attr("height", nextY - layer.y)
          .attr("fill", layer.color)
          .attr("opacity", 0.4);
        
        svg.append("text")
          .attr("x", 20)
          .attr("y", layer.y + 20)
          .attr("fill", "#94a3b8")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text(layer.name.toUpperCase());
      });

      // Draw Main Central Thrust (MCT) - Simulated fault lines
      const line = d3.line<[number, number]>().curve(d3.curveBasis);
      const mctPath: [number, number][] = Array.from({length: 10}, (_, i) => [
        (i / 9) * width,
        180 + Math.sin(i) * 30 + (i/9) * 100
      ]);

      svg.append("path")
        .attr("d", line(mctPath))
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.8);

      svg.append("text")
        .attr("x", width * 0.7)
        .attr("y", 250)
        .attr("fill", "#ef4444")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text("MAIN CENTRAL THRUST (MCT)");

    } else if (activeTab === TopTab.MAP) {
      // Draw grid lines
      for (let i = 0; i < width; i += 50) {
        svg.append("line").attr("x1", i).attr("y1", 0).attr("x2", i).attr("y2", height).attr("stroke", "#1e293b").attr("stroke-width", 0.5);
      }
      for (let i = 0; i < height; i += 50) {
        svg.append("line").attr("x1", 0).attr("y1", i).attr("x2", width).attr("y2", i).attr("stroke", "#1e293b").attr("stroke-width", 0.5);
      }

      // Draw convergence vectors
      const vectors = [
        { x: width * 0.3, y: height * 0.7, dx: 0, dy: -60, label: '38 mm/yr' },
        { x: width * 0.6, y: height * 0.7, dx: 5, dy: -55, label: '40 mm/yr' },
      ];

      vectors.forEach(v => {
        svg.append("line")
          .attr("x1", v.x)
          .attr("y1", v.y)
          .attr("x2", v.x + v.dx)
          .attr("y2", v.y + v.dy)
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 4)
          .attr("marker-end", "url(#arrowhead)");
        
        svg.append("text")
          .attr("x", v.x + 10)
          .attr("y", v.y + v.dy/2)
          .attr("fill", "#3b82f6")
          .attr("font-weight", "bold")
          .attr("font-size", "12px")
          .text(v.label);
      });

      // Add SVG marker
      svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 8)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#3b82f6");
    }

  }, [activeTab]);

  return (
    <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-800 p-3 rounded-lg backdrop-blur text-[10px] space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-slate-300">Active Thrust Fronts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-slate-300">GPS Convergence Vectors</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
          <span className="text-slate-300">Moho Discontinuity (Model)</span>
        </div>
      </div>
    </div>
  );
};

export default VisualizationCanvas;
