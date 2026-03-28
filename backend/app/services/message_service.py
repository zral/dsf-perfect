import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ad import Ad
from app.models.conversation import Conversation
from app.models.message import Message


async def get_or_create_conversation(
    db: AsyncSession, ad_id: uuid.UUID, user_id: uuid.UUID
) -> Conversation:
    """Find or create a conversation for the given ad and user (buyer)."""
    # Look up the ad
    result = await db.execute(
        select(Ad).options(selectinload(Ad.images)).where(Ad.id == ad_id)
    )
    ad = result.scalar_one_or_none()
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad not found",
        )

    seller_id = ad.seller_id
    buyer_id = user_id

    if buyer_id == seller_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot message yourself",
        )

    # Check for existing conversation
    result = await db.execute(
        select(Conversation).where(
            and_(
                Conversation.ad_id == ad_id,
                Conversation.buyer_id == buyer_id,
                Conversation.seller_id == seller_id,
            )
        )
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        conversation = Conversation(
            id=uuid.uuid4(),
            ad_id=ad_id,
            buyer_id=buyer_id,
            seller_id=seller_id,
        )
        db.add(conversation)
        await db.flush()

    return conversation


async def send_message(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    sender_id: uuid.UUID,
    content: str,
) -> Message:
    """Send a message in an existing conversation."""
    # Verify conversation exists and sender is a participant
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if sender_id not in (conversation.buyer_id, conversation.seller_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this conversation",
        )

    message = Message(
        id=uuid.uuid4(),
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content,
    )
    db.add(message)

    # Update conversation.updated_at
    conversation.updated_at = datetime.now(timezone.utc)
    await db.flush()

    return message


async def list_conversations(
    db: AsyncSession, user_id: uuid.UUID
) -> list[dict]:
    """List all conversations for a user with last message and unread count."""
    # Get all conversations where user is buyer or seller
    result = await db.execute(
        select(Conversation)
        .options(
            selectinload(Conversation.ad).selectinload(Ad.images),
            selectinload(Conversation.buyer),
            selectinload(Conversation.seller),
        )
        .where(
            or_(
                Conversation.buyer_id == user_id,
                Conversation.seller_id == user_id,
            )
        )
        .order_by(Conversation.updated_at.desc())
    )
    conversations = list(result.scalars().all())

    response = []
    for conv in conversations:
        # Determine the other user
        if conv.buyer_id == user_id:
            other_user = conv.seller
        else:
            other_user = conv.buyer

        # Get last message
        last_msg_result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_message = last_msg_result.scalar_one_or_none()

        # Count unread messages (from OTHER user, not yet read)
        unread_result = await db.execute(
            select(func.count())
            .select_from(Message)
            .where(
                and_(
                    Message.conversation_id == conv.id,
                    Message.sender_id != user_id,
                    Message.is_read == False,  # noqa: E712
                )
            )
        )
        unread_count = unread_result.scalar() or 0

        # Build ad brief with first image only
        ad_images = []
        if conv.ad.images:
            first_img = conv.ad.images[0]
            ad_images = [{"url": first_img.url, "thumbnail_url": first_img.thumbnail_url}]

        response.append(
            {
                "id": conv.id,
                "ad": {
                    "id": conv.ad.id,
                    "title": conv.ad.title,
                    "images": ad_images,
                },
                "other_user": {
                    "id": other_user.id,
                    "name": other_user.name,
                    "avatar_url": other_user.avatar_url,
                },
                "last_message": last_message,
                "unread_count": unread_count,
                "updated_at": conv.updated_at,
            }
        )

    return response


async def get_conversation_messages(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: uuid.UUID,
    page: int = 1,
    per_page: int = 50,
) -> dict:
    """Get paginated messages for a conversation. Marks messages from other user as read."""
    # Verify conversation exists and user is participant
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if user_id not in (conversation.buyer_id, conversation.seller_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this conversation",
        )

    # Mark messages from the OTHER user as read
    await db.execute(
        update(Message)
        .where(
            and_(
                Message.conversation_id == conversation_id,
                Message.sender_id != user_id,
                Message.is_read == False,  # noqa: E712
            )
        )
        .values(is_read=True)
    )
    await db.flush()

    # Count total messages
    count_result = await db.execute(
        select(func.count())
        .select_from(Message)
        .where(Message.conversation_id == conversation_id)
    )
    total = count_result.scalar() or 0

    # Get paginated messages (newest first)
    offset = (page - 1) * per_page
    msg_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    messages = list(msg_result.scalars().all())

    return {
        "messages": messages,
        "total": total,
        "page": page,
    }


async def get_unread_count(db: AsyncSession, user_id: uuid.UUID) -> int:
    """Count all unread messages across all conversations where user is recipient."""
    # Get conversation IDs where user is a participant
    result = await db.execute(
        select(func.count())
        .select_from(Message)
        .join(Conversation, Message.conversation_id == Conversation.id)
        .where(
            and_(
                or_(
                    Conversation.buyer_id == user_id,
                    Conversation.seller_id == user_id,
                ),
                Message.sender_id != user_id,
                Message.is_read == False,  # noqa: E712
            )
        )
    )
    return result.scalar() or 0
