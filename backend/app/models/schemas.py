import os
import sys
from pydantic import BaseModel
from typing import List, Optional

# Adjust Python path for direct script testing execution
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

class FilterSchema(BaseModel):
    mkt_cap_min: Optional[float] = None
    mkt_cap_max: Optional[float] = None
    roce_min: Optional[float] = None
    pat_positive: bool = False

class RankingMetric(BaseModel):
    field: str
    ascending: bool = False

class RankingSchema(BaseModel):
    metrics: List[RankingMetric]

class BacktestConfigSchema(BaseModel):
    start_date: str
    end_date: str
    frequency: str
    initial_capital: float
    portfolio_size: int
    sizing_method: str
    filters: FilterSchema
    ranking: RankingSchema
    universe: List[str] = []

if __name__ == "__main__":
    print("\n--- Running Pydantic Validation Schema Verification ---")
    
    try:
        config = BacktestConfigSchema(
            start_date="2020-01-01",
            end_date="2022-01-01",
            frequency="monthly",
            initial_capital=100000.0,
            portfolio_size=5,
            sizing_method="equal",
            filters={},
            ranking={"metrics": [{"field": "roe"}]}
        )
        print("✅ Object structural assignment complete without validation errors.")
        print("Validated Config instance mapping summary:")
        print(config.model_dump_json(indent=2))
    except Exception as e:
        print(f"❌ Pydantic verification failed: {e}")