from fastapi import FastAPI

from app.routers.nodes import router as nodes_router
from app.routers.inference import router as inference_router

app = FastAPI(
    title="MoEAllocator API",
    description="Backend for MoEAllocator distributed inference framework",
    version="1.0.0",
)

app.include_router(nodes_router)
app.include_router(inference_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
