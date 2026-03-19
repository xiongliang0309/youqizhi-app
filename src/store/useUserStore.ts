import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  nickname: string;
  setNickname: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      nickname: '宝贝',
      setNickname: (nickname) => set({ nickname }),
    }),
    {
      name: 'user-storage',
    }
  )
);
