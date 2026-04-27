import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Coins, Bitcoin, Wallet, X, Loader2 } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import { createWithdrawal } from '../../services/firebase';

interface WalletCardProps {
  balance: number;
  onWithdraw: (amount: number, address: string) => void;
}

export default function WalletCard({ balance, onWithdraw }: WalletCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!address) {
      alert("Please enter a valid BTC address");
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(async () => {
      onWithdraw(500, address); // Fixed amount for now as per "Withdraw to PayPal" replacement logic
      setIsModalOpen(false);
      setAddress('');
      setLoading(false);
      alert("Withdrawal Initiated! 500 SATS will be sent to " + address);
    }, 2000);
  };

  return (
    <div className="relative overflow-hidden mb-8">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 blur-[60px] -z-10 rounded-full" />
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-8 border-neon-green/20"
      >
        <div className="flex justify-between items-start mb-10">
          <div>
            <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block font-mono">Rewards Balance (SATS)</span>
            <div className="flex items-end gap-2">
              <h2 className="text-5xl font-black tracking-tighter neon-glow">{formatNumber(balance)}</h2>
              <span className="text-neon-green font-black pb-1.5 text-sm tracking-tight text-xs">SATS</span>
            </div>
            <p className="text-[10px] text-white/30 mt-2 font-bold uppercase tracking-widest italic">≈ {(balance * 0.0006).toFixed(4)} USD • SECURE LEDGER</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="p-4 bg-neon-green/10 rounded-2xl border border-neon-green/20"
          >
            <Coins className="text-neon-green" size={28} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary w-full py-4 text-sm uppercase tracking-tight flex items-center justify-center gap-3"
          >
            <Bitcoin size={20} className="fill-current" />
            Withdraw to Bitcoin
          </button>
        </div>
      </motion.div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm glass-card p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-xl uppercase italic tracking-tight">Withdraw SATS</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Amount to Withdraw</p>
                    <p className="text-lg font-black text-neon-green">500 <span className="text-xs">SATS</span></p>
                  </div>
                  <Coins className="text-neon-green" size={24} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Bitcoin Address (Lightning/On-chain)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="bc1q..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs font-mono focus:outline-none focus:border-neon-green/50 transition-all pl-12"
                    />
                    <Wallet size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  </div>
                </div>

                <button 
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="w-full btn-primary py-4 text-sm uppercase tracking-tight flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Bitcoin size={18} className="fill-current" />}
                  Confirm Withdrawal
                </button>
                <p className="text-[10px] text-center text-white/20 font-bold uppercase tracking-wider">Payments are processed within 24 hours.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Withdrawal Progress */}
      <div className="mt-4 px-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Network Confirmation Status</span>
          <span className="text-[10px] text-neon-green font-bold">Live Synced</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="h-full bg-neon-green shadow-[0_0_15px_rgba(57,255,20,0.5)]"
          />
        </div>
      </div>
    </div>
  );
}
