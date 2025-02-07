import { create } from 'zustand';

interface User {
  id: number;
  nome: string;
  matricula: string;
  nivel: string;
  last_login?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setToken: (token: string) => set({ token }),
  setUser: (user: User | null) => set({ user }),
  clearAuth: () => set({ token: null, user: null }),
}));
