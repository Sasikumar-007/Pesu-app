'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  // Fallback timeout: if loading takes more than 3 seconds, redirect to login
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimedOut(true);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/chat');
      } else {
        router.push('/login');
      }
    } else if (timedOut) {
      // Auth took too long, redirect to login
      router.push('/login');
    }
  }, [user, loading, router, timedOut]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#0a1628]">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-3xl mb-6 shadow-xl shadow-teal-500/25 animate-pulse">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          PESU
        </h1>
        <p className="text-slate-500">Loading...</p>
      </div>
    </div>
  );
}
