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
    { x: 100, y: 100, feature: 'age', label: 'Age', scale: 1 },
    { x: 700, y: 100, feature: 'credit_amount', label: 'Credit Amount', scale: 1 },
    { x: 400, y: 50,  feature: 'duration', label: 'Duration', scale: 1 },
    { x: 100, y: 500, feature: 'saving_accounts', label: 'Savings', scale: 1 },
    { x: 700, y: 500, feature: 'checking_account', label: 'Checking', scale: 1 },
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
  initialAlpha: 1.0,       // Initial energy of the simulation
  baseMagnetWidth: 80,
  baseMagnetHight: 40,
  magnetBoundaryForce: 0.1  // Force with which the nodes are being pushed outside of a magnet when they are underneath it
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
        let totalVx = 0;
        let totalVy = 0;

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
            totalVx -= dx * 0.1;
            totalVy -= dy * 0.1;
          }
        });

        // Apply the summed forces directly to velocity
        node.vx = totalVx;
        node.vy = totalVy;

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
      if (event.sourceEvent.shiftKey) {
        // --- SHIFT + DRAG: SCALE ---
        // Moving mouse up decreases dy, so we subtract it to increase scale
        const sensitivity = 0.01;
        d.scale = Math.max(0.5, Math.min(3, d.scale - event.dy * sensitivity));
      } else {
        // --- NORMAL DRAG: MOVE ---
        const paddingX = (SIM_CONFIG.baseMagnetWidth * d.scale) / 2;
        const paddingY = (SIM_CONFIG.baseMagnetHight * d.scale) / 2;
        d.x = Math.max(paddingX, Math.min(800 - paddingX, event.x));
        d.y = Math.max(paddingY, Math.min(600 - paddingY, event.y));
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
          const g = enter.append('g').attr('class', 'magnet').call(drag as any);
          
          g.append('rect')
            .attr('rx', 5).attr('fill', '#DBDBDB').attr('stroke', '#B0B0B0')
            .style('cursor', 'grab');

          g.append('text')
            .attr('text-anchor', 'middle')
            .style('font-size', '12px').style('font-weight', 'bold')
            .style('pointer-events', 'none');
          
          return g;
        },
      );

    // Sync positions for both new and existing magnets
    // Centering and Scaling logic for all magnets (enter + update)
    magGroups.select('rect')
      .attr('width', d => 80 * (d as any).scale)
      .attr('height', d => 40 * (d as any).scale)
      .attr('x', d => (d as any).x - (80 * (d as any).scale) / 2)
      .attr('y', d => (d as any).y - (40 * (d as any).scale) / 2);

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