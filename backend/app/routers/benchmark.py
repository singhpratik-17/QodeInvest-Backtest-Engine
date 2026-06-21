import yfinance as yf
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/benchmark/nifty50")
def nifty_benchmark(start: str, end: str):
    """
    Downloads historical closing prices for the NIFTY 50 Index (^NSEI) 
    over the requested timeline window.
    """
    try:
        # Pass multi_level_index=False if the local yfinance version supports it
        df = yf.download("^NSEI", start=start, end=end)
        
        if df.empty:
            raise HTTPException(
                status_code=404, 
                detail="No historical benchmark series returned for ^NSEI."
            )
        
        # Safe MultiIndex column flattening if multi-level columns are returned
        if isinstance(df.columns, MultiIndex := type(df.columns)) and df.columns.nlevels > 1:
            df.columns = df.columns.get_level_values(0)
            
        if "Close" not in df.columns:
            raise HTTPException(
                status_code=404,
                detail="Close price column missing from downloaded index dataset."
            )

        close_series = df["Close"].dropna()
        
        # Extract individual rows cleanly
        formatted_trend = {}
        for timestamp, val in close_series.items():
            date_str = str(timestamp.date()) if hasattr(timestamp, "date") else str(timestamp).split(" ")[0]
            
            # If val is somehow still a Series due to duplicate columns, take the first scalar value
            if hasattr(val, "iloc"):
                scalar_val = float(val.iloc[0])
            else:
                scalar_val = float(val)
                
            formatted_trend[date_str] = scalar_val
            
        return formatted_trend
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"YFinance operational failure: {str(e)}"
        )