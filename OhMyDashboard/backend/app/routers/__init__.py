from fastapi import APIRouter
from . import system, status

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(status.router, prefix="/status")
api_router.include_router(system.router, prefix="/system")
