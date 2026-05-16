import { create } from 'zustand';

let pingInterval = null;

export const useGameStore = create((set, get) => ({
    socket: null,
    gameState: null,
    playerName: "",
    roomId: "",
    isConnected: false,
    error: null,
    systemMessage: null,

    connect: (roomId, playerName) => {
        if (get().socket) return; 

        // Force lowercase to ensure 'Pritul' and 'pritul' are treated as the same user
        const safeName = playerName.toLowerCase().trim();
        
        // 1. Grab the Heroku URL from Vercel. Fallback to localhost ONLY for local dev.
        const rawUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "localhost:8000";
        
        // 2. Clean the URL (removes http:// or https:// if you accidentally pasted it in Vercel)
        const cleanUrl = rawUrl.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '').replace(/\/$/, '');
        
        // 3. FORCE secure WSS if we are on the internet. Use WS only for local testing.
        const protocol = window.location.hostname === "localhost" ? "ws://" : "wss://";
        
        // 4. Connect!
        const ws = new WebSocket(`${protocol}${cleanUrl}/ws/game/${roomId}/${safeName}`);

        ws.onopen = () => {
            set({ socket: ws, isConnected: true, playerName: safeName, roomId, error: null });
            sessionStorage.setItem("cassata_session", JSON.stringify({ roomId, playerName: safeName }));
            
            // Heartbeat to prevent 60s timeout drops
            pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ action: "PING" }));
                }
            }, 30000);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === "GAME_STATE_UPDATE") {
                // Auto-sort logic with 'HIDDEN' card safety
                const suitOrder = { 'HEARTS': 1, 'SPADES': 2, 'DIAMONDS': 3, 'CLUBS': 4, 'HIDDEN': 5 };
                if (data.state.my_hand) {
                    data.state.my_hand.sort((a, b) => {
                        if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
                        return b.value - a.value; 
                    });
                }
                set({ gameState: data.state });
                
            } else if (data.type === "ERROR") {
                set({ error: data.message });
                // Only clear session on terminal errors
                if (data.message === "Room is full!" || data.message.includes("in progress")) {
                    sessionStorage.removeItem("cassata_session");
                    set({ isConnected: false }); 
                }
                setTimeout(() => set({ error: null }), 3500);
                
            } else if (data.type === "SYSTEM") {
                set({ systemMessage: data.message });
                setTimeout(() => set({ systemMessage: null }), 4000);
            }
        };

        ws.onclose = () => {
            set({ socket: null, isConnected: false });
            if (pingInterval) clearInterval(pingInterval);
        };
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) socket.close();
        if (pingInterval) clearInterval(pingInterval);
        sessionStorage.removeItem("cassata_session");
        set({ gameState: null, isConnected: false, socket: null });
    },

    playCard: (card) => {
        const { socket } = get();
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "PLAY_CARD", card }));
        }
    },

    openHukum: () => {
        const { socket } = get();
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "OPEN_HUKUM" }));
        }
    },

    joinTeam: (teamName) => {
        const { socket } = get();
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "JOIN_TEAM", team: teamName }));
        }
    },

    startGame: () => {
        const { socket } = get();
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "START_GAME" }));
        }
    },
    
    syncState: () => {
        const { socket } = get();
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "SYNC_STATE" }));
        }
    }
}));