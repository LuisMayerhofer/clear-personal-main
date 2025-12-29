import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { CreditData, DashboardData } from '@/app/[locale]/(main)/dashboard/types';

type DnMNode = CreditData & d3.SimulationNodeDatum;

interface DnMProps extends DashboardData {
  onScenarioSelect: (scenario: CreditData) => void;
  isInfoVisible: boolean;
}

const DustAndMagnet: React.FC<DnMProps> = ({ scenarios, profile, onScenarioSelect, isInfoVisible }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // 1. Prepare Data: Combine User (Red) and Counterfactuals (Blue)
  const nodes = useMemo<DnMNode[]>(() => {
    return [profile, ...scenarios].map(d => ({
      ...d,
      // Initialize positions randomly within the view
      x: Math.random() * 800,
      y: Math.random() * 600,
    })) as DnMNode[]; // Cast to the combined type
  }, [scenarios, profile]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    // 2. Define Magnet Positions (Hardcoded corners/sides)
    const magnets = [
      { x: 100, y: 100, feature: 'age', label: 'Age' },
      { x: 700, y: 100, feature: 'credit_amount', label: 'Credit Amount' },
      { x: 100, y: 500, feature: 'duration', label: 'Duration' },
      { x: 700, y: 500, feature: 'job', label: 'Job' },
    ];

    // 3. Setup Force Simulation
    const simulation = d3.forceSimulation(nodes)
      .velocityDecay(0.6) // "Force Delay": High damping to stop motion quickly 
      .on('tick', () => {
        // Custom DnM Attraction Force
        nodes.forEach(node => {
          magnets.forEach(mag => {
            let val = (node.features[mag.feature as keyof typeof node.features] as number) || 0;

            // Normalization logic: Bring different scales into a 0.0 - 1.0 range
            if (mag.feature === 'credit_amount') val = val / 15000; // Max amount approx 15k
            if (mag.feature === 'age') val = val / 100;           // Max age approx 100
            if (mag.feature === 'duration') val = val / 72;      // Max duration approx 72
            if (mag.feature === 'job') val = val / 3;            // Max job level is 3

            // Force depends on normalized data value [cite: 81, 84]
            node.vx! += (mag.x - node.x) * (val * 0.001); 
            node.vy! += (mag.y - node.y) * (val * 0.001);
          });
        });

        // Update visual positions
        nodeSelection.attr('cx', d => d.x!).attr('cy', d => d.y!);
      });

    // 4. Render Dust (Data Points)
    const nodeSelection = svg.selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d: DnMNode) => {
        // 1. Identify the user profile point (Red)
        if (d.id === profile.id) return 10;

        // 2. Normalize risk to a number (0-1) for arithmetic
        let riskValue: number;
        if (typeof d.risk === 'number') {
          riskValue = d.risk;
        } else {
          // Convert string 'good'/'bad' to numbers if necessary
          riskValue = d.risk === 'good' ? 1 : 0;
        }
      
        // 3. Size Coding: Low risk (big number) = Big, High risk (small number) = Small
        return 4 + (riskValue * 8); 
      })
      .attr('fill', d => d.id === profile.id ? '#FF5655' : '#3B82F6') // Color Coding: Red/Blue
      .style('cursor', 'pointer')
      .on('click', (event, d) => onScenarioSelect(d)); // Maintain Dashboard Interactivity

    // 5. Render Magnets
    svg.selectAll('rect')
      .data(magnets)
      .join('rect')
      .attr('x', d => d.x - 25).attr('y', d => d.y - 15)
      .attr('width', 50).attr('height', 30)
      .attr('fill', '#DBDBDB').attr('stroke', '#B0B0B0');

    svg.selectAll('text')
      .data(magnets)
      .join('text')
      .attr('x', d => d.x).attr('y', d => d.y + 5)
      .attr('text-anchor', 'middle').text(d => d.label)
      .style('font-size', '10px');

    return () => {
      simulation.stop();
    };
  }, [nodes, onScenarioSelect]);

  return (
    <div className={`relative h-full w-full flex-1 cursor-move ${isInfoVisible ? 'blur-xs' : ''}`}>
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600" />
    </div>
  );
};

export default DustAndMagnet;