import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import type { NodeInfo, MasterStatus, NodeStatus } from './types';
import './App.css';

type Tab = 'dashboard' | 'nodes' | 'experts' | 'inference' | 'logs';

const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: '概览', icon: '◈' },
  { id: 'nodes', label: '节点管理', icon: '◇' },
  { id: 'experts', label: 'Expert 管理', icon: '◉' },
  { id: 'inference', label: '推理', icon: '▸' },
  { id: 'logs', label: '日志', icon: '☰' },
];

function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const s = localStorage.getItem('moe-theme');
    if (s) return s as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('moe-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const showToast = useCallback((msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshNodes = useCallback(async () => {
    try { setNodes(await api.getNodes()); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    refreshNodes();
    const t = setInterval(refreshNodes, 5000);
    return () => clearInterval(t);
  }, [refreshNodes]);

  const masters = nodes.filter(n => n.node_type === 'master' && n.alive);
  const workers = nodes.filter(n => n.node_type === 'worker' && n.alive);
  const aliveCount = nodes.filter(n => n.alive).length;
  const totalCount = nodes.length;

  return (
    <div className="app">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg className="sidebar-logo" viewBox="0 0 26 26" fill="none">
            <rect width="26" height="26" rx="7" fill="url(#sg)"/>
            <circle cx="8.5" cy="13" r="2.8" fill="white" opacity="0.9"/>
            <circle cx="17.5" cy="8.5" r="2.8" fill="white" opacity="0.7"/>
            <circle cx="17.5" cy="17.5" r="2.8" fill="white" opacity="0.7"/>
            <line x1="11.3" y1="13" x2="14.7" y2="9.3" stroke="white" strokeWidth="1.4" opacity="0.45"/>
            <line x1="11.3" y1="13" x2="14.7" y2="16.7" stroke="white" strokeWidth="1.4" opacity="0.45"/>
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="26" y2="26">
                <stop stopColor="#3b63f5"/>
                <stop offset="1" stopColor="#7c3aed"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="sidebar-title">MoEAllocator</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">导航</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${tab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-version">v1.0</span>
          <button className="theme-btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="main-header">
          <div>
            <div className="main-title">{NAV_ITEMS.find(n => n.id === tab)?.label}</div>
            <div className="main-subtitle">
              {totalCount === 0 ? '尚未启动任何节点' : `${aliveCount} 个节点运行中，共 ${totalCount} 个`}
            </div>
          </div>
        </div>

        <div className="main-body">
          {tab === 'dashboard' && (
            <DashboardView nodes={nodes} masters={masters} workers={workers} onRefresh={refreshNodes} showToast={showToast} onNavigate={setTab} />
          )}
          {tab === 'nodes' && (
            <NodesView nodes={nodes} masters={masters} onRefresh={refreshNodes} showToast={showToast} />
          )}
          {tab === 'experts' && (
            <ExpertsView masters={masters} showToast={showToast} />
          )}
          {tab === 'inference' && (
            <InferenceView masters={masters} showToast={showToast} loading={loading} setLoading={setLoading} />
          )}
          {tab === 'logs' && (
            <LogsView nodes={nodes} />
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Dashboard ── */
function DashboardView({ nodes, masters, workers, onRefresh, showToast, onNavigate }: {
  nodes: NodeInfo[]; masters: NodeInfo[]; workers: NodeInfo[]; onRefresh: () => void; showToast: (m: string, t?: string) => void; onNavigate: (tab: Tab) => void;
}) {
  const [masterStatuses, setMasterStatuses] = useState<Record<string, MasterStatus | null>>({});

  useEffect(() => {
    masters.forEach(m => {
      api.getNodeStatus(m.node_id)
        .then(s => setMasterStatuses(prev => ({ ...prev, [m.node_id]: s as MasterStatus })))
        .catch(() => setMasterStatuses(prev => ({ ...prev, [m.node_id]: null })));
    });
  }, [masters, nodes]);

  const totalExperts = masters.reduce((sum, m) => sum + (masterStatuses[m.node_id]?.local_expert_count || 0), 0);

  return (
    <>
      <div className="stats-row">
        <StatCard label="在线节点" value={String(nodes.filter(n => n.alive).length)} sub={`共 ${nodes.length} 个`} />
        <StatCard label="Masters" value={String(masters.length)} sub="运行中" />
        <StatCard label="Workers" value={String(workers.length)} sub="运行中" />
        <StatCard label="已加载 Experts" value={String(totalExperts)} sub={`分布在 ${masters.length} 个 Master`} />
      </div>

      <div className="card">
        <div className="section-divider"><h3>快速操作</h3></div>
        <div className="flex gap-3 mt-3">
          <button onClick={() => onNavigate('nodes')}>◈ 创建 Master</button>
          <button className="btn-outline" onClick={() => onNavigate('nodes')}>◇ 创建 Worker</button>
        </div>
      </div>

      {nodes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◎</div>
          <div className="empty-state-text">暂无节点。<br/>从「节点管理」创建 Master 和 Worker 开始。</div>
        </div>
      ) : (
        <div className="card">
          <div className="section-divider"><h3>节点概览</h3></div>
          <div className="nodes-grid mt-3">
            {nodes.slice(0, 6).map(n => (
              <NodeCard key={n.node_id} node={n} onDelete={() => { onRefresh(); showToast(`已删除 ${n.node_id}`); }} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function NodeCard({ node, onDelete }: { node: NodeInfo; onDelete: () => void }) {
  const [status, setStatus] = useState<NodeStatus | null>(null);

  useEffect(() => {
    if (!node.alive) return;
    api.getNodeStatus(node.node_id).then(setStatus).catch(() => setStatus(null));
  }, [node]);

  const isMaster = node.node_type === 'master';
  const expertCount = isMaster && status && 'local_expert_count' in status
    ? status.local_expert_count
    : !isMaster && status && 'loaded_count' in status
    ? status.loaded_count : null;
  const expertList: string[] = isMaster && status && 'local_experts' in status
    ? status.local_experts : !isMaster && status && 'loaded_experts' in status
    ? status.loaded_experts : [];

  return (
    <div className="node-card">
      <div className="node-card-top">
        <span className={`node-card-badge ${node.node_type}`}>
          {node.is_remote ? '远程' : node.node_type}
        </span>
        <div className={`node-card-status ${node.alive ? 'alive' : 'dead'}`} />
      </div>
      <div className="node-card-id">{node.node_id}</div>
      <div className="node-card-meta">
        <div className="node-card-meta-row">
          <span className="node-card-meta-key">端口</span>
          <span>HTTP {node.http_port}{node.tcp_port ? ` / TCP ${node.tcp_port}` : ''}</span>
        </div>
        {node.pid && (
          <div className="node-card-meta-row">
            <span className="node-card-meta-key">PID</span>
            <span>{node.pid}</span>
          </div>
        )}
        {expertCount !== null && (
          <div className="node-card-meta-row">
            <span className="node-card-meta-key">Experts</span>
            <span>{expertCount} 个</span>
          </div>
        )}
        {isMaster && status && 'workers' in status && (
          <div className="node-card-meta-row">
            <span className="node-card-meta-key">Workers</span>
            <span>{status.workers} 个</span>
          </div>
        )}
      </div>
      {expertList.length > 0 && (
        <div className="node-card-experts">
          {expertList.slice(0, 8).map((e, i) => (
            <span key={i} className="expert-chip">{e}</span>
          ))}
          {expertList.length > 8 && (
            <span className="expert-chip">+{expertList.length - 8}</span>
          )}
        </div>
      )}
      <div className="node-card-actions">
        <button className="btn-sm btn-danger" onClick={onDelete}>删除</button>
      </div>
    </div>
  );
}

/* ── Nodes ── */
function NodesView({ nodes, masters, onRefresh, showToast }: {
  nodes: NodeInfo[]; masters: NodeInfo[]; onRefresh: () => void; showToast: (m: string, t?: string) => void;
}) {
  const deleteNode = async (nodeId: string) => {
    if (!confirm(`确认删除节点 ${nodeId}？`)) return;
    try {
      await api.deleteNode(nodeId);
      showToast(`节点 ${nodeId} 已删除`);
      onRefresh();
    } catch (e: unknown) {
      showToast((e as Error).message, 'error');
    }
  };

  return (
    <>
      <div className="card-grid">
        <div className="card">
          <div className="page-header">
            <div>
              <div className="page-title">创建 Master</div>
              <div className="page-desc">启动一个 Master 节点，管理 Experts 和 Workers</div>
            </div>
          </div>
          <MasterForm onDone={() => { onRefresh(); showToast('Master 已启动'); }} showToast={showToast} />
        </div>
        <div className="card">
          <div className="page-header">
            <div>
              <div className="page-title">创建 Worker</div>
              <div className="page-desc">启动一个 Worker 节点，托管部分 Experts</div>
            </div>
          </div>
          <WorkerForm masters={masters} onDone={() => { onRefresh(); showToast('Worker 已启动'); }} showToast={showToast} />
        </div>
        <div className="card">
          <div className="page-header">
            <div>
              <div className="page-title">添加远程节点</div>
              <div className="page-desc">注册已运行的远程 Master 或 Worker</div>
            </div>
          </div>
          <RemoteNodeForm onDone={() => { onRefresh(); showToast('节点已添加'); }} showToast={showToast} />
        </div>
      </div>

      <div className="card">
        <div className="section-divider"><h3>所有节点 ({nodes.length})</h3></div>
        {nodes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <div className="empty-state-text">暂无节点</div>
          </div>
        ) : (
          <div className="nodes-grid mt-3">
            {nodes.map(n => (
              <NodeCard key={n.node_id} node={n} onDelete={() => deleteNode(n.node_id)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function MasterForm({ onDone, showToast }: {
  onDone: () => void; showToast: (m: string, t?: string) => void;
}) {
  const [nodeId, setNodeId] = useState('master-1');
  const [manifest, setManifest] = useState('output/splits/ERNIE-4.5-21B-A3B-PT-full/manifest.json');
  const [port, setPort] = useState('');
  const [experts, setExperts] = useState('');
  const [pythonEnv, setPythonEnv] = useState('venv');
  const [customPython, setCustomPython] = useState('');
  const [pythonEnvs, setPythonEnvs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.detectPythonEnvs().then(setPythonEnvs).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeId || !manifest) return showToast('请填写节点ID和Manifest路径', 'error');
    if (pythonEnv === 'custom' && !customPython) return showToast('请填写自定义 Python 路径', 'error');
    setLoading(true);
    try {
      await api.createMaster({
        node_id: nodeId,
        manifest_path: manifest,
        http_port: port ? parseInt(port) : undefined,
        expert_ids: experts ? experts.split(',').map(Number) : undefined,
        python_env: pythonEnv,
        custom_python: pythonEnv === 'custom' ? customPython : undefined,
      });
      onDone();
    } catch (err: unknown) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="form-grid mt-3">
      <div className="form-group">
        <label className="form-label">节点 ID</label>
        <input value={nodeId} onChange={e => setNodeId(e.target.value)} placeholder="master-1" />
      </div>
      <div className="form-group">
        <label className="form-label">Manifest 路径</label>
        <input value={manifest} onChange={e => setManifest(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">HTTP 端口</label>
        <input type="number" value={port} onChange={e => setPort(e.target.value)} placeholder="留空自动分配" />
      </div>
      <div className="form-group">
        <label className="form-label">Expert IDs</label>
        <input value={experts} onChange={e => setExperts(e.target.value)} placeholder="留空不加载，后续动态加载" />
      </div>
      <div className="form-group">
        <label className="form-label">Python 环境</label>
        <select value={pythonEnv} onChange={e => setPythonEnv(e.target.value)}>
          {pythonEnvs['venv'] && <option value="venv">.venv ({pythonEnvs['venv']})</option>}
          {pythonEnvs['system'] && <option value="system">系统 ({pythonEnvs['system']})</option>}
          <option value="custom">自定义路径</option>
        </select>
      </div>
      {pythonEnv === 'custom' && (
        <div className="form-group">
          <label className="form-label">自定义 Python 路径</label>
          <input value={customPython} onChange={e => setCustomPython(e.target.value)} placeholder="/usr/bin/python3" />
        </div>
      )}
      <div className="form-col-span-2">
        <button type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? '启动中...' : '◈ 启动 Master'}
        </button>
      </div>
    </form>
  );
}

function WorkerForm({ masters, onDone, showToast }: {
  masters: NodeInfo[]; onDone: () => void; showToast: (m: string, t?: string) => void;
}) {
  const [nodeId, setNodeId] = useState('worker-1');
  const [expertsDir, setExpertsDir] = useState('output/splits/ERNIE-4.5-21B-A3B-PT-full');
  const [expertIds, setExpertIds] = useState('');
  const [masterId, setMasterId] = useState(masters[0]?.node_id || '');
  const [pythonEnv, setPythonEnv] = useState('venv');
  const [customPython, setCustomPython] = useState('');
  const [pythonEnvs, setPythonEnvs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (masters.length > 0 && !masters.find(m => m.node_id === masterId)) {
      setMasterId(masters[0].node_id);
    }
  }, [masters, masterId]);

  useEffect(() => {
    api.detectPythonEnvs().then(setPythonEnvs).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeId) return showToast('请填写节点ID', 'error');
    if (pythonEnv === 'custom' && !customPython) return showToast('请填写自定义 Python 路径', 'error');
    setLoading(true);
    try {
      const master = masters.find(m => m.node_id === masterId);
      await api.createWorker({
        node_id: nodeId,
        experts_dir: expertsDir || undefined,
        expert_ids: expertIds ? expertIds.split(',').map(Number) : undefined,
        master_id: master ? masterId : undefined,
        master_url: master ? `http://localhost:${master.http_port}` : undefined,
        python_env: pythonEnv,
        custom_python: pythonEnv === 'custom' ? customPython : undefined,
      });
      onDone();
    } catch (err: unknown) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="form-grid mt-3">
      <div className="form-group">
        <label className="form-label">节点 ID</label>
        <input value={nodeId} onChange={e => setNodeId(e.target.value)} placeholder="worker-1" />
      </div>
      <div className="form-group">
        <label className="form-label">Experts 目录</label>
        <input value={expertsDir} onChange={e => setExpertsDir(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Expert IDs</label>
        <input value={expertIds} onChange={e => setExpertIds(e.target.value)} placeholder="留空不加载，后续动态加载" />
      </div>
      <div className="form-group">
        <label className="form-label">注册到 Master</label>
        <select value={masterId} onChange={e => setMasterId(e.target.value)}>
          <option value="">-- 不注册 --</option>
          {masters.map(m => (
            <option key={m.node_id} value={m.node_id}>{m.node_id} (HTTP {m.http_port})</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Python 环境</label>
        <select value={pythonEnv} onChange={e => setPythonEnv(e.target.value)}>
          {pythonEnvs['venv'] && <option value="venv">.venv ({pythonEnvs['venv']})</option>}
          {pythonEnvs['system'] && <option value="system">系统 ({pythonEnvs['system']})</option>}
          <option value="custom">自定义路径</option>
        </select>
      </div>
      {pythonEnv === 'custom' && (
        <div className="form-group">
          <label className="form-label">自定义 Python 路径</label>
          <input value={customPython} onChange={e => setCustomPython(e.target.value)} placeholder="/usr/bin/python3" />
        </div>
      )}
      <div className="form-col-span-2">
        <button type="submit" disabled={loading} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? '启动中...' : '◇ 启动 Worker'}
        </button>
      </div>
    </form>
  );
}

function RemoteNodeForm({ onDone, showToast }: {
  onDone: () => void; showToast: (m: string, t?: string) => void;
}) {
  const [nodeId, setNodeId] = useState('');
  const [nodeType, setNodeType] = useState('master');
  const [baseUrl, setBaseUrl] = useState('');
  const [tcpPort, setTcpPort] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeId || !baseUrl) return showToast('请填写节点ID和服务地址', 'error');
    setLoading(true);
    try {
      await api.addRemoteNode({
        node_id: nodeId,
        node_type: nodeType,
        base_url: baseUrl,
        tcp_port: tcpPort ? parseInt(tcpPort) : undefined,
      });
      setNodeId('');
      setBaseUrl('');
      setTcpPort('');
      onDone();
    } catch (err: unknown) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="form-grid mt-3">
      <div className="form-group">
        <label className="form-label">节点 ID</label>
        <input value={nodeId} onChange={e => setNodeId(e.target.value)} placeholder="remote-master-1" />
      </div>
      <div className="form-group">
        <label className="form-label">节点类型</label>
        <select value={nodeType} onChange={e => setNodeType(e.target.value)}>
          <option value="master">Master</option>
          <option value="worker">Worker</option>
        </select>
      </div>
      <div className="form-group form-col-span-2">
        <label className="form-label">服务地址（Base URL）</label>
        <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="http://192.168.1.100:5000" />
      </div>
      <div className="form-group">
        <label className="form-label">TCP 端口（可选）</label>
        <input type="number" value={tcpPort} onChange={e => setTcpPort(e.target.value)} placeholder="留空自动检测" />
      </div>
      <div className="form-col-span-2">
        <button type="submit" disabled={loading} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? '添加中...' : '+ 添加远程节点'}
        </button>
      </div>
    </form>
  );
}

/* ── Experts ── */
function ExpertsView({ masters, showToast }: {
  masters: NodeInfo[]; showToast: (m: string, t?: string) => void;
}) {
  const [selected, setSelected] = useState(masters[0]?.node_id || '');
  const [loadedExperts, setLoadedExperts] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (masters.length > 0 && !masters.find(m => m.node_id === selected)) {
      setSelected(masters[0].node_id);
    }
  }, [masters, selected]);

  const refreshExperts = useCallback(async () => {
    if (!selected) return;
    try {
      const s = await api.getNodeStatus(selected) as MasterStatus;
      setLoadedExperts(new Set(s.local_experts || []));
    } catch {
      setLoadedExperts(new Set());
    }
  }, [selected]);

  useEffect(() => {
    refreshExperts();
    const t = setInterval(refreshExperts, 3000);
    return () => clearInterval(t);
  }, [refreshExperts]);

  const toggleExpert = async (layerId: number, expertId: number) => {
    const key = `L${String(layerId).padStart(2, '0')}_E${String(expertId).padStart(3, '0')}`;
    if (loadedExperts.has(key)) {
      setLoadingId(key);
      try {
        await api.unloadExpert({ node_id: selected, expert_id: expertId, layer_id: layerId });
        refreshExperts();
        showToast(`L${layerId}_E${expertId} 已卸载`);
      } catch (err: unknown) {
        showToast((err as Error).message, 'error');
      } finally {
        setLoadingId(null);
      }
    } else {
      setLoadingId(key);
      try {
        const res = await api.loadExpert({ node_id: selected, expert_id: expertId, layer_id: layerId });
        setLoadedExperts(new Set(res.local_experts || []));
        showToast(`${key} 已加载 (${res.size_mb.toFixed(1)} MB)`);
      } catch (err: unknown) {
        showToast((err as Error).message, 'error');
      } finally {
        setLoadingId(null);
      }
    }
  };

  const NUM_LAYERS = 27;
  const NUM_EXPERTS = 64;

  return (
    <div className="card">
      <div className="page-header">
        <div>
          <div className="page-title">Expert 管理</div>
          <div className="page-desc">点击方块加载 / 卸载。共 {NUM_LAYERS} 层 × {NUM_EXPERTS} experts = {NUM_LAYERS * NUM_EXPERTS} 个</div>
        </div>
        <div className="form-group" style={{ minWidth: 200 }}>
          <select value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">-- 选择 Master --</option>
            {masters.map(m => (
              <option key={m.node_id} value={m.node_id}>{m.node_id}</option>
            ))}
          </select>
        </div>
      </div>

      {masters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-text">无可用 Master，请先创建节点</div>
        </div>
      ) : (
        <div className="expert-grid-wrap mt-3">
          {Array.from({ length: NUM_LAYERS }, (_, layerIdx) => {
            const layerId = layerIdx + 1;
            const loadedInLayer = Array.from({ length: NUM_EXPERTS }, (_, expIdx) => {
              const key = `L${String(layerId).padStart(2, '0')}_E${String(expIdx).padStart(3, '0')}`;
              return loadedExperts.has(key);
            });
            const loadedCount = loadedInLayer.filter(Boolean).length;
            return (
              <div key={layerId} className="expert-layer-row">
                <div className="expert-layer-label">
                  <span className="layer-num">L{layerId}</span>
                  <span className="layer-count">{loadedCount}/{NUM_EXPERTS}</span>
                </div>
                <div className="expert-cells">
                  {Array.from({ length: NUM_EXPERTS }, (_, expIdx) => {
                    const key = `L${String(layerId).padStart(2, '0')}_E${String(expIdx).padStart(3, '0')}`;
                    const isLoaded = loadedExperts.has(key);
                    const isLoading = loadingId === key;
                    return (
                      <button
                        key={expIdx}
                        className={`expert-cell ${isLoaded ? 'loaded' : ''} ${isLoading ? 'loading' : ''}`}
                        onClick={() => toggleExpert(layerId, expIdx)}
                        disabled={isLoading}
                        title={`${key}${isLoaded ? ' (点击卸载)' : ' (点击加载)'}`}
                      >
                        {isLoading ? '…' : expIdx}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="section-divider mt-3"><h3>已加载列表 ({loadedExperts.size})</h3></div>
      <div className="experts-display">
        {loadedExperts.size === 0 && <div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>暂无已加载的 Experts</div>}
        {Array.from(loadedExperts).map((e, i) => (
          <span key={i} className="expert-chip">{e}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Inference ── */
function InferenceView({ masters, showToast, loading, setLoading }: {
  masters: NodeInfo[]; showToast: (m: string, t?: string) => void; loading: boolean; setLoading: (v: boolean) => void;
}) {
  const [masterId, setMasterId] = useState(masters[0]?.node_id || '');
  const [prompt, setPrompt] = useState('今天天气真好，');
  const [maxTokens, setMaxTokens] = useState('20');
  const [result, setResult] = useState('');
  const [inputTokens, setInputTokens] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);

  useEffect(() => {
    if (masters.length > 0 && !masters.find(m => m.node_id === masterId)) {
      setMasterId(masters[0].node_id);
    }
  }, [masters, masterId]);

  const run = async () => {
    if (!masterId) return showToast('请选择 Master', 'error');
    if (!prompt.trim()) return showToast('请输入 prompt', 'error');
    setLoading(true);
    setResult('');
    try {
      const res = await api.inference({
        master_node_id: masterId,
        prompt,
        max_tokens: parseInt(maxTokens) || 20,
      });
      setResult(res.result || '(无输出)');
      setInputTokens(res.input_tokens);
      setOutputTokens(res.output_tokens);
      showToast('推理完成');
    } catch (err: unknown) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="page-header">
        <div>
          <div className="page-title">分布式推理</div>
          <div className="page-desc">通过 Master 节点执行 MoE 模型推理</div>
        </div>
      </div>

      <div className="form-grid mt-3">
        <div className="form-group">
          <label className="form-label">选择 Master</label>
          <select value={masterId} onChange={e => setMasterId(e.target.value)}>
            <option value="">-- 选择 Master --</option>
            {masters.map(m => (
              <option key={m.node_id} value={m.node_id}>{m.node_id} (HTTP {m.http_port})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Max Tokens</label>
          <input type="number" value={maxTokens} onChange={e => setMaxTokens(e.target.value)} min="1" max="1024" />
        </div>
      </div>

      <div className="form-group mt-3">
        <label className="form-label">Prompt</label>
        <textarea className="prompt-area" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="输入 prompt..." />
      </div>

      <button onClick={run} disabled={loading} style={{ marginTop: 14 }}>
        {loading ? '推理中...' : '▸ 开始推理'}
      </button>

      {result && (
        <>
          <div className="section-divider mt-3"><h3>输出</h3></div>
          <div className="result-box">{result}</div>
          <div className="meta-row">
            <span>Input tokens: {inputTokens}</span>
            <span>Output tokens: {outputTokens}</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Logs ── */
function LogsView({ nodes }: { nodes: NodeInfo[] }) {
  const [selected, setSelected] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    api.getNodeLogs(selected)
      .then(res => setContent(res.content || '(无可用日志)'))
      .catch(err => setContent('加载失败: ' + err.message))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="card">
      <div className="page-header">
        <div>
          <div className="page-title">节点日志</div>
          <div className="page-desc">查看各节点的实时运行日志</div>
        </div>
      </div>
      <div className="form-group mt-3">
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">-- 选择节点 --</option>
          {nodes.map(n => (
            <option key={n.node_id} value={n.node_id}>{n.node_id} ({n.node_type}, HTTP {n.http_port})</option>
          ))}
        </select>
      </div>
      <div className="log-area mt-3">
        {loading ? '加载中...' : content}
      </div>
    </div>
  );
}

export default App;
