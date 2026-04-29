import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  nickname: string;
  setNickname: (name: string) => void;
}

// 兼容某些禁用了 localStorage 的内置浏览器
const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch {}
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {}
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      nickname: '宝贝',
      setNickname: (nickname) => set({ nickname }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
