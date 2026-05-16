"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Trophy, Loader2, Crown, Info, LogOut, History, X, Lock } from "lucide-react";

const suitSymbols = { HEARTS: "♥️", SPADES: "♠️", DIAMONDS: "♦️", CLUBS: "♣️" };
const suitColors = { 
  HEARTS: "text-rose-500", 
  DIAMONDS: "text-rose-500", 
  SPADES: "text-slate-900", 
  CLUBS: "text-slate-900" 
};

export default function RoomPage({ params }) {
  const router = useRouter();
  const roomId = params.id;
  const [showTracker, setShowTracker] = useState(false);
  
  const { 
    gameState, playerName, playCard, openHukum, joinTeam, 
    startGame, isConnected, disconnect, error, systemMessage 
  } = useGameStore();

  // --- RECONNECT SYNC ---
  useEffect(() => {
    if (!isConnected) {
      const savedSession = sessionStorage.getItem("cassata_session");
      if (savedSession) {
        const { roomId: savedRoom, playerName: savedName } = JSON.parse(savedSession);
        if (savedRoom === roomId) {
          useGameStore.getState().connect(savedRoom, savedName);
          return;
        }
      }
      router.push("/");
    }
  }, [isConnected, router, roomId]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#0a0c14] flex flex-col items-center justify-center text-indigo-500">
        <Loader2 className="animate-spin mb-4" size={56} />
        <h2 className="text-2xl font-black tracking-widest uppercase">Connecting to Arena...</h2>
      </div>
    );
  }

  // --- 1. LOBBY VIEW ---
  if (gameState.status === "WAITING") {
    const t1 = gameState.lobby_teams?.team1 || [];
    const t2 = gameState.lobby_teams?.team2 || [];
    const isHost = gameState.host === playerName;
    const isReady = t1.length === 2 && t2.length === 2;

    return (
      <div className="min-h-screen bg-[#0a0c14] text-white flex flex-col items-center pt-10 px-4 custom-bg-grid">
        <div className="flex items-center gap-6 mb-2">
            <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">{roomId}</h1>
            <button onClick={() => { disconnect(); router.push("/"); }} className="p-3 bg-slate-900 hover:bg-rose-600/20 hover:text-rose-500 rounded-2xl text-slate-500 transition-all">
                <LogOut size={24} />
            </button>
        </div>
        <p className="text-slate-500 mb-12 font-bold tracking-widest uppercase">Select your allegiance</p>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
          {/* Team 1 Card */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border-2 border-indigo-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(99,102,241,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
            <h2 className="text-3xl font-black text-indigo-400 mb-8 text-center tracking-tight">TEAM 1</h2>
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="h-24 rounded-2xl border-2 border-slate-800/80 bg-slate-950/80 flex items-center justify-center gap-3">
                  {t1[i] ? (
                    <><span className="font-black text-2xl uppercase tracking-tighter">{t1[i]}</span> {gameState.host === t1[i] && <Crown size={24} className="text-yellow-400"/>}</>
                  ) : <span className="text-slate-700 font-bold uppercase tracking-widest">Empty Seat</span>}
                </div>
              ))}
            </div>
            <button onClick={() => joinTeam("team1")} disabled={t1.includes(playerName) || t1.length >= 2} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-5 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
              JOIN TEAM 1
            </button>
          </div>

          {/* Team 2 Card */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border-2 border-rose-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(244,63,94,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
            <h2 className="text-3xl font-black text-rose-400 mb-8 text-center tracking-tight">TEAM 2</h2>
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="h-24 rounded-2xl border-2 border-slate-800/80 bg-slate-950/80 flex items-center justify-center gap-3">
                  {t2[i] ? (
                    <><span className="font-black text-2xl uppercase tracking-tighter">{t2[i]}</span> {gameState.host === t2[i] && <Crown size={24} className="text-yellow-400"/>}</>
                  ) : <span className="text-slate-700 font-bold uppercase tracking-widest">Empty Seat</span>}
                </div>
              ))}
            </div>
            <button onClick={() => joinTeam("team2")} disabled={t2.includes(playerName) || t2.length >= 2} className="w-full mt-8 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-5 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
              JOIN TEAM 2
            </button>
          </div>
        </div>

        {isHost && (
          <button onClick={startGame} disabled={!isReady} className={`mt-16 px-20 py-6 rounded-full font-black text-2xl transition-all shadow-2xl tracking-widest ${isReady ? 'bg-green-500 text-slate-950 hover:bg-green-400 hover:scale-110 shadow-[0_0_40px_rgba(34,197,94,0.4)]' : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'}`}>
            {isReady ? "LAUNCH MATCH" : "WAITING FOR ROSTER"}
          </button>
        )}
      </div>
    );
  }

  // --- 2. GAME OVER VIEW ---
  if (gameState.status === "FINISHED") {
    return (
      <div className="min-h-screen bg-[#0a0c14] flex items-center justify-center text-white p-6 custom-bg-grid">
        <motion.div initial={{ scale: 0.8, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-slate-900/90 backdrop-blur-2xl p-16 rounded-[4rem] border-4 border-yellow-500/50 shadow-[0_0_100px_rgba(234,179,8,0.2)] text-center max-w-2xl w-full relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          <Trophy size={100} className="mx-auto text-yellow-400 mb-8 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse" />
          <h1 className="text-7xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">{gameState.match_result.winner.toUpperCase()}</h1>
          <p className="text-3xl text-yellow-500 mb-12 font-black tracking-widest uppercase">Victory: {gameState.match_result.win_type}</p>
          <button onClick={() => { disconnect(); router.push("/"); }} className="w-full bg-white text-slate-950 hover:bg-slate-200 py-6 rounded-2xl font-black text-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl">
            RETURN TO MENU
          </button>
        </motion.div>
      </div>
    );
  }

  // --- 3. ARENA VIEW (THE GAME) ---
  const myIndex = gameState.players.indexOf(playerName);
  const leftPlayer = gameState.players[(myIndex + 1) % 4];
  const topPlayer = gameState.players[(myIndex + 2) % 4]; 
  const rightPlayer = gameState.players[(myIndex + 3) % 4];

  // Flawless Hukum Logic
  const ledSuit = gameState.led_suit;
  const hasLedSuit = ledSuit ? gameState.my_hand.some(c => c.suit === ledSuit) : false;
  const canOpenHukum = gameState.my_turn && ledSuit && !hasLedSuit && !gameState.hukum_status.is_opened;

  const getTablePos = (pid) => {
    if (pid === playerName) return { y: 70, x: 0, rotate: 0 };
    if (pid === leftPlayer) return { y: 0, x: -90, rotate: -90 };
    if (pid === topPlayer) return { y: -70, x: 0, rotate: 180 };
    if (pid === rightPlayer) return { y: 0, x: 90, rotate: 90 };
    return { x: 0, y: 0 };
  };

  return (
    <main className="min-h-screen bg-[#07090f] text-slate-200 overflow-hidden flex flex-col relative select-none">
      
      {/* TOAST ALERTS */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-4 items-center w-full px-4">
        <AnimatePresence>
          {error && (
            <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="bg-rose-600/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-black shadow-[0_10px_40px_rgba(225,29,72,0.4)] flex items-center gap-3 border border-rose-500 uppercase tracking-wide">
              <ShieldAlert size={24} /> {error}
            </motion.div>
          )}
          {systemMessage && (
            <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="bg-indigo-600/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-black shadow-[0_10px_40px_rgba(79,70,229,0.4)] flex items-center gap-3 text-lg border border-indigo-400 uppercase tracking-widest">
              <Info size={24} /> {systemMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HEADER / STATS / CONTROLS */}
      <header className="p-6 md:p-8 flex justify-between items-start absolute top-0 w-full z-10 pointer-events-none">
        
        {/* Scores */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-5 rounded-[2rem] shadow-2xl pointer-events-auto min-w-[200px]">
            <div className="text-sm font-black flex flex-col gap-3">
                <div className="flex justify-between items-center gap-6 border-b border-slate-800 pb-2">
                  <span className="text-slate-400">TEAM 1</span> 
                  <span className="text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg">{gameState.scores.team1.mendhi}M | {gameState.scores.team1.utari}U</span>
                </div>
                <div className="flex justify-between items-center gap-6">
                  <span className="text-slate-400">TEAM 2</span> 
                  <span className="text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg">{gameState.scores.team2.mendhi}M | {gameState.scores.team2.utari}U</span>
                </div>
            </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex flex-col items-end gap-4 pointer-events-auto">
            
            {/* EASY MODE: Card Tracker */}
            <button onClick={() => setShowTracker(true)} className="bg-slate-900/60 backdrop-blur-xl hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 px-5 py-3 rounded-2xl text-sm font-black shadow-2xl flex items-center gap-3 transition-all hover:scale-105 uppercase tracking-widest">
                <History size={18} /> Played Cards
            </button>

            {/* Hukum Status */}
            <div className={`px-6 py-4 rounded-2xl font-black shadow-2xl border-2 transition-all tracking-widest uppercase flex items-center gap-2 ${gameState.hukum_status.is_opened ? 'bg-white text-slate-950 border-white' : 'bg-slate-900/60 backdrop-blur-xl text-slate-500 border-slate-800/50'}`}>
                {gameState.hukum_status.is_opened ? (
                  <>HUKUM: <span className={`text-xl ${suitColors[gameState.hukum_status.suit]}`}>{suitSymbols[gameState.hukum_status.suit]}</span></>
                ) : (
                  <><Lock size={18}/> HUKUM HIDDEN</>
                )}
            </div>
            
            {/* Reveal Hukum Button */}
            <AnimatePresence>
              {canOpenHukum && (
                  <motion.button 
                      initial={{ scale: 0.8, opacity: 0, x: 50 }} 
                      animate={{ scale: 1, opacity: 1, x: 0 }} 
                      exit={{ scale: 0.8, opacity: 0, x: 50 }}
                      onClick={openHukum} 
                      className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-black shadow-[0_0_30px_rgba(225,29,72,0.4)] flex items-center gap-3 animate-pulse uppercase tracking-widest border border-rose-400 mt-2"
                  >
                      <ShieldAlert size={24} /> REVEAL HUKUM NOW
                  </motion.button>
              )}
            </AnimatePresence>
        </div>
      </header>

      {/* THE TABLE */}
      <div className="flex-1 relative flex items-center justify-center pt-10">
        
        {/* Opponent Badges */}
        <PlayerBadge name={topPlayer} count={gameState.opponent_card_counts[topPlayer]} pos="top" active={gameState.current_turn_player === topPlayer} />
        <PlayerBadge name={leftPlayer} count={gameState.opponent_card_counts[leftPlayer]} pos="left" active={gameState.current_turn_player === leftPlayer} />
        <PlayerBadge name={rightPlayer} count={gameState.opponent_card_counts[rightPlayer]} pos="right" active={gameState.current_turn_player === rightPlayer} />

        {/* Central Play Area */}
        <div className="w-[320px] h-[320px] md:w-[480px] md:h-[480px] rounded-full border-[16px] border-slate-900/40 bg-gradient-to-b from-slate-800/30 to-transparent flex items-center justify-center relative shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
          <AnimatePresence>
            {gameState.table.map((play) => {
              const pos = getTablePos(play.player_id);
              return (
                <motion.div
                  key={`${play.player_id}-${play.card.suit}-${play.card.rank}`}
                  initial={{ scale: 0, opacity: 0, y: 0, rotate: pos.rotate - 45 }}
                  animate={{ scale: 1, opacity: 1, x: pos.x, y: pos.y, rotate: pos.rotate }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className={`absolute w-24 h-32 md:w-28 md:h-40 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center border-4 ${play.is_trump ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)]' : 'border-slate-200'}`}
                >
                  <span className={`text-3xl md:text-4xl font-black ${suitColors[play.card.suit]}`}>{play.card.rank}</span>
                  <span className={`text-4xl md:text-5xl ${suitColors[play.card.suit]}`}>{suitSymbols[play.card.suit]}</span>
                  <div className="absolute -bottom-10 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg text-xs font-black text-white uppercase tracking-widest border border-slate-700">{play.player_id}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* PLAYER HAND AREA */}
      <footer className="bg-slate-950/80 border-t border-slate-800/50 p-6 pt-12 backdrop-blur-2xl relative shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Your Badge */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <PlayerBadge name={playerName} count={gameState.my_hand.length} pos="bottom" active={gameState.current_turn_player === playerName} />
        </div>

        {/* The Cards */}
        <div className="flex justify-center items-end gap-1 md:gap-2 h-44 md:h-52 max-w-6xl mx-auto custom-card-fan">
          <AnimatePresence>
            {gameState.my_hand.map((card, idx) => {
              const rot = (idx - gameState.my_hand.length / 2) * 3;
              const yPush = Math.abs(idx - gameState.my_hand.length / 2) * 2;
              
              // Special Hidden Hukum Render
              if (card.suit === "HIDDEN") {
                return (
                  <motion.div 
                    key="hidden-hukum" 
                    layoutId="card-hidden"
                    initial={{ y: 100 }} 
                    animate={{ y: yPush, rotate: rot }} 
                    className="w-16 h-24 md:w-28 md:h-40 bg-slate-900 rounded-2xl border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center -ml-6 md:-ml-10 first:ml-0 origin-bottom z-10"
                  >
                    <Lock size={28} className="text-indigo-400 mb-2" />
                    <span className="text-[10px] md:text-xs font-black tracking-widest text-indigo-400 uppercase">Hidden</span>
                  </motion.div>
                );
              }

              // Normal Card Render
              return (
                <motion.button
                  key={`${card.suit}-${card.rank}`}
                  layoutId={`card-${card.suit}-${card.rank}`}
                  whileHover={{ y: -40, scale: 1.15, zIndex: 100 }}
                  onClick={() => playCard(card)}
                  style={{ rotate: rot, y: yPush }}
                  className={`relative w-16 h-24 md:w-28 md:h-40 bg-white rounded-2xl shadow-[-5px_0_15px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center border-[3px] border-slate-200 -ml-6 md:-ml-10 first:ml-0 origin-bottom transition-all z-20 ${!gameState.my_turn ? 'opacity-70 saturate-50 hover:border-slate-200 cursor-not-allowed' : 'hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] cursor-pointer'}`}
                >
                  <span className={`text-2xl md:text-4xl font-black ${suitColors[card.suit]}`}>{card.rank}</span>
                  <span className={`text-3xl md:text-5xl ${suitColors[card.suit]}`}>{suitSymbols[card.suit]}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </footer>

      {/* EASY MODE: PLAYED CARDS TRACKER MODAL */}
      <AnimatePresence>
        {showTracker && (
          <div className="absolute inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border-2 border-indigo-500/50 w-full max-w-4xl rounded-[2.5rem] p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
              
              <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight"><History className="text-indigo-400" size={32}/> PLAYED CARDS TRACKER</h2>
                <button onClick={() => setShowTracker(false)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 bg-slate-800 p-3 rounded-full transition-all"><X size={28} /></button>
              </div>
              
              <div className="overflow-y-auto flex-1 pr-4 custom-scrollbar">
                {gameState.played_cards?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <History size={64} className="mb-4 opacity-50" />
                    <p className="text-xl font-bold tracking-widest uppercase">No cards cleared yet</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {gameState.played_cards.map((c, i) => (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }} key={i} className="w-16 h-24 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center border-2 border-slate-300">
                        <span className={`text-xl font-black ${suitColors[c.suit]}`}>{c.rank}</span>
                        <span className={`text-2xl ${suitColors[c.suit]}`}>{suitSymbols[c.suit]}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}

// Subcomponent: Player Avatar Badges
function PlayerBadge({ name, count, pos, active }) {
  const styles = {
    top: "absolute top-10 left-1/2 -translate-x-1/2",
    left: "absolute left-6 md:left-12 top-1/2 -translate-y-1/2",
    right: "absolute right-6 md:right-12 top-1/2 -translate-y-1/2",
    bottom: "relative z-30" // Ensures the bottom badge sits above the cards
  };

  return (
    <div className={`${styles[pos]} flex flex-col items-center gap-3`}>
      <motion.div 
        animate={{ 
            scale: active ? 1.2 : 1, 
            y: active ? -5 : 0,
            boxShadow: active ? "0 0 30px rgba(34,197,94,0.5)" : "0 10px 25px rgba(0,0,0,0.5)"
        }}
        className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl font-black border-[4px] transition-all duration-300 ${active ? 'bg-green-500 border-white text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
      >
        {name[0].toUpperCase()}
      </motion.div>
      <div className="bg-slate-900/90 backdrop-blur px-5 py-2 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-4">
        <span className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-200">{name}</span>
        <span className="h-5 w-[2px] bg-slate-700"></span>
        <div className="flex items-center gap-1">
            <div className="w-2 h-3 bg-white rounded-[2px] border border-slate-400 opacity-80"></div>
            <span className="text-xs md:text-sm font-black text-indigo-400">{count}</span>
        </div>
      </div>
    </div>
  );
}