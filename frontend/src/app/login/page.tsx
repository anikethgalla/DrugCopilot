'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  KeyRound, 
  ArrowRight, 
  AlertCircle,
  Lock
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { login, isAuthenticated, user, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await login(email, password);
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push(res.default_portal);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background text-gray-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-mono text-gray-300">
            <Lock className="h-3.5 w-3.5 text-white" />
            <span>SECURE ACCESS &amp; RBAC AUTHENTICATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            DrugCopilot Sign In
          </h1>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Authenticate to access your assigned portal and research capabilities.
          </p>
        </div>

        {/* Already Authenticated Banner */}
        {isAuthenticated && user && (
          <div className="rounded-xl border border-surface-border bg-surface-raised p-4 flex flex-col items-center justify-between gap-3 shadow-specular text-center">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono font-bold text-xs">
                {user.role === 'admin' ? 'ADM' : 'USR'}
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-white">{user.name}</span>
                  <span className="rounded bg-white/10 border border-white/20 px-1.5 py-0.2 text-[9px] font-mono font-bold text-gray-200 uppercase">
                    {user.role}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">{user.email}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full pt-1">
              <Link
                href={user.role === 'admin' ? '/admin' : '/copilot'}
                className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black px-3 py-2 text-xs font-bold transition-all shadow-specular-strong"
              >
                <span>Go to {user.role === 'admin' ? 'Admin Hub' : 'Researcher Portal'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center justify-center rounded-lg bg-surface hover:bg-surface-overlay border border-surface-border px-3 py-2 text-xs font-medium text-gray-400 hover:text-white transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Clean Credentials Form Box */}
        <div className="rounded-xl border border-surface-border bg-surface p-6 shadow-specular space-y-5">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center space-x-2">
              <KeyRound className="h-4 w-4 text-gray-300" />
              <h2 className="text-sm font-semibold text-white">Sign In with Credentials</h2>
            </div>
            <span className="text-[11px] font-mono text-gray-400">HTTP Basic / JWT</span>
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-red-950/40 border border-red-800/60 p-3 text-xs text-red-200 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@drugcopilot.org"
                className="w-full rounded-lg bg-surface-raised border border-surface-border px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-gray-300">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg bg-surface-raised border border-surface-border px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center space-x-2 rounded-lg bg-white hover:bg-neutral-200 text-black py-2.5 text-xs font-bold transition-all shadow-specular-strong disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center">
        <div className="text-xs font-mono text-gray-400 animate-pulse">Loading Authentication Portal...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
