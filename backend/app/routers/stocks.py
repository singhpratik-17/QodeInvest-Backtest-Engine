from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import Stock

router = APIRouter(tags=["Stocks"])

@router.get("/stocks")
def list_stocks(db: Session = Depends(get_db)):
    """
    Returns the metadata profiles for all registered equities 
    available inside the system universe.
    """
    try:
        stocks = db.query(Stock).all()
        return [
            {
                "ticker": s.ticker,
                "company_name": s.company_name,
                "sector": s.sector,
                "exchange": s.exchange
            }
            for s in stocks
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch stock universe metadata: {str(e)}"
        )