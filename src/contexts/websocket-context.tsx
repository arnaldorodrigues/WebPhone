"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { useUserData } from "@/hooks/use-userdata";

interface WebSocketMessage {
  type: string;
  messageId?: string;
  from?: string;
  body?: string;
  timestamp?: Date;
  [key: string]: any;
}

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  subscribe: (callback: (message: WebSocketMessage) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { userData } = useUserData();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [subscribers] = useState<Set<(message: WebSocketMessage) => void>>(
    new Set()
  );

  const connectWebSocket = useCallback(() => {
    console.log("Connecting WebSocket", userData?.id, socket?.readyState);
    if (!userData?.id || socket?.readyState === WebSocket.OPEN) return;

    const wsPort = process.env.NEXT_PUBLIC_WS_PORT || "8080";
    const hostname = window.location.hostname;
    const ws = new WebSocket(
      process.env.PRODUCTION
        ? `wss://${hostname}/ws`
        : `ws://${hostname}:${wsPort}`
    );

    ws.onopen = () => {
      console.log("WebSocket connected successfully");
      setIsConnected(true);
      // Authenticate the connection
      ws.send(JSON.stringify({ type: "auth", userId: userData.id }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log("onmessage", message);
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
      // Attempt to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    setSocket(ws);

    return () => {
      ws.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, [userData?.id]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return () => {
      if (cleanup) cleanup();
    };
  }, [connectWebSocket]);

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    },
    [socket]
  );

  const subscribe = useCallback(
    (callback: (message: WebSocketMessage) => void) => {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    [subscribers]
  );

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
