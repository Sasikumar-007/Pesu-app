'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '@/lib/types';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useMessages(conversationId: string | null, userId: string | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }, 100);
    }, []);

    // Fetch messages
    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            setMessages(data || []);
            setLoading(false);
            scrollToBottom();
        };

        fetchMessages();
    }, [conversationId, scrollToBottom]);

    // Realtime subscription
    useEffect(() => {
        if (!conversationId) return;

        channelRef.current = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((prev) => {
                        if (prev.find(m => m.id === newMessage.id)) return prev;
                        return [...prev, newMessage];
                    });
                    scrollToBottom();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const updated = payload.new as Message;
                    setMessages((prev) =>
                        prev.map((m) => (m.id === updated.id ? updated : m))
                    );
                }
            )
            .subscribe();

        return () => {
            channelRef.current?.unsubscribe();
        };
    }, [conversationId, scrollToBottom]);

    const sendMessage = useCallback(
        async (content: string, mediaUrl?: string, mediaType?: 'image' | 'pdf' | 'voice') => {
            if (!conversationId || !userId) return;
            if (!content.trim() && !mediaUrl) return;

            const { error } = await supabase.from('messages').insert({
                conversation_id: conversationId,
                sender_id: userId,
                content: content.trim() || null,
                media_url: mediaUrl || null,
                media_type: mediaType || null,
                is_sent: true,
            });

            if (error) {
                console.error('Send message error:', error);
                alert(`Error sending message: ${error.message}`);
            }
        },
        [conversationId, userId]
    );

    const filteredMessages = messages.filter(
        (m) => !m.deleted_for_user_ids?.includes(userId || '')
    );

    return { messages: filteredMessages, loading, sendMessage, scrollRef, scrollToBottom };
}
