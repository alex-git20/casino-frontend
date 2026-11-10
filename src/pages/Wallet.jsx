import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Importamos nuestro cartero automático
import './Wallet.css';
import DepositModal from '../components/DepositModal'; 
import WithdrawModal from '../components/WithdrawModal';
import TransactionHistory from '../components/TransactionHistory';

const Wallet = () => {
  const navigate = useNavigate();
  const [balances, setBalances] = useState({ real: 0, bono: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Función para consultar el saldo y refrescar saldos
  const fetchWallet = async () => {
    try {
      setError('');
      // Axios inyectará automáticamente el "Bearer <token>" aquí
      const response = await api.get('/api/wallet/balance'); // Ruta de wallet para ver el saldo en el backend
        
      const walletData = response.data.data || response.data;
        
      setBalances({
        real: walletData.saldo_real || 0,
        bono: walletData.saldo_bono || 0
      });
    } catch (err) {
      console.error("Error al obtener billetera:", err);
      setError('No pudimos cargar tus saldos. Verifica la conexión con el casino.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <div className="wallet-wrapper">
      <nav className="wallet-nav">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Volver al Lobby
        </button>
        <h1 className="logo">💰 Mi Billetera</h1>
      </nav>

      <main className="wallet-content">
        {error && (
          <div className="error-alert">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="balances-container">
          {/* Tarjeta de Saldo Real */}
          <div className="balance-card real-balance">
            <h3>Saldo Real</h3>
            <div className="amount">
              {isLoading ? '...' : `$${Number(balances.real).toFixed(2)}`}
            </div>
            <p>Dinero disponible para retirar o apostar.</p>
            <div className="wallet-actions">
              <button className="btn-deposit" onClick={() => setIsDepositModalOpen(true)}>Depositar</button>
              <button className="btn-withdraw" onClick={() => setIsWithdrawModalOpen(true)}>Retirar</button>
            </div>
          </div>

          {/* Tarjeta de Saldo Bono */}
          <div className="balance-card bonus-balance">
            <h3>Saldo de Bono</h3>
            <div className="amount">
              {isLoading ? '...' : `$${Number(balances.bono).toFixed(2)}`}
            </div>
            <p>Créditos de regalo sujetos a requisitos de apuesta (Rollover).</p>
          </div>

          <TransactionHistory />
        </div> 
      </main>

      {/* Modales de Transacción */}
      <DepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => {
          setIsDepositModalOpen(false);
          fetchWallet(); // Actualiza el saldo si se completó un depósito
        }} 
      />

      <WithdrawModal 
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        currentBalance={balances.real}
        onWithdrawSuccess={fetchWallet} // Invoca fetchWallet tras un retiro exitoso
      />
    </div>
  );
};

export default Wallet;