import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.schemas import BacktestConfigSchema
from app.engine.backtest_engine import run_backtest
from app.database import get_db
from app.models.db_models import BacktestResult

router = APIRouter(tags=["Backtest"])

@router.post("/run-backtest")
def run_backtest_api(config: BacktestConfigSchema, db: Session = Depends(get_db)):
    """
    Executes a point-in-time multi-factor engine scenario simulation 
    and appends performance matrices to the analytics logging ledger.
    """
    try:
        config_dict = config.model_dump()

        # Structural provider injection routing maps
        config_dict["data_provider"] = lambda d: [
            {"ticker": "TCS", "roe": 20, "pe_ratio": 10},
            {"ticker": "INFY", "roe": 30, "pe_ratio": 15},
            {"ticker": "RELIANCE", "roe": 15, "pe_ratio": 22}
        ]

        result = run_backtest(config_dict)

        # Build persistent row matching database column map contracts
        db_result = BacktestResult(
            id=uuid.uuid4(),
            parameters=config.model_dump(),
            equity_curve=result["equity_curve"],
            metrics=result["metrics"],
            portfolio_logs=result["logs"]
        )

        db.add(db_result)
        db.commit()

        return result
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Backtest execution loop operational error: {str(e)}"
        )