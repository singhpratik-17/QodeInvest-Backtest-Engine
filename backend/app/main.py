import os 
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.routers import backtest, benchmark , stocks

app = FastAPI(
    title="Backtesting Platform for QodeInvest",
    description="Production-ready core system endpoint network for equity analytics",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include core system engine routers
app.include_router(backtest.router)
app.include_router(stocks.router)
app.include_router(benchmark.router)


@app.get("/")
def check_status():
    return {
        "status": "running ok",
        "message": "Backtesting API"
    }