'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserStatus } from '@/lib/types';

export function useUserStatus(targetUserId: string | null) {
    const [status, setStatus] = useState<UserStatus | null>(null);

    useEffect(() => {
        if (!targetUserId) return;

        const fetchStatus = async () => {
            const { data } = await supabase
                .from('user_status')
                .select('*')
                .eq('user_id', targetUserId)
                .single();
            setStatus(data);
        };

        fetchStatus();

        const channel = supabase
            .channel(`user-status:${targetUserId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_status',
                    filter: `user_id=eq.${targetUserId}`,
                },
                (payload) => {
                    setStatus(payload.new as UserStatus);
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [targetUserId]);

    return status;
}
