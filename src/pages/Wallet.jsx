import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Wallet.css';
import DepositModal from '../components/DepositModal'; 
import WithdrawModal from '../components/WithdrawModal';
import TransactionHistory from '../components/TransactionHistory';
import { useWallet } from '../context/WalletContext';

const Wallet = () => {
  const { balances, isLoading, fetchWallet } = useWallet();
  const navigate = useNavigate();
 
  const [error, setError] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

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