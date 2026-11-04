import { create } from 'zustand';
import api from '../api/axios';

const useWalletStore = create((set) => ({
  balance: 0,
  isLoading: false,
  error: null,

  // Acción para consultar el saldo real en tu backend
  fetchBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      // Ajusta '/wallet/balance' a la ruta exacta de tu backend
      const response = await api.get('/wallet/balance');
      set({ balance: response.data.balance, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al obtener el saldo',
        isLoading: false
      });
    }
  },

  // Acción para actualizar el saldo instantáneamente (ej. al ganar/perder en la ruleta)
  setBalance: (newBalance) => set({ balance: newBalance }),

  // Limpiar el estado al cerrar sesión
  clearWallet: () => set({ balance: 0, isLoading: false, error: null })
}));

export default useWalletStore;