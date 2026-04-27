import React from 'react';
import { motion } from 'motion/react';
import { Footprints } from 'lucide-react';
import { formatNumber } from '../../lib/utils';

interface StepCounterProps {
  steps: number;
  goal: number;
}

export default function StepCounter({ steps, goal }: StepCounterProps) {
  const percentage = Math.min((steps / goal) * 100, 100);
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center my-10 min-h-[300px]">
      {/* Background Gradient Effect from Palette */}
      <div className="absolute inset-0 opacity-20 pointer-events-none rounded-full blur-[100px]" 
           style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #39FF14 0%, transparent 70%)' }}></div>

      {/* Circle Background */}
      <svg className="w-72 h-72 progress-ring">
        <circle
          cx="144"
          cy="144"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-zinc-900"
        />
        <motion.circle
          cx="144"
          cy="144"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-neon-green drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]"
          strokeLinecap="round"
        />
      </svg>

      {/* Stats Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <span className="text-white/40 text-sm font-bold uppercase tracking-[0.2em] mb-1">
            Steps
          </span>
          <span className="text-6xl font-display font-black tracking-tighter">
            {formatNumber(steps)}
          </span>
          <div className="h-[2px] w-12 bg-zinc-800 my-3" />
          <span className="text-white/40 text-sm font-bold uppercase tracking-wider">
            Goal: {formatNumber(goal)}
          </span>
        </motion.div>
      </div>

      {/* Daily Reward Badge */}
      <div className="absolute -bottom-2 glass-card px-4 py-2 border-neon-green/30">
        <span className="text-[10px] font-black text-neon-green flex items-center gap-2 uppercase tracking-widest">
          <span className="flex h-2 w-2 rounded-full bg-neon-green animate-pulse" />
          EARNING 2.4X MULTIPLIER
        </span>
      </div>
    </div>
  );
}
