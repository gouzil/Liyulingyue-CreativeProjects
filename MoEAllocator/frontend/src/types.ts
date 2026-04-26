export interface NodeInfo {
  node_id: string;
  node_type: 'master' | 'worker';
  alive: boolean;
  http_port: number;
  tcp_port?: number;
  pid?: number;
  log_file?: string;
  is_remote?: boolean;
}

export interface AddRemoteNodeRequest {
  node_id: string;
  node_type: string;
  base_url: string;
  tcp_port?: number;
}

export interface MasterConfig {
  num_experts?: number;
  num_layers?: number;
  moe_k?: number;
  num_shared_experts?: number;
  hidden_size?: number;
  moe_intermediate_size?: number;
}

export interface MasterStatus {
  local_expert_count: number;
  workers: number;
  local_experts: string[];
  config?: MasterConfig;
  output_dir?: string;
}

export interface WorkerStatus {
  worker_id?: string;
  http_port?: number;
  tcp_port?: number;
  loaded_count: number;
  loaded_experts: string[];
  memory_mb?: number;
  error?: string;
}

export type NodeStatus = MasterStatus | WorkerStatus;

export interface MasterWorkerInfo {
  host: string;
  http_port: number;
  tcp_port: number;
  loaded_experts: string[];
  loaded_count?: number;
  memory_mb?: number;
  error?: string;
  note?: string;
}

export interface MasterWorkersResponse {
  workers: Record<string, MasterWorkerInfo>;
}

export interface CreateMasterRequest {
  node_id: string;
  manifest_path: string;
  http_port?: number;
  expert_ids?: string;
  python_env?: string;
  custom_python?: string;
}

export interface CreateWorkerRequest {
  node_id: string;
  experts_dir?: string;
  expert_ids?: string;
  master_node_id?: string;
  python_env?: string;
  custom_python?: string;
}

export interface DetectedPythonEnvs {
  [key: string]: string;
}

export interface InferenceRequest {
  master_node_id: string;
  prompt: string;
  max_tokens?: number;
}

export interface InferenceResponse {
  result: string;
  input_tokens: number;
  output_tokens: number;
}

export interface LoadExpertRequest {
  node_id: string;
  expert_id: number;
  layer_id: number;
}

export interface WorkerExpertRequest {
  expert_id: number;
  layer_id: number;
  file_path?: string;
}

export interface LoadExpertResponse {
  status?: string;
  expert_id?: number;
  layer_id?: number;
  size_mb?: number;
  loaded_count?: number;
  local_experts?: string[];
  loaded_experts?: string[];
}

export interface LogResponse {
  content: string;
}
