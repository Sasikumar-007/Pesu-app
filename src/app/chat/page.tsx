'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { usePresence } from '@/hooks/usePresence';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/chat/Sidebar';
import ChatArea from '@/components/chat/ChatArea';
import { Profile } from '@/lib/types';

export default function ChatPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [activeOtherUser, setActiveOtherUser] = useState<Profile | null>(null);
    const [showSidebar, setShowSidebar] = useState(true);

    const { conversations, allUsers, getOrCreateConversation } = useConversations(user?.id || null);

    // Track presence
    usePresence(user?.id || null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleSelectConversation = (conversationId: string) => {
        setActiveConversationId(conversationId);
        const conv = conversations.find(c => c.id === conversationId);
        setActiveOtherUser(conv?.other_user || null);
        // On mobile, hide sidebar when chat opened
        setShowSidebar(false);
    };

    const handleSelectUser = async (otherUserId: string) => {
        const conversationId = await getOrCreateConversation(otherUserId);
        if (conversationId) {
            setActiveConversationId(conversationId);
            const otherUser = allUsers.find(u => u.id === otherUserId) || null;
            setActiveOtherUser(otherUser);
            setShowSidebar(false);
        }
    };

    const handleBack = () => {
        setShowSidebar(true);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0a1628]">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">Loading PESU...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="h-screen flex bg-[#0a1628] overflow-hidden">
            {/* Sidebar */}
            <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-[380px] lg:w-[420px] flex-shrink-0`}>
                <Sidebar
                    conversations={conversations}
                    allUsers={allUsers}
                    activeConversationId={activeConversationId}
                    onSelectConversation={handleSelectConversation}
                    onSelectUser={handleSelectUser}
                    userId={user.id}
                />
            </div>

            {/* Chat Area */}
            <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-1 min-w-0`}>
                <ChatArea
                    conversationId={activeConversationId}
                    otherUser={activeOtherUser}
                    userId={user.id}
                    userName={profile?.full_name || ''}
                    onBack={handleBack}
                />
            </div>
        </div>
    );
}
