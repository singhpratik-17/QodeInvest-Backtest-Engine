from app.database import engine, Base

from app.models.db_models import (
    Stock,
    StockPrice,
    Fundamental,
    BacktestResult,
)

Base.metadata.create_all(bind=engine)

print("✅ All tables created successfully")