import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { CreditData, DashboardData } from '@/app/[locale]/(main)/dashboard/types';
import { PlusSquare, MinusSquare, ArrowRotateLeft } from '@/components/Icons';
import Tooltip from './Tooltip';
import { GRAPH_COLORS } from '@/utils/colors';
import { useTranslations } from 'next-intl';

type DnMNode = CreditData & d3.SimulationNodeDatum;

interface DnMProps extends DashboardData {
	onScenarioSelect: (scenario: CreditData) => void;
	isInfoVisible: boolean;
}

// Interface for the tooltip position state
interface TooltipPosition {
	x: number;
	y: number;
	translateY: string;
	translateX: string;
}

interface Magnet {
	x: number;
	y: number;
	feature: string;
	label: string;
	scale: number;
}

//#region Config
const DEFAULT_MAGNETS: Magnet[] = [
	{ x: 100, y: 100, feature: 'age', label: 'Age', scale: 1 },
	{ x: 700, y: 100, feature: 'credit_amount', label: 'Credit Amount', scale: 1 },
	{ x: 400, y: 50, feature: 'duration', label: 'Duration', scale: 1 },
	{ x: 100, y: 500, feature: 'saving_accounts', label: 'Savings', scale: 1 },
	{ x: 700, y: 500, feature: 'checking_account', label: 'Checking', scale: 1 },
];

const SIM_CONFIG = {
	forceMultiplier: 0.01, // Strength of magnetic pull (Higher = faster movement) 
	alphaDecay: 0.02, // Cooling rate (Lower = simulation runs longer before stopping)
	velocityDecay: 0.6, // "Visual Friction" (Higher = heavier dust feel, prevents orbiting) 
	initialAlpha: 1.0, // Initial energy of the simulation
	baseMagnetWidth: 120,
	baseMagnetHight: 50,
	magnetBoundaryForce: 0.05, // Force with which the nodes are being pushed outside of a magnet when they are underneath it
	minWinSizeX: -800,
	maxWinSizeX: 1600,
	minWinSizeY: -300,
	maxWinSizeY: 900,
};
//#endregion

const DustAndMagnet: React.FC<DnMProps> = ({
	scenarios,
	profile,
	onScenarioSelect,
	isInfoVisible,
	chosenScenario, 
}) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const containerRef = useRef<SVGGElement>(null);
	const simulationRef = useRef<d3.Simulation<DnMNode, undefined> | null>(null);
	const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

	const magnetsRef = useRef(DEFAULT_MAGNETS.map((m) => ({ ...m })));

	const [activeFeatures, setActiveFeatures] = useState<Set<string>>(
		new Set(DEFAULT_MAGNETS.map((m) => m.feature)),
	);

	// Tooltip state and effect
	const [tooltipData, setTooltipData] = useState<CreditData | null>(null);
	const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);

	const t = useTranslations('dashboard');
	const tMagnets = useTranslations('magnets');

	const nodes = useMemo<DnMNode[]>(() => {
		// Ensure user profile isn't included twice
		const otherScenarios = scenarios.filter((s) => s.id !== profile.id);
		return [...otherScenarios, profile].map((d) => {
			// Look for existing coordinates in the current simulation to maintain continuity
			const existingNode = simulationRef.current?.nodes().find((n) => n.id === d.id);
			return {
				...d,
				x: existingNode?.x ?? Math.random() * 800,
				y: existingNode?.y ?? Math.random() * 600,
				vx: existingNode?.vx ?? 0,
				vy: existingNode?.vy ?? 0,
			};
		}) as DnMNode[];
	}, [scenarios, profile]);

	// Main Physics Effect
	useEffect(() => {
		if (!svgRef.current || !containerRef.current) return;
		const svg = d3.select(svgRef.current);
		const container = d3.select(containerRef.current);

		// Zoom
		const zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 5])
			.filter((event) => {
				return event.type === 'wheel' ? true : !event.button;
			})
			.on('zoom', (event) => {
				container.attr('transform', event.transform);
			});
		svg.call(zoom);
		svg.on('dblclick.zoom', null); // Disable double-click zoom
		zoomBehaviorRef.current = zoom;

		//#region Simulation Init
		const simulation = d3
			.forceSimulation<DnMNode>(nodes)
			.alpha(SIM_CONFIG.initialAlpha)
			.alphaDecay(SIM_CONFIG.alphaDecay)
			.velocityDecay(SIM_CONFIG.velocityDecay)
			.on('tick', () => {
				nodes.forEach((node) => {
					let totalVx = 0;
					let totalVy = 0;

					magnetsRef.current.forEach((mag) => {
						if (!activeFeatures.has(mag.feature)) return; // Check whether Magnet is active
						const rawVal = node.features[mag.feature as keyof typeof node.features];
						let val = 0;

						// Normalization
						// Handle Numeric Features
						if (typeof rawVal === 'number') {
							if (mag.feature === 'credit_amount') {
								val = (rawVal - 276) / (18424 - 276);
							} else if (mag.feature === 'age') {
								val = (rawVal - 19) / (75 - 19);
							} else if (mag.feature === 'duration') {
								val = (rawVal - 6) / (72 - 6);
							} else {
								val = rawVal / 3; 
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

						// Scale the strength by the magnet's current scale
						const pull = val * (mag.scale || 1) * SIM_CONFIG.forceMultiplier;
						totalVx += dx * pull;
						totalVy += dy * pull;

						// "Border Force" to prevents nodes from disappearing under the magnet
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

					// Window size Bounding box constraints
					const r = 10; // Collision radius from the walls
					if (node.x! < SIM_CONFIG.minWinSizeX + r) node.x = SIM_CONFIG.minWinSizeX + r;
					if (node.x! > SIM_CONFIG.maxWinSizeX - r) node.x = SIM_CONFIG.maxWinSizeX - r;
					if (node.y! < SIM_CONFIG.minWinSizeY + r) node.y = SIM_CONFIG.minWinSizeY + r;
					if (node.y! > SIM_CONFIG.maxWinSizeY - r) node.y = SIM_CONFIG.maxWinSizeY - r;
				});

				container
					.selectAll('circle')
					.attr('cx', (d) => (d as DnMNode).x!)
					.attr('cy', (d) => (d as DnMNode).y!);
			});

		simulationRef.current = simulation;
		//#endregion

		//#region Magnet Drag
		const drag = d3
			.drag<SVGGElement, Magnet>()
			.on('start', function () {
				// Bring the dragged magnet to the front visually
				d3.select(this).raise();
			})
			.on('drag', function (event: d3.D3DragEvent<SVGGElement, Magnet, Magnet>, d) {
				if (event.sourceEvent.shiftKey) {
					// --- SHIFT + DRAG: SCALE ---
					const sensitivity = 0.01;
					d.scale = Math.max(0.5, Math.min(3, d.scale - event.dy * sensitivity));
				} else {
					// --- NORMAL DRAG: MOVE ---
					const paddingX = (SIM_CONFIG.baseMagnetWidth * d.scale) / 2;
					const paddingY = (SIM_CONFIG.baseMagnetHight * d.scale) / 2;
					d.x = Math.max(
						SIM_CONFIG.minWinSizeX + paddingX,
						Math.min(SIM_CONFIG.maxWinSizeX - paddingX, event.x),
					);
					d.y = Math.max(
						SIM_CONFIG.minWinSizeY + paddingY,
						Math.min(SIM_CONFIG.maxWinSizeY - paddingY, event.y),
					);
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
		//#endregion

		//#region Rendering
		// Render Dust
		container
			.selectAll('circle')
			.data(nodes)
			.join('circle')
			.style('cursor', 'pointer')
			.on('click', (event, d) => {
				onScenarioSelect(d as CreditData);

				event.stopPropagation();

				const svgBounds = svgRef.current?.getBoundingClientRect();
				if (!svgBounds) return;
				const x = event.clientX - svgBounds.left;
				const y = event.clientY - svgBounds.top;

				let translateY = '5%';
				let translateX = '-50%';
				if (y > svgBounds.height * 0.6) {
					translateY = '-105%';
				}
				if (x > svgBounds.width - 200) {
					translateX = '-100%';
				} else if (x < 200) {
					translateX = '0%';
				}

				setTooltipData(d as CreditData);
				setTooltipPosition({ x, y, translateX, translateY });
			});

		// Render Magnets
		const activeMagnets = magnetsRef.current.filter((m) => activeFeatures.has(m.feature)); // Filter for active magnets
		const magGroups = container
			.selectAll<SVGGElement, Magnet>('.magnet')
			.data(activeMagnets, (d) => d.feature)
			.join((enter) => {
				const g = enter.append('g').attr('class', 'magnet').call(drag);

				g.append('rect')
					.attr('rx', 5)
					.attr('fill', '#DBDBDB')
					.attr('stroke', '#B0B0B0')
					.style('cursor', 'grab');

				g.append('text')
					.attr('text-anchor', 'middle')
					.style('font-size', 'sm')
					.style('font-weight', 'bold')
					.style('pointer-events', 'none');

				return g;
			});

		// Sync positions for both new and existing magnets
		// Centering and Scaling logic for all magnets (enter + update)
		magGroups
			.select('rect')
			.attr('width', (d) => SIM_CONFIG.baseMagnetWidth * d.scale)
			.attr('height', (d) => SIM_CONFIG.baseMagnetHight * d.scale)
			.attr('x', (d) => d.x - (SIM_CONFIG.baseMagnetWidth * d.scale) / 2)
			.attr('y', (d) => d.y - (SIM_CONFIG.baseMagnetHight * d.scale) / 2);

		magGroups
			.select('text')
			.attr('x', (d) => d.x)
			.attr('y', (d) => d.y + 5)
			.text((d) => tMagnets(d.feature));

		return () => {
			simulation.stop();
		};
		//#endregion
	}, [nodes, activeFeatures, tMagnets, onScenarioSelect]);

	// Visual Styling Effect
	useEffect(() => {
		if (!containerRef.current) return;
		const container = d3.select(containerRef.current);

		container
			.selectAll<SVGCircleElement, DnMNode>('circle')
			.data(nodes)
			.transition()
			.duration(250)
			.attr('r', (d) => {
				if (d.id === profile.id) return 10;
				const risk = d.risk;
				let riskValue: number;
				if (typeof risk === 'number') {
					riskValue = risk;
				} else {
					riskValue = risk === 'good' ? 1 : 0;
				}

				return 3 + Math.pow(riskValue, 1.5) * 22; 
			})
			.attr('fill', (d: DnMNode) => {
				if (d.id === profile.id) return GRAPH_COLORS.userProfile;
				if (d.id === chosenScenario?.id) return GRAPH_COLORS.selectedNode;
				if (d.counterfactual === false) {
					return 'grey';
				}
				return GRAPH_COLORS.counterfactualNode;
			})
			.attr('stroke', (d: DnMNode) => (d.id === chosenScenario?.id ? '#000' : '#fff'))
			.attr('stroke-width', (d: DnMNode) => (d.id === chosenScenario?.id ? 2 : 1));
	}, [nodes, chosenScenario, profile.id]);

	// Activate/Deactivate Magnet
	const handleToggleMagnet = (feature: string) => {
		setActiveFeatures((prev) => {
			const next = new Set(prev);
			if (next.has(feature)) next.delete(feature);
			else next.add(feature);
			return next;
		});
		if (simulationRef.current) simulationRef.current.alpha(0.3).restart();
	};

	// Reset Magnets
	const handleResetMagnets = () => {
		magnetsRef.current = DEFAULT_MAGNETS.map((m) => ({ ...m }));

		if (!containerRef.current) return;
		const container = d3.select(containerRef.current);
		const magGroups = container
			.selectAll<SVGGElement, Magnet>('.magnet')
			.data(magnetsRef.current, (d) => (d as Magnet).feature);

		magGroups.transition().duration(750).ease(d3.easeCubicInOut);
		magGroups
			.select('rect')
			.transition()
			.duration(750)
			.attr('width', (d) => SIM_CONFIG.baseMagnetWidth * d.scale)
			.attr('height', (d) => SIM_CONFIG.baseMagnetHight * d.scale)
			.attr('x', (d) => d.x - (SIM_CONFIG.baseMagnetWidth * d.scale) / 2)
			.attr('y', (d) => d.y - (SIM_CONFIG.baseMagnetHight * d.scale) / 2);
		magGroups
			.select('text')
			.transition()
			.duration(750)
			.attr('x', (d) => d.x)
			.attr('y', (d) => d.y + 5)
			.text((d) => tMagnets(d.feature));

		setActiveFeatures(new Set(DEFAULT_MAGNETS.map((m) => m.feature))); 
		if (simulationRef.current) simulationRef.current.alpha(0.5).restart();
	};

	// Zoom
	const handleZoomIn = () => {
		if (svgRef.current && zoomBehaviorRef.current) {
			d3.select(svgRef.current)
				.transition()
				.duration(300)
				.call(zoomBehaviorRef.current.scaleBy, 1.3);
		}
	};
	const handleZoomOut = () => {
		if (svgRef.current && zoomBehaviorRef.current) {
			d3.select(svgRef.current)
				.transition()
				.duration(300)
				.call(zoomBehaviorRef.current.scaleBy, 0.7);
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

	//#region HTML
	return (
		<div className={`relative h-full w-full flex-1 ${isInfoVisible ? 'blur-xs' : ''}`}>
			{/* MAGNET MANAGEMENT SIDEBAR */}
			<div className="left absolute top-4 z-20 flex flex-col gap-3 rounded-md border border-gray-200 bg-white/80 p-1 shadow-sm">
				<p className="border-b border-gray-100 pb-2 text-sm font-bold text-gray-800">Magnets:</p>
				<div className="flex flex-col gap-2 pr-1">
					{DEFAULT_MAGNETS.map((mag) => (
						<label key={mag.feature} className="group flex cursor-pointer items-center gap-3">
							<input
								type="checkbox"
								checked={activeFeatures.has(mag.feature)}
								onChange={() => handleToggleMagnet(mag.feature)}
								className="accent-button-background h-4 w-4 rounded border-gray-300"
							/>
							<span
								className={`text-sm ${activeFeatures.has(mag.feature) ? 'font-medium text-gray-700' : 'text-gray-400'}`}
							>
								{tMagnets(mag.feature)}
							</span>
						</label>
					))}
				</div>

				<div className="flex justify-center px-1 pb-1">
					<button
						onClick={handleResetMagnets}
						className="hover:bg-button-background flex w-full items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 shadow-sm transition-all duration-100 hover:border-blue-600 hover:text-white active:scale-95"
						title="Reset Magnets to Defaults"
					>
						<span className="whitespace-nowrap">{tMagnets('reset_button')}</span>
					</button>
				</div>
			</div>

			{/* ZOOM TOOLBAR */}
			<div className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 flex-row gap-2 rounded-md border border-gray-200 bg-white/80 p-1 shadow-sm">
				<button
					onClick={handleZoomOut}
					className="rounded px-0.5 py-0.5 text-gray-600 transition-colors duration-50 hover:bg-gray-200 active:scale-95"
					title="Zoom Out"
				>
					<MinusSquare size="s" color="#B0B0B0" />
				</button>
				<button
					onClick={handleResetZoom}
					className="rounded px-0.5 py-0.5 text-gray-600 transition-colors duration-50 hover:bg-gray-200 active:scale-95"
					title="Reset Zoom"
				>
					<ArrowRotateLeft size="s" color="#B0B0B0" />
				</button>
				<button
					onClick={handleZoomIn}
					className="rounded px-0.5 py-0.5 text-gray-600 transition-colors duration-50 hover:bg-gray-200 active:scale-95"
					title="Zoom In"
				>
					<PlusSquare size="s" color="#B0B0B0" />
				</button>
			</div>

			{/* COLOR LEGEND */}
			<div className="left absolute bottom-0 z-10 flex flex-row gap-4 rounded-md border border-gray-200 bg-white/80 bg-white/90 p-2 shadow-sm">
				<div className="flex items-center gap-2">
					<div
						className="h-3 w-3 rounded-full shadow-sm"
						style={{ backgroundColor: GRAPH_COLORS.userProfile }}
					></div>
					<span className="text-xs font-medium text-gray-700">{t('UMAP_legend_user_text')}</span>
				</div>

				<div className="flex items-center gap-2">
					<div
						className="h-3 w-3 rounded-full shadow-sm"
						style={{ backgroundColor: GRAPH_COLORS.selectedNode }}
					></div>
					<span className="text-xs font-medium text-gray-700">
						{t('UMAP_legend_chosen_scenario_text')}
					</span>
				</div>

				<div className="flex items-center gap-2">
					<div
						className="h-3 w-3 rounded-full shadow-sm"
						style={{ backgroundColor: GRAPH_COLORS.counterfactualNode }}
					></div>
					<span className="text-xs font-medium text-gray-700">
						{t('UMAP_legend_alternative_scenarios_text')}
					</span>
				</div>
			</div>

			<svg
				ref={svgRef}
				width="100%"
				height="100%"
				viewBox="0 0 800 600"
				className="cursor-move"
				onClick={() => setTooltipData(null)}
			>
				<g ref={containerRef} />
			</svg>
			{tooltipData && tooltipPosition && (
				<Tooltip
					data={tooltipData}
					position={tooltipPosition}
					onMouseEnter={() => {}}
					onMouseLeave={() => {}}
					isUser={tooltipData.id === profile.id}
				/>
			)}
		</div>
	);
};
//#endregion
export default DustAndMagnet;
