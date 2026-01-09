import React, { useEffect, useRef } from 'react';
import * as d3Base from 'd3';
import { VibeSpot, Coordinates } from '../types';

const d3 = d3Base as any;

interface CityMapProps {
  center: Coordinates;
  spots: VibeSpot[];
  cityName: string;
}

const CityMap: React.FC<CityMapProps> = ({ center, spots, cityName }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !spots.length) return;

    const width = 300;
    const height = 200;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create a local projection centered on the city
    const projection = d3.geoMercator()
      .center([center.lng, center.lat])
      .scale(150000) // High zoom for city level
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Draw Radar Grid (since we don't have street map data)
    const gridGroup = svg.append("g").attr("class", "grid");
    
    // Concentric circles
    [50, 100, 150].forEach(r => {
        gridGroup.append("circle")
            .attr("cx", width/2).attr("cy", height/2).attr("r", r)
            .attr("fill", "none").attr("stroke", "#334155").attr("stroke-dasharray", "4 4");
    });
    
    // Crosshairs
    gridGroup.append("line").attr("x1", 0).attr("y1", height/2).attr("x2", width).attr("y2", height/2).attr("stroke", "#334155");
    gridGroup.append("line").attr("x1", width/2).attr("y1", 0).attr("x2", width/2).attr("y2", height).attr("stroke", "#334155");

    // City Center Marker
    svg.append("circle")
        .attr("cx", width/2).attr("cy", height/2).attr("r", 4)
        .attr("fill", "#38bdf8").attr("stroke", "#fff").attr("stroke-width", 2);

    // Plot Vibe Spots
    spots.forEach((spot, i) => {
        if (!spot.coordinates) return;
        
        const coords = projection([spot.coordinates.lng, spot.coordinates.lat]);
        if (!coords) return;
        
        const [x, y] = coords;

        const g = svg.append("g");
        
        // Pulse effect
        g.append("circle")
            .attr("cx", x).attr("cy", y).attr("r", 3)
            .attr("fill", "none").attr("stroke", "#f43f5e").attr("stroke-opacity", 0.5)
            .append("animate")
            .attr("attributeName", "r")
            .attr("from", "3").attr("to", "15")
            .attr("dur", "2s").attr("repeatCount", "indefinite");
            
        g.append("circle")
            .attr("cx", x).attr("cy", y).attr("r", 3)
            .attr("fill", "#f43f5e").attr("stroke", "#fff").attr("stroke-width", 1);
            
        // Label
        g.append("text")
            .attr("x", x + 8).attr("y", y + 4)
            .text(spot.name)
            .attr("fill", "#e2e8f0").attr("font-size", "9px").attr("font-weight", "bold")
            .style("text-shadow", "0px 1px 2px #000");
    });

  }, [center, spots]);

  return (
    <div className="w-full h-48 bg-slate-800 rounded-xl overflow-hidden relative border border-slate-700">
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice"></svg>
        <div className="absolute bottom-2 right-2 text-[9px] text-slate-500 bg-slate-900/80 px-1.5 py-0.5 rounded">
            {cityName} Radar View
        </div>
    </div>
  );
};

export default CityMap;