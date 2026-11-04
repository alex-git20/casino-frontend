import { useNavigate } from 'react-router-dom';
import useWalletStore from '../store/useWalletStore';

const Dashboard = () => {
  const navigate = useNavigate();
  // Extraemos el saldo directamente del estado global
  const balance = useWalletStore((state) => state.balance);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="flex items-center justify-between bg-gray-800 px-6 py-4 shadow-md">
        <h1 className="text-xl font-bold text-emerald-400">Casino Central</h1>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400">Saldo Disponible</span>
            <span className="font-mono text-lg font-bold text-yellow-400">
              ${balance.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl p-6">
        <h2 className="mb-8 text-2xl font-semibold">Selecciona una opción</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tarjeta de Ruleta */}
          <div
            onClick={() => navigate('/ruleta')}
            className="group cursor-pointer rounded-2xl border border-gray-700 bg-gray-800 p-8 transition-all hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            <h3 className="text-2xl font-bold text-emerald-400 transition-colors group-hover:text-emerald-300">
              Ruleta Europea
            </h3>
            <p className="mt-3 text-gray-400">
              Mesa clásica. Apuestas internas, externas y multiplicadores de hasta 35x.
            </p>
          </div>

          {/* Tarjeta de Billetera (Stripe) */}
          <div className="group cursor-pointer rounded-2xl border border-gray-700 bg-gray-800 p-8 transition-all hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <h3 className="text-2xl font-bold text-blue-400 transition-colors group-hover:text-blue-300">
              Recargar Billetera
            </h3>
            <p className="mt-3 text-gray-400">
              Deposita fondos de forma segura usando tu tarjeta vía Stripe.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;