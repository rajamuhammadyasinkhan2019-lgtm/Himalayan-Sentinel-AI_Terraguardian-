
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
    const margin = { top: 60, right: 60, bottom: 80, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    if (activeTab === TopTab.AGE) {
      // Advanced Geochronological Data Visualization
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      // Mock dataset for Himalayan Thermochronology
      const data = [
        { dist: 15, age: 14.2, type: 'AFT', label: 'Siwaliks' },
        { dist: 35, age: 8.4, type: 'AFT', label: 'MBT Hanging Wall' },
        { dist: 45, age: 3.8, type: 'AHe', label: 'Lesser Him.' },
        { dist: 60, age: 1.2, type: 'AHe', label: 'MCT Footwall' },
        { dist: 78, age: 16.5, type: 'ZHe', label: 'GHS Core' },
        { dist: 92, age: 21.0, type: 'ZFT', label: 'High Peaks' },
        { dist: 115, age: 24.8, type: 'Ar-Ar', label: 'Standard' },
        { dist: 135, age: 0.6, type: 'AHe', label: 'Syntaxis' }, 
        { dist: 155, age: 4.9, type: 'AFT', label: 'Tethyan' },
        { dist: 180, age: 12.1, type: 'ZHe', label: 'Plateau Edge' },
      ];

      // Define Tectonic Zones for context
      const zones = [
        { name: 'Sub-Himalaya', start: 0, end: 30, color: '#1e293b' },
        { name: 'Lesser Himalaya', start: 30, end: 70, color: '#334155' },
        { name: 'Higher Himalaya', start: 70, end: 140, color: '#475569' },
        { name: 'Tethyan Himalaya', start: 140, end: 200, color: '#64748b' },
      ];

      const xScale = d3.scaleLinear().domain([0, 200]).range([0, chartWidth]);
      const yScale = d3.scaleLinear().domain([0, 30]).range([chartHeight, 0]);

      // Draw Tectonic Zone Backgrounds
      zones.forEach(zone => {
        g.append("rect")
          .attr("x", xScale(zone.start))
          .attr("y", 0)
          .attr("width", xScale(zone.end) - xScale(zone.start))
          .attr("height", chartHeight)
          .attr("fill", zone.color)
          .attr("opacity", 0.15);
        
        g.append("text")
          .attr("x", xScale((zone.start + zone.end) / 2))
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .attr("fill", "#64748b")
          .attr("font-size", "9px")
          .attr("font-weight", "bold")
          .text(zone.name.toUpperCase());
      });

      // Draw Grid Lines
      g.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale).ticks(10).tickSize(-chartHeight).tickFormat(() => ""))
        .attr("class", "grid")
        .selectAll("line").attr("stroke", "#1e293b").attr("stroke-dasharray", "2,2");

      g.append("g")
        .call(d3.axisLeft(yScale).ticks(6).tickSize(-chartWidth).tickFormat(() => ""))
        .attr("class", "grid")
        .selectAll("line").attr("stroke", "#1e293b").attr("stroke-dasharray", "2,2");

      // Draw Axes
      g.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale).ticks(10))
        .selectAll("text").attr("fill", "#94a3b8").attr("font-size", "10px");

      g.append("g")
        .call(d3.axisLeft(yScale).ticks(6))
        .selectAll("text").attr("fill", "#94a3b8").attr("font-size", "10px");

      svg.selectAll(".domain").remove();

      // Axis Labels
      g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 45)
        .attr("fill", "#94a3b8")
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .text("DISTANCE FROM HIMALAYAN FRONT (KM)");

      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -50)
        .attr("fill", "#94a3b8")
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .text("THERMOCHRONOLOGICAL AGE (Ma)");

      // Color mapping for chronometers
      const colorScale = d3.scaleOrdinal<string>()
        .domain(['AHe', 'AFT', 'ZHe', 'ZFT', 'Ar-Ar'])
        .range(['#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#34d399']);

      // Draw Data Points
      g.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.dist))
        .attr("cy", d => yScale(d.age))
        .attr("r", 6)
        .attr("fill", d => colorScale(d.type))
        .attr("stroke", "#0f172a")
        .attr("stroke-width", 2)
        .style("cursor", "crosshair")
        .on("mouseover", function(event, d) {
          d3.select(this).transition().duration(200).attr("r", 10).attr("stroke", "#fff");
        })
        .on("mouseout", function() {
          d3.select(this).transition().duration(200).attr("r", 6).attr("stroke", "#0f172a");
        });

      // Major Fault Markers
      const faults = [
        { name: 'MBT', x: 30, color: '#ef4444' },
        { name: 'MCT', x: 70, color: '#f97316' },
        { name: 'STD', x: 140, color: '#3b82f6' },
      ];

      faults.forEach(f => {
        g.append("line")
          .attr("x1", xScale(f.x))
          .attr("x2", xScale(f.x))
          .attr("y1", 0)
          .attr("y2", chartHeight)
          .attr("stroke", f.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "6,4");
        
        g.append("text")
          .attr("x", xScale(f.x))
          .attr("y", chartHeight + 15)
          .attr("text-anchor", "middle")
          .attr("fill", f.color)
          .attr("font-size", "10px")
          .attr("font-weight", "800")
          .text(f.name);
      });

      // Rapid Exhumation Pulse Annotation
      const syntaxisPoint = data.find(d => d.dist === 135);
      if (syntaxisPoint) {
        g.append("path")
          .attr("d", d3.symbol().type(d3.symbolStar).size(150)())
          .attr("transform", `translate(${xScale(syntaxisPoint.dist)},${yScale(syntaxisPoint.age)})`)
          .attr("fill", "#fff")
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 2);

        g.append("text")
          .attr("x", xScale(syntaxisPoint.dist) + 10)
          .attr("y", yScale(syntaxisPoint.age) - 10)
          .attr("fill", "#ef4444")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text("RAPID EXHUMATION PULSE");
      }

      // Legend
      const legend = g.append("g").attr("transform", `translate(${chartWidth - 110}, 20)`);
      ['AHe', 'AFT', 'ZHe', 'ZFT', 'Ar-Ar'].forEach((type, i) => {
        const row = legend.append("g").attr("transform", `translate(0, ${i * 18})`);
        row.append("circle").attr("r", 5).attr("fill", colorScale(type));
        row.append("text")
          .attr("x", 12)
          .attr("y", 4)
          .attr("fill", "#94a3b8")
          .attr("font-size", "10px")
          .attr("font-weight", "600")
          .text(type);
      });

    } else if (activeTab === TopTab.SECTION) {
      const layers = [
        { name: 'Tethyan Himalaya', color: '#64748b', y: 100 },
        { name: 'Higher Himalaya', color: '#475569', y: 200 },
        { name: 'Lesser Himalaya', color: '#334155', y: 350 },
        { name: 'Sub-Himalaya', color: '#1e293b', y: 450 },
      ];

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
      for (let i = 0; i < width; i += 50) {
        svg.append("line").attr("x1", i).attr("y1", 0).attr("x2", i).attr("y2", height).attr("stroke", "#1e293b").attr("stroke-width", 0.5);
      }
      for (let i = 0; i < height; i += 50) {
        svg.append("line").attr("x1", 0).attr("y1", i).attr("x2", width).attr("y2", i).attr("stroke", "#1e293b").attr("stroke-width", 0.5);
      }

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
      
      {/* Dynamic legend based on tab */}
      <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-800 p-3 rounded-lg backdrop-blur text-[10px] space-y-2 max-w-[220px]">
        {activeTab === TopTab.AGE ? (
           <>
            <p className="font-bold text-slate-400 mb-1 border-b border-slate-800 pb-1">GEOCHRONOLOGY INTELLIGENCE</p>
            <div className="space-y-1">
              <p className="text-slate-300">Analysis: Integration of regional cooling ages vs orogenic strike distance.</p>
              <p className="text-slate-500 italic">Reference: Himalayan Thermochronology Database v4.2</p>
            </div>
           </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default VisualizationCanvas;
