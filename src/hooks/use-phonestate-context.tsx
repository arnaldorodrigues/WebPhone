"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getParsedToken } from "@/utils/auth";

export type PhoneStateType =
  | "dialing"
  | "sending"
  | "receiving"
  | "calling"
  | "ended"
  | null;

export interface PhoneStateContextType {
  phoneState: PhoneStateType;
  setPhoneState: (state: PhoneStateType) => void;
  extensionNumber: string;
}

const PhoneStateContext = createContext<PhoneStateContextType | undefined>(
  undefined
);

export function PhoneStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [phoneState, setPhoneState] = useState<PhoneStateType>(null);
  const [extensionNumber, setExtensionNumber] = useState("");

  // Initialize extension number from auth token
  useEffect(() => {
    const token = getParsedToken();
    if (token?.extensionNumber) {
      setExtensionNumber(token.extensionNumber);
    }
  }, []);

  const value = {
    phoneState,
    setPhoneState,
    extensionNumber,
  };

  useEffect(() => {}, [phoneState]);

  return (
    <PhoneStateContext.Provider value={value}>
      {children}
    </PhoneStateContext.Provider>
  );
}

export function usePhoneState() {
  const context = useContext(PhoneStateContext);
  if (!context) {
    throw new Error("usePhoneState must be used within a PhoneStateProvider");
  }
  return context;
}
