import { create } from 'zustand';

const useBuyBccModalStore = create((set) => ({
  isBuyBccModalOpen: false,
  openBuyBccModal: () => set({ isBuyBccModalOpen: true}),
  closeBuyBccModal: () => set({ isBuyBccModalOpen: false}),
}));

export default useBuyBccModalStore;