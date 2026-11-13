import { useWallet } from '../context/WalletContext';

const Header = () => {
  const { balances, isLoading } = useWallet();

  return (
    <header className="main-header">
      <div className="logo">🎰 Mi Casino</div>
      
      <div className="global-balance-display">
        <span className="balance-label">Saldo:</span>
        <span className="balance-amount">
          {isLoading ? '...' : `$${Number(balances.real).toFixed(2)}`}
        </span>
      </div>
    </header>
  );
};

export default Header;