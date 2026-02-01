/**
 * Example graph structures for the DAG Test Viewer
 */

import type { DAGStructure } from './dag';

export const EXAMPLES: Record<string, DAGStructure> = {
  '5-node DAG (diamond + tail)': {
    nodes: [
      { id: 'a', data: 'Task A' },
      { id: 'b', data: 'Task B' },
      { id: 'c', data: 'Task C' },
      { id: 'd', data: 'Task D' },
      { id: 'e', data: 'Task E' },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'a', to: 'c' },
      { from: 'b', to: 'd' },
      { from: 'c', to: 'd' },
      { from: 'd', to: 'e' },
    ],
  },

  '3-node path': {
    nodes: [
      { id: 'x', data: 'X' },
      { id: 'y', data: 'Y' },
      { id: 'z', data: 'Z' },
    ],
    edges: [
      { from: 'x', to: 'y' },
      { from: 'y', to: 'z' },
    ],
  },

  '3-node path (matches Task A→B→D)': {
    nodes: [
      { id: 'p', data: 'Task A' },
      { id: 'q', data: 'Task B' },
      { id: 'r', data: 'Task D' },
    ],
    edges: [
      { from: 'p', to: 'q' },
      { from: 'q', to: 'r' },
    ],
  },

  'Diamond (2 parents → 1 child, matches B,C→D)': {
    nodes: [
      { id: 'x', data: 'Task B' },
      { id: 'y', data: 'Task C' },
      { id: 'z', data: 'Task D' },
    ],
    edges: [
      { from: 'x', to: 'z' },
      { from: 'y', to: 'z' },
    ],
  },

  'Fork (1 root, 2 children)': {
    nodes: [
      { id: 'r', data: 'Task A' },
      { id: 's', data: 'Task B' },
      { id: 't', data: 'Task C' },
    ],
    edges: [
      { from: 'r', to: 's' },
      { from: 'r', to: 't' },
    ],
  },

  '4-node chain': {
    nodes: [
      { id: 'n1', data: 'N1' },
      { id: 'n2', data: 'N2' },
      { id: 'n3', data: 'N3' },
      { id: 'n4', data: 'N4' },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
    ],
  },

  '2-node edge': {
    nodes: [
      { id: 'u', data: 'U' },
      { id: 'v', data: 'V' },
    ],
    edges: [{ from: 'u', to: 'v' }],
  },

  'Single node': {
    nodes: [{ id: 'solo', data: 'Solo' }],
    edges: [],
  },

  'Empty (no nodes)': {
    nodes: [],
    edges: [],
  },

  '7-node DAG (deeper)': {
    nodes: [
      { id: '1', data: '1' },
      { id: '2', data: '2' },
      { id: '3', data: '3' },
      { id: '4', data: '4' },
      { id: '5', data: '5' },
      { id: '6', data: '6' },
      { id: '7', data: '7' },
    ],
    edges: [
      { from: '1', to: '2' },
      { from: '1', to: '3' },
      { from: '2', to: '4' },
      { from: '3', to: '5' },
      { from: '4', to: '6' },
      { from: '5', to: '6' },
      { from: '6', to: '7' },
    ],
  },
};
