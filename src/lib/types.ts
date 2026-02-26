export interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    status_message: string | null;
    created_at: string;
}

export interface Conversation {
    id: string;
    created_at: string;
    participants?: ConversationParticipant[];
    last_message?: Message | null;
    unread_count?: number;
    other_user?: Profile;
}

export interface ConversationParticipant {
    conversation_id: string;
    user_id: string;
    profile?: Profile;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string | null;
    media_url: string | null;
    media_type: 'image' | 'pdf' | 'voice' | null;
    is_sent: boolean;
    is_delivered: boolean;
    is_read: boolean;
    is_deleted: boolean;
    deleted_for_user_ids: string[];
    created_at: string;
    sender?: Profile;
}

export interface UserStatus {
    user_id: string;
    is_online: boolean;
    last_seen: string;
}
