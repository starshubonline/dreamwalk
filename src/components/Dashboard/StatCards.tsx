import React from 'react';
import { Flame, MapPin, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function StatCards() {
  const stats = [
    { icon: Flame, value: '452', label: 'kcal', color: 'text-orange-500' },
    { icon: MapPin, value: '3.2', label: 'km', color: 'text-blue-500' },
    { icon: Clock, value: '42', label: 'min', color: 'text-neon-green' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 my-6">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 * i }}
          className="glass-card p-5 flex flex-col items-center gap-1 border-white/5"
        >
          <stat.icon size={18} className={stat.color} />
          <span className="text-xl font-black tracking-tight">{stat.value}</span>
          <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
