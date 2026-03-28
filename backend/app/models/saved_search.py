import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    query: Mapped[str | None] = mapped_column(String(200), nullable=True)
    category_slug: Mapped[str | None] = mapped_column(String(100), nullable=True)
    filters: Mapped[dict] = mapped_column(JSON, default=dict, server_default="{}")
    notify: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
    )
