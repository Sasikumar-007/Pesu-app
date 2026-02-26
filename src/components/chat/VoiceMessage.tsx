'use client';

import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface VoiceMessageProps {
    url: string;
    isSender: boolean;
}

export default function VoiceMessage({ url, isSender }: VoiceMessageProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number) => {
        if (!isFinite(time) || isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex items-center gap-3 min-w-[200px]">
            <audio
                ref={audioRef}
                src={url}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
            />

            <button
                onClick={togglePlay}
                className={`p-2 rounded-full flex-shrink-0 transition-colors ${isSender
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-600'
                    }`}
            >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="flex-1 flex flex-col gap-1">
                {/* Waveform visualization */}
                <div className="flex items-center gap-0.5 h-6">
                    {Array.from({ length: 30 }).map((_, i) => {
                        const barProgress = (i / 30) * 100;
                        const isActive = barProgress <= progress;
                        const height = [4, 8, 12, 6, 14, 8, 10, 16, 6, 12, 8, 14, 4, 10, 16, 8, 6, 12, 14, 4, 10, 8, 16, 6, 12, 8, 14, 10, 4, 8][i];
                        return (
                            <div
                                key={i}
                                className={`w-1 rounded-full transition-colors ${isActive
                                        ? isSender ? 'bg-white/80' : 'bg-teal-500'
                                        : isSender ? 'bg-white/30' : 'bg-slate-300'
                                    }`}
                                style={{ height: `${height}px` }}
                            />
                        );
                    })}
                </div>

                <span className={`text-[10px] ${isSender ? 'text-white/60' : 'text-slate-400'}`}>
                    {formatTime(isPlaying ? currentTime : duration)}
                </span>
            </div>
        </div>
    );
}
