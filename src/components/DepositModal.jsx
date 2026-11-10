import { useState } from 'react';
import api from '../api/axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './DepositModal.css';

// 1. Inicializamos Stripe fuera del componente para no recargarlo en cada render
// Reemplaza esto con tu clave PÚBLICA de Stripe (empieza con pk_test_...)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// 2. Sub-componente: El Formulario Seguro de Tarjeta
const CheckoutForm = ({ clientSecret, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage('');

    // Confirmamos el pago usando el clientSecret que nos dio tu backend
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe redirigirá aquí o terminará el flujo si es un pago modal
        return_url: window.location.origin + '/wallet',
      },
      redirect: "if_required" // Evita que recargue la página si no es estrictamente necesario
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <PaymentElement />
      {errorMessage && <div className="modal-error" style={{ marginTop: '1rem' }}>{errorMessage}</div>}
      <button type="submit" disabled={isProcessing || !stripe} className="btn-submit-deposit" style={{ marginTop: '1.5rem' }}>
        {isProcessing ? 'Procesando Pago...' : `Pagar $${amount}.00`}
      </button>
    </form>
  );
};

// 3. Componente Principal del Modal
const DepositModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [clientSecret, setClientSecret] = useState(''); // Guarda el ticket de Stripe
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Pantalla de éxito

  if (!isOpen) return null;

  // Paso 1: Pedir el client_secret al backend
  const handleRequestSecret = async (e) => {
    e.preventDefault();
    setError('');
    const depositAmount = parseFloat(amount);
    
    if (isNaN(depositAmount) || depositAmount < 10) {
      setError('El depósito mínimo es de $10.00');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/wallet/deposit', { amount: depositAmount });
    
      const secret = response.data?.clientSecret;
    
      if (!secret) {
          throw new Error("El backend no devolvió el clientSecret");
      } 
      setClientSecret(secret);
    
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Error al iniciar el depósito.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setAmount('');
    setClientSecret('');
    setPaymentSuccess(false);
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={resetAndClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close" onClick={resetAndClose}>&times;</button>
        
        {paymentSuccess ? (
          <div className="success-view" style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#c5a059', marginBottom: '1rem' }}>¡Depósito Exitoso!</h2>
            <p>Tus fondos han sido añadidos a tu billetera real.</p>
            <button className="btn-submit-deposit" onClick={() => { resetAndClose(); window.location.reload(); }} style={{ marginTop: '2rem' }}>
              Ver mi nuevo saldo
            </button>
          </div>
        ) : !clientSecret ? (
          <>
            <h2>Depositar Fondos</h2>
            <p className="modal-subtitle">Ingresa el monto que deseas recargar de forma segura.</p>
            {error && <div className="modal-error">⚠️ {error}</div>}
            
            <form onSubmit={handleRequestSecret}>
              <div className="input-group">
                <label>Monto a depositar (USD)</label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">$</span>
                  <input 
                    type="number" min="10" step="1"
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" disabled={isLoading} required 
                  />
                </div>
              </div>
              
              <div className="preset-amounts">
                <button type="button" onClick={() => setAmount(20)}> $20 </button>
                <button type="button" onClick={() => setAmount(50)}> $50 </button>
                <button type="button" onClick={() => setAmount(100)}> $100 </button>
              </div>

              <button type="submit" className="btn-submit-deposit" disabled={isLoading}>
                {isLoading ? 'Conectando con el Banco...' : 'Continuar'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Ingresa tu Tarjeta</h2>
            <p className="modal-subtitle">Transacción segura procesada por Stripe.</p>
            {/* Paso 2: Renderizar el formulario de Stripe con el ticket */}
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
              <CheckoutForm 
                clientSecret={clientSecret} 
                amount={amount} 
                onSuccess={() => setPaymentSuccess(true)} 
              />
            </Elements>
          </>
        )}
      </div>
    </div>
  );
};

export default DepositModal;