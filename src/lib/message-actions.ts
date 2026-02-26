import { supabase } from './supabase';

export async function deleteForMe(messageId: string, userId: string) {
    const { data: message } = await supabase
        .from('messages')
        .select('deleted_for_user_ids')
        .eq('id', messageId)
        .single();

    if (!message) return;

    const updatedIds = [...(message.deleted_for_user_ids || []), userId];

    await supabase
        .from('messages')
        .update({ deleted_for_user_ids: updatedIds })
        .eq('id', messageId);
}

export async function deleteForEveryone(messageId: string, userId: string) {
    const { data: message } = await supabase
        .from('messages')
        .select('sender_id, created_at')
        .eq('id', messageId)
        .single();

    if (!message) return { error: 'Message not found' };
    if (message.sender_id !== userId) return { error: 'Not your message' };

    const createdAt = new Date(message.created_at).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - createdAt > fiveMinutes) {
        return { error: 'Cannot delete after 5 minutes' };
    }

    await supabase
        .from('messages')
        .update({ is_deleted: true, content: null, media_url: null })
        .eq('id', messageId);

    return { error: null };
}

export async function markAsRead(conversationId: string, userId: string) {
    await supabase
        .from('messages')
        .update({ is_read: true, is_delivered: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);
}
