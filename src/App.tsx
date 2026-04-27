import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import StepCounter from './components/Dashboard/StepCounter';
import StatCards from './components/Dashboard/StatCards';
import BonusTasks from './components/Dashboard/BonusTasks';
import WalletCard from './components/Wallet/WalletCard';
import TransactionHistory, { Transaction } from './components/Wallet/TransactionHistory';
import Leaderboard from './components/Social/Leaderboard';
import WorkoutGenerator from './components/AI/WorkoutGenerator';
import SolitaireLobby from './components/Solitaire/SolitaireLobby';
import SolitaireGame from './components/Solitaire/SolitaireGame';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, CreditCard, ArrowUpRight, Footprints, Play, Trophy } from 'lucide-react';
import { getMotivationalQuote } from './services/gemini';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [steps, setSteps] = useState(4200);
  const [balance, setBalance] = useState(1284);
  const [quote, setQuote] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<'lobby' | 'active'>('lobby');
  const [gameConfig, setGameConfig] = useState<any>(null);
  const [gameMode, setGameMode] = useState<'solo' | 'multi'>('solo');

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: 'reward', title: 'Daily Steps Reward', amount: 45, date: 'Today, 2:42 PM', icon: Footprints, color: 'text-neon-green' },
    { id: 2, type: 'bonus', title: 'Ad Reward Bonus', amount: 10, date: 'Today, 1:15 PM', icon: Play, color: 'text-blue-400' },
    { id: 3, type: 'withdrawal', title: 'Withdrawal to Bitcoin', amount: -500, date: 'Yesterday, 8:12 PM', icon: ArrowUpRight, color: 'text-red-400', status: 'completed' },
    { id: 4, type: 'reward', title: 'Daily Steps Reward', amount: 38, date: 'Yesterday, 6:00 PM', icon: Footprints, color: 'text-neon-green' },
  ]);

  const addSats = (amount: number) => {
    setBalance(prev => prev + amount);
    const newTx: Transaction = {
      id: Date.now(),
      type: amount > 10 ? 'reward' : 'bonus',
      title: amount > 10 ? 'System Reward' : 'Ad Reward Bonus',
      amount: amount,
      date: 'Just now',
      icon: amount > 10 ? Footprints : Play,
      color: amount > 10 ? 'text-neon-green' : 'text-blue-400'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleWithdraw = (amount: number, address: string) => {
    setBalance(prev => prev - amount);
    const newTx: Transaction = {
      id: Date.now(),
      type: 'withdrawal',
      title: 'Bitcoin Withdrawal',
      amount: -amount,
      date: 'Just now',
      icon: ArrowUpRight,
      color: 'text-red-400',
      status: 'pending'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Simulate step tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setSteps(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch motivational quote
  useEffect(() => {
    getMotivationalQuote().then(setQuote).catch(() => setQuote("Keep moving, keep dreaming."));
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {quote && (
              <div className="mt-4 glass-card p-5 flex items-center gap-4 border-neon-green/10 bg-neon-green/[0.02]">
                <Sparkles size={20} className="text-neon-green shrink-0 drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]" />
                <p className="text-[11px] font-black leading-relaxed text-white/60 uppercase tracking-[0.1em] italic">"{quote}"</p>
              </div>
            )}
            <StepCounter steps={steps} goal={10000} />
            <StatCards />
            <BonusTasks onReward={addSats} />
          </motion.div>
        );
      case 'leaderboard':
        return (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Leaderboard />
          </motion.div>
        );
      case 'ai':
        return (
          <motion.div
            key="ai"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <WorkoutGenerator />
          </motion.div>
        );
      case 'games':
        return (
          <motion.div
            key="games"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-[calc(100vh-180px)] overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-10">
              {gamePhase === 'lobby' ? (
                <SolitaireLobby 
                  balance={balance}
                  onBack={() => setActiveTab('home')}
                  onStartGame={(mode, config) => {
                    setGameMode(mode);
                    setGameConfig(config);
                    setGamePhase('active');
                    if (config && mode === 'multi') {
                      setBalance(prev => prev - config.betAmount);
                    }
                  }}
                />
              ) : (
                <SolitaireGame 
                  mode={gameMode}
                  config={gameConfig}
                  onBack={() => setGamePhase('lobby')}
                  onWin={(amount) => {
                    const finalAmount = gameMode === 'multi' ? (gameConfig?.betAmount * 2) : amount;
                    setBalance(prev => prev + finalAmount);
                    setTransactions(prev => [{
                      id: Date.now(),
                      type: 'reward',
                      title: `Solitaire ${gameMode === 'multi' ? 'Arena' : 'Solo'} Win`,
                      amount: finalAmount,
                      date: 'Just now',
                      icon: Trophy,
                      color: 'text-neon-green'
                    }, ...prev]);
                  }}
                />
              )}
            </div>
          </motion.div>
        );
      case 'wallet':
        return (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-display font-bold tracking-tighter mb-4 uppercase italic">YOUR <span className="text-neon-green">WALLET</span></h2>
            <WalletCard balance={balance} onWithdraw={handleWithdraw} />
            <TransactionHistory transactions={transactions} />
          </motion.div>
        );
      case 'profile':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-8 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-neon-green/20 border-2 border-neon-green animate-pulse absolute inset-0 blur-xl" />
              <div className="w-24 h-24 rounded-full glass-card border-2 border-neon-green flex items-center justify-center relative bg-charcoal overflow-hidden p-0.5">
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                  <span className="text-3xl font-display font-black text-neon-green neon-glow italic">DW</span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-neon-green text-charcoal p-1.5 rounded-full border-4 border-charcoal">
                <Zap size={14} className="fill-current" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-display font-black tracking-tighter uppercase italic">DREAM WAKER</h2>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-2 bg-white/5 py-1 px-3 rounded-full border border-white/5 inline-block">CORE MEMBER • LVL 12</p>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-4 mt-4">
              <div className="glass-card p-4 text-center">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Rank</p>
                <p className="text-lg font-black text-neon-green">#142</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Efficiency</p>
                <p className="text-lg font-black text-blue-400">92%</p>
              </div>
            </div>

            <div className="w-full space-y-3">
              {[
                { label: 'Profile Settings', action: () => alert("Settings updated successfully!") },
                { label: 'Health Connections', action: () => alert("Google Fit and Apple Health synchronized.") },
                { label: 'Notifications', action: () => alert("2 unread reward notifications.") },
                { label: 'Security & Keys', action: () => alert("Private keys encrypted.") },
                { label: 'Logout', action: () => window.location.reload() }
              ].map((item) => (
                <button 
                  key={item.label} 
                  onClick={item.action}
                  className="w-full glass-card p-5 rounded-3xl text-left text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all border border-white/5 flex justify-between items-center group"
                >
                  {item.label}
                  <Sparkles size={14} className="text-white/10 group-hover:text-neon-green transition-colors" />
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </Layout>
  );
}
