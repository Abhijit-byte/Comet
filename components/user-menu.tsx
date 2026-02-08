'use client';

import { useAuth } from '@/lib/auth-context';
import { LogOut, User, Shield } from 'lucide-react';

export default function UserMenu() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-cyan-500/20 animate-pulse">
        <div className="h-4 w-4 rounded-full bg-cyan-500/30" />
        <div className="h-4 w-20 bg-cyan-500/30 rounded" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 glass rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all duration-300">
        <div className="flex items-center gap-2 pr-2 border-r border-red-500/20">
          <Shield className="w-4 h-4 text-red-400" />
          <div className="flex flex-col">
            <span className="text-xs font-mono text-red-300 font-semibold">
              GUEST_MODE
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 hover:bg-red-500/20 rounded transition-all duration-300 hover:scale-110 group"
          title="Return to Login"
        >
          <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 glass rounded-lg border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300">
      <div className="flex items-center gap-2 pr-2 border-r border-cyan-500/20">
        <Shield className="w-4 h-4 text-cyan-400" />
        <div className="flex flex-col">
          <span className="text-xs font-mono text-cyan-300 font-semibold">
            {user.username || user.email?.split('@')[0]}
          </span>
          <span className="text-[10px] text-cyan-400/60 uppercase tracking-wider">
            Operator
          </span>
        </div>
      </div>
      <button
        onClick={logout}
        className="p-2 hover:bg-red-500/20 rounded transition-all duration-300 hover:scale-110 group"
        title="Terminate Session"
      >
        <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300" />
      </button>
    </div>
  );
}
