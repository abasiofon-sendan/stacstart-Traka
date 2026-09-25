from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.accounts.router import router as accounts_router
from app.activity.router import router as activity_router
from app.core.scheduler import start_scheduler
from app.db.database import Base, engine
from app.debtors.router import router as debtors_router
from app.inventory.router import router as inventory_router
from app.notifications.router import router as notifications_router
from app.reports.router import router as reports_router
from app.simulation.router import router as simulation_router
from app.voice.router import router as voice_router
from app.transactions.router import router as transactions_router
from app.webhooks.router import router as webhooks_router

# Import all models to ensure they are registered with Base before create_all
from app.accounts import models as accounts_models
from app.activity import models as activity_models  # noqa: F401
from app.debtors import models as debtors_models
from app.inventory import models as inventory_models
from app.notifications import models as notifications_models
from app.transactions import models as transactions_models

# Create the database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield


app = FastAPI(title="Traka API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts_router)
app.include_router(inventory_router)
app.include_router(debtors_router)
app.include_router(transactions_router)
app.include_router(activity_router)
app.include_router(notifications_router)
app.include_router(reports_router)
app.include_router(webhooks_router)
app.include_router(simulation_router)
app.include_router(voice_router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Traka API"}
