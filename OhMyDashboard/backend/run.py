import uvicorn
import argparse
import os
import shutil
import subprocess

def check_terminal_deps():
    errors = []

    node = shutil.which("node")
    if not node:
        errors.append("  - Node.js 未安装，请访问 https://nodejs.org 下载安装")
    else:
        print(f"[CHECK] Node.js: {node}")

    bridge_dir = os.path.join(os.path.dirname(__file__), "app", "core", "pty_bridge")
    package_json = os.path.join(bridge_dir, "package.json")
    node_modules = os.path.join(bridge_dir, "node_modules")
    pty_index = os.path.join(bridge_dir, "index.js")

    if not os.path.exists(package_json):
        errors.append(f"  - PTY bridge package.json 不存在: {package_json}")
    elif not os.path.exists(node_modules):
        errors.append(f"  - PTY bridge node_modules 未安装，请运行:")
        errors.append(f"    cd {bridge_dir} && npm install")
    elif not os.path.exists(os.path.join(node_modules, "node-pty")):
        errors.append(f"  - node-pty 模块未安装，请运行:")
        errors.append(f"    cd {bridge_dir} && npm install")
    elif os.path.exists(pty_index):
        print(f"[CHECK] node-pty: OK ({node_modules})")

    if errors:
        print("[ERROR] 终端功能依赖检查失败:")
        for e in errors:
            print(e)
        print()

def main():
    check_terminal_deps()

    parser = argparse.ArgumentParser(description="OhMyDashboard Backend Runtime")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind")
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    
    args = parser.parse_args()

    print(f">>> Starting OhMyDashboard Backend from app.main on http://{args.host}:{args.port}")
    
    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload
    )

if __name__ == "__main__":
    main()
