/**
 * Directed Acyclic Graph (DAG) data structure
 */

import type { DAGNode, DAGEdge, DAGStructure } from './types';

export class DAG<T = unknown> {
  private nodeMap = new Map<string, DAGNode<T>>();
  private outgoingEdges = new Map<string, Set<string>>();
  private incomingEdges = new Map<string, Set<string>>();

  constructor(structure?: DAGStructure<T>) {
    if (structure) {
      this.load(structure);
    }
  }

  /** Add a node to the graph */
  addNode(node: DAGNode<T>): void {
    this.nodeMap.set(node.id, node);
    if (!this.outgoingEdges.has(node.id)) {
      this.outgoingEdges.set(node.id, new Set());
    }
    if (!this.incomingEdges.has(node.id)) {
      this.incomingEdges.set(node.id, new Set());
    }
  }

  /** Add an edge from node A to node B */
  addEdge(from: string, to: string): void {
    this.outgoingEdges.get(from)?.add(to);
    this.incomingEdges.get(to)?.add(from);
  }

  /** Remove a node and all its edges */
  removeNode(id: string): void {
    this.nodeMap.delete(id);
    this.outgoingEdges.delete(id);
    this.incomingEdges.delete(id);
    for (const edges of [this.outgoingEdges, this.incomingEdges]) {
      for (const set of edges.values()) {
        set.delete(id);
      }
    }
  }

  /** Get a node by ID */
  getNode(id: string): DAGNode<T> | undefined {
    return this.nodeMap.get(id);
  }

  /** Get all nodes */
  getNodes(): DAGNode<T>[] {
    return Array.from(this.nodeMap.values());
  }

  /** Get children of a node */
  getChildren(id: string): string[] {
    return Array.from(this.outgoingEdges.get(id) ?? []);
  }

  /** Get parents of a node */
  getParents(id: string): string[] {
    return Array.from(this.incomingEdges.get(id) ?? []);
  }

  /** Get roots (nodes with no incoming edges) */
  getRoots(): string[] {
    return this.getNodes()
      .filter((n) => (this.incomingEdges.get(n.id)?.size ?? 0) === 0)
      .map((n) => n.id);
  }

  /** Get leaves (nodes with no outgoing edges) */
  getLeaves(): string[] {
    return this.getNodes()
      .filter((n) => (this.outgoingEdges.get(n.id)?.size ?? 0) === 0)
      .map((n) => n.id);
  }

  /** Load from structure */
  load(structure: DAGStructure<T>): void {
    this.clear();
    for (const node of structure.nodes) {
      this.addNode(node);
    }
    for (const edge of structure.edges) {
      this.addEdge(edge.from, edge.to);
    }
  }

  /** Export to structure */
  toStructure(): DAGStructure<T> {
    const nodes = this.getNodes();
    const edges: DAGEdge[] = [];
    for (const [from, targets] of this.outgoingEdges) {
      for (const to of targets) {
        edges.push({ from, to });
      }
    }
    return { nodes, edges };
  }

  /** Clear the graph */
  clear(): void {
    this.nodeMap.clear();
    this.outgoingEdges.clear();
    this.incomingEdges.clear();
  }
}
