"use client";

import { Notification, NotificationType } from "@/components/ui/notification";
import React, { createContext, useContext, useState, useCallback } from "react";

interface NotificationContextType {
  showNotification: (
    title: string,
    message: string,
    type?: NotificationType
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    type: NotificationType;
  } | null>(null);

  const showNotification = useCallback(
    (title: string, message: string, type: NotificationType = "info") => {
      setNotification({ title, message, type });

      const audio = new Audio("/sounds/notification.mp3");
      audio.play().catch((err: any) => {
        console.warn("Unable to play notification sound", err);
      })
    },
    []
  );

  const handleClose = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <Notification
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClose={handleClose}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
