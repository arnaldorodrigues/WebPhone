interface UserSettings {
  wsServer: string;
  wsPort: string;
  wsPath: string;
  domain: string;
  sipUsername: string;
  sipPassword: string;
  updatedAt: string;
}

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: "admin" | "user" | "moderator";
//   status: "active" | "inactive" | "suspended";
//   did: {
//     _id: string;
//     type: string;
//     config: {
//       phoneNumber: string;
//       projectId: string;
//       authToken: string;
//       spaceUrl: string;
//       apiKey: string;
//       apiSecret: string;
//     };
//   };
//   createdAt: string;
//   settings?: UserSettings;
// }

export interface IUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt: string;
  settings: UserSettings | null;
  contacts: Contact[];
  did?: {
    _id: string;
    type: string;
    config: {
      phoneNumber: string;
      projectId: string;
      authToken: string;
      spaceUrl: string;
      apiKey: string;
      apiSecret: string;
    };
  };
}


interface Contact {
  id: string;
  name: string;
  number: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  unreadCount?: number;
}

export const defaultUserData: IUserData = {
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
  did: {
    _id: "",
    type: "",
    config: {
      phoneNumber: "",
      projectId: "",
      authToken: "",
      spaceUrl: "",
      apiKey: "",
      apiSecret: "",
    },
  },
};