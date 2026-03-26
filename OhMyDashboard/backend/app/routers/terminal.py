import os
import asyncio
import json
import threading
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["terminal"])


@router.websocket("/ws/terminal/{session_id}")
async def terminal_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()

    from ..core.terminal_manager import terminal_manager
    session = terminal_manager.get_or_create_session(session_id, working_dir=os.path.expanduser("~"))
    output_queue = session.get_output_queue()

    async def downlink():
        try:
            while True:
                data = await output_queue.get()
                if data:
                    await websocket.send_text(data)
        except Exception:
            pass
        finally:
            session.remove_queue(output_queue)

    async def uplink():
        try:
            while True:
                message = await websocket.receive_text()
                if not message:
                    continue
                if message.startswith('{') and message.endswith('}'):
                    try:
                        cmd = json.loads(message)
                        if cmd.get("type") == "resize":
                            session.resize(cmd["cols"], cmd["rows"])
                            continue
                        elif cmd.get("type") == "input":
                            await session.write(cmd["text"])
                            continue
                    except Exception:
                        pass
                await session.write(message)
        except WebSocketDisconnect:
            pass
        except Exception:
            pass

    await asyncio.wait(
        [asyncio.create_task(downlink()), asyncio.create_task(uplink())],
        return_when=asyncio.FIRST_COMPLETED
    )
