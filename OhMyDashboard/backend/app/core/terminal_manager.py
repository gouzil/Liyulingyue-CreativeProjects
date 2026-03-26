import os
import asyncio
import threading
import json
import subprocess
import time
from pathlib import Path


class TerminalSession:

    def __init__(self, session_id: str, working_dir: str = None):
        self.session_id = session_id
        self.working_dir = working_dir or os.path.expanduser("~")
        self.proc = None
        self.is_running = False

        self._queues: set = set()
        self._lock = threading.Lock()
        self._loop = None
        self.last_activity = time.time()

    def start(self):
        if self.is_running:
            return

        bridge_path = Path(__file__).parent / "pty_bridge" / "index.js"

        try:
            self._loop = asyncio.get_running_loop()
        except RuntimeError:
            self._loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self._loop)

        env = os.environ.copy()
        env["PTY_CWD"] = str(self.working_dir)
        env["PTY_COLS"] = "120"
        env["PTY_ROWS"] = "30"

        try:
            self.proc = subprocess.Popen(
                ["node", str(bridge_path)],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=False,
                env=env,
                cwd=str(bridge_path.parent)
            )
            self.is_running = True
            threading.Thread(target=self._read_loop, daemon=True).start()
            threading.Thread(target=self._error_loop, daemon=True).start()
        except Exception as e:
            print(f"[TERMINAL] Failed to spawn PTY Bridge: {e}")
            self.is_running = False
            raise

    def _read_loop(self):
        while self.is_running and self.proc and self.proc.stdout:
            try:
                data = self.proc.stdout.read1(16384)
                if not data:
                    break
                text = data.decode("utf-8", errors="replace")
                self.last_activity = time.time()
                with self._lock:
                    for q in self._queues:
                        self._loop.call_soon_threadsafe(q.put_nowait, text)
            except Exception:
                break
        self.is_running = False
        print(f"[TERMINAL] Session {self.session_id} ended.")

    def _error_loop(self):
        while self.is_running and self.proc and self.proc.stderr:
            line = self.proc.stderr.readline()
            if not line:
                break
            print(f" [NODE-BRIDGE-{self.session_id}] {line.decode().strip()}")

    async def write(self, data: str):
        self.last_activity = time.time()
        if self.is_running and self.proc and self.proc.stdin:
            msg = json.dumps({"type": "input", "data": data}) + "\n"
            self.proc.stdin.write(msg.encode())
            self.proc.stdin.flush()

    def resize(self, cols: int, rows: int):
        if self.is_running and self.proc and self.proc.stdin:
            msg = json.dumps({"type": "resize", "cols": cols, "rows": rows}) + "\n"
            self.proc.stdin.write(msg.encode())
            self.proc.stdin.flush()

    def stop(self):
        self.is_running = False
        if self.proc:
            self.proc.terminate()
            self.proc = None

    def get_output_queue(self) -> asyncio.Queue:
        q = asyncio.Queue()
        with self._lock:
            self._queues.add(q)
        return q

    def remove_queue(self, q: asyncio.Queue):
        with self._lock:
            if q in self._queues:
                self._queues.remove(q)


class SessionManager:

    def __init__(self):
        self.sessions: dict = {}
        self._cleanup_thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        self._cleanup_thread.start()

    def get_or_create_session(self, session_id: str, working_dir: str = None) -> TerminalSession:
        if session_id not in self.sessions:
            session = TerminalSession(session_id, working_dir=working_dir)
            session.start()
            self.sessions[session_id] = session
        return self.sessions[session_id]

    def _cleanup_loop(self):
        while True:
            time.sleep(300)
            now = time.time()
            stale_ids = [
                sid for sid, s in self.sessions.items()
                if now - s.last_activity > 3600
            ]
            for sid in stale_ids:
                print(f"[TERMINAL] Cleaning up stale session {sid}")
                self.sessions[sid].stop()
                del self.sessions[sid]


terminal_manager = SessionManager()
