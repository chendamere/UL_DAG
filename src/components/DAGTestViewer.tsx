/**
 * DAG Test Viewer - React component for testing DAG data structures
 */

import { useState, useCallback } from 'react';
import {
  DAG,
  validateDAG,
  topologicalSort,
  bfsFromRoots,
  dfsPostOrder,
  type DAGStructure,
} from '../dag';

const SAMPLE_DAG: DAGStructure<string> = {
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
};

const CYCLIC_SAMPLE: DAGStructure = {
  nodes: [
    { id: 'x', data: 'X' },
    { id: 'y', data: 'Y' },
    { id: 'z', data: 'Z' },
  ],
  edges: [
    { from: 'x', to: 'y' },
    { from: 'y', to: 'z' },
    { from: 'z', to: 'x' },
  ],
};

function tryParseJSON<T>(str: string): { ok: true; data: T } | { ok: false; error: string } {
  try {
    const data = JSON.parse(str) as T;
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Parse error' };
  }
}

export function DAGTestViewer() {
  const [input, setInput] = useState(() => JSON.stringify(SAMPLE_DAG, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);
  const [lastStructure, setLastStructure] = useState<DAGStructure | null>(SAMPLE_DAG);

  const runTests = useCallback(() => {
    const parsed = tryParseJSON<DAGStructure>(input);
    if (!parsed.ok) {
      setParseError(parsed.error);
      setLastStructure(null);
      return;
    }
    setParseError(null);
    setLastStructure(parsed.data);
  }, [input]);

  const structure = lastStructure;
  const validation = structure ? validateDAG(structure) : null;
  const topo = structure && validation?.isAcyclic ? topologicalSort(structure) : null;
  const bfs = structure && validation?.isAcyclic ? bfsFromRoots(structure) : null;
  const dfs = structure && validation?.isAcyclic ? dfsPostOrder(structure) : null;
  const dag = structure ? new DAG(structure) : null;

  const loadSample = (sample: DAGStructure) => {
    setInput(JSON.stringify(sample, null, 2));
    setParseError(null);
    setLastStructure(sample);
  };

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>DAG Test Viewer</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Enter or edit JSON DAG structure, then run tests to validate and traverse.
      </p>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => loadSample(SAMPLE_DAG)}
          style={buttonStyle}
        >
          Load Sample DAG
        </button>
        <button
          type="button"
          onClick={() => loadSample(CYCLIC_SAMPLE)}
          style={buttonStyle}
        >
          Load Cyclic (invalid) Sample
        </button>
        <button type="button" onClick={runTests} style={{ ...buttonStyle, background: '#2563eb', color: 'white' }}>
          Run Tests
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>DAG JSON</label>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setParseError(null);
          }}
          rows={14}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: 13,
            padding: 12,
            border: '1px solid #ddd',
            borderRadius: 8,
            resize: 'vertical',
          }}
          spellCheck={false}
        />
        {parseError && (
          <div style={{ color: '#dc2626', marginTop: 8, fontSize: 14 }}>Parse error: {parseError}</div>
        )}
      </div>

      {lastStructure && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ResultBlock title="Validation">
            {validation && (
              <div>
                <div>
                  <strong>Valid:</strong>{' '}
                  <span style={{ color: validation.isValid ? '#059669' : '#dc2626' }}>
                    {validation.isValid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <strong>Acyclic:</strong>{' '}
                  <span style={{ color: validation.isAcyclic ? '#059669' : '#dc2626' }}>
                    {validation.isAcyclic ? 'Yes' : 'No'}
                  </span>
                </div>
                {validation.cycles && validation.cycles.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Cycles:</strong>{' '}
                    {validation.cycles.map((c) => c.join(' → ')).join('; ')}
                  </div>
                )}
                {validation.orphanNodes && validation.orphanNodes.length > 0 && (
                  <div>
                    <strong>Orphan nodes:</strong> {validation.orphanNodes.join(', ')}
                  </div>
                )}
                {validation.missingReferences && validation.missingReferences.length > 0 && (
                  <div>
                    <strong>Missing refs:</strong>{' '}
                    {validation.missingReferences.map((m) => `${m.edge.from}→${m.edge.to} (${m.missing})`).join(', ')}
                  </div>
                )}
              </div>
            )}
          </ResultBlock>

          {validation?.isAcyclic && dag && (
            <>
              <ResultBlock title="Graph Info">
                <div>
                  <strong>Nodes:</strong> {dag.getNodes().length}
                </div>
                <div>
                  <strong>Roots:</strong> {dag.getRoots().join(', ') || '(none)'}
                </div>
                <div>
                  <strong>Leaves:</strong> {dag.getLeaves().join(', ') || '(none)'}
                </div>
              </ResultBlock>

              <ResultBlock title="Topological Order">
                {topo ? topo.join(' → ') : '-'}
              </ResultBlock>

              <ResultBlock title="BFS (from roots)">
                {bfs ? bfs.join(' → ') : '-'}
              </ResultBlock>

              <ResultBlock title="DFS Post-order">
                {dfs ? dfs.join(' → ') : '-'}
              </ResultBlock>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        background: '#fafafa',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8, color: '#374151' }}>{title}</div>
      <div style={{ fontSize: 14 }}>{children}</div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  background: 'white',
  cursor: 'pointer',
  fontSize: 14,
};
