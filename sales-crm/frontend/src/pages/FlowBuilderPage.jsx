import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  MarkerType,
  EdgeLabelRenderer,
  BaseEdge,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { templateAPI, flowAPI } from '../services/api';
import './FlowBuilderPage.css';

// Category color map
const CAT_COLORS = {
  'Initial Contact': '#4CAF50',
  'Follow Up':       '#2196F3',
  'Collaboration':   '#9C27B0',
  'Demo':            '#FF9800',
  'Proposal':        '#E91E63',
  'Default':         '#607D8B',
};
const catColor = (cat) => CAT_COLORS[cat] || CAT_COLORS['Default'];

// StartNode
function StartNode() {
  return (
    <div className="sn-start-node">
      <span>START</span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// TemplateNode
function TemplateNode({ data }) {
  const color = catColor(data.category);
  const preview = data.message
    ? data.message.slice(0, 100) + (data.message.length > 100 ? '...' : '')
    : '';
  return (
    <div className="sn-template-node">
      <Handle type="target" position={Position.Left} />
      <div className="sn-tn-header">
        <span className="sn-tn-badge" style={{ backgroundColor: color }}>
          {data.category || 'Template'}
        </span>
      </div>
      <div className="sn-tn-name">{data.label}</div>
      {preview && <div className="sn-tn-preview">{preview}</div>}
      {data.variables && data.variables.length > 0 && (
        <div className="sn-tn-vars">
          {data.variables.slice(0, 3).map((v) => (
            <span key={v} className="sn-tn-chip">{'{' + v + '}'}</span>
          ))}
          {data.variables.length > 3 && (
            <span className="sn-tn-chip">+{data.variables.length - 3}</span>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// DecisionNode
function DecisionNode({ id, data }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Decision');
  const inputRef = useRef(null);

  useEffect(() => { setLabel(data.label || 'Decision'); }, [data.label]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const commitEdit = () => {
    setEditing(false);
    data.onLabelChange?.(id, label);
  };

  return (
    <div className="sn-decision-node" onDoubleClick={() => setEditing(true)}>
      <Handle type="target" position={Position.Top} id="top" />
      <div className="sn-dn-diamond">
        <div className="sn-dn-content">
          {editing ? (
            <input
              ref={inputRef}
              className="sn-dn-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span>{label}</span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
}

// EditableEdge
function EditableEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, markerEnd, style,
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || '');
  const inputRef = useRef(null);

  useEffect(() => { setLabel(data?.label || ''); }, [data?.label]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const commit = () => {
    setEditing(false);
    data?.onLabelChange?.(id, label);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="sn-edge-label-wrap nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              className="sn-edge-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === 'Enter' && commit()}
            />
          ) : (
            <div className="sn-edge-label" onClick={() => setEditing(true)}>
              {label || <span className="sn-edge-placeholder">+ label</span>}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

// Stable type registries
const nodeTypes = {
  startNode:    StartNode,
  templateNode: TemplateNode,
  decisionNode: DecisionNode,
};
const edgeTypes = { editable: EditableEdge };

// Build default flow from templates
function buildDefaultFlow(templates) {
  const find = (name) =>
    templates.find((t) => t.name.toLowerCase().includes(name.toLowerCase())) || null;

  const tdata = (name) => {
    const t = find(name);
    return {
      label:      t?.name      || name,
      category:   t?.category  || 'Template',
      message:    t?.message   || '',
      variables:  t?.variables || [],
      templateId: t?.id        || null,
    };
  };

  const nodes = [
    { id: 'start', type: 'startNode',    position: { x: 50,   y: 260 }, data: {}, deletable: false },
    { id: 'n1',    type: 'templateNode', position: { x: 270,  y: 220 }, data: tdata('First Cold Chatting') },
    { id: 'n2',    type: 'templateNode', position: { x: 560,  y: 220 }, data: tdata('Collaborate Check Up') },
    { id: 'n3',    type: 'templateNode', position: { x: 860,  y: 80  }, data: tdata('Demo Link (Default)') },
    { id: 'n4',    type: 'templateNode', position: { x: 860,  y: 250 }, data: tdata('Demo Link (After GForms)') },
    { id: 'n5',    type: 'templateNode', position: { x: 860,  y: 420 }, data: tdata('Demo Link (After WhatsApp)') },
    { id: 'n6',    type: 'templateNode', position: { x: 1160, y: 250 }, data: tdata('Introduction with Proposal') },
  ];

  const mkEdge = (id, source, target, label, sh, th) => ({
    id, source, target,
    type: 'editable',
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { label },
    ...(sh ? { sourceHandle: sh } : {}),
    ...(th ? { targetHandle: th } : {}),
  });

  const edges = [
    mkEdge('e-s-n1',  'start', 'n1', 'Send intro'),
    mkEdge('e-n1-n2', 'n1',    'n2', 'Confirmed contact'),
    mkEdge('e-n2-n3', 'n2',    'n3', 'Open to collab'),
    mkEdge('e-n2-n4', 'n2',    'n4', 'Uses GForms'),
    mkEdge('e-n2-n5', 'n2',    'n5', 'Uses WA manual'),
    mkEdge('e-n3-n6', 'n3',    'n6', 'Interested'),
    mkEdge('e-n4-n6', 'n4',    'n6', ''),
    mkEdge('e-n5-n6', 'n5',    'n6', ''),
  ];

  return { nodes, edges };
}

// Inner component (inside ReactFlowProvider)
function FlowBuilderInner() {
  const { fitView, screenToFlowPosition } = useReactFlow();
  // Keep a stable ref so onDrop closure never goes stale
  const s2fRef = useRef(screenToFlowPosition);
  s2fRef.current = screenToFlowPosition;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [templates, setTemplates]        = useState([]);
  const [loading, setLoading]            = useState(true);
  const [saveStatus, setSaveStatus]      = useState('idle');
  const [searchQuery, setSearchQuery]    = useState('');
  const [selectedItem, setSelectedItem]  = useState(null); // { type, payload }
  const reactFlowWrapper = useRef(null);
  const autoSaveTimer    = useRef(null);
  const latestNodes      = useRef([]);
  const latestEdges      = useRef([]);

  useEffect(() => { latestNodes.current = nodes; }, [nodes]);
  useEffect(() => { latestEdges.current = edges; }, [edges]);

  // Load on mount
  useEffect(() => {
    (async () => {
      try {
        const [tmplRes, canvasRes] = await Promise.all([
          templateAPI.getAll({ enabled: true }),
          flowAPI.getCanvas(),
        ]);
        const raw = tmplRes.data;
        const loadedTemplates = Array.isArray(raw)
          ? raw
          : raw?.templates
            ? Object.values(raw.templates).flat()
            : [];
        setTemplates(loadedTemplates);

        const { nodes: sn, edges: se } = canvasRes.data;
        if (!sn || sn.length === 0) {
          const { nodes: dn, edges: de } = buildDefaultFlow(loadedTemplates);
          setNodes(dn);
          setEdges(de);
        } else {
          const validNodes = sn.filter((n) => n.position && typeof n.position.x === 'number');
          setNodes(validNodes);
          setEdges(se);
        }
      } catch (err) {
        console.error('FlowBuilder init error:', err);
      } finally {
        setLoading(false);
        setTimeout(() => fitView({ padding: 0.15, duration: 600 }), 150);
      }
    })();
  }, []);

  // Auto-save debounced via refs
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await flowAPI.saveCanvas({ nodes: latestNodes.current, edges: latestEdges.current });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 2000);
  }, []);

  useEffect(() => {
    if (!loading) scheduleAutoSave();
  }, [nodes, edges]);

  // Manual save
  const handleManualSave = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus('saving');
    try {
      await flowAPI.saveCanvas({ nodes: latestNodes.current, edges: latestEdges.current });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  };

  // Reset
  const handleReset = () => {
    if (!confirm('Reset canvas to default flow? All changes will be lost.')) return;
    const { nodes: dn, edges: de } = buildDefaultFlow(templates);
    setNodes(dn);
    setEdges(de);
    setTimeout(() => fitView({ padding: 0.15, duration: 600 }), 150);
  };

  // Connect
  const onConnect = useCallback((params) => {
    setEdges((eds) =>
      addEdge(
        { ...params, type: 'editable', animated: false,
          markerEnd: { type: MarkerType.ArrowClosed }, data: { label: '' } },
        eds,
      ),
    );
  }, []);

  // Edge label change
  const handleEdgeLabelChange = useCallback((edgeId, newLabel) => {
    setEdges((eds) =>
      eds.map((e) => e.id === edgeId ? { ...e, data: { ...e.data, label: newLabel } } : e),
    );
  }, []);

  // Decision node label change
  const handleDecisionLabelChange = useCallback((nodeId, newLabel) => {
    setNodes((nds) =>
      nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n),
    );
  }, []);

  // Inject callbacks
  const nodesWithCb = useMemo(
    () => nodes.map((n) => ({ ...n, data: { ...n.data, onLabelChange: handleDecisionLabelChange } })),
    [nodes, handleDecisionLabelChange],
  );
  const edgesWithCb = useMemo(
    () => edges.map((e) => ({ ...e, data: { ...e.data, onLabelChange: handleEdgeLabelChange } })),
    [edges, handleEdgeLabelChange],
  );

  // Drag-and-drop
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/reactflow');
    if (!raw) return;
    let nd;
    try { nd = JSON.parse(raw); } catch { return; }
    const position = s2fRef.current({ x: e.clientX, y: e.clientY });
    const newId = 'node-' + Date.now();
    if (nd.type === 'templateNode') {
      setNodes((nds) => [...nds, {
        id: newId, type: 'templateNode', position,
        data: { label: nd.label, category: nd.category, message: nd.message,
                variables: nd.variables, templateId: nd.templateId },
      }]);
    } else if (nd.type === 'decisionNode') {
      setNodes((nds) => [...nds, {
        id: newId, type: 'decisionNode', position, data: { label: 'Decision' },
      }]);
    }
  }, []);  // s2fRef is stable

  const onDragStart = (e, type, template = null) => {
    const payload = template
      ? { type: 'templateNode', label: template.name, category: template.category,
          message: template.message, variables: template.variables, templateId: template.id }
      : { type: 'decisionNode' };
    e.dataTransfer.setData('application/reactflow', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Click-to-add: place node at canvas center
  const handleAddToCanvas = useCallback((item) => {
    console.log('[FlowBuilder] handleAddToCanvas called with:', item);
    const wrapper = reactFlowWrapper.current;
    let position = { x: 350 + Math.random() * 80, y: 200 + Math.random() * 80 };
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      console.log('[FlowBuilder] canvas bounds:', rect);
      position = s2fRef.current({
        x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 60,
        y: rect.top  + rect.height / 2 + (Math.random() - 0.5) * 60,
      });
      console.log('[FlowBuilder] resolved flow position:', position);
    } else {
      console.warn('[FlowBuilder] reactFlowWrapper.current is null, using fallback position');
    }
    const newId = 'node-' + Date.now();
    if (item.type === 'templateNode') {
      setNodes((nds) => {
        const updated = [...nds, {
          id: newId, type: 'templateNode', position,
          data: { label: item.label, category: item.category,
                  message: item.message, variables: item.variables, templateId: item.templateId },
        }];
        console.log('[FlowBuilder] ✅ TemplateNode added:', item.label, '| total nodes:', updated.length);
        return updated;
      });
    } else {
      setNodes((nds) => {
        const updated = [...nds, {
          id: newId, type: 'decisionNode', position, data: { label: 'Decision' },
        }];
        console.log('[FlowBuilder] ✅ DecisionNode added | total nodes:', updated.length);
        return updated;
      });
    }
    setSelectedItem(null);
  }, []);

  // Filtered templates
  const filtered = useMemo(() => {
    if (!searchQuery) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
    );
  }, [templates, searchQuery]);

  const statusText = { idle: '', saving: 'Saving...', saved: 'Saved', error: 'Save failed!' }[saveStatus];

  if (loading) return <div className="sn-loading">Loading Flow Builder...</div>;

  return (
    <div className="sn-layout">
      {/* Left Panel */}
      <aside className="sn-panel">
        <div className="sn-panel-header">
          <h3 className="sn-panel-title">Flow Builder</h3>
          <input
            className="sn-search"
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="sn-panel-section">DRAG TO CANVAS</div>

        <div
          className={`sn-panel-item sn-decision-item${selectedItem?.type === 'decisionNode' ? ' sn-item-selected' : ''}`}
          draggable
          onDragStart={(e) => onDragStart(e, 'decisionNode')}
          onClick={() => setSelectedItem(selectedItem?.type === 'decisionNode' ? null : { type: 'decisionNode', label: 'Decision' })}
        >
          <span className="sn-decision-icon">◇</span>
          <div className="sn-item-info">
            <span className="sn-item-name">Decision Node</span>
            <span className="sn-item-desc">Branch the flow</span>
          </div>
          {selectedItem?.type === 'decisionNode' && (
            <button className="sn-add-btn" onClick={(e) => { e.stopPropagation(); handleAddToCanvas({ type: 'decisionNode' }); }}>
              ➕ Add
            </button>
          )}
        </div>

        <div className="sn-divider" />
        <div className="sn-panel-section">TEMPLATES ({filtered.length})</div>

        <div className="sn-template-list">
          {filtered.map((t) => (
            <div
              key={t.id}
              className={`sn-panel-item sn-template-item${selectedItem?.templateId === t.id ? ' sn-item-selected' : ''}`}
              draggable
              onDragStart={(e) => onDragStart(e, 'templateNode', t)}
              onClick={() => setSelectedItem(selectedItem?.templateId === t.id ? null : {
                type: 'templateNode', label: t.name, category: t.category,
                message: t.message, variables: t.variables, templateId: t.id,
              })}
            >
              <div className="sn-item-dot" style={{ backgroundColor: catColor(t.category) }} />
              <div className="sn-item-info">
                <span className="sn-item-name">{t.name}</span>
                <span className="sn-item-cat">{t.category}</span>
              </div>
              {selectedItem?.templateId === t.id && (
                <button className="sn-add-btn" onClick={(e) => { e.stopPropagation(); handleAddToCanvas(selectedItem); }}>
                  ➕ Add
                </button>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div className="sn-empty">No templates found</div>}
        </div>
      </aside>

      {/* Canvas */}
      <div className="sn-canvas" ref={reactFlowWrapper} onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodesWithCb}
          edges={edgesWithCb}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
        >
          <Panel position="top-left" className="sn-toolbar">
            <button
              className="sn-btn sn-btn-primary"
              onClick={handleManualSave}
              disabled={saveStatus === 'saving'}
            >
              Save
            </button>
            <button className="sn-btn" onClick={handleReset}>
              Reset
            </button>
            <button className="sn-btn" onClick={() => fitView({ padding: 0.15, duration: 500 })}>
              Fit View
            </button>
            {statusText && (
              <span className={`sn-status sn-status-${saveStatus}`}>{statusText}</span>
            )}
          </Panel>
          <Controls />
          <MiniMap
            nodeColor={(n) => {
              if (n.type === 'startNode')    return '#4CAF50';
              if (n.type === 'decisionNode') return '#9C27B0';
              return '#1e1e2e';
            }}
          />
          <Background color="#2a2a3a" gap={20} />
        </ReactFlow>
      </div>
    </div>
  );
}

// Page export
export default function FlowBuilderPage() {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner />
    </ReactFlowProvider>
  );
}
