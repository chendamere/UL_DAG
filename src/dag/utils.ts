/**
 * DAG utilities: validation, topological sort, traversal
 */

import type { DAGStructure, DAGValidationResult } from './types';
import { DAG } from './DAG';

/** Check if a graph has cycles (DFS-based cycle detection) */
function findCycles(dag: DAG): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];
  const pathIndex = new Map<string, number>();
  const nodeIds = dag.getNodes().map((n) => n.id);

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    const idx = path.length;
    path.push(nodeId);
    pathIndex.set(nodeId, idx);

    for (const childId of dag.getChildren(nodeId)) {
      if (!visited.has(childId)) {
        if (dfs(childId)) return true;
      } else if (recursionStack.has(childId)) {
        const cycleStart = pathIndex.get(childId) ?? 0;
        cycles.push([...path.slice(cycleStart), childId]);
        return true;
      }
    }

    path.pop();
    pathIndex.delete(nodeId);
    recursionStack.delete(nodeId);
    return false;
  }

  for (const id of nodeIds) {
    if (!visited.has(id)) {
      dfs(id);
    }
  }

  return cycles;
}

/** Validate a DAG structure */
export function validateDAG(structure: DAGStructure): DAGValidationResult {
  const dag = new DAG(structure);
  const nodeIds = new Set(structure.nodes.map((n) => n.id));

  const missingReferences: DAGValidationResult['missingReferences'] = [];
  for (const edge of structure.edges) {
    if (!nodeIds.has(edge.from)) {
      missingReferences.push({ edge, missing: 'from' });
    }
    if (!nodeIds.has(edge.to)) {
      missingReferences.push({ edge, missing: 'to' });
    }
  }

  const cycles = findCycles(dag);
  const orphanNodes = structure.nodes
    .filter((n) => {
      const hasIn = structure.edges.some((e) => e.to === n.id);
      const hasOut = structure.edges.some((e) => e.from === n.id);
      return !hasIn && !hasOut;
    })
    .map((n) => n.id);

  const isValid =
    missingReferences.length === 0 &&
    cycles.length === 0;

  return {
    isValid,
    isAcyclic: cycles.length === 0,
    cycles: cycles.length > 0 ? cycles : undefined,
    orphanNodes: orphanNodes.length > 0 ? orphanNodes : undefined,
    missingReferences: missingReferences.length > 0 ? missingReferences : undefined,
  };
}

/** Topological sort (Kahn's algorithm) */
export function topologicalSort<T>(structure: DAGStructure<T>): string[] {
  const dag = new DAG(structure);
  const inDegree = new Map<string, number>();

  for (const node of structure.nodes) {
    inDegree.set(node.id, 0);
  }
  for (const edge of structure.edges) {
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    result.push(id);
    for (const child of dag.getChildren(id)) {
      const deg = (inDegree.get(child) ?? 1) - 1;
      inDegree.set(child, deg);
      if (deg === 0) queue.push(child);
    }
  }

  return result;
}

/** Breadth-first traversal from roots */
export function bfsFromRoots<T>(structure: DAGStructure<T>, startIds?: string[]): string[] {
  const dag = new DAG(structure);
  const start = startIds ?? dag.getRoots();
  const visited = new Set<string>();
  const queue = [...start];
  const result: string[] = [];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    result.push(id);
    for (const child of dag.getChildren(id)) {
      if (!visited.has(child)) queue.push(child);
    }
  }

  return result;
}

/** Depth-first traversal (post-order) */
export function dfsPostOrder<T>(structure: DAGStructure<T>, startIds?: string[]): string[] {
  const dag = new DAG(structure);
  const start = startIds ?? dag.getRoots();
  const visited = new Set<string>();
  const result: string[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    for (const child of dag.getChildren(id)) {
      visit(child);
    }
    result.push(id);
  }

  for (const id of start) {
    visit(id);
  }

  return result;
}
