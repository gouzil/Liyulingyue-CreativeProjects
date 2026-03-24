from fastapi import APIRouter
from datetime import datetime

router = APIRouter(tags=["status"])

@router.get("")
async def get_status():
    """通用状态检测路由"""
    return {
        "status": "online",
        "time": datetime.now().isoformat()
    }
