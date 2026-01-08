import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { supabase } from "./supabase.js";

// Socket.IO server instance
let io: Server | null = null;

// =====================
// SOCKET EVENT TYPES
// =====================
export interface SocketEvents {
    // Post events
    "post:created": { post: unknown };
    "post:deleted": { postId: string };
    "post:liked": { postId: string; likesCount: number; userId: string };
    "post:unliked": { postId: string; likesCount: number; userId: string };
    "post:replied": { parentPostId: string; reply: unknown };
    "post:reposted": { postId: string; repostsCount: number; userId: string };
    "post:unreposted": { postId: string; repostsCount: number; userId: string };

    // Notification events
    "notification:new": { notification: unknown };

    // User events
    "user:followed": {
        followerId: string;
        followingId: string;
        followerUsername: string;
    };
    "user:unfollowed": { followerId: string; followingId: string };
}

// =====================
// INITIALIZE SOCKET.IO
// =====================
export function initializeSocket(httpServer: HttpServer): Server {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true,
        },
        path: "/socket.io",
    });

    // Authentication middleware using Supabase
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            // Allow unauthenticated connections for public events
            socket.data.userId = null;
            return next();
        }

        try {
            // Verify token with Supabase
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                socket.data.userId = null;
            } else {
                socket.data.userId = user.id;
            }
            next();
        } catch (err) {
            console.error("[Socket] Auth error:", err);
            socket.data.userId = null;
            next();
        }
    });

    // Connection handler
    io.on("connection", (socket: Socket) => {
        const userId = socket.data.userId;

        // Join user-specific room for targeted notifications
        if (userId) {
            socket.join(`user:${userId}`);
        }

        // Join global feed room
        socket.join("feed:global");

        socket.on("disconnect", () => {
            // Cleanup if needed
        });
    });

    console.log("Socket.IO server initialized with Supabase Auth");
    return io;
}

// =====================
// EMIT HELPERS
// =====================
export function getIO(): Server | null {
    return io;
}

export function emitToAll<K extends keyof SocketEvents>(
    event: K,
    data: SocketEvents[K]
): void {
    if (io) {
        io.to("feed:global").emit(event, data);
    }
}

export function emitToUser<K extends keyof SocketEvents>(
    userId: string,
    event: K,
    data: SocketEvents[K]
): void {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
}
