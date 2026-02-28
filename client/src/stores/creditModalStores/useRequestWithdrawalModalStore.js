import { create } from 'zustand';

const useRequestWithdrawalModalStore = create((set) => ({
  isRequestWithdrawalModalOpen: false,
  bccWalletData: null,

  openRequestWithdrawalModal: (bccWalletData) => set({ isRequestWithdrawalModalOpen: true, bccWalletData: bccWalletData}),
  closeRequestWithdrawalModal: () => set({ isRequestWithdrawalModalOpen: false, bccWalletData: null}),

}));

export default useRequestWithdrawalModalStore;