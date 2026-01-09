import React, { useEffect, useRef, useState } from 'react';
import * as d3Base from 'd3';
import { feature } from 'topojson-client';
import { WORLD_GEOJSON_URL } from '../constants';
import { Coordinates } from '../types';

// Cast d3 to any to avoid type errors with missing definitions
const d3 = d3Base as any;

interface FlightMapProps {
  originCoords: Coordinates | null;
  destCoords: Coordinates | null;
  originLabel?: string;
  destLabel?: string;
  isLoading?: boolean;
  onCountrySelect?: (countryName: string) => void;
}

const FlightMap: React.FC<FlightMapProps> = ({ 
  originCoords, 
  destCoords, 
  originLabel,
  destLabel,
  isLoading = false,
  onCountrySelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const projectionRef = useRef(d3.geoOrthographic());
  const pathRef = useRef(d3.geoPath());
  const [worldData, setWorldData] = useState<any>(null);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);

  useEffect(() => {
    d3.json(WORLD_GEOJSON_URL).then((data: any) => {
      const countries = feature(data, data.objects.countries);
      setWorldData(countries);
    }).catch((err: any) => console.error("Failed to load map data", err));
  }, []);

  useEffect(() => {
    if (!worldData || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = Math.min(width * 0.6, 600); 

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#0f172a");

    projectionRef.current
      .scale(height / 2.2)
      .translate([width / 2, height / 2])
      .clipAngle(90);

    pathRef.current.projection(projectionRef.current);

    // Initial View Logic
    if (!isLoading) {
        if (originCoords && destCoords) {
            const center: [number, number] = [
                (originCoords.lng + destCoords.lng) / 2,
                (originCoords.lat + destCoords.lat) / 2
            ];
            d3.transition()
              .duration(1500)
              .tween("rotate", () => {
                  const r = d3.interpolate(projectionRef.current.rotate(), [-center[0], -center[1]]);
                  return (t: any) => {
                      projectionRef.current.rotate(r(t) as [number, number, number]);
                      svg.selectAll("path").attr("d", pathRef.current as any);
                  };
              });
        } else if (originCoords) {
            d3.transition()
            .duration(1500)
            .tween("rotate", () => {
                const r = d3.interpolate(projectionRef.current.rotate(), [-originCoords.lng, -originCoords.lat]);
                return (t: any) => {
                    projectionRef.current.rotate(r(t) as [number, number, number]);
                    svg.selectAll("path").attr("d", pathRef.current as any);
                };
            });
        }
    }

    renderMap(svg, worldData, originCoords, destCoords);

    const drag = d3.drag()
    .on("drag", (event: any) => {
        const rotate = projectionRef.current.rotate();
        const k = 75 / projectionRef.current.scale();
        projectionRef.current.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
        svg.selectAll("path").attr("d", pathRef.current as any);
    });
    svg.call(drag);

  }, [worldData, originCoords, destCoords, isLoading, originLabel, destLabel]);

  useEffect(() => {
    if (!isLoading || !svgRef.current || !worldData) return;
    const svg = d3.select(svgRef.current);
    const timer = d3.timer(() => {
        const rotate = projectionRef.current.rotate();
        projectionRef.current.rotate([rotate[0] + 0.5, rotate[1]]); 
        svg.selectAll("path").attr("d", pathRef.current as any);
    });
    return () => timer.stop();
  }, [isLoading, worldData]);


  const renderMap = (
      svg: any, 
      data: any, 
      oCoords: Coordinates | null, 
      dCoords: Coordinates | null
  ) => {
      svg.selectAll("*").interrupt();
      svg.selectAll("*").remove();

      const defs = svg.append("defs");

      const oceanGradient = defs.append("radialGradient")
          .attr("id", "oceanGradient")
          .attr("cx", "50%")
          .attr("cy", "50%")
          .attr("r", "50%");
      oceanGradient.append("stop").attr("offset", "0%").attr("stop-color", "#1e293b"); 
      oceanGradient.append("stop").attr("offset", "100%").attr("stop-color", "#020617"); 

      const flightGradient = defs.append("linearGradient")
          .attr("id", "flightGradient")
          .attr("gradientUnits", "userSpaceOnUse") 
          .attr("x1", "0%").attr("y1", "0%")
          .attr("x2", "100%").attr("y2", "0%");
      flightGradient.append("stop").attr("offset", "0%").attr("stop-color", "#10b981");
      flightGradient.append("stop").attr("offset", "100%").attr("stop-color", "#f43f5e");

      const glowFilter = defs.append("filter").attr("id", "glow");
      glowFilter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
      const feMerge = glowFilter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      const path = pathRef.current;

      svg.append("path")
         .datum({ type: "Sphere" })
         .attr("d", path)
         .attr("fill", "none")
         .attr("stroke", "#38bdf8")
         .attr("stroke-width", 1)
         .attr("stroke-opacity", 0.3)
         .style("filter", "url(#glow)");

      svg.append("path")
      .datum({ type: "Sphere" })
      .attr("class", "water")
      .attr("d", path)
      .attr("fill", "url(#oceanGradient)")
      .attr("stroke", "none");

      svg.append("g")
      .selectAll("path")
      .data(data.features)
      .enter().append("path")
      .attr("d", path as any)
      .attr("fill", "#475569")
      .attr("stroke", "#64748b")
      .attr("stroke-width", 0.5)
      .attr("cursor", "pointer")
      .on("mouseover", function(event: any, d: any) {
          d3.select(this).transition().duration(200).attr("fill", "#64748b").attr("stroke", "#94a3b8");
          setTooltipContent(d.properties.name);
      })
      .on("mouseout", function(event: any, d: any) {
          d3.select(this).transition().duration(200).attr("fill", "#475569").attr("stroke", "#64748b");
          setTooltipContent(null);
      })
      .on("click", (event: any, d: any) => {
          if (onCountrySelect) onCountrySelect(d.properties.name);
          const centroid = d3.geoCentroid(d);
          d3.transition().duration(1000).tween("rotate", () => {
              const r = d3.interpolate(projectionRef.current.rotate(), [-centroid[0], -centroid[1]]);
              return (t: any) => {
                  projectionRef.current.rotate(r(t) as [number, number, number]);
                  svg.selectAll("path").attr("d", path as any);
              };
          });
      });

      const shadowGradient = defs.append("radialGradient")
          .attr("id", "shadowGradient")
          .attr("cx", "75%").attr("cy", "25%").attr("r", "100%");
      shadowGradient.append("stop").attr("offset", "50%").attr("stop-color", "transparent").attr("stop-opacity", 0);
      shadowGradient.append("stop").attr("offset", "100%").attr("stop-color", "#000").attr("stop-opacity", 0.6);

      svg.append("path")
         .datum({ type: "Sphere" })
         .attr("d", path)
         .attr("fill", "url(#shadowGradient)")
         .style("pointer-events", "none");


      if (oCoords && dCoords) {
        const flightPath = {
            type: "LineString",
            coordinates: [[oCoords.lng, oCoords.lat], [dCoords.lng, dCoords.lat]]
        };

        const pathEl = svg.append("path")
            .datum(flightPath)
            .attr("d", path as any)
            .attr("fill", "none")
            .attr("stroke", "url(#flightGradient)") 
            .attr("stroke-width", 2) 
            .attr("stroke-linecap", "round")
            .style("filter", "drop-shadow(0px 0px 4px rgba(56, 189, 248, 0.4))");
            
        const plane = svg.append("path")
            .attr("class", "plane")
            .attr("d", "M2,0 L10,20 L2,16 L-6,20 L2,0")
            .attr("fill", "#fff")
            .attr("transform", "scale(0.8)"); // Make plane slightly smaller

        const pathNode = pathEl.node() as SVGPathElement;
        if (pathNode && pathNode.getTotalLength && pathNode.getTotalLength() > 0) {
            const animatePlane = () => {
                 if (!plane.node()?.isConnected) return;
                 plane.transition().duration(2000).ease(d3.easeQuadInOut).attrTween("transform", translateAlong(pathNode)).on("end", animatePlane);
            };
            animatePlane();
        }
      }

      // Origin Marker (Smaller)
      if (oCoords) {
          pathRef.current.pointRadius(3); // Reduced from 6
          svg.append("path")
             .datum({ type: "Point", coordinates: [oCoords.lng, oCoords.lat] })
             .attr("d", path as any)
             .attr("fill", "#10b981")
             .attr("stroke", "#fff")
             .attr("stroke-width", 1.5)
             .attr("cursor", "pointer")
             .on("mouseover", () => setTooltipContent(originLabel || "Origin"))
             .on("mouseout", () => setTooltipContent(null));
      }

      // Destination Marker (Smaller)
      if (dCoords) {
          const ripple = svg.append("path")
              .datum({ type: "Point", coordinates: [dCoords.lng, dCoords.lat] })
              .attr("class", "ripple")
              .attr("d", path as any)
              .attr("fill", "none")
              .attr("stroke", "#f43f5e")
              .attr("stroke-width", 1);
          
          const pulse = () => {
             if (!ripple.node()?.isConnected) return;
             pathRef.current.pointRadius(3); // Start size
             ripple.attr("d", path as any).attr("stroke-opacity", 1).attr("stroke-width", 2);
             ripple.transition().duration(1500).ease(d3.easeCircleOut).tween("radius", () => {
                    return (t: number) => {
                         pathRef.current.pointRadius(3 + (t * 10)); // Grow less
                         ripple.attr("d", path as any);
                    };
                }).attr("stroke-opacity", 0).on("end", pulse);
          };
          pulse();

          pathRef.current.pointRadius(3); // Reduced from 6
          svg.append("path")
             .datum({ type: "Point", coordinates: [dCoords.lng, dCoords.lat] })
             .attr("d", path as any)
             .attr("fill", "#f43f5e")
             .attr("stroke", "#fff")
             .attr("stroke-width", 1.5)
             .attr("cursor", "pointer")
             .on("mouseover", () => setTooltipContent(destLabel || "Destination"))
             .on("mouseout", () => setTooltipContent(null));
      }
      
      pathRef.current.pointRadius(4.5);
  };

  function translateAlong(pathNode: SVGPathElement) {
    if (!pathNode) return () => "";
    const l = pathNode.getTotalLength();
    return function(d: any, i: any, a: any) {
      return function(t: number) {
        const p = pathNode.getPointAtLength(t * l);
        const p_before = pathNode.getPointAtLength(Math.max(0, t * l - 1));
        const angle = Math.atan2(p.y - p_before.y, p.x - p_before.x) * 180 / Math.PI;
        // Scale down the plane slightly in the transform
        return "translate(" + p.x + "," + p.y + ") rotate(" + (angle + 90) + ") scale(0.6)";
      };
    };
  }

  return (
    <div ref={containerRef} className="w-full h-full flex justify-center items-center bg-slate-900 rounded-xl overflow-hidden shadow-2xl relative group">
      <svg ref={svgRef}></svg>
      <div className={`absolute top-4 right-4 bg-slate-800/90 border border-slate-700 backdrop-blur text-white px-3 py-2 rounded-lg shadow-xl transition-all duration-300 transform ${tooltipContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
            <span className="font-medium text-sm">{tooltipContent}</span>
        </div>
      </div>
    </div>
  );
};

export default FlightMap;