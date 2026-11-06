import { useEffect, useState } from 'react';
import type { Technology } from '../types';
import DetailPanel from './DetailPanel';
import { interfaceDescriptions } from '../data/interfaceDescriptions';
import {
  LAYERS,
  LAYER_X_POSITIONS,
  NODE_HEIGHT,
  NODE_WIDTH,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
  getNodePosition,
} from '../data/technologies';

function getLinkGeometry(
  from: { x: number; y: number },
  to: { x: number; y: number },
  routeIndex = 0
) {
  if (Math.abs(to.x - from.x) < NODE_WIDTH) {
    const direction = Math.sign(to.y - from.y) || 1;
    const start = { x: from.x, y: from.y + direction * NODE_HEIGHT / 2 };
    const end = { x: to.x, y: to.y - direction * NODE_HEIGHT / 2 };

    if (Math.abs(to.y - from.y) <= NODE_HEIGHT * 2) {
      return {
        path: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
        labelX: from.x,
        labelY: (start.y + end.y) / 2,
      };
    }

    const side = routeIndex % 2 === 0 ? -1 : 1;
    const lane = NODE_WIDTH / 2 + 42 + (Math.floor(routeIndex / 2) % 2) * 28;
    const laneX = from.x + side * lane;
    const sideStart = { x: from.x + side * NODE_WIDTH / 2, y: from.y };
    const sideEnd = { x: to.x + side * NODE_WIDTH / 2, y: to.y };
    const labelX = (sideStart.x + 3 * laneX + 3 * laneX + sideEnd.x) / 8;

    return {
      path: `M ${sideStart.x} ${sideStart.y} C ${laneX} ${sideStart.y}, ${laneX} ${sideEnd.y}, ${sideEnd.x} ${sideEnd.y}`,
      labelX,
      labelY: (sideStart.y + sideEnd.y) / 2,
    };
  }

  const direction = Math.sign(to.x - from.x);
  const start = { x: from.x + direction * NODE_WIDTH / 2, y: from.y };
  const end = { x: to.x - direction * NODE_WIDTH / 2, y: to.y };
  const curve = Math.max(50, Math.abs(end.x - start.x) * 0.38);

  return {
    path: `M ${start.x} ${start.y} C ${start.x + direction * curve} ${start.y}, ${end.x - direction * curve} ${end.y}, ${end.x} ${end.y}`,
    labelX: (start.x + end.x) / 2,
    labelY: (start.y + end.y) / 2,
  };
}

function rectanglesOverlap(
  first: { left: number; top: number; right: number; bottom: number },
  second: { left: number; top: number; right: number; bottom: number }
) {
  return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
}

function getInterfacePopupPosition(
  linkId: string,
  labelX: number,
  labelY: number,
  technology: Technology,
  positions: Record<string, { x: number; y: number }>
) {
  const popupWidth = 260;
  const popupHeight = 145;
  const candidates = [
    { left: labelX + 20, top: labelY + 18 },
    { left: labelX - popupWidth - 20, top: labelY + 18 },
    { left: labelX + 20, top: labelY - popupHeight - 18 },
    { left: labelX - popupWidth - 20, top: labelY - popupHeight - 18 },
  ];
  const obstacles = [
    ...technology.nodes.map((node) => {
      const position = positions[node.id];
      return {
        left: position.x - NODE_WIDTH / 2,
        top: position.y - NODE_HEIGHT / 2,
        right: position.x + NODE_WIDTH / 2,
        bottom: position.y + NODE_HEIGHT / 2,
      };
    }),
    ...technology.links.flatMap((link, index) => {
      if (!link.label || link.id === linkId) return [];
      const geometry = getLinkGeometry(positions[link.from], positions[link.to], index);
      const width = Math.max(42, link.label.length * 6.2 + 14);
      return [{
        left: geometry.labelX - width / 2,
        top: geometry.labelY - 10,
        right: geometry.labelX + width / 2,
        bottom: geometry.labelY + 10,
      }];
    }),
  ];

  return candidates
    .map((candidate) => {
      const rect = {
        ...candidate,
        right: candidate.left + popupWidth,
        bottom: candidate.top + popupHeight,
      };
      const outOfBounds =
        rect.left < 8 || rect.top < 88 || rect.right > VIEWBOX_WIDTH - 8 || rect.bottom > VIEWBOX_HEIGHT - 8;
      const collisions = obstacles.filter((obstacle) => rectanglesOverlap(rect, obstacle)).length;
      const distance = Math.hypot(candidate.left - labelX, candidate.top - labelY);
      return { ...candidate, score: (outOfBounds ? 1000 : 0) + collisions * 100 + distance / 1000 };
    })
    .sort((first, second) => first.score - second.score)[0];
}

interface Props {
  technology: Technology;
  selectedNodeId: string | null;
  onNodeClick: (id: string) => void;
  onClose: () => void;
  onShowDetails: (kind: 'node' | 'interface', id: string) => void;
}

export default function ArchitectureDiagram({
  technology,
  selectedNodeId,
  onNodeClick,
  onClose,
  onShowDetails,
}: Props) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  useEffect(() => {
    setHoveredLinkId(null);
    setSelectedLinkId(null);
  }, [technology.id]);

  const positions = Object.fromEntries(
    technology.nodes.map((n) => [n.id, getNodePosition(n, technology.nodes)])
  ) as Record<string, { x: number; y: number }>;

  const selectedNode = technology.nodes.find((n) => n.id === selectedNodeId) ?? null;
  const selectedLink = technology.links.find((link) => link.id === selectedLinkId && link.label) ?? null;
  const selectedLinkFrom = selectedLink
    ? technology.nodes.find((node) => node.id === selectedLink.from)
    : null;
  const selectedLinkTo = selectedLink
    ? technology.nodes.find((node) => node.id === selectedLink.to)
    : null;
  const selectedLinkIndex = selectedLink
    ? technology.links.findIndex((link) => link.id === selectedLink.id)
    : -1;
  const selectedLinkGeometry = selectedLink
    ? getLinkGeometry(positions[selectedLink.from], positions[selectedLink.to], selectedLinkIndex)
    : null;
  const selectedLinkPopupPosition = selectedLink && selectedLinkGeometry
    ? getInterfacePopupPosition(
        selectedLink.id,
        selectedLinkGeometry.labelX,
        selectedLinkGeometry.labelY,
        technology,
        positions
      )
    : null;
  const popupPosition = selectedNode ? positions[selectedNode.id] : null;
  const popupStyle = popupPosition
    ? {
        left:
          popupPosition.x > VIEWBOX_WIDTH * 0.72
            ? `${((popupPosition.x - 260) / VIEWBOX_WIDTH) * 100}%`
            : `${((popupPosition.x + 40) / VIEWBOX_WIDTH) * 100}%`,
        top:
          popupPosition.y > VIEWBOX_HEIGHT * 0.72
            ? `${((popupPosition.y - 150) / VIEWBOX_HEIGHT) * 100}%`
            : `${((popupPosition.y + 20) / VIEWBOX_HEIGHT) * 100}%`,
      }
    : undefined;

  const isLinkRelatedToHoveredNode = (from: string, to: string) =>
    !hoveredNodeId || from === hoveredNodeId || to === hoveredNodeId;

  const isNodeRelatedToHoveredNode = (nodeId: string) =>
    !hoveredNodeId ||
    nodeId === hoveredNodeId ||
    technology.links.some(
      (link) =>
        (link.from === hoveredNodeId && link.to === nodeId) ||
        (link.to === hoveredNodeId && link.from === nodeId)
    );

  const layerBoundaries = LAYERS.slice(0, -1).map((layer, index) => {
    const nextLayer = LAYERS[index + 1];
    const start = LAYER_X_POSITIONS[layer.id];
    const end = LAYER_X_POSITIONS[nextLayer.id];
    return (start + end) / 2;
  });

  return (
    <div className="architecture-diagram">
      <div className="desktop-architecture relative overflow-visible">
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className="block h-auto w-full min-h-[500px]"
        role="img"
        aria-label={`Архитектура ${technology.label}`}
      >
        {LAYERS.map((layer) => {
          const x = LAYER_X_POSITIONS[layer.id];
          return (
            <g key={layer.id}>
              <text
                className={`layer-label layer-${layer.id}`}
                x={x}
                y={80}
                textAnchor="middle"
                fill={layer.textColor}
                fontSize={11}
                fontWeight={700}
                letterSpacing="0.08em"
              >
                {layer.label.toUpperCase()}
              </text>
              <rect
                className="layer-marker"
                x={x - 16}
                y={92}
                width={32}
                height={3}
                rx={1.5}
                fill={layer.color}
              />
            </g>
          );
        })}

        {layerBoundaries.map((x, i) => (
          <line
            key={i}
            className="layer-separator"
            x1={x}
            x2={x}
            y1={112}
            y2={VIEWBOX_HEIGHT - 72}
            stroke="#e2e8f0"
            strokeDasharray="3 7"
          />
        ))}

        {technology.links.map((link, index) => {
          const from = positions[link.from];
          const to = positions[link.to];
          if (!from || !to) return null;
          const geometry = getLinkGeometry(from, to, index);
          const related = isLinkRelatedToHoveredNode(link.from, link.to);
          const active =
            hoveredLinkId === link.id || selectedLinkId === link.id ||
            (hoveredNodeId !== null && related);

          return (
            <path
              key={`path-${link.id}`}
              className={`interface-route${active ? ' interface-route-active' : ''}`}
              d={geometry.path}
              fill="none"
              stroke={active ? '#6687ad' : '#cbd5e1'}
              strokeWidth={active ? 2.2 : 1.4}
              opacity={hoveredNodeId && !related ? 0.12 : active ? 0.98 : 0.58}
              style={{ transition: 'stroke 0.15s, stroke-width 0.15s, opacity 0.15s' }}
            />
          );
        })}

        {technology.links.map((link, index) => {
          if (!link.label) return null;
          const from = positions[link.from];
          const to = positions[link.to];
          if (!from || !to) return null;
          const { labelX, labelY } = getLinkGeometry(from, to, index);
          const related = isLinkRelatedToHoveredNode(link.from, link.to);
          const active =
            hoveredLinkId === link.id || selectedLinkId === link.id ||
            (hoveredNodeId !== null && related);
          const labelWidth = Math.max(42, link.label.length * 6.2 + 14);

          return (
            <g
              key={`label-${link.id}`}
              className={`interface-chip${active ? ' interface-chip-active' : ''}`}
              transform={`translate(${labelX}, ${labelY})`}
              role="button"
              tabIndex={0}
              aria-label={`Интерфейс ${link.label}`}
              onMouseEnter={() => setHoveredLinkId(link.id)}
              onMouseLeave={() => setHoveredLinkId(null)}
              onFocus={() => setHoveredLinkId(link.id)}
              onBlur={() => setHoveredLinkId(null)}
              onClick={() => setSelectedLinkId(selectedLinkId === link.id ? null : link.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedLinkId(selectedLinkId === link.id ? null : link.id);
                }
              }}
              style={{
                cursor: 'pointer',
                opacity: hoveredNodeId && !related ? 0.22 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <rect
                x={-labelWidth / 2}
                y={-10}
                width={labelWidth}
                height={20}
                rx={6}
                fill={active ? '#eef4fb' : 'white'}
                stroke={active ? '#6687ad' : '#d8e0ea'}
                strokeWidth={active ? 1.4 : 1}
              />
              <text
                x={0}
                y={3.5}
                textAnchor="middle"
                fontSize={9.5}
                fontFamily="ui-monospace, monospace"
                fontWeight={600}
                fill="#475569"
                pointerEvents="none"
              >
                {link.label}
              </text>
            </g>
          );
        })}

        {technology.nodes.map((node) => {
          const pos = positions[node.id];
          const layer = LAYERS.find((l) => l.id === node.layer)!;
          const selected = selectedNodeId === node.id;
          const hovered = hoveredNodeId === node.id;
          const related = isNodeRelatedToHoveredNode(node.id);

          return (
            <g
              key={node.id}
              className="architecture-node"
              data-active={selected || hovered}
              data-layer={node.layer}
              role="button"
              tabIndex={0}
              aria-label={`Узел ${node.label}, ${node.fullName}`}
              transform={`translate(${pos.x - NODE_WIDTH / 2}, ${pos.y - NODE_HEIGHT / 2})`}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onFocus={() => setHoveredNodeId(node.id)}
              onBlur={() => setHoveredNodeId(null)}
              onClick={() => {
                setSelectedLinkId(null);
                onNodeClick(node.id);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedLinkId(null);
                  onNodeClick(node.id);
                }
              }}
              style={{
                cursor: 'pointer',
                opacity: related || selected ? 1 : 0.24,
                transition: 'opacity 0.15s',
              }}
            >
              <rect
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={8}
                fill="white"
                stroke={selected || hovered ? layer.color : '#cbd5e1'}
                strokeWidth={selected ? 2.5 : hovered ? 2 : 1}
                style={{ transition: 'stroke 0.15s, stroke-width 0.15s' }}
              />
              <rect
                x={1}
                y={9}
                width={4}
                height={NODE_HEIGHT - 18}
                rx={2}
                fill={layer.color}
                opacity={0.9}
              />
              <text
                x={NODE_WIDTH / 2}
                y={NODE_HEIGHT / 2 + 5}
                textAnchor="middle"
                fontSize={13}
                fontWeight={600}
                fill="#0f172a"
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {technology.nodes.map((node) => {
          if (!node.badge) return null;
          const pos = positions[node.id];
          const layer = LAYERS.find((l) => l.id === node.layer)!;
          const w = Math.max(50, node.badge.length * 8 + 14);

          return (
            <g
              key={'badge-' + node.id}
              transform={`translate(${pos.x}, ${pos.y - NODE_HEIGHT / 2 - 10})`}
              pointerEvents="none"
            >
              <rect x={-w / 2} y={-7} width={w} height={14} rx={3} fill={layer.color} />
              <text x={0} y={3} textAnchor="middle" fontSize={9} fontWeight={600} fill="white">
                {node.badge}
              </text>
            </g>
          );
        })}
      </svg>

      {selectedNode && popupPosition && popupStyle && !selectedLink && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: popupStyle.left,
            top: popupStyle.top,
          }}
        >
          <div className="pointer-events-auto">
            <DetailPanel
              node={selectedNode}
              onClose={onClose}
              onMore={() => onShowDetails('node', selectedNode.id)}
              floating
            />
          </div>
        </div>
      )}

      {selectedLink && selectedLinkFrom && selectedLinkTo && selectedLinkPopupPosition && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: `${(selectedLinkPopupPosition.left / VIEWBOX_WIDTH) * 100}%`,
            top: `${(selectedLinkPopupPosition.top / VIEWBOX_HEIGHT) * 100}%`,
          }}
        >
          <div className="interface-detail-popup pointer-events-auto w-[260px] max-w-[40vw] rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="font-mono text-sm font-semibold text-slate-800">
                {selectedLink.label}
              </h3>
              <button
                onClick={() => setSelectedLinkId(null)}
                aria-label="Закрыть"
                className="-mt-1 text-xl leading-none text-slate-400 transition hover:text-slate-700"
              >
                ×
              </button>
            </div>
            <p className="mb-1 text-xs text-slate-500">
              {selectedLinkFrom.label} — {selectedLinkTo.label}
            </p>
            <p className="text-sm leading-relaxed text-slate-700">
              {interfaceDescriptions[selectedLink.label] ?? 'Интерфейс обмена данными между узлами сети.'}
            </p>
            <button
              type="button"
              onClick={() => onShowDetails('interface', selectedLink.label!)}
              className="mt-3 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
            >
              Подробнее
            </button>
          </div>
        </div>
      )}
      </div>

      <div className="mobile-architecture">
        {LAYERS.map((layer) => {
          const layerNodes = technology.nodes.filter((node) => node.layer === layer.id);
          if (layerNodes.length === 0) return null;

          return (
            <section key={layer.id} className="mobile-layer">
              <h2 className="mobile-layer-heading">
                <span className="mobile-layer-marker" style={{ backgroundColor: layer.color }} />
                {layer.label}
              </h2>
              <ul>
                {layerNodes.map((node) => {
                  const selected = selectedNodeId === node.id;
                  return (
                    <li key={node.id} className="mobile-node-item">
                      <button
                        type="button"
                        aria-expanded={selected}
                        onClick={() => onNodeClick(node.id)}
                        className="mobile-node-button"
                      >
                        <span className="mobile-node-title">
                          <strong>{node.label}</strong>
                          <span>{node.fullName}</span>
                        </span>
                        <span className="mobile-node-role">{node.role}</span>
                      </button>
                      {selected && (
                        <div className="mobile-node-details">
                          <DetailPanel
                            node={node}
                            onClose={onClose}
                            onMore={() => onShowDetails('node', node.id)}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <section className="mobile-connections">
          <h2 className="mobile-layer-heading">Связи</h2>
          <ul>
            {technology.links.map((link) => {
              const from = technology.nodes.find((node) => node.id === link.from);
              const to = technology.nodes.find((node) => node.id === link.to);
              if (!from || !to) return null;

              return (
                <li key={link.id} className="mobile-connection">
                  <span className="mobile-connection-endpoints">
                    <span>{from.label}</span>
                    <span aria-hidden="true">→</span>
                    <span>{to.label}</span>
                  </span>
                  {link.label ? (
                    <button
                      type="button"
                      onClick={() => onShowDetails('interface', link.label!)}
                      className="mobile-interface-button"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <span className="mobile-transport-label">Транспорт</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
