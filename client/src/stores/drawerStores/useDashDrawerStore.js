import { create } from 'zustand';

const useDashDrawertore = create((set) => ({
  isDrawerOpen: true,
  openDrawer: () => set({ isDrawerOpen: true}),
  closeDrawer: () => set({ isDrawerOpen: false}),
}));

export default useDashDrawertore;