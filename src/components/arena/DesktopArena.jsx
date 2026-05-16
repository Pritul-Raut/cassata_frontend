"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Info, History, X, Lock, RefreshCw } from "lucide-react";
import { useGameStore } from "@/store/gameStore";

const suitSymbols = { HEARTS: "♥️", SPADES: "♠️", DIAMONDS: "♦️", CLUBS: "♣️" };
const suitColors = {
    HEARTS: "text-rose-500",
    DIAMONDS: "text-rose-500",
    SPADES: "text-slate-900",
    CLUBS: "text-slate-900"
};

export default function DesktopArena({ roomId }) {
    const [showTracker, setShowTracker] = useState(false);


    const [showSecretAlert, setShowSecretAlert] = useState(true);




    const {
        gameState,
        playerName,
        playCard,
        openHukum,
        error,
        systemMessage,
        syncState,
    } = useGameStore();

    useEffect(() => {
        // If the intel exists, start an 8-second countdown to hide it
        if (gameState?.hukum_status?.exposed_card) {
            setShowSecretAlert(true);
            const timer = setTimeout(() => setShowSecretAlert(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [gameState?.hukum_status?.exposed_card]);

    // --- PLAYER POSITIONING ---
    const myIndex = gameState.players.indexOf(playerName);
    const leftPlayer = gameState.players[(myIndex + 1) % 4];
    const topPlayer = gameState.players[(myIndex + 2) % 4];
    const rightPlayer = gameState.players[(myIndex + 3) % 4];

    // --- FLAWLESS HUKUM LOGIC ---
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

    const suitOrder = { 'HEARTS': 1, 'SPADES': 2, 'DIAMONDS': 3, 'CLUBS': 4 };
    const sortedPlayedCards = gameState.played_cards ? [...gameState.played_cards].sort((a, b) => {
        if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
        return b.value - a.value;
    }) : [];

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

                {showSecretAlert && gameState.hukum_status?.exposed_card && !gameState.hukum_status.is_opened && gameState.played_cards?.length === 0 && (
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl font-black shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-4 border border-indigo-500 mt-2">

                        {/* If I am the Viewer (Teammate) */}
                        {gameState.hukum_status.exposed_card.viewer === playerName && (
                            <>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-indigo-400 uppercase tracking-widest">Secret Intel</span>
                                    <span className="text-sm">You saw {gameState.hukum_status.exposed_card.victim}&apos;s card:</span>
                                </div>
                                <div className="bg-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-inner">
                                    <span className={`text-xl ${suitColors[gameState.hukum_status.exposed_card.card.suit]}`}>{gameState.hukum_status.exposed_card.card.rank}</span>
                                    <span className={`text-2xl ${suitColors[gameState.hukum_status.exposed_card.card.suit]}`}>{suitSymbols[gameState.hukum_status.exposed_card.card.suit]}</span>
                                </div>
                            </>
                        )}

                        {/* If I am the Victim */}
                        {gameState.hukum_status.exposed_card.victim === playerName && (
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="text-rose-500 animate-pulse" size={24} />
                                <div className="flex flex-col">
                                    <span className="text-xs text-rose-500 uppercase tracking-widest">Compromised</span>
                                    <span className="text-sm">{gameState.hukum_status.exposed_card.viewer} saw your {gameState.hukum_status.exposed_card.card.rank} of {suitSymbols[gameState.hukum_status.exposed_card.card.suit]}!</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* HEADER / STATS / CONTROLS */}
            <header className="p-8 flex justify-between items-start absolute top-0 w-full z-10 pointer-events-none">

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

                    {/* EASY MODE & SYNC CONTROLS */}
                    <div className="flex gap-3">
                        {/* 1. The New Sync Button */}
                        <button onClick={syncState} className="bg-slate-900/60 backdrop-blur-xl hover:bg-slate-800 text-green-400 border border-green-500/30 px-5 py-3 rounded-2xl text-sm font-black shadow-2xl flex items-center gap-3 transition-all hover:scale-105 uppercase tracking-widest active:scale-95">
                            <RefreshCw size={18} /> Sync
                        </button></div>

                    {/* EASY MODE: Card Tracker */}
                    <button onClick={() => setShowTracker(true)} className="bg-slate-900/60 backdrop-blur-xl hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 px-5 py-3 rounded-2xl text-sm font-black shadow-2xl flex items-center gap-3 transition-all hover:scale-105 uppercase tracking-widest">
                        <History size={18} /> Played Cards
                    </button>

                    {/* Hukum Status */}
                    <div className={`px-6 py-4 rounded-2xl font-black shadow-2xl border-2 transition-all tracking-widest uppercase flex items-center gap-2 ${gameState.hukum_status.is_opened ? 'bg-white text-slate-950 border-white' : 'bg-slate-900/60 backdrop-blur-xl text-slate-500 border-slate-800/50'}`}>
                        {gameState.hukum_status.is_opened ? (
                            <>HUKUM: <span className={`text-xl ${suitColors[gameState.hukum_status.suit]}`}>{suitSymbols[gameState.hukum_status.suit]}</span></>
                        ) : (
                            <><Lock size={18} /> HUKUM HIDDEN</>
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
                <div className="w-[480px] h-[480px] rounded-full border-[16px] border-slate-900/40 bg-gradient-to-b from-slate-800/30 to-transparent flex items-center justify-center relative shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
                    <AnimatePresence>
                        {gameState.table.map((play) => {
                            const pos = getTablePos(play.player_id);

                            // --- SORT PLAYED CARDS ---
                            const suitOrder = { 'HEARTS': 1, 'SPADES': 2, 'DIAMONDS': 3, 'CLUBS': 4 };
                            const sortedPlayedCards = gameState.played_cards ? [...gameState.played_cards].sort((a, b) => {
                                if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
                                return b.value - a.value;
                            }) : [];

                            return (
                                <motion.div
                                    key={`${play.player_id}-${play.card.suit}-${play.card.rank}`}
                                    initial={{ scale: 0, opacity: 0, y: 0, rotate: pos.rotate - 45 }}
                                    animate={{ scale: 1, opacity: 1, x: pos.x, y: pos.y, rotate: pos.rotate }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    className={`absolute w-28 h-40 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center border-4 ${play.is_trump ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)]' : 'border-slate-200'}`}
                                >
                                    <span className={`text-4xl font-black ${suitColors[play.card.suit]}`}>{play.card.rank}</span>
                                    <span className={`text-5xl ${suitColors[play.card.suit]}`}>{suitSymbols[play.card.suit]}</span>
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
                <div className="flex justify-center items-end gap-2 h-52 max-w-6xl mx-auto custom-card-fan">
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
                                        className="w-28 h-40 bg-slate-900 rounded-2xl border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center -ml-10 first:ml-0 origin-bottom z-10"
                                    >
                                        <Lock size={28} className="text-indigo-400 mb-2" />
                                        <span className="text-xs font-black tracking-widest text-indigo-400 uppercase">Hidden</span>
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
                                    className={`relative w-28 h-40 bg-white rounded-2xl shadow-[-5px_0_15px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center border-[3px] border-slate-200 -ml-10 first:ml-0 origin-bottom transition-all z-20 ${!gameState.my_turn ? 'opacity-70 saturate-50 hover:border-slate-200 cursor-not-allowed' : 'hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] cursor-pointer'}`}
                                >
                                    <span className={`text-4xl font-black ${suitColors[card.suit]}`}>{card.rank}</span>
                                    <span className={`text-5xl ${suitColors[card.suit]}`}>{suitSymbols[card.suit]}</span>
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
                                <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight"><History className="text-indigo-400" size={32} /> PLAYED CARDS TRACKER</h2>
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
                                        {sortedPlayedCards.map((c, i) => (
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

// Subcomponent: Player Avatar Badges (Desktop Only styling)
function PlayerBadge({ name, count, pos, active }) {
    const styles = {
        top: "absolute top-10 left-1/2 -translate-x-1/2",
        left: "absolute left-12 top-1/2 -translate-y-1/2",
        right: "absolute right-12 top-1/2 -translate-y-1/2",
        bottom: "relative z-30"
    };

    return (
        <div className={`${styles[pos]} flex flex-col items-center gap-3`}>
            <motion.div
                animate={{
                    scale: active ? 1.2 : 1,
                    y: active ? -5 : 0,
                    boxShadow: active ? "0 0 30px rgba(34,197,94,0.5)" : "0 10px 25px rgba(0,0,0,0.5)"
                }}
                className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl font-black border-[4px] transition-all duration-300 ${active ? 'bg-green-500 border-white text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
                {name[0].toUpperCase()}
            </motion.div>
            <div className="bg-slate-900/90 backdrop-blur px-5 py-2 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-4">
                <span className="text-sm font-black uppercase tracking-widest text-slate-200">{name}</span>
                <span className="h-5 w-[2px] bg-slate-700"></span>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-3 bg-white rounded-[2px] border border-slate-400 opacity-80"></div>
                    <span className="text-sm font-black text-indigo-400">{count}</span>
                </div>
            </div>
        </div>
    );
}