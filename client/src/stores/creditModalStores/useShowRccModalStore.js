import { create } from "zustand";

const useShowRccModalStore = create((set) => ({
  isShowRccModalOpen: false,
  rcc: null,
  openShowRccModal: () => set({ isShowRccModalOpen: true }),
  closeShowRccModal: () => set({ isShowRccModalOpen: false }),
  setRcc: (data) => set({ rcc: data }),
}));

export default useShowRccModalStore;
