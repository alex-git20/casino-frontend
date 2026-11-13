import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

// 1. Creamos el contexto
const WalletContext = createContext();

// 2. Creamos el proveedor que envolverá tu app
export const WalletProvider = ({ children }) => {
  const [balances, setBalances] = useState({ real: 0, bono: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const response = await api.get('/api/wallet/balance');
      const walletData = response.data.data || response.data;
      
      setBalances({
        real: walletData.saldo_real || 0,
        bono: walletData.saldo_bono || 0
      });
    } catch (err) {
      console.error("Error al cargar saldo global:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Carga el saldo automáticamente cuando el usuario entra a la app
  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <WalletContext.Provider value={{ balances, fetchWallet, isLoading }}>
      {children}
    </WalletContext.Provider>
  );
};

// 3. Hook personalizado para usarlo fácilmente en cualquier componente
export const useWallet = () => useContext(WalletContext);