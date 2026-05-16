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

export default function MobileArena({ roomId }) {
    // 1. Component State
    const [showTracker, setShowTracker] = useState(false);
    const [showSecretAlert, setShowSecretAlert] = useState(true);

    // 2. Global Game Store
    const {
        gameState,
        playerName,
        playCard,
        openHukum,
        error,
        systemMessage,
        syncState
    } = useGameStore();

    // 3. Secret Intel Timer (Runs only once at the start of the game)
    useEffect(() => {
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

    // --- HUKUM LOGIC ---
    const ledSuit = gameState.led_suit;
    const hasLedSuit = ledSuit ? gameState.my_hand.some(c => c.suit === ledSuit) : false;
    const canOpenHukum = gameState.my_turn && ledSuit && !hasLedSuit && !gameState.hukum_status.is_opened;

    // --- MOBILE TABLE POSITIONING (Pushed outward to avoid overlap) ---
    const getMobileTablePos = (pid) => {
        if (pid === playerName) return { y: 45, x: 0, z: 4, rotate: 0 };
        if (pid === leftPlayer) return { y: -5, x: -60, z: 2, rotate: -90 };
        if (pid === topPlayer) return { y: -60, x: 0, z: 1, rotate: 180 };
        if (pid === rightPlayer) return { y: -5, x: 60, z: 3, rotate: 90 };
        return { x: 0, y: 0, z: 0, rotate: 0 };
    };

    // --- SORT PLAYED CARDS ---
    const suitOrder = { 'HEARTS': 1, 'SPADES': 2, 'DIAMONDS': 3, 'CLUBS': 4 };
    const sortedPlayedCards = gameState.played_cards ? [...gameState.played_cards].sort((a, b) => {
        if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
        return b.value - a.value;
    }) : [];

    // --- RENDER SLIDER CARDS ---
    const renderCard = (card, idx) => {
        if (card.suit === "HIDDEN") {
            return (
                <motion.div
                    key={`hidden-hukum-${idx}`}
                    className="w-14 h-[85px] bg-slate-900 rounded-xl border border-indigo-500 shadow-md flex flex-col items-center justify-center shrink-0 z-10"
                >
                    <Lock size={16} className="text-indigo-400 mb-1" />
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Hide</span>
                </motion.div>
            );
        }

        return (
            <motion.button
                key={`${card.suit}-${card.rank}`}
                whileTap={{ y: -15, scale: 1.15, zIndex: 100 }}
                onClick={() => playCard(card)}
                className={`relative w-14 h-[85px] bg-white rounded-xl shadow-md flex flex-col items-center justify-center border-2 shrink-0 transition-all z-20 ${!gameState.my_turn ? 'opacity-50 border-slate-300' : 'border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]'}`}
            >
                <span className={`text-xl font-black leading-none ${suitColors[card.suit]}`}>{card.rank}</span>
                <span className={`text-2xl leading-none mt-1 ${suitColors[card.suit]}`}>{suitSymbols[card.suit]}</span>
            </motion.button>
        );
    };

    return (
        <main className="h-[100dvh] bg-[#07090f] text-slate-200 overflow-hidden flex flex-col relative touch-none select-none">

            {/* MOBILE TOAST ALERTS */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[100] w-[95%]">
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="bg-rose-600/95 backdrop-blur-md text-white p-3 rounded-xl text-xs font-black shadow-xl flex items-center gap-2 mb-2 uppercase tracking-wide border border-rose-500">
                            <ShieldAlert size={16} /> {error}
                        </motion.div>
                    )}
                    {systemMessage && (
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="bg-indigo-600/95 backdrop-blur-md text-white p-3 rounded-xl text-sm font-black shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest border border-indigo-400 mb-2">
                            <Info size={18} /> {systemMessage}
                        </motion.div>
                    )}

                    {/* PHASE 3: EXPOSED CARD SECRET ALERT */}
                    {showSecretAlert && gameState.hukum_status?.exposed_card && !gameState.hukum_status.is_opened && gameState.played_cards?.length === 0 && (
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0, y: -50 }} className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl font-black shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center justify-center gap-3 border border-indigo-500 mt-1 w-full mx-auto max-w-sm">

                            {/* If I am the Viewer (Teammate) */}
                            {gameState.hukum_status.exposed_card.viewer === playerName && (
                                <>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-indigo-400 uppercase tracking-widest">Secret Intel</span>
                                        <span className="text-xs leading-none mt-0.5">Saw {gameState.hukum_status.exposed_card.victim}&apos;s card:</span>
                                    </div>
                                    <div className="bg-white px-2 py-1 rounded-md flex items-center gap-1 shadow-inner">
                                        <span className={`text-lg leading-none ${suitColors[gameState.hukum_status.exposed_card.card.suit]}`}>{gameState.hukum_status.exposed_card.card.rank}</span>
                                        <span className={`text-xl leading-none ${suitColors[gameState.hukum_status.exposed_card.card.suit]}`}>{suitSymbols[gameState.hukum_status.exposed_card.card.suit]}</span>
                                    </div>
                                </>
                            )}

                            {/* If I am the Victim */}
                            {gameState.hukum_status.exposed_card.victim === playerName && (
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="text-rose-500 animate-pulse shrink-0" size={20} />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-rose-500 uppercase tracking-widest">Compromised</span>
                                        <span className="text-xs leading-none mt-0.5">{gameState.hukum_status.exposed_card.viewer} saw your {gameState.hukum_status.exposed_card.card.rank} {suitSymbols[gameState.hukum_status.exposed_card.card.suit]}!</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* HEADER: Scores & Controls */}
            <header className="p-3 flex justify-between items-start z-10 w-full absolute top-0 pointer-events-none">

                {/* Scores */}
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-3 py-2 rounded-xl flex gap-3 text-[10px] font-black shadow-lg pointer-events-auto">
                    <div className="text-indigo-400 flex flex-col items-center"><span>T1</span><span>{gameState.scores.team1.mendhi}M | {gameState.scores.team1.utari}U</span></div>
                    <div className="w-[1px] bg-slate-700 my-1"></div>
                    <div className="text-rose-400 flex flex-col items-center"><span>T2</span><span>{gameState.scores.team2.mendhi}M | {gameState.scores.team2.utari}U</span></div>
                </div>

                {/* Right Controls */}
                <div className="flex flex-col items-end gap-2 pointer-events-auto">
                    <div className="flex gap-2">
                        <button onClick={syncState} className="bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl text-green-400 border border-slate-700/50 shadow-lg active:scale-95 transition-transform"><RefreshCw size={16} /></button>
                        <button onClick={() => setShowTracker(true)} className="bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl text-indigo-300 border border-slate-700/50 shadow-lg active:scale-95 transition-transform"><History size={16} /></button>
                        <div className={`px-3 py-2 rounded-xl font-black text-xs border flex items-center shadow-lg transition-colors ${gameState.hukum_status.is_opened ? 'bg-white text-slate-900 border-white' : 'bg-slate-900/80 backdrop-blur-md text-slate-500 border-slate-700/50'}`}>
                            {gameState.hukum_status.is_opened ? suitSymbols[gameState.hukum_status.suit] : <Lock size={14} />}
                        </div>
                    </div>
                </div>
            </header>

            {/* REVEAL BUTTON */}
            <AnimatePresence>
                {canOpenHukum && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                        onClick={openHukum}
                        className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-6 py-3 rounded-full font-black shadow-[0_0_20px_rgba(225,29,72,0.6)] flex items-center gap-2 text-sm animate-pulse w-max border border-rose-400 uppercase tracking-widest"
                    >
                        <ShieldAlert size={18} /> REVEAL HUKUM
                    </motion.button>
                )}
            </AnimatePresence>

            {/* MOBILE TABLE */}
            <div className="flex-1 relative flex items-center justify-center mt-[-2vh]">
                <MobilePlayerBadge name={topPlayer} count={gameState.opponent_card_counts[topPlayer]} pos="top" active={gameState.current_turn_player === topPlayer} />
                <MobilePlayerBadge name={leftPlayer} count={gameState.opponent_card_counts[leftPlayer]} pos="left" active={gameState.current_turn_player === leftPlayer} />
                <MobilePlayerBadge name={rightPlayer} count={gameState.opponent_card_counts[rightPlayer]} pos="right" active={gameState.current_turn_player === rightPlayer} />

                {/* Central Ring */}
                <div className="w-[200px] h-[200px] rounded-full border-[6px] border-slate-900/40 bg-gradient-to-b from-slate-800/30 to-transparent flex items-center justify-center relative shadow-inner">
                    <AnimatePresence mode="popLayout">
                        {gameState.table.map((play, index) => {
                            const pos = getMobileTablePos(play.player_id);
                            return (
                                <motion.div
                                    // Added index to key to completely remove the lingering card visual glitch
                                    key={`${play.player_id}-${play.card.suit}-${play.card.rank}-${index}`}
                                    initial={{ scale: 0, opacity: 0, rotate: pos.rotate - 45 }}
                                    animate={{ scale: 1, opacity: 1, x: pos.x, y: pos.y, zIndex: pos.z, rotate: pos.rotate }}
                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                    className={`absolute w-14 h-[80px] bg-white rounded-xl shadow-xl flex flex-col items-center justify-center border-2 ${play.is_trump ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'border-slate-200'}`}
                                >
                                    <span className={`text-xl font-black leading-none ${suitColors[play.card.suit]}`}>{play.card.rank}</span>
                                    <span className={`text-2xl leading-none ${suitColors[play.card.suit]}`}>{suitSymbols[play.card.suit]}</span>
                                    <div className="absolute -bottom-5 bg-slate-900/90 px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest border border-slate-700">{play.player_id}</div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* PHASE 2 REWRITE: 2-ROW SLIDER FOR CARDS */}
            <footer className="bg-slate-950 border-t-2 border-slate-800/80 pt-12 pb-4 relative shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">

                {/* Your Bottom Badge (Pushed higher to avoid card overlap) */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50">
                    <MobilePlayerBadge name={playerName} count={gameState.my_hand.length} pos="bottom" active={gameState.current_turn_player === playerName} />
                </div>

                {/* 2-Row Horizontal Scroll Container */}
                <div className="w-full overflow-x-auto overflow-y-visible px-2 pb-2 custom-scrollbar touch-pan-x">
                    <div className="flex flex-col gap-2 min-w-max mx-auto px-2">

                        {/* Top Row (First 7 Cards) */}
                        <div className="flex gap-2 justify-center">
                            {gameState.my_hand.slice(0, 7).map((card, idx) => renderCard(card, idx))}
                        </div>

                        {/* Bottom Row (Remaining Cards) */}
                        <div className="flex gap-2 justify-center">
                            {gameState.my_hand.slice(7).map((card, idx) => renderCard(card, idx + 7))}
                        </div>

                    </div>
                </div>
            </footer>

            {/* MOBILE TRACKER MODAL */}
            <AnimatePresence>
                {showTracker && (
                    <div className="absolute inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex flex-col p-4 pt-12 pb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border-2 border-indigo-500/50 w-full flex-1 rounded-3xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500"></div>
                            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                                <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight"><History className="text-indigo-400" size={20} /> PLAYED CARDS</h2>
                                <button onClick={() => setShowTracker(false)} className="text-slate-400 active:bg-slate-800 p-2 rounded-full"><X size={24} /></button>
                            </div>

                            <div className="overflow-y-auto flex-1 custom-scrollbar">
                                {gameState.played_cards?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                        <History size={48} className="mb-4 opacity-30" />
                                        <p className="text-sm font-bold tracking-widest uppercase">No cards cleared</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-5 gap-2">
                                        {/* Using the sorted array! */}
                                        {sortedPlayedCards.map((c, i) => (
                                            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.01 }} key={i} className="aspect-[2/3] bg-white rounded-lg shadow-md flex flex-col items-center justify-center border border-slate-300">
                                                <span className={`text-sm font-black ${suitColors[c.suit]}`}>{c.rank}</span>
                                                <span className={`text-lg ${suitColors[c.suit]}`}>{suitSymbols[c.suit]}</span>
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

// ==========================================
// MOBILE PLAYER BADGE
// ==========================================
function MobilePlayerBadge({ name, count, pos, active }) {

    const styles = {
        top: "absolute top-24 left-1/2 -translate-x-1/2",           // 👇 Pushed down to clear the header buttons
        left: "absolute left-2 top-[45%] -translate-y-1/2",         // 👇 Pushed down to the middle of the screen
        right: "absolute right-2 top-[45%] -translate-y-1/2",       // 👇 Pushed down to the middle of the screen
        bottom: "relative z-30"
    }

    return (
        // Added w-max to prevent flexbox crushing side badges
        <div className={`${styles[pos]} flex flex-col items-center gap-1.5 w-max`} >
            <motion.div
                animate={{ scale: active ? 1.15 : 1, y: active ? -3 : 0 }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black border-2 transition-colors ${active ? 'bg-green-500 border-white text-slate-900 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
                {name[0].toUpperCase()}
            </motion.div>
            <div className="bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-[9px] font-black uppercase text-slate-200 flex items-center gap-1.5 border border-slate-700 shadow-lg">
                {name}
                <span className="w-[1px] h-3 bg-slate-600"></span>
                <span className="text-indigo-400">{count}</span>
            </div>
        </div >
    );
}