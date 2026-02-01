/**
 * Directed Acyclic Graph (DAG) Types
 */

export interface DAGNode<T = unknown> {
  id: string;
  data?: T;
}

export interface DAGEdge {
  from: string;
  to: string;
}

export interface DAGStructure<T = unknown> {
  nodes: DAGNode<T>[];
  edges: DAGEdge[];
}

export interface DAGValidationResult {
  isValid: boolean;
  isAcyclic: boolean;
  cycles?: string[][];
  orphanNodes?: string[];
  missingReferences?: { edge: DAGEdge; missing: 'from' | 'to' }[];
}
