import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoutes from './components/PrivateRoutes';

// Componentes protegidos
import Dashboard from './pages/Dashboard';
import Roulette from './pages/Roulette';
import Wallet from './pages/Wallet';

// Importe del Contexto y el Header
import { WalletProvider } from './context/WalletContext';
import Header from './components/Header';

// Este contenedor (Layout) asegura que el saldo global y el Header
// SOLO existan dentro de las zonas seguras del casino.
const PrivateLayout = () => {
  return (
    <WalletProvider>
      <Header />
      <Outlet /> {/* <Outlet /> le dice a React Router que aquí adentro inyecte la ruta hija (Dashboard, Wallet, etc.) */}
    </WalletProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas (Cualquiera puede entrar, sin contexto de billetera) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* RUTAS PRIVADAS (Protegidas por el JWT) */}
        <Route element={<PrivateRoutes />}>
          
          {/* Layout Privado que provee el saldo y el Navbar superior */}
          <Route element={<PrivateLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/roulette" element={<Roulette />} />
            <Route path="/wallet" element={<Wallet />} />
          </Route>
          
        </Route>
        
        {/* Ruta 404 para URLs que no existen */}
        <Route path="*" element={<div>404 - Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;