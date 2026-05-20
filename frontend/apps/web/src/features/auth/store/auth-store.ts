import { create } from 'zustand';

const TOKEN_KEY = 'mst_access_token';

interface AuthStore {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token });
  },
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null });
  },
}));
