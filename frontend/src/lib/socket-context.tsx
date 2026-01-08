"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";

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
        // Get API URL from env or default
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        // Create socket connection
        const newSocket = io(apiUrl, {
            path: "/socket.io",
            withCredentials: true,
            // Auth token can be added if needed
            // auth: { token: accessToken },
        });

        newSocket.on("connect", () => {
            console.log("[Socket] Connected:", newSocket.id);
            setIsConnected(true);
        });

        newSocket.on("disconnect", () => {
            console.log("[Socket] Disconnected");
            setIsConnected(false);
        });

        newSocket.on("connect_error", (error) => {
            console.error("[Socket] Connection error:", error.message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}
