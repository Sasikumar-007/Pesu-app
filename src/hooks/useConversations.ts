'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Conversation, Profile, Message } from '@/lib/types';

export function useConversations(userId: string | null) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [allUsers, setAllUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchConversations = useCallback(async () => {
        if (!userId) return;
        setLoading(true);

        // Get conversations where user is a participant
        const { data: participations } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', userId);

        if (!participations?.length) {
            setConversations([]);
            setLoading(false);
            return;
        }

        const convIds = participations.map((p) => p.conversation_id);

        // Get conversations
        const { data: convs } = await supabase
            .from('conversations')
            .select('*')
            .in('id', convIds)
            .order('created_at', { ascending: false });

        if (!convs) {
            setConversations([]);
            setLoading(false);
            return;
        }

        // For each conversation, get other participant and last message
        const enrichedConversations: Conversation[] = await Promise.all(
            convs.map(async (conv) => {
                // Get other participant
                const { data: participants } = await supabase
                    .from('conversation_participants')
                    .select('user_id')
                    .eq('conversation_id', conv.id)
                    .neq('user_id', userId);

                let otherUser: Profile | undefined;
                if (participants?.[0]) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', participants[0].user_id)
                        .single();
                    otherUser = profile || undefined;
                }

                // Get last message
                const { data: lastMsgArr } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', conv.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                const last_message = lastMsgArr?.[0] || null;

                // Get unread count
                const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conv.id)
                    .eq('is_read', false)
                    .neq('sender_id', userId);

                return {
                    ...conv,
                    other_user: otherUser,
                    last_message,
                    unread_count: count || 0,
                };
            })
        );

        // Sort by last message time
        enrichedConversations.sort((a, b) => {
            const timeA = a.last_message?.created_at || a.created_at;
            const timeB = b.last_message?.created_at || b.created_at;
            return new Date(timeB).getTime() - new Date(timeA).getTime();
        });

        setConversations(enrichedConversations);
        setLoading(false);
    }, [userId]);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            if (!userId) return;
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .neq('id', userId)
                .order('full_name');
            setAllUsers(data || []);
        };
        fetchUsers();

        if (!userId) return;

        // Subscribe to new users joining
        const profileChannel = supabase
            .channel('profiles-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' },
                () => {
                    fetchUsers();
                }
            )
            .subscribe();

        return () => {
            profileChannel.unsubscribe();
        };
    }, [userId]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Subscribe to new messages across all conversations to update sidebar
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel('sidebar-messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                () => {
                    // Refetch conversations when any new message arrives
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [userId, fetchConversations]);

    const getOrCreateConversation = useCallback(
        async (otherUserId: string): Promise<string | null> => {
            if (!userId) return null;

            // Check if conversation already exists
            const { data: myConvs } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', userId);

            if (myConvs) {
                for (const mc of myConvs) {
                    const { data: otherParticipant } = await supabase
                        .from('conversation_participants')
                        .select('user_id')
                        .eq('conversation_id', mc.conversation_id)
                        .eq('user_id', otherUserId)
                        .single();

                    if (otherParticipant) {
                        return mc.conversation_id;
                    }
                }
            }

            // Generate a UUID for the new conversation
            // Generate a UUID for the new conversation (with fallback for non-secure contexts)
            const generateUUID = () => {
                if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                    return crypto.randomUUID();
                }
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };
            const newConvId = generateUUID();

            // Create new conversation (without .select() to avoid RLS hiding it before participants are added)
            const { error: convError } = await supabase
                .from('conversations')
                .insert({ id: newConvId });

            if (convError) {
                console.error("convError:", convError);
                return null;
            }

            // Add both participants
            const { error: partError } = await supabase.from('conversation_participants').insert([
                { conversation_id: newConvId, user_id: userId },
                { conversation_id: newConvId, user_id: otherUserId },
            ]);

            if (partError) {
                console.error("Error adding participants:", partError);
                return null;
            }

            await fetchConversations();
            return newConvId;
        },
        [userId, fetchConversations]
    );

    return {
        conversations,
        allUsers,
        loading,
        getOrCreateConversation,
        refreshConversations: fetchConversations,
    };
}
