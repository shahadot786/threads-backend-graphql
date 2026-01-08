"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export function useSocketContext() {
    return useContext(SocketContext);
}

interface SocketProviderProps {
    children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        let currentSocket: Socket | null = null;

        async function initSocket() {
            // Get API URL from env or default
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            // Get current session for token
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            // Create socket connection
            currentSocket = io(apiUrl, {
                path: "/socket.io",
                withCredentials: true,
                auth: { token },
            });

            currentSocket.on("connect", () => {
                console.log("[Socket] Connected:", currentSocket?.id);
                setIsConnected(true);
            });

            currentSocket.on("disconnect", () => {
                console.log("[Socket] Disconnected");
                setIsConnected(false);
            });

            currentSocket.on("connect_error", (error) => {
                console.error("[Socket] Connection error:", error.message);
            });

            setSocket(currentSocket);
        }

        initSocket();

        return () => {
            if (currentSocket) {
                currentSocket.disconnect();
            }
        };
    }, [isAuthenticated]); // Reconnect when authentication status changes

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}
