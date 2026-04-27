import React from 'react';
import { Home, Wallet, Trophy, User, Zap, Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Dream' },
    { id: 'games', icon: Gamepad2, label: 'Arcade' },
    { id: 'leaderboard', icon: Trophy, label: 'Climb' },
    { id: 'ai', icon: Zap, label: 'Coach' },
    { id: 'wallet', icon: Wallet, label: 'Earn' },
    { id: 'profile', icon: User, label: 'Me' },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-charcoal overflow-hidden border-x border-white/5 shadow-2xl relative">
      {/* Header */}
      <header className="px-6 pt-8 pb-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center text-xl font-bold text-neon-green">
            D
          </div>
          <h1 className="font-display text-2xl font-black tracking-tighter uppercase">
            DREAM <span className="text-neon-green neon-glow">WAKER</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-0.5">STREAK</p>
          <p className="text-sm font-bold text-orange-500 italic">🔥 7 DAYS</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 custom-scrollbar">
        {children}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass-card rounded-b-none border-t border-white/10 px-6 py-5 flex items-center justify-between z-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-neon-green scale-110" : "text-white/40 hover:text-white/60"
              )}
            >
              <div className="relative">
                <Icon size={24} />
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 bg-neon-green/20 blur-md rounded-full -z-10"
                  />
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
