'use client';

import { MessageCircle } from 'lucide-react';

export default function Logo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
    const sizes = {
        small: { icon: 'w-8 h-8', iconInner: 'w-4 h-4', text: 'text-xl' },
        default: { icon: 'w-10 h-10', iconInner: 'w-5 h-5', text: 'text-2xl' },
        large: { icon: 'w-16 h-16', iconInner: 'w-8 h-8', text: 'text-4xl' },
    };

    const s = sizes[size];

    return (
        <div className="flex items-center gap-2.5">
            <div className={`${s.icon} bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20`}>
                <MessageCircle className={`${s.iconInner} text-white`} />
            </div>
            <div>
                <h1 className={`${s.text} font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent tracking-tight leading-none`} style={{ fontFamily: "'Inter', sans-serif" }}>
                    PESU
                </h1>
            </div>
        </div>
    );
}
