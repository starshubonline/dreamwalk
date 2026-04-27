import React from 'react';
import { motion } from 'motion/react';
import { Footprints, Play, ArrowUpRight, Clock } from 'lucide-react';
import { formatNumber, cn } from '../../lib/utils';

export interface Transaction {
  id: string | number;
  type: 'reward' | 'bonus' | 'withdrawal';
  title: string;
  amount: number;
  date: string;
  icon: any;
  color: string;
  status?: 'pending' | 'completed';
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
}

export default function TransactionHistory({ transactions: propTransactions }: TransactionHistoryProps) {
  const defaultTransactions: Transaction[] = [
    { id: 1, type: 'reward', title: 'Daily Steps Reward', amount: 45, date: 'Today, 2:42 PM', icon: Footprints, color: 'text-neon-green' },
    { id: 2, type: 'bonus', title: 'Ad Reward Bonus', amount: 10, date: 'Today, 1:15 PM', icon: Play, color: 'text-blue-400' },
    { id: 3, type: 'withdrawal', title: 'Withdrawal to Bitcoin', amount: -500, date: 'Yesterday, 8:12 PM', icon: ArrowUpRight, color: 'text-red-400', status: 'completed' },
    { id: 4, type: 'reward', title: 'Daily Steps Reward', amount: 38, date: 'Yesterday, 6:00 PM', icon: Footprints, color: 'text-neon-green' },
  ];

  const transactions = propTransactions || defaultTransactions;

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2 px-1 text-xs">Lightning Ledger</h3>
      {transactions.map((tx, i) => (
        <motion.div
          key={tx.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center justify-between p-5 glass-card relative overflow-hidden"
        >
          {tx.status === 'pending' && (
            <div className="absolute top-0 right-0 px-2 py-1 bg-yellow-500/20 text-yellow-500 text-[8px] font-black uppercase tracking-tighter rounded-bl-lg flex items-center gap-1 border-l border-b border-yellow-500/30">
              <Clock size={8} className="animate-pulse" />
              Processing
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 ${tx.color}`}>
              <tx.icon size={20} />
            </div>
            <div>
              <h4 className="font-black text-sm tracking-tight">{tx.title}</h4>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest font-mono">{tx.date}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={cn(
              "font-display font-black text-lg tracking-tighter",
              tx.amount > 0 ? "text-neon-green neon-glow" : (tx.status === 'pending' ? "text-white/60" : "text-red-500")
            )}>
              {tx.amount > 0 ? '+' : ''}{formatNumber(tx.amount)}
            </span>
            <p className="text-[10px] text-white/40 font-black tracking-widest uppercase">SATS</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
