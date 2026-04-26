import type {
  NodeInfo,
  NodeStatus,
  CreateMasterRequest,
  CreateWorkerRequest,
  InferenceRequest,
  InferenceResponse,
  LoadExpertRequest,
  LoadExpertResponse,
  LogResponse,
  AddRemoteNodeRequest,
  DetectedPythonEnvs,
  MasterWorkersResponse,
  WorkerExpertRequest,
  WorkerStatus,
} from './types';

const BASE = '/api';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(BASE + path, opts);
  const text = await r.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!r.ok) {
    const detail = typeof data === 'object' && data !== null && 'detail' in data
      ? String((data as { detail?: unknown }).detail)
      : typeof data === 'string'
      ? data
      : JSON.stringify(data);
    throw new Error(detail || `HTTP ${r.status}`);
  }
  return data as T;
}

export const api = {
  getNodes: () => request<NodeInfo[]>('GET', '/nodes'),
  getNode: (nodeId: string) => request<NodeInfo>('GET', `/nodes/${nodeId}`),
  getNodeStatus: (nodeId: string) => request<NodeStatus>('GET', `/nodes/${nodeId}/status`),
  getMasterWorkers: (masterId: string) => request<MasterWorkersResponse>('GET', `/nodes/${masterId}/workers`),
  getMasterWorkerStatus: (masterId: string, workerId: string) => request<WorkerStatus>('GET', `/nodes/${masterId}/workers/${workerId}/status`),
  getNodeLogs: (nodeId: string) => request<LogResponse>('GET', `/nodes/${nodeId}/logs`),
  createMaster: (req: CreateMasterRequest) => request<NodeInfo>('POST', '/nodes/master', req),
  createWorker: (req: CreateWorkerRequest) => request<NodeInfo>('POST', '/nodes/worker', req),
  addRemoteNode: (req: AddRemoteNodeRequest) => request<NodeInfo>('POST', '/nodes/remote', req),
  deleteNode: (nodeId: string) => request<void>('DELETE', `/nodes/${nodeId}`),
  detectPythonEnvs: () => request<DetectedPythonEnvs>('GET', '/nodes/detect-python'),
  inference: (req: InferenceRequest) => request<InferenceResponse>('POST', '/inference', req),
  loadExpert: (req: LoadExpertRequest) => request<LoadExpertResponse>('POST', '/nodes/master/load_expert', req),
  unloadExpert: (req: LoadExpertRequest) => request<void>('POST', '/nodes/master/unload_expert', req),
  loadWorkerExpert: (masterId: string, workerId: string, req: WorkerExpertRequest) =>
    request<LoadExpertResponse>('POST', `/nodes/${masterId}/workers/${workerId}/load`, req),
  unloadWorkerExpert: (masterId: string, workerId: string, req: WorkerExpertRequest) =>
    request<LoadExpertResponse>('POST', `/nodes/${masterId}/workers/${workerId}/unload`, req),
};
