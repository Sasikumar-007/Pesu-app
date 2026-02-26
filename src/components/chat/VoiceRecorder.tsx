'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Send, X } from 'lucide-react';
import { uploadMedia } from '@/lib/storage';

interface VoiceRecorderProps {
    userId: string;
    onSend: (mediaUrl: string) => void;
    onCancel: () => void;
}

export default function VoiceRecorder({ userId, onSend, onCancel }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [uploading, setUploading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => { track.stop() });
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

                if (audioBlob.size > 0) {
                    setUploading(true);
                    const url = await uploadMedia(audioBlob, userId, 'webm');
                    setUploading(false);
                    if (url) {
                        onSend(url);
                    }
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Microphone access denied:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current.stop();
            chunksRef.current = [];
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
        onCancel();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (uploading) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1a2a3a] rounded-2xl">
                <div className="w-5 h-5 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                <span className="text-slate-300 text-sm">Sending voice message...</span>
            </div>
        );
    }

    if (!isRecording) {
        return (
            <button
                onClick={startRecording}
                className="p-2.5 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/20 transition-all duration-200"
                title="Record voice message"
            >
                <Mic className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-2xl flex-1 animate-in fade-in duration-200">
            <button
                onClick={cancelRecording}
                className="p-1.5 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 flex-1">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-sm font-mono">{formatTime(recordingTime)}</span>
                <div className="flex-1 flex items-center gap-0.5">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-red-400/60 rounded-full animate-pulse"
                            style={{
                                height: `${Math.random() * 16 + 4}px`,
                                animationDelay: `${i * 0.05}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            <button
                onClick={stopRecording}
                className="p-2 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md transition-all duration-200 hover:scale-105"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
    );
}
