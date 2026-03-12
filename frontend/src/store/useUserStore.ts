import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  age: number;
  nickname: string;
  setAge: (age: number) => void;
  setNickname: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      age: 4, // 默认4岁
      nickname: '宝贝',
      setAge: (age) => set({ age }),
      setNickname: (nickname) => set({ nickname }),
    }),
    {
      name: 'user-storage',
    }
  )
);
