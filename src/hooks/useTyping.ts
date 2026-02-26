'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useTyping(conversationId: string | null, userId: string | null, userName: string | null) {
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!conversationId || !userId) return;

        channelRef.current = supabase.channel(`typing:${conversationId}`);

        channelRef.current
            .on('broadcast', { event: 'typing' }, (payload) => {
                const data = payload.payload;
                if (data.userId !== userId) {
                    setTypingUser(data.userName);

                    // Clear previous timeout
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);

                    // Auto-hide after 3 seconds
                    timeoutRef.current = setTimeout(() => {
                        setTypingUser(null);
                    }, 3000);
                }
            })
            .on('broadcast', { event: 'stop_typing' }, (payload) => {
                const data = payload.payload;
                if (data.userId !== userId) {
                    setTypingUser(null);
                }
            })
            .subscribe();

        return () => {
            channelRef.current?.unsubscribe();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [conversationId, userId]);

    const sendTyping = useCallback(() => {
        if (!channelRef.current || !userId || !userName) return;

        channelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId, userName },
        });

        // Clear previous stop-typing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Send stop-typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            channelRef.current?.send({
                type: 'broadcast',
                event: 'stop_typing',
                payload: { userId },
            });
        }, 2000);
    }, [userId, userName]);

    return { typingUser, sendTyping };
}
