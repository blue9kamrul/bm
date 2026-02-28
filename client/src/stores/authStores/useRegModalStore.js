import { create } from 'zustand';

const useRegModalStore = create((set) => ({
  isRegModalOpen: false,
  openRegModal: () => set({ isRegModalOpen: true}),
  closeRegModal: () => set({ isRegModalOpen: false}),
}));

export default useRegModalStore;