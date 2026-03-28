import uuid

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.message import (
    ConversationResponse,
    MessageCreate,
    MessageResponse,
    UnreadCountResponse,
)
from app.services import message_service
from app.utils.security import decode_access_token

router = APIRouter(prefix="/api/v1/messages", tags=["messages"])


# ---------------------------------------------------------------------------
# ConnectionManager for WebSocket
# ---------------------------------------------------------------------------


class ConnectionManager:
    def __init__(self) -> None:
        self.connections: dict[str, list[WebSocket]] = {}  # user_id str -> websockets

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        conns = self.connections.get(user_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns and user_id in self.connections:
            del self.connections[user_id]

    async def send_to_user(self, user_id: str, data: dict) -> None:
        for ws in self.connections.get(user_id, []):
            await ws.send_json(data)


manager = ConnectionManager()


# ---------------------------------------------------------------------------
# REST endpoints
# ---------------------------------------------------------------------------


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ConversationResponse]:
    result = await message_service.list_conversations(db, current_user.id)
    return [ConversationResponse.model_validate(conv) for conv in result]


@router.get("/conversations/{conversation_id}")
async def get_conversation_messages(
    conversation_id: uuid.UUID,
    page: int = 1,
    per_page: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    result = await message_service.get_conversation_messages(
        db, conversation_id, current_user.id, page, per_page
    )
    return {
        "messages": [MessageResponse.model_validate(m) for m in result["messages"]],
        "total": result["total"],
        "page": result["page"],
    }


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    body: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    if body.conversation_id:
        # Send in existing conversation — but verify it exists first
        conversation_id = body.conversation_id
        # send_message will verify existence and participation
        message = await message_service.send_message(
            db, conversation_id, current_user.id, body.content
        )
    else:
        # Create or reuse conversation from ad_id
        conversation = await message_service.get_or_create_conversation(
            db, body.ad_id, current_user.id
        )
        message = await message_service.send_message(
            db, conversation.id, current_user.id, body.content
        )

    # Notify via WebSocket if recipient is online
    msg_response = MessageResponse.model_validate(message)
    # Determine recipient
    from sqlalchemy import select
    from app.models.conversation import Conversation

    conv_result = await db.execute(
        select(Conversation).where(Conversation.id == message.conversation_id)
    )
    conv = conv_result.scalar_one()
    recipient_id = str(conv.seller_id) if current_user.id == conv.buyer_id else str(conv.buyer_id)
    await manager.send_to_user(
        recipient_id,
        {"type": "new_message", "message": msg_response.model_dump(mode="json")},
    )

    return msg_response


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UnreadCountResponse:
    count = await message_service.get_unread_count(db, current_user.id)
    return UnreadCountResponse(count=count)


# ---------------------------------------------------------------------------
# WebSocket endpoint
# ---------------------------------------------------------------------------


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = "") -> None:
    settings = get_settings()
    try:
        payload = decode_access_token(token, settings.JWT_SECRET_KEY)
    except ValueError:
        await websocket.close(code=4001)
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001)
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "message":
                # Handle message sending via WebSocket
                from app.database import async_session_factory

                async with async_session_factory() as db:
                    try:
                        conversation_id = uuid.UUID(data["conversation_id"])
                        content = data.get("content", "")
                        if not content or len(content) > 2000:
                            continue

                        message = await message_service.send_message(
                            db, conversation_id, uuid.UUID(user_id), content
                        )
                        msg_response = MessageResponse.model_validate(message)
                        msg_data = {
                            "type": "new_message",
                            "message": msg_response.model_dump(mode="json"),
                        }

                        # Send to sender
                        await websocket.send_json(msg_data)

                        # Send to recipient
                        from sqlalchemy import select
                        from app.models.conversation import Conversation

                        conv_result = await db.execute(
                            select(Conversation).where(
                                Conversation.id == conversation_id
                            )
                        )
                        conv = conv_result.scalar_one()
                        recipient_id = (
                            str(conv.seller_id)
                            if str(conv.buyer_id) == user_id
                            else str(conv.buyer_id)
                        )
                        await manager.send_to_user(recipient_id, msg_data)

                        await db.commit()
                    except Exception:
                        await db.rollback()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
