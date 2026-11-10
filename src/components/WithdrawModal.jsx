import { useState } from 'react';
import api from '../api/axios';
import './DepositModal.css'; // Reutilizamos el CSS del depósito

const WithdrawModal = ({ isOpen, onClose, currentBalance, onWithdrawSuccess }) => {
  const [amount, setAmount] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const withdrawAmount = parseFloat(amount);
    
    // Validaciones del Frontend
    if (isNaN(withdrawAmount) || withdrawAmount < 10) {
      setError('El retiro mínimo es de $10.00');
      return;
    }

    if (withdrawAmount > currentBalance) {
      setError('No tienes fondos suficientes (Saldo actual: $' + currentBalance.toFixed(2) + ')');
      return;
    }

    if (!destinationAccount.trim()) {
      setError('Por favor, indica tu cuenta de destino (ej. CBU, IBAN, o email de PayPal).');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/wallet/withdraw', { 
        amount: withdrawAmount,
        destinationAccount: destinationAccount
      });
      
      setSuccess('¡Solicitud registrada con éxito! Está pendiente de revisión.');
      
      // Esperamos 2.5 segundos para que lea el éxito, cerramos y actualizamos el saldo
      setTimeout(() => {
        onWithdrawSuccess(); 
        resetAndClose();
      }, 2500);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Error al solicitar el retiro.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setAmount('');
    setDestinationAccount('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={resetAndClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close" onClick={resetAndClose}>&times;</button>
        
        <h2>Retirar Fondos</h2>
        <p className="modal-subtitle">Tu saldo disponible es de <strong>${Number(currentBalance).toFixed(2)}</strong></p>

        {error && <div className="modal-error">⚠️ {error}</div>}
        {success && <div className="success-view" style={{ color: '#c5a059', marginBottom: '1rem' }}>✅ {success}</div>}

        {!success && (
          <form onSubmit={handleWithdraw}>
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label>Monto a retirar (USD)</label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">$</span>
                <input 
                  type="number" min="10" step="1" max={currentBalance}
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" disabled={isLoading} required 
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label>Cuenta de Destino</label>
              <input 
                type="text"
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value)}
                placeholder="Ej: Banco Nacional - Cuenta 123456"
                disabled={isLoading}
                required
                style={{ width: '100%', padding: '1rem', background: '#121418', border: '1px solid #495057', borderRadius: '6px', color: 'white', marginTop: '0.5rem' }}
              />
            </div>

            <button type="submit" className="btn-submit-deposit" disabled={isLoading || currentBalance < 10}>
              {isLoading ? 'Procesando...' : 'Solicitar Retiro'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal;