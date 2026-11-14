// Header.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const Header = () => {
  const { balances, isLoading } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  // Detecta si estamos en el Dashboard/Lobby o dentro de un juego/billetera
  const isLobby = location.pathname === '/dashboard';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="w-full bg-[#16181d] border-b border-yellow-600/50 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg sticky top-0 z-50">
      {/* Izquierda: Logo / Marca */}
      <div 
        onClick={() => navigate('/dashboard')} 
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <span className="text-xl sm:text-2xl">🎰</span>
        <span className="text-base sm:text-xl font-bold text-[#e5b84b] tracking-wide group-hover:text-yellow-300 transition-colors">
          Casino Imperial
        </span>
      </div>

      {/* Derecha: Saldo global + Navegación / Cerrar Sesión */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Píldora de Saldo en tiempo real */}
        <div className="flex items-center gap-2 bg-[#1f222a] border border-yellow-600/30 px-3 sm:px-4 py-1.5 rounded-full shadow-inner">
          <span className="text-xs sm:text-sm text-gray-400 font-medium">Saldo:</span>
          <span className="text-xs sm:text-sm font-bold text-emerald-400">
            {isLoading ? '...' : `$${Number(balances?.real || 0).toFixed(2)}`}
          </span>
        </div>

        {/* Botón dinámico: "Lobby" si estás en Ruleta/Wallet, o "Cerrar Sesión" si estás en el Dashboard */}
        {!isLobby ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 sm:px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white text-xs sm:text-sm font-semibold rounded-lg border border-gray-600 transition-all"
          >
            ← Lobby
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-1.5 bg-transparent hover:bg-red-950/50 text-red-400 hover:text-red-300 text-xs sm:text-sm font-semibold rounded-lg border border-red-800/70 transition-all"
          >
            Cerrar Sesión
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;