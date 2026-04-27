import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Users, Trophy, Play, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { socketService } from '../../services/socket';

interface SolitaireLobbyProps {
  onStartGame: (mode: 'solo' | 'multi', config?: { roomId: string, betAmount: number, seed: string }) => void;
  onBack: () => void;
  balance: number;
}

export default function SolitaireLobby({ onStartGame, onBack, balance }: SolitaireLobbyProps) {
  const [mode, setMode] = useState<'selection' | 'joining'>('selection');
  const [roomId, setRoomId] = useState('');
  const [betAmount, setBetAmount] = useState(100);
  const [status, setStatus] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<any>(null);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('room_updated', (data) => {
      setRoomData(data);
      setStatus(`Room ${data.id}: ${data.players.length}/2 players. Waiting for opponent...`);
    });

    socket.on('game_start', (data) => {
      setStatus('Game Starting!');
      setTimeout(() => {
        onStartGame('multi', { roomId, betAmount, seed: data.deckSeed });
      }, 1000);
    });

    socket.on('error', (msg) => {
      alert(msg);
      setMode('selection');
      setStatus(null);
    });

    return () => {
      socket.off('room_updated');
      socket.off('game_start');
      socket.off('error');
    };
  }, [roomId, betAmount, onStartGame]);

  const handleJoinRoom = () => {
    if (!roomId) return;
    if (balance < betAmount) {
      alert("Insufficient balance for this bet!");
      return;
    }
    setMode('joining');
    setStatus('Connecting to room...');
    socketService.emit('join_room', { roomId, playerName: 'Player', betAmount });
  };

  const handleReady = () => {
    socketService.emit('player_ready', { roomId });
    setStatus('Ready! Waiting for opponent...');
  };

  return (
    <div className="flex flex-col items-center pb-20">
      <div className="w-full flex items-center justify-between mb-8 sticky top-0 z-30 bg-charcoal/90 backdrop-blur-md py-4 px-2 -mx-2 border-b border-white/5">
        <button onClick={onBack} className="p-3 glass-card rounded-2xl hover:bg-white/10 transition-all hover:scale-110 active:scale-95 group">
          <ArrowLeft size={20} className="group-hover:text-neon-green transition-colors" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-display font-black uppercase italic tracking-tighter leading-none">
            SOLITAIRE <span className="text-neon-green neon-glow">ARENA</span>
          </h2>
          <p className="text-[8px] text-white/30 uppercase tracking-[0.3em] mt-1 font-black">Powered by Dream Waker</p>
        </div>
        <div className="bg-neon-green/10 px-4 py-2 rounded-2xl border border-neon-green/20 shadow-[0_0_15px_rgba(57,255,20,0.05)]">
          <p className="text-[12px] font-black text-neon-green uppercase tracking-widest leading-none">{balance} SATS</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'selection' ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full space-y-6 relative"
          >
            {/* Background decorative glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-neon-green/5 blur-[100px] pointer-events-none rounded-full" />
            {/* Solo Mode */}
            <div 
              onClick={() => onStartGame('solo')}
              className="glass-card p-6 border-white/5 hover:border-neon-green/30 transition-all cursor-pointer group relative overflow-hidden active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-green/[0.03] to-transparent" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tight group-hover:text-neon-green transition-colors">Classic Mode</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-bold">Standard rules • Casual Play</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-neon-green/20 transition-all group-hover:shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                  <Play size={24} className="text-white group-hover:text-neon-green transition-all group-hover:scale-110" />
                </div>
              </div>
            </div>

            <div className="relative py-4 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Competitive Arena</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Multiplayer Selection */}
            <div className="glass-card p-8 border-neon-green/10 bg-neon-green/[0.02]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-neon-green/20 rounded-lg">
                  <Zap size={20} className="text-neon-green" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tight text-neon-green">Multiplayer Bet</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Challenge players worldwide</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2 block">Room Identity</label>
                  <input 
                    type="text" 
                    placeholder="ENTER ROOM CODE"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    className="w-full bg-charcoal border border-white/10 rounded-2xl p-4 text-sm font-bold tracking-widest uppercase focus:outline-none focus:border-neon-green transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2 block">Wager Amount (Sats)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000].map(val => (
                      <button 
                        key={val}
                        onClick={() => setBetAmount(val)}
                        className={`p-3 rounded-xl border text-[11px] font-black transition-all ${
                          betAmount === val 
                            ? 'bg-neon-green text-charcoal border-neon-green' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleJoinRoom}
                  disabled={!roomId}
                  className="w-full btn-primary p-5 rounded-2xl mt-4 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Users size={18} />
                  <span className="uppercase tracking-widest font-black italic">Enter Arena</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="joining"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full glass-card p-12 flex flex-col items-center justify-center space-y-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-neon-green/30 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Users size={32} className="text-neon-green animate-pulse" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter mb-2">Finding <span className="text-neon-green">Opponent</span></h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black animate-pulse">{status}</p>
            </div>

            {roomData && roomData.players.find((p: any) => p.id === socketService.getSocket()?.id && !p.ready) && (
              <button 
                onClick={handleReady}
                className="btn-primary px-12 py-4 rounded-full uppercase tracking-[0.2em] font-black italic flex items-center gap-2"
              >
                <Sparkles size={18} />
                I AM READY
              </button>
            )}

            <div className="w-full flex gap-4 pt-4">
              {roomData?.players.map((p: any) => (
                <div key={p.id} className="flex-1 glass-card p-4 border-white/5 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${p.ready ? 'bg-neon-green text-charcoal' : 'bg-white/5 text-white/40'}`}>
                    <Trophy size={14} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">{p.id === socketService.getSocket()?.id ? 'YOU' : 'OPPONENT'}</p>
                  <p className={`text-[8px] font-black uppercase tracking-tighter ${p.ready ? 'text-neon-green' : 'text-white/20'}`}>
                    {p.ready ? 'READY' : 'WAITING'}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
