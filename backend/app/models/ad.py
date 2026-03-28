import enum
import uuid
from datetime import datetime

from sqlalchemy import Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PriceType(str, enum.Enum):
    FIXED = "FIXED"
    BID = "BID"
    FREE = "FREE"
    CONTACT = "CONTACT"


class AdCondition(str, enum.Enum):
    NEW = "NEW"
    LIKE_NEW = "LIKE_NEW"
    GOOD = "GOOD"
    FAIR = "FAIR"


class AdStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SOLD = "SOLD"
    EXPIRED = "EXPIRED"
    DRAFT = "DRAFT"


class Ad(Base):
    __tablename__ = "ads"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    seller_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    price_type: Mapped[str] = mapped_column(
        String(20), default=PriceType.FIXED.value, server_default="FIXED"
    )
    condition: Mapped[str] = mapped_column(
        String(20), default=AdCondition.GOOD.value, server_default="GOOD"
    )
    status: Mapped[str] = mapped_column(
        String(20), default=AdStatus.DRAFT.value, server_default="DRAFT", index=True
    )
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    views_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), default=datetime.utcnow, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
    expires_at: Mapped[datetime | None] = mapped_column(nullable=True)

    seller: Mapped["User"] = relationship("User", lazy="selectin")  # noqa: F821
    category: Mapped["Category"] = relationship("Category", lazy="selectin")  # noqa: F821
    images: Mapped[list["AdImage"]] = relationship(  # noqa: F821
        "AdImage",
        back_populates="ad",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
