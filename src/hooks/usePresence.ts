'use client';

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://maynrffyeyyklaxyliuo.supabase.co';

export function usePresence(userId: string | null) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const setOnline = useCallback(async () => {
        if (!userId) return;
        await supabase
            .from('user_status')
            .upsert({ user_id: userId, is_online: true, last_seen: new Date().toISOString() });
    }, [userId]);

    const setOffline = useCallback(async () => {
        if (!userId) return;
        await supabase
            .from('user_status')
            .upsert({ user_id: userId, is_online: false, last_seen: new Date().toISOString() });
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        // Set online initially
        setOnline();

        // Heartbeat every 30 seconds
        intervalRef.current = setInterval(setOnline, 30000);

        // Handle page visibility changes
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setOnline();
            } else {
                setOffline();
            }
        };

        // Handle before unload
        const handleBeforeUnload = () => {
            // Use sendBeacon for reliable offline status update
            const url = `${SUPABASE_URL}/rest/v1/user_status?user_id=eq.${userId}`;
            const body = JSON.stringify({ is_online: false, last_seen: new Date().toISOString() });
            navigator.sendBeacon(
                url,
                new Blob([body], { type: 'application/json' })
            );
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            setOffline();
        };
    }, [userId, setOnline, setOffline]);
}
