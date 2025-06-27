'use client';

import { User, UserData } from "@/types/user";
import { createContext, useEffect, useState } from "react";

type AuthContextType = {
  userData: UserData | null;
  loading: boolean;
  setUserData: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children} : {children: ReactNode}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      
    }
  })
}