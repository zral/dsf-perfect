export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ConversationAdBrief {
  id: string;
  title: string;
  images: Array<{ thumbnail_url: string }>;
}

export interface ConversationUserBrief {
  id: string;
  name: string;
  avatar_url: string | null;
}

export interface Conversation {
  id: string;
  ad: ConversationAdBrief;
  other_user: ConversationUserBrief;
  last_message: Message | null;
  unread_count: number;
  updated_at: string;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: Message[];
  total: number;
  page: number;
}

export interface SendMessageRequest {
  ad_id: string;
  conversation_id?: string;
  content: string;
}
