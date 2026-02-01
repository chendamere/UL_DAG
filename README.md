# DAG Test Viewer

A React app for testing **Directed Acyclic Graph (DAG)** data structures.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
src/
├── dag/                    # DAG implementation
│   ├── types.ts            # DAGNode, DAGEdge, DAGStructure, DAGValidationResult
│   ├── DAG.ts              # DAG class (add/remove nodes & edges, traversal helpers)
│   ├── utils.ts            # validateDAG, topologicalSort, bfsFromRoots, dfsPostOrder
│   └── index.ts            # Module exports
├── components/
│   └── DAGTestViewer.tsx   # React component for testing DAGs
├── App.tsx
└── main.tsx
```

## DAG Data Format

```json
{
  "nodes": [
    { "id": "a", "data": "Task A" },
    { "id": "b", "data": "Task B" }
  ],
  "edges": [
    { "from": "a", "to": "b" }
  ]
}
```

## Usage

- **Load Sample DAG** / **Load Cyclic Sample** – Load predefined test data
- **Run Tests** – Validate the graph and run topological sort, BFS, and DFS
- Edit the JSON and run tests to experiment with your own DAGs
