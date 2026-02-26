'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation, Profile } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Search, LogOut, Users, MessageSquarePlus } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { UserStatus } from '@/lib/types';

interface SidebarProps {
    conversations: Conversation[];
    allUsers: Profile[];
    activeConversationId: string | null;
    onSelectConversation: (conversationId: string) => void;
    onSelectUser: (userId: string) => void;
    userId: string;
}

export default function Sidebar({
    conversations,
    allUsers,
    activeConversationId,
    onSelectConversation,
    onSelectUser,
    userId,
}: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showUsers, setShowUsers] = useState(false);
    const [userStatuses, setUserStatuses] = useState<Record<string, UserStatus>>({});
    const { signOut, profile } = useAuth();

    // Fetch all user statuses
    useEffect(() => {
        const fetchStatuses = async () => {
            const { data } = await supabase.from('user_status').select('*');
            if (data) {
                const statusMap: Record<string, UserStatus> = {};
                data.forEach(s => { statusMap[s.user_id] = s; });
                setUserStatuses(statusMap);
            }
        };
        fetchStatuses();

        const channel = supabase
            .channel('all-user-statuses')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_status' }, (payload) => {
                const updated = payload.new as UserStatus;
                setUserStatuses(prev => ({ ...prev, [updated.user_id]: updated }));
            })
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, []);

    const formatMessageTime = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isToday(d)) return format(d, 'HH:mm');
        if (isYesterday(d)) return 'Yesterday';
        return format(d, 'dd/MM/yy');
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const filteredConversations = conversations.filter(c => {
        const name = c.other_user?.full_name || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredUsers = allUsers.filter(u =>
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full h-full flex flex-col bg-[#0a1628] border-r border-white/5">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-[#0d1b2a]">
                <Logo size="small" />
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowUsers(!showUsers)}
                        className={`p-2 rounded-lg transition-colors ${showUsers ? 'bg-teal-500/20 text-teal-400' : 'hover:bg-white/5 text-slate-400 hover:text-slate-300'}`}
                        title="New chat"
                    >
                        {showUsers ? <Users className="w-5 h-5" /> : <MessageSquarePlus className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={signOut}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Current user info */}
            <div className="px-4 py-2 border-b border-white/5 flex items-center gap-3">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white text-xs">
                        {getInitials(profile?.full_name || 'U')}
                    </AvatarFallback>
                </Avatar>
                <span className="text-sm text-slate-300 truncate">{profile?.full_name}</span>
            </div>

            {/* Search */}
            <div className="px-3 py-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={showUsers ? 'Search users...' : 'Search chats...'}
                        className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/30 transition-colors"
                    />
                </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1">
                {showUsers ? (
                    // All Users List
                    <div className="px-2 py-1">
                        <p className="px-3 py-2 text-xs text-slate-500 uppercase tracking-wider font-medium">All Users</p>
                        {filteredUsers.map(user => {
                            const status = userStatuses[user.id];
                            return (
                                <button
                                    key={user.id}
                                    onClick={() => { onSelectUser(user.id); setShowUsers(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    <div className="relative">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={user.avatar_url || ''} />
                                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-sm">
                                                {getInitials(user.full_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {status?.is_online && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0a1628]" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm text-white font-medium">{user.full_name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user.status_message || 'Available'}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    // Conversations List
                    <div className="px-2 py-1">
                        {filteredConversations.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquarePlus className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No conversations yet</p>
                                <p className="text-xs text-slate-600 mt-1">Click the + button to start chatting</p>
                            </div>
                        ) : (
                            filteredConversations.map(conv => {
                                const isActive = conv.id === activeConversationId;
                                const otherUser = conv.other_user;
                                const status = otherUser ? userStatuses[otherUser.id] : null;
                                const lastMsg = conv.last_message;

                                let lastMsgPreview = '';
                                if (lastMsg) {
                                    if (lastMsg.is_deleted) lastMsgPreview = '🚫 Message deleted';
                                    else if (lastMsg.media_type === 'voice') lastMsgPreview = '🎤 Voice message';
                                    else if (lastMsg.media_type === 'image') lastMsgPreview = '📷 Photo';
                                    else if (lastMsg.media_type === 'pdf') lastMsgPreview = '📄 Document';
                                    else lastMsgPreview = lastMsg.content || '';
                                }

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => onSelectConversation(conv.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 ${isActive
                                                ? 'bg-teal-500/10 border border-teal-500/20'
                                                : 'hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <Avatar className="w-11 h-11">
                                                <AvatarImage src={otherUser?.avatar_url || ''} />
                                                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white text-sm">
                                                    {getInitials(otherUser?.full_name || '?')}
                                                </AvatarFallback>
                                            </Avatar>
                                            {status?.is_online && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0a1628]" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm font-medium truncate ${isActive ? 'text-teal-400' : 'text-white'}`}>
                                                    {otherUser?.full_name || 'Unknown'}
                                                </p>
                                                {lastMsg && (
                                                    <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                                                        {formatMessageTime(lastMsg.created_at)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-0.5">
                                                <p className="text-xs text-slate-500 truncate pr-2">{lastMsgPreview || 'Start a conversation'}</p>
                                                {(conv.unread_count ?? 0) > 0 && (
                                                    <Badge className="bg-teal-500 text-white text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full flex-shrink-0">
                                                        {conv.unread_count}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
