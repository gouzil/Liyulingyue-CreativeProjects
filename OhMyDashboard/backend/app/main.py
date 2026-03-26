from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import api_router
from .routers.terminal import router as terminal_router

app = FastAPI(title="OhMyDashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(terminal_router)
