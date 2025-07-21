'use client'

import { ISmsMessage } from "@/core/messages/model";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";


interface SmsContextType {
  isConnected: boolean;
  subscribe: (callback: (message: ISmsMessage) => void) => () => void;
}

const SmsContext = createContext<SmsContextType | undefined>(undefined);

export const SmsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [subscribers] = useState<Set<(message: ISmsMessage) => void>>(
    new Set()
  );

  const connectWebSocket = useCallback(() => {
    console.log("Connecting WebSocket", user?.userId, socket?.readyState);
    if (!user?.userId || socket?.readyState === WebSocket.OPEN) return;

    const wsPort = process.env.NEXT_PUBLIC_WS_PORT || "8080";
    const hostname = window.location.hostname;
    const ws = new WebSocket(
      process.env.NODE_ENV === "production"
        ? `wss://${hostname}/ws`
        : `ws://${hostname}:${wsPort}`
    );

    ws.onopen = () => {
      console.log("WebSocket connected successfully");
      setIsConnected(true);
      ws.send(JSON.stringify({ type: "auth", userId: user.userId }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as ISmsMessage;
        subscribers.forEach((callback) => callback(message));
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      setSocket(null);
      setTimeout(connectWebSocket, 5000);
    };

    setSocket(ws);

    return () => {
      ws.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user?.userId]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return () => {
      if (cleanup) cleanup();
    };
  }, [connectWebSocket]);

  const sendMessage = useCallback(
    (message: ISmsMessage) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    },
    [socket]
  );

  const subscribe = useCallback(
    (callback: (message: ISmsMessage) => void) => {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    [subscribers]
  );

  return (
    <SmsContext.Provider value={{ isConnected, subscribe }}>
      {children}
    </SmsContext.Provider>
  );
}

export const useSmsSocket = () => {
  const ctx = useContext(SmsContext);
  if (!ctx)
    throw new Error('useSmsSocket must be used within SmsProvider');
  return ctx;
}