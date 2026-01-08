"use client";

import { useEffect, useCallback } from "react";
import { useSocketContext } from "@/lib/socket-context";

type SocketEventHandler<T = unknown> = (data: T) => void;

/**
 * Hook to subscribe to a socket event
 * Automatically cleans up on unmount
 */
export function useSocketEvent<T = unknown>(
    event: string,
    handler: SocketEventHandler<T>
) {
    const { socket } = useSocketContext();

    useEffect(() => {
        if (!socket) return;

        socket.on(event, handler);

        return () => {
            socket.off(event, handler);
        };
    }, [socket, event, handler]);
}

/**
 * Hook to get socket connection status and emit function
 */
export function useSocket() {
    const { socket, isConnected } = useSocketContext();

    const emit = useCallback(
        (event: string, data: unknown) => {
            if (socket && isConnected) {
                socket.emit(event, data);
            }
        },
        [socket, isConnected]
    );

    return { socket, isConnected, emit };
}
