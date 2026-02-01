/**
 * DAG Test Viewer - React component for testing DAG data structures
 * and subgraph isomorphism (VF2 algorithm)
 */

import { useState, useCallback } from 'react';
import {
  DAG,
  validateDAG,
  topologicalSort,
  bfsFromRoots,
  dfsPostOrder,
  vf2SubgraphIsomorphism,
  type DAGStructure,
} from '../dag';
import { DAGGraphVisual } from './DAGGraphVisual';
import { EXAMPLES } from '../examples';

const DEFAULT_TARGET = EXAMPLES['5-node DAG (diamond + tail)'];
const DEFAULT_PATTERN = EXAMPLES['3-node path (matches Task A→B→D)'];

function tryParseJSON<T>(str: string): { ok: true; data: T } | { ok: false; error: string } {
  try {
    const data = JSON.parse(str) as T;
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Parse error' };
  }
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'monospace',
  fontSize: 13,
  padding: 12,
  border: '1px solid #ddd',
  borderRadius: 8,
  resize: 'vertical',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  background: 'white',
  cursor: 'pointer',
  fontSize: 14,
};

interface PatternGraph {
  id: string;
  input: string;
}

let nextId = 0;

export function DAGTestViewer() {
  const [targetInput, setTargetInput] = useState(() => JSON.stringify(DEFAULT_TARGET, null, 2));
  const [patterns, setPatterns] = useState<PatternGraph[]>(() => [
    { id: 'p0', input: JSON.stringify(DEFAULT_PATTERN, null, 2) },
  ]);

  const targetParsed = tryParseJSON<DAGStructure>(targetInput);
  const targetStructure = targetParsed.ok ? targetParsed.data : null;
  const targetParseError = targetParsed.ok ? null : targetParsed.error;

  const addPattern = useCallback(() => {
    setPatterns((prev) => [...prev, { id: `p${++nextId}`, input: JSON.stringify({ nodes: [], edges: [] }, null, 2) }]);
  }, []);

  const removePattern = useCallback((id: string) => {
    setPatterns((prev) => (prev.length <= 1 ? prev : prev.filter((p) => p.id !== id)));
  }, []);

  const updatePatternInput = useCallback((id: string, input: string) => {
    setPatterns((prev) => prev.map((p) => (p.id === id ? { ...p, input } : p)));
  }, []);

  const loadTargetSample = useCallback((sample: DAGStructure) => {
    setTargetInput(JSON.stringify(sample, null, 2));
  }, []);

  const loadPatternSample = useCallback((id: string, sample: DAGStructure) => {
    setPatterns((prev) => prev.map((p) => (p.id === id ? { ...p, input: JSON.stringify(sample, null, 2) } : p)));
  }, []);

  // Parse all patterns and compute subgraph results
  const patternResults = patterns.map((p) => {
    const parsed = tryParseJSON<DAGStructure>(p.input);
    const structure = parsed.ok ? parsed.data : null;
    const mapping = targetStructure && structure ? vf2SubgraphIsomorphism(structure, targetStructure) : null;
    return {
      id: p.id,
      input: p.input,
      structure,
      parseError: parsed.ok ? null : parsed.error,
      mapping,
      isSubgraph: mapping !== null,
    };
  });

  const validation1 = targetStructure ? validateDAG(targetStructure) : null;
  const topo1 = targetStructure && validation1?.isAcyclic ? topologicalSort(targetStructure) : null;
  const bfs1 = targetStructure && validation1?.isAcyclic ? bfsFromRoots(targetStructure) : null;
  const dfs1 = targetStructure && validation1?.isAcyclic ? dfsPostOrder(targetStructure) : null;
  const dag1 = targetStructure ? new DAG(targetStructure) : null;

  const exampleNames = Object.keys(EXAMPLES);

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>DAG Test Viewer</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Graph 1 is the target. Each pattern graph is checked as a subgraph of the target using the VF2 algorithm.
        Add patterns to check multiple graphs.
      </p>

      <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>Load into target:</span>
        <select
          onChange={(e) => {
            const name = e.target.value;
            if (name) loadTargetSample(EXAMPLES[name]);
          }}
          style={{ ...buttonStyle, padding: '6px 12px' }}
          defaultValue=""
        >
          <option value="">— Examples —</option>
          {exampleNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Target graph */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Graph 1 (Target)</label>
        <textarea
          value={targetInput}
          onChange={(e) => setTargetInput(e.target.value)}
          rows={10}
          style={textareaStyle}
          spellCheck={false}
        />
        {targetParseError && (
          <div style={{ color: '#dc2626', marginTop: 8, fontSize: 14 }}>Parse error: {targetParseError}</div>
        )}
      </div>

      {/* Pattern graphs */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ fontWeight: 600 }}>Pattern graphs</label>
          <button type="button" onClick={addPattern} style={{ ...buttonStyle, background: '#f3f4f6' }}>
            + Add pattern
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {patternResults.map((pr, idx) => (
            <div
              key={pr.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 16,
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>Pattern {idx + 2}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    onChange={(e) => {
                      const name = e.target.value;
                      if (name) loadPatternSample(pr.id, EXAMPLES[name]);
                      e.target.value = '';
                    }}
                    style={{ ...buttonStyle, padding: '6px 12px', fontSize: 13 }}
                  >
                    <option value="">Load example</option>
                    {exampleNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removePattern(pr.id)}
                    style={{ ...buttonStyle, color: '#dc2626' }}
                    disabled={patterns.length <= 1}
                    title="Remove pattern"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <textarea
                value={pr.input}
                onChange={(e) => updatePatternInput(pr.id, e.target.value)}
                rows={8}
                style={{ ...textareaStyle, marginBottom: 8 }}
                spellCheck={false}
              />
              {pr.parseError && (
                <div style={{ color: '#dc2626', marginTop: 4, fontSize: 14 }}>Parse error: {pr.parseError}</div>
              )}
              {targetStructure && pr.structure && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    borderRadius: 6,
                    background: pr.isSubgraph ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${pr.isSubgraph ? '#059669' : '#dc2626'}`,
                  }}
                >
                  <strong>Subgraph of target:</strong>{' '}
                  <span style={{ color: pr.isSubgraph ? '#059669' : '#dc2626', fontWeight: 600 }}>
                    {pr.isSubgraph ? 'Yes' : 'No'}
                  </span>
                  {pr.mapping && pr.mapping.size > 0 && (
                    <div style={{ fontFamily: 'monospace', fontSize: 12, marginTop: 4 }}>
                      {[...pr.mapping.entries()]
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([p, t]) => (
                          <span key={p} style={{ marginRight: 12 }}>
                            {p}→{t}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Graph visuals */}
      {targetStructure && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 16 }}>Graphs</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
            <ResultBlock title="Graph 1 (Target)">
              <DAGGraphVisual structure={targetStructure} />
            </ResultBlock>
            {patternResults.map(
              (pr, idx) =>
                pr.structure &&
                pr.structure.nodes.length > 0 && (
                  <ResultBlock key={pr.id} title={`Pattern ${idx + 2}`} highlight={pr.isSubgraph}>
                    <DAGGraphVisual structure={pr.structure} />
                  </ResultBlock>
                )
            )}
          </div>
        </div>
      )}

      {/* Target details */}
      {targetStructure && (
        <div style={{ marginTop: 24 }}>
          <ResultBlock title="Target — Validation">
            {validation1 && (
              <div>
                <div>
                  <strong>Valid:</strong>{' '}
                  <span style={{ color: validation1.isValid ? '#059669' : '#dc2626' }}>
                    {validation1.isValid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <strong>Acyclic:</strong>{' '}
                  <span style={{ color: validation1.isAcyclic ? '#059669' : '#dc2626' }}>
                    {validation1.isAcyclic ? 'Yes' : 'No'}
                  </span>
                </div>
                {validation1.cycles && validation1.cycles.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Cycles:</strong> {validation1.cycles.map((c) => c.join(' → ')).join('; ')}
                  </div>
                )}
              </div>
            )}
          </ResultBlock>
          {validation1?.isAcyclic && dag1 && (
            <ResultBlock title="Target — Traversal">
              <div>
                <strong>Nodes:</strong> {dag1.getNodes().length} | <strong>Roots:</strong>{' '}
                {dag1.getRoots().join(', ') || '(none)'} | <strong>Leaves:</strong>{' '}
                {dag1.getLeaves().join(', ') || '(none)'}
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>Topological:</strong> {topo1 ? topo1.join(' → ') : '-'}
              </div>
              <div>
                <strong>BFS:</strong> {bfs1 ? bfs1.join(' → ') : '-'}
              </div>
              <div>
                <strong>DFS (post-order):</strong> {dfs1 ? dfs1.join(' → ') : '-'}
              </div>
            </ResultBlock>
          )}
        </div>
      )}
    </div>
  );
}

function ResultBlock({
  title,
  children,
  highlight,
}: {
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        border: `1px solid ${highlight ? '#059669' : '#e5e7eb'}`,
        borderRadius: 8,
        padding: 16,
        background: highlight ? '#f0fdf4' : '#fafafa',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8, color: '#374151' }}>{title}</div>
      <div style={{ fontSize: 14 }}>{children}</div>
    </div>
  );
}
