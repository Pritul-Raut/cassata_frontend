"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useIsMobile } from "@/hooks/useIsMobile"; 
import { motion } from "framer-motion";
import { Trophy, Loader2, Crown, LogOut } from "lucide-react";

// Import your newly separated Arena components
import DesktopArena from "@/components/arena/DesktopArena";
import MobileArena from "@/components/arena/MobileArena";

export default function RoomPage({ params }) {
  const router = useRouter();
  const roomId = params.id;
  const isMobile = useIsMobile(); 
  
  const { 
    gameState, 
    playerName, 
    joinTeam, 
    startGame, 
    isConnected, 
    disconnect 
  } = useGameStore();

  // --- RECONNECT SYNC LOGIC ---
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
      // If no valid session exists, kick them back to the login page
      router.push("/");
    }
  }, [isConnected, router, roomId]);

  // --- 0. LOADING VIEW ---
  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#0a0c14] flex flex-col items-center justify-center text-indigo-500">
        <Loader2 className="animate-spin mb-4" size={56} />
        <h2 className="text-2xl font-black tracking-widest uppercase">Connecting to Arena...</h2>
      </div>
    );
  }

  // --- 1. LOBBY VIEW ---
  // We keep this in page.js because it's a simple, naturally responsive flexbox layout
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
        <p className="text-slate-500 mb-12 font-bold tracking-widest uppercase text-center">Select your allegiance</p>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
          {/* Team 1 Card */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border-2 border-indigo-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(99,102,241,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
            <h2 className="text-3xl font-black text-indigo-400 mb-8 text-center tracking-tight">TEAM 1</h2>
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="h-20 md:h-24 rounded-2xl border-2 border-slate-800/80 bg-slate-950/80 flex items-center justify-center gap-3">
                  {t1[i] ? (
                    <><span className="font-black text-xl md:text-2xl uppercase tracking-tighter">{t1[i]}</span> {gameState.host === t1[i] && <Crown size={24} className="text-yellow-400"/>}</>
                  ) : <span className="text-slate-700 font-bold uppercase tracking-widest text-sm md:text-base">Empty Seat</span>}
                </div>
              ))}
            </div>
            <button onClick={() => joinTeam("team1")} disabled={t1.includes(playerName) || t1.length >= 2} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-4 md:py-5 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
              JOIN TEAM 1
            </button>
          </div>

          {/* Team 2 Card */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border-2 border-rose-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(244,63,94,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
            <h2 className="text-3xl font-black text-rose-400 mb-8 text-center tracking-tight">TEAM 2</h2>
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="h-20 md:h-24 rounded-2xl border-2 border-slate-800/80 bg-slate-950/80 flex items-center justify-center gap-3">
                  {t2[i] ? (
                    <><span className="font-black text-xl md:text-2xl uppercase tracking-tighter">{t2[i]}</span> {gameState.host === t2[i] && <Crown size={24} className="text-yellow-400"/>}</>
                  ) : <span className="text-slate-700 font-bold uppercase tracking-widest text-sm md:text-base">Empty Seat</span>}
                </div>
              ))}
            </div>
            <button onClick={() => joinTeam("team2")} disabled={t2.includes(playerName) || t2.length >= 2} className="w-full mt-8 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-4 md:py-5 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
              JOIN TEAM 2
            </button>
          </div>
        </div>

        {isHost && (
          <button onClick={startGame} disabled={!isReady} className={`mt-16 px-12 md:px-20 py-5 md:py-6 rounded-full font-black text-xl md:text-2xl transition-all shadow-2xl tracking-widest mb-10 ${isReady ? 'bg-green-500 text-slate-950 hover:bg-green-400 hover:scale-110 shadow-[0_0_40px_rgba(34,197,94,0.4)]' : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'}`}>
            {isReady ? "LAUNCH MATCH" : "WAITING FOR ROSTER"}
          </button>
        )}
      </div>
    );
  }

  // --- 2. GAME OVER VIEW ---
  // We also keep this here because it is a simple, centered success state
  if (gameState.status === "FINISHED") {
    return (
      <div className="min-h-screen bg-[#0a0c14] flex items-center justify-center text-white p-6 custom-bg-grid">
        <motion.div initial={{ scale: 0.8, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-slate-900/90 backdrop-blur-2xl p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] border-4 border-yellow-500/50 shadow-[0_0_100px_rgba(234,179,8,0.2)] text-center max-w-2xl w-full relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          <Trophy size={80} className="mx-auto text-yellow-400 mb-8 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">{gameState.match_result.winner.toUpperCase()}</h1>
          <p className="text-xl md:text-3xl text-yellow-500 mb-12 font-black tracking-widest uppercase">Victory: {gameState.match_result.win_type}</p>
          <button onClick={() => { disconnect(); router.push("/"); }} className="w-full bg-white text-slate-950 hover:bg-slate-200 py-5 md:py-6 rounded-2xl font-black text-xl md:text-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl">
            RETURN TO MENU
          </button>
        </motion.div>
      </div>
    );
  }

  // --- 3. THE ARENA ROUTER ---
  // If the game is PLAYING, hand over full rendering control to the optimized files
  if (gameState.status === "PLAYING") {
    return isMobile ? (
      <MobileArena roomId={roomId} />
    ) : (
      <DesktopArena roomId={roomId} />
    );
  }

  return null; // Fallback
}