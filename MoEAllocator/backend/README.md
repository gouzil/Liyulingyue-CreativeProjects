# MoEAllocator 后端

FastAPI 后端服务，提供进程管理、HTTP 转发和 REST API。

## 启动

```bash
pip install -r backend/requirements.txt
.venv/bin/python backend/run.py
```

API 文档: http://localhost:8000/docs

## 目录结构

```
backend/
├── run.py                   # 启动入口
└── app/
    ├── main.py              # FastAPI app 定义
    ├── process_manager.py  # 进程生命周期管理
    ├── proxy.py             # HTTP 转发到 Core
    └── routers/
        ├── nodes.py         # 节点管理 API
        └── inference.py      # 推理 API
```

## API 接口

### 节点管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/nodes` | 列出所有节点 |
| POST | `/api/nodes/master` | 创建 Master 节点 |
| POST | `/api/nodes/worker` | 创建 Worker 节点 |
| GET | `/api/nodes/{node_id}` | 获取节点信息 |
| DELETE | `/api/nodes/{node_id}` | 删除节点 |
| GET | `/api/nodes/{node_id}/status` | 获取节点状态 |
| GET | `/api/nodes/{node_id}/logs` | 获取节点日志 |
| GET | `/api/nodes/{node_id}/workers` | 获取 Master 的 Workers 列表 |
| POST | `/api/nodes/{master_id}/workers` | 手动注册 Worker 到 Master |

### Expert 动态管理

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/nodes/master/load_expert` | 在 Master 运行时加载 Expert |
| POST | `/api/nodes/master/unload_expert` | 在 Master 运行时卸载 Expert |

### 推理

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/inference` | 执行推理 |

## 架构

```
Frontend (React, :5173)
    ↓ HTTP /api/*
Backend (FastAPI, :8000) — 进程管理 + HTTP 转发
    ↓ subprocess / HTTP
Core: Master + Worker — 真正推理
```

## 前端

React 前端位于 `frontend/` 目录：

```bash
cd frontend && npm run dev
```

前端功能：节点管理、Expert 管理、状态监控、推理、日志查看。
