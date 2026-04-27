import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Crown, MessageSquare, Zap, X, Share2, Users, Copy, Check } from 'lucide-react';
import { subscribeToLeaderboard } from '../../services/firebase';
import { cn } from '../../lib/utils';

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [challengeStatus, setChallengeStatus] = useState<'idle' | 'waiting' | 'active'>('idle');

  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((data) => {
      setUsers(data);
    });
    return () => unsubscribe();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={18} />;
    if (rank === 2) return <Medal className="text-slate-300" size={18} />;
    if (rank === 3) return <Medal className="text-amber-600" size={18} />;
    return <span className="text-[10px] font-black text-white/40">#{rank}</span>;
  };

  const handleStartChallenge = () => {
    const code = Math.random().toString(36).substring(7).toUpperCase();
    setInviteCode(code);
    setShowChallengeModal(true);
    setChallengeStatus('waiting');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold tracking-tighter uppercase italic">GLOBAL <span className="text-neon-green">CLIMB</span></h2>
        <div className="flex gap-2">
          <button className="text-[10px] font-black uppercase text-neon-green bg-neon-green/10 px-3 py-1 rounded-full border border-neon-green/30">Weekly</button>
          <button className="text-[10px] font-black uppercase text-white/40 px-3 py-1 rounded-full">All Time</button>
        </div>
      </div>

      {/* Challenge Section */}
      <div className="glass-card p-5 mb-6 border-neon-green/20 bg-neon-green/[0.02] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-green/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-green/10 rounded-xl">
              <Zap className="text-neon-green animate-pulse" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black tracking-tight uppercase">Walk Challenge</h4>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-tight">
                {challengeStatus === 'waiting' ? 'WAITING FOR RIVAL...' : 'Compete with friends for SATS'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleStartChallenge}
            className={cn(
              "btn-primary px-5 py-2.5 text-[10px] uppercase tracking-widest rounded-xl font-black italic",
              challengeStatus === 'waiting' && "bg-white/10 text-white/40 border-white/5"
            )}
          >
            {challengeStatus === 'waiting' ? 'PENDING' : 'START'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showChallengeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/90 backdrop-blur-md z-[50] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-sm p-8 border-neon-green/20 relative"
            >
              <button 
                onClick={() => setShowChallengeModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} className="text-white/40" />
              </button>

              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto">
                  <Users size={32} className="text-neon-green" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter">CHALLENGE <span className="text-neon-green">FRIEND</span></h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-bold">Ask a friend to join the walk</p>
                </div>

                <div className="space-y-4">
                  {challengeStatus === 'waiting' ? (
                    <div className="bg-charcoal border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                      <span className="text-lg font-mono font-bold tracking-[0.2em]">{inviteCode}</span>
                      <button 
                        onClick={copyCode}
                        className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        {copied ? <Check size={18} className="text-neon-green" /> : <Copy size={18} />}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="ENTER INVITE CODE"
                        className="w-full bg-charcoal border border-white/10 rounded-2xl p-4 text-center font-mono font-bold tracking-[0.2em] focus:outline-none focus:border-neon-green/50 transition-colors"
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      />
                      <button 
                        onClick={() => {
                          if (inviteCode.length > 0) {
                            setChallengeStatus('active');
                            alert(`Challenge Joined! Room: ${inviteCode}`);
                            setShowChallengeModal(false);
                          }
                        }}
                        className="w-full py-4 bg-neon-green text-charcoal rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                      >
                        Join Now
                      </button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        setChallengeStatus('waiting');
                        const code = Math.random().toString(36).substring(7).toUpperCase();
                        setInviteCode(code);
                      }}
                      className="flex items-center justify-center gap-2 p-4 glass-card border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      <Users size={16} />
                      Host
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4 bg-white/5 text-white/40 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
                      <Share2 size={16} />
                      Invite
                    </button>
                  </div>
                  
                  <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-black animate-pulse">
                    {challengeStatus === 'waiting' ? 'READY FOR BATTLE? WAITING FOR RIVAL...' : 'CONNECT WITH RIVALS IN REAL-TIME'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {users.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "flex items-center justify-between p-4 rounded-3xl glass-card relative overflow-hidden transition-all duration-500",
              user.isUser && "border-neon-green/50 bg-neon-green/5"
            )}
          >
            <div className="flex items-center gap-4 relative z-10 w-full">
              <div className="w-6 flex justify-center">
                {getRankIcon(user.rank)}
              </div>
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs">
                {user.avatar}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm tracking-tight">{user.name}</h4>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-wider font-mono">
                  {new Intl.NumberFormat().format(user.steps)} SATS-EQUIV STEPS
                </p>
              </div>
              
              <button className="p-2 text-white/20 hover:text-neon-green transition-colors">
                <MessageSquare size={16} />
              </button>
            </div>
            
            <motion.div 
              className="h-full bg-neon-green/[0.03] absolute left-0 top-0 transition-all duration-1000" 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((user.steps / 130000) * 100, 100)}%` }}
            />
          </motion.div>
        ))}

        {/* Current User Row */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between p-4 rounded-3xl glass-card border-neon-green/50 bg-neon-green/5 mt-8"
        >
          <div className="flex items-center gap-4 w-full">
            <div className="w-6 flex justify-center">
              <span className="text-[10px] font-black text-neon-green">#142</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-neon-green/30 flex items-center justify-center font-bold text-xs text-neon-green">
              DW
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm tracking-tight text-neon-green">Dreamwaker (You)</h4>
              <p className="text-[10px] text-neon-green/60 font-black uppercase tracking-wider font-mono">
                {new Intl.NumberFormat().format(4200)} STEPS TODAY
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
