import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { io, type Socket } from "socket.io-client";

import { SOCKET_BASE } from "../utils/apiConfig";
import { useAuth } from "./AuthContext";

type SocketStatus = "disconnected" | "connecting" | "connected";

type SocketContextValue = {
  socket: Socket | null;
  status: SocketStatus;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>("disconnected");

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setStatus("disconnected");
      return;
    }

    setStatus("connecting");
    const socket = io(SOCKET_BASE, {
      withCredentials: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    const handleConnect = () => setStatus("connected");
    const handleDisconnect = () => setStatus("disconnected");
    const handleError = () => setStatus("disconnected");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  const value = useMemo<SocketContextValue>(
    () => ({
      socket: socketRef.current,
      status,
    }),
    [status]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return ctx;
}


