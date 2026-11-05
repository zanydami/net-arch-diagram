export type LayerId = 'ue' | 'ran' | 'transport' | 'core' | 'external';

export interface Layer {
  id: LayerId;
  label: string;
  color: string;
  textColor: string;
}

export interface NetNode {
  id: string;
  layer: LayerId;
  label: string;
  fullName: string;
  role: string;
  interfaces: string[];
  badge?: string;
}

export interface NetLink {
  id: string;
  from: string;
  to: string;
  label?: string;
  kind?: 'control' | 'user';
}

export interface Technology {
  id: string;
  label: string;
  summary: string;
  nodes: NetNode[];
  links: NetLink[];
}