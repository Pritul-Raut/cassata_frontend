"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { motion } from "framer-motion"; // Added for premium desktop entrance

export default function Home() {
  const [name, setName] = useState("");
  // Generates a random 4-digit PIN on load
  const [room, setRoom] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const router = useRouter();
  
  const { connect, isConnected, roomId } = useGameStore();

  // Instantly redirect if Ghost Auth remembers the session
  useEffect(() => {
    if (isConnected && roomId) {
      router.push(`/room/${roomId}`);
    }
  }, [isConnected, roomId, router]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name || !room) return;
    connect(room, name);
    router.push(`/room/${room}`);
  };

  return (
    <main className="min-h-screen bg-[#07090f] flex items-center justify-center p-6 custom-bg-grid">
      
      {/* Premium Desktop Animation Wrapper */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl p-10 rounded-[2.5rem] border-2 border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)] relative overflow-hidden"
      >
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-rose-500"></div>

        <h1 className="text-5xl font-black text-center mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 italic">
          CASSATA
        </h1>
        <p className="text-slate-500 text-center mb-10 font-bold tracking-widest uppercase text-xs">
          Authentic Mendhi Coat Multiplayer
        </p>

        <form onSubmit={handleJoin} className="space-y-6">
          
          {/* Player Identity Input */}
          <div className="space-y-2 group">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">
              Player Identity
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 focus:bg-slate-950 outline-none transition-all font-bold placeholder-slate-700"
              placeholder="e.g. Pritul"
              required
              autoComplete="off"
            />
          </div>

          {/* Room PIN Input */}
          <div className="space-y-2 group">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-rose-400 transition-colors">
              Room Access Code
            </label>
            <input 
              type="number" 
              value={room}
              onChange={(e) => setRoom(e.target.value.slice(0, 4))}
              className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-rose-500 focus:bg-slate-950 outline-none transition-all font-black text-3xl tracking-[1rem] text-center placeholder-slate-700"
              placeholder="0000"
              required
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl text-xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.03] active:scale-[0.97] mt-4 tracking-widest"
          >
            ENTER ARENA
          </button>
        </form>
      </motion.div>
      
    </main>
  );
}