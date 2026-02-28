import { create } from 'zustand';

const useConfirmRentalRequestModalStore = create((set) => ({
  isConfirmRentalRequestModalOpen: false,
  data: null,

  openConfirmRentalRequestModal: (data) => set({ isConfirmRentalRequestModalOpen: true, data: data}),
  closeConfirmRentalRequestModal: () => set({ isConfirmRentalRequestModalOpen: false, data: null}),

}));

export default useConfirmRentalRequestModalStore;