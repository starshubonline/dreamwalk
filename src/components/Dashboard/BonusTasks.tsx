import React, { useState } from 'react';
import { Play, Calendar, Zap, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface BonusTasksProps {
  onReward: (amount: number) => void;
}

export default function BonusTasks({ onReward }: BonusTasksProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [claimedTasks, setClaimedTasks] = useState<string[]>(['checkin']);

  const tasks = [
    { 
      id: 'ad', 
      title: 'Watch Ad', 
      desc: '+10 Satoshi (SATS)', 
      icon: Play, 
      color: 'bg-neon-green/20 text-neon-green',
      reward: 10
    },
    { 
      id: 'checkin', 
      title: 'Daily Check-in', 
      desc: 'Day 4 Streak', 
      icon: Calendar, 
      color: 'bg-blue-500/20 text-blue-500',
      reward: 50
    },
    { 
      id: 'boost', 
      title: 'X2 Booster', 
      desc: 'Next 30 mins', 
      icon: Zap, 
      color: 'bg-orange-500/20 text-orange-500',
      reward: 0
    },
  ];

  const handleTask = (task: any) => {
    if (claimedTasks.includes(task.id) && task.id !== 'ad') return;
    
    setLoadingId(task.id);
    
    // Simulate task action (e.g. watching ad)
    setTimeout(() => {
      setLoadingId(null);
      if (task.reward > 0) {
        onReward(task.reward);
      }
      
      if (task.id !== 'ad') {
        setClaimedTasks(prev => [...prev, task.id]);
      }
      
      if (task.id === 'ad') {
        alert("Ad watched! 10 SATS added to your wallet.");
      } else if (task.id === 'boost') {
        alert("X2 Booster activated for 30 minutes!");
      }
    }, task.id === 'ad' ? 3000 : 1000);
  };

  return (
    <div className="space-y-4 my-8">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2 px-1">Active Bonus Tasks</h3>
      {tasks.map((task, i) => {
        const isLoading = loadingId === task.id;
        const isClaimed = claimedTasks.includes(task.id);
        
        return (
          <motion.div
            key={task.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="glass-card p-5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${task.color} ${isLoading ? 'animate-pulse scale-90' : ''}`}>
                <task.icon size={20} className={isLoading ? 'animate-spin' : ''} />
              </div>
              <div>
                <h4 className="font-black text-sm tracking-tight">{task.title}</h4>
                <p className="text-[10px] uppercase font-bold text-white/30 tracking-wider font-mono">{task.desc}</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleTask(task)}
              disabled={isLoading || (isClaimed && task.id !== 'ad')}
              className={cn(
                "text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-2",
                isLoading ? "bg-white/5 text-white/20" :
                (isClaimed && task.id !== 'ad') ? "bg-neon-green/10 text-neon-green border border-neon-green/20" :
                "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Processing
                </>
              ) : (isClaimed && task.id !== 'ad') ? (
                <>
                  <CheckCircle size={12} />
                  Claimed
                </>
              ) : task.id === 'ad' ? 'Watch' : 'Claim'}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
