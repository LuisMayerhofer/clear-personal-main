import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { CreditData, DashboardData } from '@/app/[locale]/(main)/dashboard/types';
import { PlusSquare, MinusSquare, ArrowRotateLeft } from '@/components/Icons';

type DnMNode = CreditData & d3.SimulationNodeDatum;

interface DnMProps extends DashboardData {
  onScenarioSelect: (scenario: CreditData) => void;
  isInfoVisible: boolean;
}

const DEFAULT_MAGNETS = [
  { x: 100, y: 100, feature: 'age', label: 'Age', scale: 1 },
  { x: 700, y: 100, feature: 'credit_amount', label: 'Credit Amount', scale: 1 },
  { x: 400, y: 50,  feature: 'duration', label: 'Duration', scale: 1 },
  { x: 100, y: 500, feature: 'saving_accounts', label: 'Savings', scale: 1 },
  { x: 700, y: 500, feature: 'checking_account', label: 'Checking', scale: 1 },
];

const DustAndMagnet: React.FC<DnMProps> = ({ 
  scenarios, 
  profile, 
  onScenarioSelect, 
  isInfoVisible, 
  chosenScenario // Make sure this is destructured
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  const simulationRef = useRef<d3.Simulation<DnMNode, undefined> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Initialized with a copy of DEFAULT_MAGNETS
  const magnetsRef = useRef(DEFAULT_MAGNETS.map(m => ({ ...m })));

  const [activeFeatures, setActiveFeatures] = useState<Set<string>>(
    new Set(DEFAULT_MAGNETS.map(m => m.feature))
  );

  const nodes = useMemo<DnMNode[]>(() => {
    // Ensure user profile isn't included twice
    const otherScenarios = scenarios.filter(s => s.id !== profile.id);
    return [...otherScenarios, profile].map(d => {
      // Look for existing coordinates in the current simulation to maintain continuity
      const existingNode = simulationRef.current?.nodes().find(n => n.id === d.id);
      return {
        ...d,
        x: existingNode?.x ?? Math.random() * 800,
        y: existingNode?.y ?? Math.random() * 600,
        vx: existingNode?.vx ?? 0,
        vy: existingNode?.vy ?? 0,
      };
    }) as DnMNode[];
  }, [scenarios, profile]);

const SIM_CONFIG = {
  forceMultiplier: 0.01,  // Strength of magnetic pull (Higher = faster movement) [cite: 84]
  alphaDecay: 0.02,       // Cooling rate (Lower = simulation runs longer before stopping) [cite: 55]
  velocityDecay: 0.6,     // "Visual Friction" (Higher = heavier dust feel, prevents orbiting) [cite: 70, 97]
  initialAlpha: 1.0,       // Initial energy of the simulation
  baseMagnetWidth: 120,
  baseMagnetHight: 50,
  magnetBoundaryForce: 0.05,  // Force with which the nodes are being pushed outside of a magnet when they are underneath it
  minWinSizeX: -800,
  maxWinSizeX: 1600,
  minWinSizeY: -300,
  maxWinSizeY: 900,
};

// Main Physics Effect
useEffect(() => {
  if (!svgRef.current || !containerRef.current) return;
  const svg = d3.select(svgRef.current);
  const container = d3.select(containerRef.current);

  // Zoom 
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 5]) 
    .filter((event) => {
      if (event.type === 'wheel') {
        return event.ctrlKey;
      }
      return !event.ctrlKey && !event.button;
    })
    .on('zoom', (event) => {
      container.attr('transform', event.transform);
    });
  svg.call(zoom);
  svg.on("dblclick.zoom", null); // Disable double-click zoom 
  zoomBehaviorRef.current = zoom;
  
  // Initialize simulation
  const simulation = d3.forceSimulation<DnMNode>(nodes)
    .alpha(SIM_CONFIG.initialAlpha)
    .alphaDecay(SIM_CONFIG.alphaDecay)
    .velocityDecay(SIM_CONFIG.velocityDecay)
    .on('tick', () => {
      nodes.forEach(node => {
        let totalVx = 0;
        let totalVy = 0;

        magnetsRef.current.forEach(mag => {
          if (!activeFeatures.has(mag.feature)) return; // Check whether Magnet is active
          const rawVal = node.features[mag.feature as keyof typeof node.features];
          let val = 0;

          // Handle Numeric Features
          if (typeof rawVal === 'number') {
            if (mag.feature === 'credit_amount') {
              val = (rawVal - 276) / (18424 - 276);
            } 
            else if (mag.feature === 'age') {
              val = (rawVal - 19) / (75 - 19);
            } 
            else if (mag.feature === 'duration') {
              val = (rawVal - 6) / (72 - 6);
            }
            else {
              val = rawVal / 3; // Fallback for 'job' (0-3)
            }
          }

          // Handle Categorical Strings (Savings & Checking)
          else if (typeof rawVal === 'string') {
            const s = rawVal.toLowerCase();
            if (s === 'little') val = 0.25;
            else if (s === 'moderate') val = 0.5;
            else if (s === 'quite rich') val = 0.75;
            else if (s === 'rich') val = 1.0;
            else val = 0; // Covers 'NA', 'none', or 'null'
          }

          // Ensure val stays within 0-1 range to prevent "super-pulls"
          val = Math.max(0, Math.min(1, val));

          const dx = mag.x - node.x!;
          const dy = mag.y - node.y!;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // Scale the strength by the magnet's current scale
          const pull = val * (mag.scale || 1) * SIM_CONFIG.forceMultiplier;
          totalVx += dx * pull;
          totalVy += dy * pull;

          // Prevents nodes from disappearing under the magnet
          const buffer = 5;
          const magW = (SIM_CONFIG.baseMagnetWidth * (mag.scale || 1)) / 2 + buffer;
          const magH = (SIM_CONFIG.baseMagnetHight * (mag.scale || 1)) / 2 + buffer;

          if (Math.abs(dx) < magW && Math.abs(dy) < magH) {
            totalVx -= dx * SIM_CONFIG.magnetBoundaryForce;
            totalVy -= dy * SIM_CONFIG.magnetBoundaryForce;
          }
        });

        // Apply the summed forces directly to velocity
        node.vx = totalVx;
        node.vy = totalVy;

        // Bounding box constraints
        const r = 10; // Collision radius from the walls
        if (node.x! < SIM_CONFIG.minWinSizeX + r) node.x = SIM_CONFIG.minWinSizeX + r;
        if (node.x! > SIM_CONFIG.maxWinSizeX - r) node.x = SIM_CONFIG.maxWinSizeX - r;
        if (node.y! < SIM_CONFIG.minWinSizeY + r) node.y = SIM_CONFIG.minWinSizeY + r;
        if (node.y! > SIM_CONFIG.maxWinSizeY - r) node.y = SIM_CONFIG.maxWinSizeY - r;
      });

      container.selectAll('circle')
        .attr('cx', d => (d as DnMNode).x!)
        .attr('cy', d => (d as DnMNode).y!);
    });

  simulationRef.current = simulation;
  
  // Magnet Drag
  const drag = d3.drag<SVGGElement, any>()
    .on('start', function() {
      // Bring the dragged magnet to the front visually
      d3.select(this).raise();
    })
    .on('drag', function(event, d) {
      if (event.sourceEvent.shiftKey) {
        // --- SHIFT + DRAG: SCALE ---
        // Moving mouse up decreases dy, so we subtract it to increase scale
        const sensitivity = 0.01;
        d.scale = Math.max(0.5, Math.min(3, d.scale - event.dy * sensitivity));
      } else {
        // --- NORMAL DRAG: MOVE ---
        const paddingX = (SIM_CONFIG.baseMagnetWidth * d.scale) / 2;
        const paddingY = (SIM_CONFIG.baseMagnetHight * d.scale) / 2;
        d.x = Math.max(SIM_CONFIG.minWinSizeX + paddingX, Math.min(SIM_CONFIG.maxWinSizeX - paddingX, event.x));
        d.y = Math.max(SIM_CONFIG.minWinSizeY + paddingY, Math.min(SIM_CONFIG.maxWinSizeY - paddingY, event.y));
      }

      // Update visuals immediately based on new x, y, and scale
      const w = SIM_CONFIG.baseMagnetWidth * d.scale;
      const h = SIM_CONFIG.baseMagnetHight * d.scale;
      const g = d3.select(this);

      g.select('rect')
        .attr('width', w)
        .attr('height', h)
        .attr('x', d.x - w / 2)
        .attr('y', d.y - h / 2);

      g.select('text')
        .attr('x', d.x)
        .attr('y', d.y + 5);
      
      if (simulationRef.current) {
        simulationRef.current.alpha(0.3).restart(); 
      }
    });

  // Render initial dust and magnets
  container.selectAll('circle')
    .data(nodes)
    .join('circle')
    .style('cursor', 'pointer')
    .on('click', (event, d) => onScenarioSelect(d as CreditData));

  // Render Magnets
  const activeMagnets = magnetsRef.current.filter(m => activeFeatures.has(m.feature)); // Filter for active magnets
  const magGroups = container.selectAll('.magnet')
      .data(activeMagnets, (d: any) => d.feature)
      .join(
        (enter) => {
          const g = enter.append('g').attr('class', 'magnet').call(drag as any);
          
          g.append('rect')
            .attr('rx', 5).attr('fill', '#DBDBDB').attr('stroke', '#B0B0B0')
            .style('cursor', 'grab');

          g.append('text')
            .attr('text-anchor', 'middle')
            .style('font-size', 'sm').style('font-weight', 'bold')
            .style('pointer-events', 'none');
          
          return g;
        },
      );

    // Sync positions for both new and existing magnets
    // Centering and Scaling logic for all magnets (enter + update)
    magGroups.select('rect')
      .attr('width', d => SIM_CONFIG.baseMagnetWidth * (d as any).scale)
      .attr('height', d => SIM_CONFIG.baseMagnetHight * (d as any).scale)
      .attr('x', d => (d as any).x - (SIM_CONFIG.baseMagnetWidth * (d as any).scale) / 2)
      .attr('y', d => (d as any).y - (SIM_CONFIG.baseMagnetHight * (d as any).scale) / 2);

    magGroups.select('text')
      .attr('x', d => (d as any).x)
      .attr('y', d => (d as any).y + 5)
      .text(d => (d as any).label);

    return () => {
      simulation.stop();
    };
  }, [nodes, activeFeatures])


// Visual Styling Effect
useEffect(() => {
  if (!containerRef.current) return;
  const container = d3.select(containerRef.current);

  container.selectAll('circle')
    .data(nodes)
    .transition()
    .duration(250)
    .attr('r', (d: DnMNode) => {
      if (d.id === profile.id) return 10;
      const riskValue = typeof d.risk === 'number' ? d.risk : (d.risk === 'good' ? 1 : 0);
      return 4 + (riskValue * 8); // Size coding based on risk [cite: 139]
    })
    .attr('fill', (d: DnMNode) => {
      if (d.id === profile.id) return '#FF5655'; // User Red
      if (d.id === chosenScenario?.id) return '#14E9C0'; // Chosen Mint Green
      return '#3B82F6'; // Others Blue
    })
    .attr('stroke', (d: DnMNode) => d.id === chosenScenario?.id ? '#000' : '#fff')
    .attr('stroke-width', (d: DnMNode) => d.id === chosenScenario?.id ? 2 : 1);
    

}, [nodes, chosenScenario, profile.id]);


// Activate/Deactivate Magnet
const handleToggleMagnet = (feature: string) => {
  setActiveFeatures(prev => {
    const next = new Set(prev);
    if (next.has(feature)) next.delete(feature);
    else next.add(feature);
    return next;
  });
  if (simulationRef.current) simulationRef.current.alpha(0.3).restart();
};

// Reset Magnets
const handleResetMagnets = () => {
  magnetsRef.current = DEFAULT_MAGNETS.map(m => ({ ...m }));

  if (!containerRef.current) return;
  const container = d3.select(containerRef.current);
  const magGroups = container.selectAll('.magnet').data(magnetsRef.current, (d: any) => d.feature);

  magGroups.transition().duration(750).ease(d3.easeCubicInOut);
  magGroups.select('rect').transition().duration(750)
    .attr('width', d => SIM_CONFIG.baseMagnetWidth * (d as any).scale)
    .attr('height', d => SIM_CONFIG.baseMagnetHight * (d as any).scale)
    .attr('x', d => (d as any).x - (SIM_CONFIG.baseMagnetWidth * (d as any).scale) / 2)
    .attr('y', d => (d as any).y - (SIM_CONFIG.baseMagnetHight * (d as any).scale) / 2);
  magGroups.select('text').transition().duration(750)
    .attr('x', d => (d as any).x).attr('y', d => (d as any).y + 5);

  setActiveFeatures(new Set(DEFAULT_MAGNETS.map(m => m.feature)));  // Activate all Magnets
  if (simulationRef.current) simulationRef.current.alpha(0.5).restart();
};

const handleZoomIn = () => {
  if (svgRef.current && zoomBehaviorRef.current) {
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
  }
};
const handleZoomOut = () => {
  if (svgRef.current && zoomBehaviorRef.current) {
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
  }
};
const handleResetZoom = () => {
  if (svgRef.current && zoomBehaviorRef.current) {
    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  }
};

return (
    <div className={`relative h-full w-full flex-1 ${isInfoVisible ? 'blur-xs' : ''}`}>
      {/* MAGNET MANAGEMENT SIDEBAR */}
      <div className="absolute top-4 left z-20 flex flex-col gap-3 bg-white/80 p-1 rounded-md shadow-sm border border-gray-200">
        <p className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Magnets:</p>
        <div className="flex flex-col gap-2 pr-1">
          {DEFAULT_MAGNETS.map((mag) => (
            <label key={mag.feature} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={activeFeatures.has(mag.feature)}
                onChange={() => handleToggleMagnet(mag.feature)}
                className="w-4 h-4 rounded border-gray-300 text-blue-500"
              />
              <span className={`text-sm ${activeFeatures.has(mag.feature) ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                {mag.label}
              </span>
            </label>
          ))}
        </div>

        <div className="flex justify-center px-1 pb-1">
          <button 
            onClick={handleResetMagnets} 
            className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all duration-100 shadow-sm border border-blue-100 hover:border-blue-600 active:scale-95"
            title="Reset Magnets to Defaults"
          >
            <span className="whitespace-nowrap">Reset Magnets</span>
          </button>
        </div>
      </div>
         
   
      {/* ZOOM TOOLBAR */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex flex-row gap-2 bg-white/80 p-1 rounded-md shadow-sm border border-gray-200">
        <button 
          onClick={handleZoomOut}
          className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
          title="Zoom Out"
        >
          <MinusSquare color="#B0B0B0" />
        </button>
        <button 
          onClick={handleResetZoom}
          className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
          title="Reset Zoom"
        >
          <ArrowRotateLeft color="#B0B0B0"/>
        </button>
        <button 
          onClick={handleZoomIn}
          className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
          title="Zoom In"
        >
          <PlusSquare color="#B0B0B0" />
        </button>
      </div>

      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        viewBox="0 0 800 600" 
        className="cursor-move"
      >
        <g ref={containerRef} />
      </svg>
    </div>
  );
};

export default DustAndMagnet;