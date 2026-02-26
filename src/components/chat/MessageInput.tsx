'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, Image as ImageIcon, FileText } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import { uploadMedia } from '@/lib/storage';

interface MessageInputProps {
    onSend: (content: string, mediaUrl?: string, mediaType?: 'image' | 'pdf' | 'voice') => void;
    onTyping: () => void;
    userId: string;
    disabled?: boolean;
}

export default function MessageInput({ onSend, onTyping, userId, disabled }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [showAttach, setShowAttach] = useState(false);
    const [showVoice, setShowVoice] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!message.trim()) return;
        onSend(message);
        setMessage('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        onTyping();

        // Auto-resize
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setShowAttach(false);

        const ext = file.name.split('.').pop() || (type === 'image' ? 'jpg' : 'pdf');
        const url = await uploadMedia(file, userId, ext);

        setUploading(false);

        if (url) {
            onSend('', url, type);
        }

        // Reset the file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleVoiceSend = (mediaUrl: string) => {
        onSend('', mediaUrl, 'voice');
        setShowVoice(false);
    };

    if (showVoice) {
        return (
            <div className="px-4 py-3 bg-[#0d1b2a] border-t border-white/5">
                <VoiceRecorder
                    userId={userId}
                    onSend={handleVoiceSend}
                    onCancel={() => setShowVoice(false)}
                />
            </div>
        );
    }

    return (
        <div className="relative px-4 py-3 bg-[#0d1b2a] border-t border-white/5">
            {/* Attachment popup */}
            {showAttach && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAttach(false)} />
                    <div className="absolute bottom-full left-4 mb-2 bg-[#1a2a3a] border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-purple-400" />
                            </div>
                            <span className="text-sm text-slate-300">Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'image')}
                            />
                        </label>
                        <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                                <FileText className="w-4 h-4 text-red-400" />
                            </div>
                            <span className="text-sm text-slate-300">Document</span>
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'pdf')}
                            />
                        </label>
                    </div>
                </>
            )}

            <div className="flex items-end gap-2">
                {/* Attach Document button */}
                <button
                    onClick={() => setShowAttach(!showAttach)}
                    disabled={disabled}
                    className="p-2.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-300 transition-colors flex-shrink-0"
                    title="Attach Document"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                {/* Direct Photo Upload button */}
                <label className="p-2.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-300 transition-colors flex-shrink-0 cursor-pointer" title="Send Photo">
                    <ImageIcon className="w-5 h-5" />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'image')}
                        disabled={disabled || uploading}
                    />
                </label>

                {/* Text input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={disabled || uploading}
                        rows={1}
                        className="w-full bg-[#1a2a3a] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 resize-none transition-colors disabled:opacity-50"
                        style={{ maxHeight: '120px' }}
                    />
                </div>

                {/* Send or Voice button */}
                {message.trim() ? (
                    <button
                        onClick={handleSend}
                        disabled={disabled || uploading}
                        className="p-2.5 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/20 transition-all duration-200 flex-shrink-0 disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                ) : (
                    <VoiceRecorder
                        userId={userId}
                        onSend={handleVoiceSend}
                        onCancel={() => { }}
                    />
                )}
            </div>

            {uploading && (
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                    <div className="w-4 h-4 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                    Uploading file...
                </div>
            )}

            <input ref={fileInputRef} type="file" className="hidden" />
        </div>
    );
}
