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

export type { UserSettings, User };