from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Index, DateTime, JSON, Text
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from app.database import Base



# STOCK MASTER TABLE
 
class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticker = Column(String, unique=True, index=True, nullable=False)
    company_name = Column(String, nullable=False)
    sector = Column(String)
    exchange = Column(String)
    nse_code = Column(String)



# DAILY PRICE DATA

class StockPrice(Base):
    __tablename__ = "stock_prices"

    __table_args__ = (
    UniqueConstraint(
        "ticker",
        "date",
        name="uq_stock_price"
    ),
    Index(
        "idx_price_ticker_date",
        "ticker",
        "date"
    ),
)
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    ticker = Column(String, ForeignKey("stocks.ticker"), index=True)
    date = Column(Date, index=True)

    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    adj_close = Column(Float)
    volume = Column(Float)



# FUNDAMENTALS TABLE

class Fundamental(Base):
    __tablename__ = "fundamentals"

    __table_args__ = (
    UniqueConstraint(
        "ticker",
        "period_date",
        "period_type",
        name="uq_fundamental"
    ),
    Index(
        "idx_fundamental_ticker_period",
        "ticker",
        "period_date"
    ),
)

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticker = Column(String, ForeignKey("stocks.ticker"), index=True)

    period_date = Column(Date, index=True)
    period_type = Column(String)  

    market_cap = Column(Float)
    revenue = Column(Float)
    pat = Column(Float)
    ebitda = Column(Float)

    roce = Column(Float)
    roe = Column(Float)
    pe_ratio = Column(Float)
    pb_ratio = Column(Float)
    debt_to_equity = Column(Float)

    eps = Column(Float)
    free_cash_flow = Column(Float)
    current_ratio = Column(Float)



# BACKTEST RESULTS STORAGE

class BacktestResult(Base):
    __tablename__ = "backtest_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    created_at = Column(DateTime, default=datetime.utcnow)

    parameters = Column(JSON)        # strategy config
    equity_curve = Column(JSON)      # list of {date, value}
    metrics = Column(JSON)           # CAGR, Sharpe, etc
    portfolio_logs = Column(JSON)    # holdings per rebalance