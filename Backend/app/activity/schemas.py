from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class ActivityLogResponse(BaseModel):
    id: int
    account_id: str
    activity_type: str
    title: str
    description: Optional[str]
    event_metadata: Optional[Any]
    created_at: datetime

    class Config:
        from_attributes = True
