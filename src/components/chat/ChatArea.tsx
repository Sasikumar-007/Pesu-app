'use client';

import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Profile } from '@/lib/types';
import { useMessages } from '@/hooks/useMessages';
import { useTyping } from '@/hooks/useTyping';
import { useUserStatus } from '@/hooks/useUserStatus';
import { markAsRead } from '@/lib/message-actions';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatAreaProps {
    conversationId: string | null;
    otherUser: Profile | null;
    userId: string;
    userName: string;
    onBack?: () => void;
}

export default function ChatArea({ conversationId, otherUser, userId, userName, onBack }: ChatAreaProps) {
    const { messages, loading, sendMessage, scrollRef } = useMessages(conversationId, userId);
    const { typingUser, sendTyping } = useTyping(conversationId, userId, userName);
    const otherStatus = useUserStatus(otherUser?.id || null);

    // Mark messages as read when viewing
    useEffect(() => {
        if (conversationId && userId) {
            markAsRead(conversationId, userId);
        }
    }, [conversationId, userId, messages]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (!conversationId || !otherUser) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#0d1b2a]">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-3xl mb-4">
                        <MessageCircle className="w-10 h-10 text-teal-500/50" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                        PESU
                    </h2>
                    <p className="text-sm text-slate-500">Select a conversation to start messaging</p>
                    <p className="text-xs text-slate-600 mt-1">Your messages are private and secure</p>
                </div>
            </div>
        );
    }

    const handleSend = (content: string, mediaUrl?: string, mediaType?: 'image' | 'pdf' | 'voice') => {
        sendMessage(content, mediaUrl, mediaType);
    };

    // Group messages by date
    const groupedMessages: { date: string; messages: typeof messages }[] = [];
    let currentDate = '';
    messages.forEach(msg => {
        const dateStr = format(new Date(msg.created_at), 'yyyy-MM-dd');
        if (dateStr !== currentDate) {
            currentDate = dateStr;
            groupedMessages.push({ date: dateStr, messages: [msg] });
        } else {
            groupedMessages[groupedMessages.length - 1].messages.push(msg);
        }
    });

    const formatDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'Today';
        if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) return 'Yesterday';
        return format(date, 'MMMM d, yyyy');
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0d1b2a]">
            {/* Chat header */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5 bg-[#0a1628]">
                {onBack && (
                    <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 md:hidden">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <div className="relative">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={otherUser.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white text-sm">
                            {getInitials(otherUser.full_name)}
                        </AvatarFallback>
                    </Avatar>
                    {otherStatus?.is_online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a1628]" />
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">{otherUser.full_name}</h3>
                    <p className="text-xs text-slate-400">
                        {typingUser ? (
                            <span className="text-teal-400 animate-pulse">typing...</span>
                        ) : otherStatus?.is_online ? (
                            <span className="text-emerald-400">online</span>
                        ) : otherStatus?.last_seen ? (
                            `last seen ${format(new Date(otherStatus.last_seen), 'HH:mm')}`
                        ) : (
                            'offline'
                        )}
                    </p>
                </div>
            </div>

            {/* Messages area */}
            <ScrollArea ref={scrollRef} className="flex-1 overflow-y-auto">
                <div className="px-4 py-4 min-h-full flex flex-col justify-end">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {groupedMessages.map(group => (
                                <div key={group.date}>
                                    <div className="flex items-center justify-center my-4">
                                        <span className="px-3 py-1 bg-white/5 rounded-full text-[11px] text-slate-500 font-medium">
                                            {formatDateLabel(group.date)}
                                        </span>
                                    </div>
                                    {group.messages.map(msg => (
                                        <MessageBubble
                                            key={msg.id}
                                            message={msg}
                                            isSender={msg.sender_id === userId}
                                            userId={userId}
                                        />
                                    ))}
                                </div>
                            ))}

                            {typingUser && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="px-3 py-2 bg-[#1e2d3d] rounded-2xl rounded-bl-md">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </ScrollArea>

            {/* Message input */}
            <MessageInput
                onSend={handleSend}
                onTyping={sendTyping}
                userId={userId}
            />
        </div>
    );
}
