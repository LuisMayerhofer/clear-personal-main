import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { CreditData, DashboardData } from '@/app/[locale]/(main)/dashboard/types';

type DnMNode = CreditData & d3.SimulationNodeDatum;

interface DnMProps extends DashboardData {
  onScenarioSelect: (scenario: CreditData) => void;
  isInfoVisible: boolean;
}

const DustAndMagnet: React.FC<DnMProps> = ({ 
  scenarios, 
  profile, 
  onScenarioSelect, 
  isInfoVisible, 
  chosenScenario // Make sure this is destructured
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Use a Ref to hold the simulation instance so it persists between renders
  const simulationRef = useRef<d3.Simulation<DnMNode, undefined> | null>(null);

  const magnetsRef = useRef([
    { x: 100, y: 100, feature: 'age', label: 'Age' },
    { x: 700, y: 100, feature: 'credit_amount', label: 'Credit Amount' },
    { x: 400, y: 50,  feature: 'duration', label: 'Duration' },
    { x: 100, y: 500, feature: 'saving_accounts', label: 'Savings' },
    { x: 700, y: 500, feature: 'checking_account', label: 'Checking' },
  ]);


  // 1. Prepare Data: This only re-runs if the underlying scenarios change
  const nodes = useMemo<DnMNode[]>(() => {
    return [profile, ...scenarios].map(d => {
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

// 1. Centralized Configuration (Place this at the top of your component body)
const SIM_CONFIG = {
  forceMultiplier: 0.01,  // Strength of magnetic pull (Higher = faster movement) [cite: 84]
  alphaDecay: 0.02,       // Cooling rate (Lower = simulation runs longer before stopping) [cite: 55]
  velocityDecay: 0.6,     // "Visual Friction" (Higher = heavier dust feel, prevents orbiting) [cite: 70, 97]
  initialAlpha: 1.0       // Initial energy of the simulation
};

// 2. Main Physics Effect
useEffect(() => {
  if (!svgRef.current) return;
  const svg = d3.select(svgRef.current);

  
  // Initialize simulation using variables from SIM_CONFIG
  const simulation = d3.forceSimulation<DnMNode>(nodes)
    .alpha(SIM_CONFIG.initialAlpha)
    .alphaDecay(SIM_CONFIG.alphaDecay)
    .velocityDecay(SIM_CONFIG.velocityDecay)
    .on('tick', () => {
      nodes.forEach(node => {
        magnetsRef.current.forEach(mag => {
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

          // Apply force using SIM_CONFIG.forceMultiplier
          node.vx! += (mag.x - node.x!) * (val * SIM_CONFIG.forceMultiplier); 
          node.vy! += (mag.y - node.y!) * (val * SIM_CONFIG.forceMultiplier);
        });

        // ADD BOUNDING BOX CONSTRAINTS
        const r = 10; // Collision radius from the walls
        if (node.x! < r) node.x = r;
        if (node.x! > 800 - r) node.x = 800 - r;
        if (node.y! < r) node.y = r;
        if (node.y! > 600 - r) node.y = 600 - r;
      });

      svg.selectAll('circle')
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
      // Define boundaries (adjust for half-width/height of the magnet)
      const paddingX = 40;
      const paddingY = 20;

      // Clamp values: Math.max(min, Math.min(max, current))
      d.x = Math.max(paddingX, Math.min(800 - paddingX, event.x));
      d.y = Math.max(paddingY, Math.min(600 - paddingY, event.y));

      const g = d3.select(this);
      g.select('rect').attr('x', d.x - 40).attr('y', d.y - 20);
      g.select('text').attr('x', d.x).attr('y', d.y + 5);

      if (simulationRef.current) {
        simulationRef.current.alpha(0.3).restart(); 
      }
    });

  // Render initial dust and magnets
  svg.selectAll('circle')
    .data(nodes)
    .join('circle')
    .style('cursor', 'pointer')
    .on('click', (event, d) => onScenarioSelect(d as CreditData));

  // Render Magnets
  const magGroups = svg.selectAll('.magnet')
      .data(magnetsRef.current, (d: any) => d.feature)
      .join(
        (enter) => {
          // Create group and elements only once
          const g = enter.append('g').attr('class', 'magnet').call(drag as any);
          
          g.append('rect')
            .attr('width', 80).attr('height', 40)
            .attr('rx', 5).attr('fill', '#DBDBDB').attr('stroke', '#B0B0B0')
            .style('cursor', 'grab');

          g.append('text')
            .attr('text-anchor', 'middle')
            .style('font-size', '12px').style('font-weight', 'bold')
            .style('pointer-events', 'none');
          
          return g;
        },
        (update) => update 
      );

    // Sync positions for both new and existing magnets
    magGroups.select('rect')
      .attr('x', d => (d as any).x - 40)
      .attr('y', d => (d as any).y - 20);

    magGroups.select('text')
      .attr('x', d => (d as any).x)
      .attr('y', d => (d as any).y + 5)
      .text(d => (d as any).label);

    return () => {
      simulation.stop();
    };
  }, [nodes])


// 3. Visual Styling Effect
useEffect(() => {
  if (!svgRef.current) return;
  const svg = d3.select(svgRef.current);

  svg.selectAll('circle')
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

  return (
    <div className={`relative h-full w-full flex-1 cursor-move ${isInfoVisible ? 'blur-xs' : ''}`}>
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600" />
    </div>
  );
};

export default DustAndMagnet;