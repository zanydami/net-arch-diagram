import type { Technology } from './types';

export interface AppSelection {
  technologyId: string;
  nodeId: string | null;
}

export function parseAppSelection(
  search: string,
  technologies: Technology[],
  defaultTechnologyId: string
): AppSelection {
  const params = new URLSearchParams(search);
  const requestedTechnologyId = params.get('tech');
  const technology =
    technologies.find((item) => item.id === requestedTechnologyId) ??
    technologies.find((item) => item.id === defaultTechnologyId) ??
    technologies[0];

  if (!technology) {
    return { technologyId: defaultTechnologyId, nodeId: null };
  }

  const requestedNodeId = params.get('node');
  const nodeId = technology.nodes.some((node) => node.id === requestedNodeId)
    ? requestedNodeId
    : null;

  return { technologyId: technology.id, nodeId };
}

export function selectTechnology(technologyId: string): AppSelection {
  return { technologyId, nodeId: null };
}

export function serializeAppSelection(technologyId: string, nodeId: string | null): string {
  const params = new URLSearchParams();
  params.set('tech', technologyId);
  if (nodeId) params.set('node', nodeId);
  return `?${params.toString()}`;
}