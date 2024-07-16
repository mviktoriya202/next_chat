import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ChatStore = {
  data: Record<string, any>[];
  loading: boolean;
  setData: (msg: Record<string, any>) => void;
  setLoading: (loading: boolean) => void;
  saveEdit: (msg: Record<string, any>) => void;
  deleteMsg: (id: number) => void;
};

export const useChatStore = create(
  persist<ChatStore>(
    (set) => ({
      data: [],
      loading: true,
      setLoading: (loading) => set({ loading }),
      setData: (msg) => {
        set((state) => ({ data: [...state.data, msg] }));
      },
      saveEdit: (msg) => {
        set((state) => ({
          data: state.data.map((item) => {
            if (item.id === msg.id) {
              return msg;
            }
            return item;
          })
        }));
      },
      deleteMsg: (id) => {
        set((state) => ({
          data: state.data.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                deleted: true
              };
            }
            return item;
          })
        }));
      }
    }),
    { name: 'chat' }
  )
);
