export interface User {
    id: number;
    email: string;
    name: string;
    avatar?: string;
    role: string;
    isActive: boolean;
  }