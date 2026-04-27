import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { generateWorkoutPlan } from '../../services/gemini';

export default function WorkoutGenerator() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const goals = ['Weight Loss', 'Muscle Gain', 'Endurance', 'General Fitness'];

  const [level, setLevel] = useState('Beginner');
  const [goal, setGoal] = useState('General Fitness');

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateWorkoutPlan(level, goal, 'Home based, no equipment');
    setPlan(result);
    setLoading(false);
  };

  return (
    <div className="py-4 space-y-6">
      <div className="glass-card p-8 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="text-neon-green" size={20} />
          <h2 className="text-2xl font-display font-black tracking-tighter uppercase italic">AI COACH</h2>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] mb-3 block px-1">Training Level</label>
            <div className="grid grid-cols-3 gap-2">
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${level === l ? 'bg-neon-green text-black border-neon-green' : 'bg-zinc-900 text-white/40 border border-zinc-800 hover:bg-zinc-800'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] mb-3 block px-1">Wellness Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {goals.map(g => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${goal === g ? 'bg-neon-green text-black border-neon-green' : 'bg-zinc-900 text-white/40 border border-zinc-800 hover:bg-zinc-800'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-primary py-5 text-sm uppercase tracking-tight flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} className="fill-current" />}
            Generate Coach Protocol
          </button>
        </div>
      </div>

      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card p-8 space-y-8"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-3xl font-display font-black tracking-tighter leading-tight uppercase italic">{plan.title}</h3>
              <div className="bg-neon-green/10 text-neon-green text-[10px] font-black px-4 py-1.5 rounded-full border border-neon-green/30 tracking-[0.2em]">GENERATED</div>
            </div>
            
            <p className="text-xs text-white/50 leading-relaxed font-medium">{plan.description}</p>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-neon-green tracking-[0.3em] px-1">Workout Protocol</h4>
              {plan.exercises.map((ex: any, i: number) => (
                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-neon-green/20 transition-all">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-neon-green/10 flex items-center justify-center text-neon-green font-black text-sm border border-neon-green/20">
                    {i + 1}
                  </div>
                  <div>
                    <h5 className="font-black text-sm mb-1 tracking-tight">{ex.name}</h5>
                    <div className="flex gap-4 text-[10px] font-black text-white/30 uppercase tracking-widest font-mono">
                      <span>{ex.sets} Sets</span>
                      <span>{ex.reps} Reps</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {plan.nutritionalTips && (
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">Nutrition Advice</h4>
                <ul className="space-y-2">
                  {plan.nutritionalTips.map((tip: string, i: number) => (
                    <li key={i} className="text-xs text-white/60 flex gap-2">
                      <CheckCircle2 size={14} className="text-blue-400 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
