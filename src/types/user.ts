interface UserSettings {
  wsServer: string;
  wsPort: string;
  wsPath: string;
  domain: string;
  sipUsername: string;
  sipPassword: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  settings?: UserSettings;
}

interface Contact {
  id: string;
  name: string;
  number: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  settings: UserSettings | null;
  contacts: Contact[];
}

// Default user data
export const defaultUserData: UserData = {
  id: "",
  name: "",
  email: "",
  role: "user",
  status: "inactive",
  createdAt: new Date().toISOString(),
  settings: {
    wsServer: "",
    wsPort: "",
    wsPath: "/",
    domain: "",
    sipUsername: "",
    sipPassword: "",
    updatedAt: new Date().toISOString(),
  },
  contacts: [],
};

export type { UserSettings, User, Contact };