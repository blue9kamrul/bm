import { create } from 'zustand';

const useResetPasswordModalStore = create((set) => ({
  isResetPasswordModalOpen: false,
  openResetPasswordModal: () => set({ isResetPasswordModalOpen: true}),
  closeResetPasswordModal: () => set({ isResetPasswordModalOpen: false}),
}));

export default useResetPasswordModalStore;