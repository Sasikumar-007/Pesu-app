'use client';

import { Message } from '@/lib/types';
import { format } from 'date-fns';
import { Check, CheckCheck, Trash2 } from 'lucide-react';
import VoiceMessage from './VoiceMessage';
import { useState } from 'react';
import { deleteForMe, deleteForEveryone } from '@/lib/message-actions';
import Image from 'next/image';

interface MessageBubbleProps {
    message: Message;
    isSender: boolean;
    userId: string;
}

export default function MessageBubble({ message, isSender, userId }: MessageBubbleProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [deleted, setDeleted] = useState(false);

    if (deleted) return null;

    const time = format(new Date(message.created_at), 'HH:mm');

    const handleDeleteForMe = async () => {
        await deleteForMe(message.id, userId);
        setDeleted(true);
        setShowMenu(false);
    };

    const handleDeleteForEveryone = async () => {
        const result = await deleteForEveryone(message.id, userId);
        if (result.error) {
            alert(result.error);
        }
        setShowMenu(false);
    };

    // Deleted message
    if (message.is_deleted) {
        return (
            <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-1`}>
                <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-slate-500 text-sm italic flex items-center gap-1.5">
                        <Trash2 className="w-3 h-3" />
                        This message was deleted
                    </p>
                </div>
            </div>
        );
    }

    const renderStatus = () => {
        if (!isSender) return null;
        if (message.is_read) {
            return <CheckCheck className="w-4 h-4 text-blue-400" />;
        }
        if (message.is_delivered) {
            return <CheckCheck className="w-4 h-4 text-slate-400" />;
        }
        return <Check className="w-4 h-4 text-slate-400" />;
    };

    const renderMedia = () => {
        if (!message.media_url) return null;

        if (message.media_type === 'voice') {
            return <VoiceMessage url={message.media_url} isSender={isSender} />;
        }

        if (message.media_type === 'image') {
            return (
                <div className="relative w-full max-w-[280px] aspect-video rounded-lg overflow-hidden mb-1">
                    <Image
                        src={message.media_url}
                        alt="Shared image"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            );
        }

        if (message.media_type === 'pdf') {
            return (
                <a
                    href={message.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 transition-colors ${isSender ? 'bg-white/10 hover:bg-white/20' : 'bg-teal-500/10 hover:bg-teal-500/20'
                        }`}
                >
                    <div className="w-8 h-10 bg-red-500/20 rounded flex items-center justify-center text-xs font-bold text-red-400">
                        PDF
                    </div>
                    <span className={`text-sm ${isSender ? 'text-white/90' : 'text-slate-700'}`}>
                        Document.pdf
                    </span>
                </a>
            );
        }
    };

    return (
        <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-1 group`}>
            <div
                className={`relative max-w-[75%] md:max-w-[65%] px-3 py-2 rounded-2xl shadow-sm ${isSender
                        ? 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-br-md'
                        : 'bg-[#1e2d3d] text-slate-100 rounded-bl-md'
                    }`}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setShowMenu(true);
                }}
            >
                {renderMedia()}

                {message.content && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                )}

                <div className={`flex items-center gap-1 mt-0.5 ${isSender ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-[10px] ${isSender ? 'text-white/50' : 'text-slate-500'}`}>
                        {time}
                    </span>
                    {renderStatus()}
                </div>

                {/* Context menu */}
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                        <div className="absolute z-50 bottom-full right-0 mb-1 bg-[#1a2a3a] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[180px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <button
                                onClick={handleDeleteForMe}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete for me
                            </button>
                            {isSender && (
                                <button
                                    onClick={handleDeleteForEveryone}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete for everyone
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
