import type { Technology } from '../types';

export function validateTechnologies(technologies: Technology[]): string[] {
  const issues: string[] = [];
  const technologyIds = new Set<string>();

  for (const technology of technologies) {
    if (technologyIds.has(technology.id)) {
      issues.push(`Duplicate technology id "${technology.id}".`);
    }
    technologyIds.add(technology.id);

    const nodeIds = new Set<string>();
    for (const node of technology.nodes) {
      if (nodeIds.has(node.id)) {
        issues.push(`${technology.id}: duplicate node id "${node.id}".`);
      }
      nodeIds.add(node.id);
    }

    const linkIds = new Set<string>();
    for (const link of technology.links) {
      if (linkIds.has(link.id)) {
        issues.push(`${technology.id}: duplicate link id "${link.id}".`);
      }
      linkIds.add(link.id);

      const fromNode = technology.nodes.find((node) => node.id === link.from);
      const toNode = technology.nodes.find((node) => node.id === link.to);
      if (!fromNode) {
        issues.push(`${technology.id}: link "${link.id}" references missing node "${link.from}".`);
      }
      if (!toNode) {
        issues.push(`${technology.id}: link "${link.id}" references missing node "${link.to}".`);
      }

      if (
        link.label &&
        fromNode &&
        toNode &&
        !fromNode.interfaces.includes(link.label) &&
        !toNode.interfaces.includes(link.label)
      ) {
        issues.push(
          `${technology.id}: interface "${link.label}" is not listed on either endpoint of link "${link.id}".`
        );
      }
    }
  }

  return issues;
}