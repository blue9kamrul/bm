import { create } from 'zustand';

const useCreditModalStore = create((set) => ({
  isCreditModalOpen: false,
  data: null,

  openCreditModal: (data) => set({ isCreditModalOpen: true, data: data}),
  closeCreditModal: () => set({ isCreditModalOpen: false, data: null}),

}));

export default useCreditModalStore;