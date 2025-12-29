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

  const magnets = [
    { x: 150, y: 150, feature: 'age', label: 'Age' },
    { x: 650, y: 150, feature: 'credit_amount', label: 'Credit Amount' },
    { x: 150, y: 450, feature: 'duration', label: 'Duration' },
    { x: 650, y: 450, feature: 'job', label: 'Job' },
  ];

  // Initialize simulation using variables from SIM_CONFIG
  const simulation = d3.forceSimulation<DnMNode>(nodes)
    .alpha(SIM_CONFIG.initialAlpha)
    .alphaDecay(SIM_CONFIG.alphaDecay)
    .velocityDecay(SIM_CONFIG.velocityDecay)
    .on('tick', () => {
      nodes.forEach(node => {
        magnets.forEach(mag => {
          let val = (node.features[mag.feature as keyof typeof node.features] as number) || 0;

          // Normalization logic [cite: 81]
          if (mag.feature === 'credit_amount') val = val / 15000;
          if (mag.feature === 'age') val = val / 100;
          if (mag.feature === 'duration') val = val / 72;
          if (mag.feature === 'job') val = val / 3;

          // Apply force using SIM_CONFIG.forceMultiplier [cite: 84]
          node.vx! += (mag.x - node.x!) * (val * SIM_CONFIG.forceMultiplier); 
          node.vy! += (mag.y - node.y!) * (val * SIM_CONFIG.forceMultiplier);
        });
      });

      svg.selectAll('circle')
        .attr('cx', d => (d as DnMNode).x!)
        .attr('cy', d => (d as DnMNode).y!);
    });

  simulationRef.current = simulation;

  // Render initial dust and magnets
  svg.selectAll('circle')
    .data(nodes)
    .join('circle')
    .style('cursor', 'pointer')
    .on('click', (event, d) => onScenarioSelect(d as CreditData));

  const magGroups = svg.selectAll('.magnet')
    .data(magnets)
    .join('g')
    .attr('class', 'magnet');

  magGroups.append('rect')
    .attr('x', d => d.x - 40).attr('y', d => d.y - 20)
    .attr('width', 80).attr('height', 40)
    .attr('rx', 5).attr('fill', '#DBDBDB').attr('stroke', '#B0B0B0');

  magGroups.append('text')
    .attr('x', d => d.x).attr('y', d => d.y + 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px').style('font-weight', 'bold')
    .text(d => d.label);

  return () => {
    simulation.stop();
  };
}, [nodes]); 


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