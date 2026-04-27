import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, ArrowLeft, Gamepad2, Timer, Zap, Coins, Bitcoin } from 'lucide-react';
import { Card, createDeck, seededShuffle, getSuitSymbol, getColor, RANKS } from './PlayingCard';
import { socketService } from '../../services/socket';
import confetti from 'canvas-confetti';

interface SolitaireGameProps {
  mode: 'solo' | 'multi';
  config?: { roomId: string, betAmount: number, seed: string };
  onBack: () => void;
  onWin: (amount: number) => void;
}

interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
}

export default function SolitaireGame({ mode, config, onBack, onWin }: SolitaireGameProps) {
  const [state, setState] = useState<GameState | null>(null);
  const [history, setHistory] = useState<GameState[]>([]);
  const [selected, setSelected] = useState<{ type: string, index: number, cardIndex?: number } | null>(null);
  const [opponentScore, setOpponentScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // Helper to save state for undo
  const saveHistory = (currentState: GameState) => {
    setHistory(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(currentState))]);
  };

  const undoMove = () => {
    if (history.length === 0 || isGameOver) return;
    const previousState = history[history.length - 1];
    setState(previousState);
    setHistory(prev => prev.slice(0, -1));
    setSelected(null);
  };

  // Initialize Game
  useEffect(() => {
    const deck = createDeck();
    const shuffled = config ? seededShuffle([...deck], config.seed) : seededShuffle([...deck], Math.random().toString());
    
    const tableau: Card[][] = [[], [], [], [], [], [], []];
    let cardIdx = 0;
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = shuffled[cardIdx++];
        card.isFaceUp = (j === i);
        tableau[i].push(card);
      }
    }

    setState({
      stock: shuffled.slice(cardIdx),
      waste: [],
      foundations: [[], [], [], []],
      tableau
    });
    setHistory([]);

    const timer = setInterval(() => setGameTime(prev => prev + 1), 1000);

    if (mode === 'multi') {
      socketService.on('opponent_score', ({ score }) => setOpponentScore(score));
      socketService.on('game_over', ({ winnerId }) => {
        setIsGameOver(true);
        setWinner(winnerId === socketService.getSocket()?.id ? 'YOU' : 'OPPONENT');
      });
    }

    return () => {
      clearInterval(timer);
      socketService.off('opponent_score');
      socketService.off('game_over');
    };
  }, [mode, config]);

  // Score calculation
  const score = state ? state.foundations.reduce((acc, f) => acc + f.length * 100, 0) : 0;

  useEffect(() => {
    if (mode === 'multi' && config) {
      socketService.emit('update_score', { roomId: config.roomId, score });
    }
  }, [score, mode, config]);

  const drawCard = () => {
    if (!state) return;
    saveHistory(state);
    const newState = { ...state };
    if (newState.stock.length === 0) {
      newState.stock = [...newState.waste].reverse().map(c => ({ ...c, isFaceUp: false }));
      newState.waste = [];
    } else {
      const card = newState.stock.pop()!;
      card.isFaceUp = true;
      newState.waste.push(card);
    }
    setState(newState);
    setSelected(null);
  };

  const handleCardClick = (type: string, pileIndex: number, cardIndex?: number) => {
    if (!state || isGameOver) return;

    // Logic for selecting source
    if (!selected) {
      if (type === 'waste' && state.waste.length > 0) {
        setSelected({ type: 'waste', index: 0 });
      } else if (type === 'tableau') {
        const column = state.tableau[pileIndex];
        if (column.length > 0 && typeof cardIndex === 'number' && column[cardIndex].isFaceUp) {
          setSelected({ type: 'tableau', index: pileIndex, cardIndex });
        }
      }
      return;
    }

    // Logic for moving to destination
    const moveSource = () => {
      let cardsToMove: Card[] = [];
      if (selected.type === 'waste') {
        cardsToMove = [state.waste[state.waste.length - 1]];
      } else if (selected.type === 'tableau' && typeof selected.cardIndex === 'number') {
        cardsToMove = state.tableau[selected.index].slice(selected.cardIndex);
      }
      return cardsToMove;
    };

    const cleanupSource = (newState: GameState) => {
      if (selected.type === 'waste') {
        newState.waste.pop();
      } else if (selected.type === 'tableau') {
        newState.tableau[selected.index].splice(selected.cardIndex!);
        // Flip the new top card
        const col = newState.tableau[selected.index];
        if (col.length > 0) col[col.length - 1].isFaceUp = true;
      }
    };

    const newState = JSON.parse(JSON.stringify(state)) as GameState;
    const cards = moveSource();

    if (type === 'foundation') {
      const targetPile = newState.foundations[pileIndex];
      const card = cards[0];
      if (cards.length === 1) {
        const isValid = (targetPile.length === 0 && card.rank === 'A') || 
                      (targetPile.length > 0 && 
                       RANKS.indexOf(card.rank) === RANKS.indexOf(targetPile[targetPile.length - 1].rank) + 1 &&
                       card.suit === targetPile[targetPile.length - 1].suit);
        
        if (isValid) {
          saveHistory(state);
          targetPile.push(card);
          cleanupSource(newState);
          setState(newState);
          checkWin(newState);
        }
      }
    } else if (type === 'tableau') {
      const targetCol = newState.tableau[pileIndex];
      const card = cards[0];
      const isValid = (targetCol.length === 0 && card.rank === 'K') ||
                    (targetCol.length > 0 && 
                     RANKS.indexOf(card.rank) === RANKS.indexOf(targetCol[targetCol.length - 1].rank) - 1 &&
                     ((card.suit === 'hearts' || card.suit === 'diamonds') !== 
                      (targetCol[targetCol.length - 1].suit === 'hearts' || targetCol[targetCol.length - 1].suit === 'diamonds')));
      
      if (isValid) {
        saveHistory(state);
        newState.tableau[pileIndex].push(...cards);
        cleanupSource(newState);
        setState(newState);
      }
    }

    setSelected(null);
  };

  const checkWin = (currentState: GameState) => {
    const isWin = currentState.foundations.every(f => f.length === 13);
    if (isWin) {
      if (mode === 'multi' && config) {
        socketService.emit('game_won', { roomId: config.roomId });
      } else {
        setIsGameOver(true);
        setWinner('YOU');
        confetti();
        onWin(50); // Small reward for solo win
      }
    }
  };

  if (!state) return null;

  return (
    <div className="flex flex-col h-full bg-charcoal select-none">
      {/* HUD */}
      <div className="p-4 glass-card border-white/5 flex items-center justify-between mb-8 sticky top-0 z-30 bg-charcoal/90 backdrop-blur-md -mx-2 px-6">
        <div className="flex gap-2">
          <button onClick={onBack} className="p-2.5 glass-card rounded-xl hover:bg-white/10 transition-all active:scale-90 group">
            <ArrowLeft size={18} className="group-hover:text-neon-green transition-colors" />
          </button>
          {history.length > 0 && (
            <button 
              onClick={undoMove}
              className="p-2.5 glass-card rounded-xl hover:bg-white/10 transition-all active:scale-90 group relative"
            >
              <RefreshCw size={18} className="group-hover:text-amber-400 transition-colors" />
              <span className="absolute -top-1 -right-1 bg-amber-500 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-charcoal">
                {history.length}
              </span>
            </button>
          )}
        </div>
        <div className="flex gap-8 items-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 opacity-40 mb-0.5">
              <Timer size={10} />
              <span className="text-[8px] font-black uppercase tracking-widest">Time</span>
            </div>
            <span className="text-sm font-mono font-bold">{Math.floor(gameTime / 60)}:{String(gameTime % 60).padStart(2, '0')}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 opacity-40 mb-0.5">
              <Trophy size={10} />
              <span className="text-[8px] font-black uppercase tracking-widest">Score</span>
            </div>
            <span className="text-sm font-black text-neon-green neon-glow">{score}</span>
          </div>
        </div>
        <div>
          {mode === 'multi' ? (
            <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <Gamepad2 size={14} className="text-red-400" />
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-red-400/60 uppercase tracking-tighter">Opponent</span>
                <span className="text-[10px] font-black text-red-400 leading-none">{opponentScore}</span>
              </div>
            </div>
          ) : (
             <div className="w-10" /> // Spacer for solo mode
          )}
        </div>
      </div>

      {/* Play Area */}
      <div className="flex-1 px-2 relative custom-scrollbar">
        {/* Top Section: Stock, Waste, Foundations */}
        <div className="flex justify-between gap-1 h-24 mb-12 relative z-20">
            <div className="flex gap-2 w-[35%]">
              {/* Stock */}
              <div 
                onClick={drawCard}
                className={`w-[45%] aspect-[2/3] max-h-24 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                  state.stock.length > 0 ? 'bg-indigo-950/20 border-indigo-400/30' : 'bg-white/5 border-white/10 opacity-20'
                }`}
              >
                {state.stock.length > 0 ? (
                  <div className="w-full h-full bg-[#3D2B56] rounded-lg border-2 border-indigo-400/50 shadow-lg flex flex-col items-center justify-center overflow-hidden p-1 relative group">
                    <div className="absolute inset-0 bg-indigo-900/20 mix-blend-overlay" />
                    <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-inner relative z-10 mb-1">
                      <Bitcoin size={16} className="text-charcoal fill-current" />
                    </div>
                    <span className="text-[6px] font-black text-amber-400/80 uppercase tracking-widest leading-none text-center relative z-10">DREAM X</span>
                    {/* Grid pattern on back */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-5 gap-1 opacity-5 pointer-events-none p-1">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <Bitcoin key={i} size={4} className="text-white fill-current" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <RefreshCw size={16} className="text-white/20" />
                )}
              </div>

              {/* Waste */}
              <div 
                className={`w-[45%] aspect-[2/3] max-h-24 rounded-xl border-2 border-white/5 bg-white/[0.02] flex items-center justify-center relative ${
                  selected?.type === 'waste' ? 'ring-2 ring-neon-green scale-105 z-10 shadow-[0_0_20px_rgba(57,255,20,0.4)]' : ''
                }`}
                onClick={() => handleCardClick('waste', 0)}
              >
                {state.waste.length > 0 && (
                  <CardView card={state.waste[state.waste.length - 1]} />
                )}
              </div>
            </div>

            <div className="flex gap-1.5 w-[60%] justify-end">
              {state.foundations.map((pile, i) => (
                <div 
                  key={i}
                  onClick={() => handleCardClick('foundation', i)}
                  className={`w-[22%] aspect-[2/3] max-h-24 rounded-xl border-2 flex items-center justify-center transition-all ${
                    selected ? 'border-neon-green/40 bg-neon-green/5' : 'border-white/5 bg-white/[0.01]'
                  }`}
                >
                  {pile.length > 0 ? (
                    <CardView card={pile[pile.length - 1]} />
                  ) : (
                    <div className="flex flex-col items-center gap-1 opacity-10">
                      <span className="text-xl font-bold leading-none">{['♥', '♦', '♣', '♠'][i]}</span>
                      <span className="text-[6px] font-black uppercase tracking-tighter">Foundation</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
        </div>

        {/* Tableau */}
        <div className="grid grid-cols-7 gap-1 px-1 pb-24">
          {state.tableau.map((col, i) => (
            <div 
              key={i} 
              className="flex flex-col min-h-[150px] cursor-pointer" 
              onClick={() => col.length === 0 && handleCardClick('tableau', i)}
            >
              {col.length === 0 && (
                <div className="w-full aspect-[2/3] rounded-lg border-2 border-white/5 bg-white/[0.01]" />
              )}
              {col.map((card, j) => (
                <div 
                  key={card.id}
                  style={{ marginTop: j > 0 ? '-35px' : '0' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick('tableau', i, j);
                  }}
                  className={`transition-all ${
                    selected?.type === 'tableau' && selected.index === i && j >= selected.cardIndex! 
                    ? 'translate-y-2 brightness-125 z-20' : ''
                  }`}
                >
                  <CardView card={card} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-charcoal/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-12 w-full max-w-sm text-center border-neon-green/20"
            >
              <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} className="text-neon-green neon-glow" />
              </div>
              <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter mb-2">
                GAME <span className="text-neon-green">OVER</span>
              </h2>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black mb-8">
                {winner === 'YOU' ? 'VICTORY SECURED' : 'BET LOST'}
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center glass-card p-4 bg-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Your Score</span>
                  <span className="text-lg font-black text-neon-green">{score}</span>
                </div>
                {mode === 'multi' && (
                  <div className="flex justify-between items-center glass-card p-4 bg-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Opponent</span>
                    <span className="text-lg font-black text-red-400">{opponentScore}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={onBack}
                className="w-full btn-primary p-5 rounded-2xl mt-8 uppercase tracking-[0.2em] font-black italic flex items-center justify-center gap-2"
              >
                Return to Lobby
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CardView({ card }: { card: Card }) {
  if (!card.isFaceUp) {
    return (
      <div className="w-full h-full bg-[#2D1E42] rounded-xl border-2 border-indigo-500/40 shadow-lg flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-indigo-900/10 mix-blend-overlay" />
        <div className="relative flex flex-col items-center z-10">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg mb-1.5 border border-white/20">
            <Bitcoin size={18} className="text-charcoal fill-current" />
          </div>
          <span className="text-[7px] font-black text-amber-400 uppercase tracking-[0.2em] leading-none text-center drop-shadow-md">DREAM X</span>
        </div>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-4 grid-rows-5 gap-1.5 p-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <Bitcoin key={i} size={6} className="text-white fill-current" />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
    );
  }

  const symbol = getSuitSymbol(card.suit);
  const colorClass = getColor(card.suit);

  return (
    <div className={`w-full aspect-[2/3] bg-white rounded-xl border border-zinc-200 shadow-xl p-1.5 flex flex-col justify-between relative overflow-hidden transition-all group-hover:border-neon-green/40 group-hover:shadow-2xl`}>
      <div className={`flex flex-col leading-none ${colorClass} z-10`}>
        <span className="text-[15px] font-black tracking-tighter">{card.rank}</span>
        <span className="text-[12px] leading-tight mb-1">{symbol}</span>
      </div>
      
      <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none ${colorClass} opacity-80`}>
        <span className="text-3xl font-bold mb-1">{symbol}</span>
        <div className="flex items-center gap-1.5 opacity-20">
          <Bitcoin size={10} className="fill-current" />
          <span className="text-[5px] font-black tracking-widest uppercase">Dream X</span>
        </div>
      </div>

      <div className={`flex flex-col items-end leading-none rotate-180 self-end ${colorClass} z-10`}>
        <span className="text-[15px] font-black tracking-tighter">{card.rank}</span>
        <span className="text-[12px] leading-tight mb-1">{symbol}</span>
      </div>
      
      {/* Subtle texture for white card */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-100/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 transition-opacity" />
    </div>
  );
}
