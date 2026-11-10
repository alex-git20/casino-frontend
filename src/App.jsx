import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoutes from './components/PrivateRoutes';
// Componentes protegidos
import Dashboard from './pages/Dashboard';
import Roulette from './pages/Roulette';
import Wallet from './pages/Wallet';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas (Cualquiera puede entrar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* RUTAS PRIVADAS (Protegidas por el JWT) */}
        <Route element={<PrivateRoutes />}>
          {/* Todas las rutas aquí adentro requerirán login */}
          { <Route path="/dashboard" element={<Dashboard />} /> }
          { <Route path="/roulette" element={<Roulette />} /> }
          { <Route path="/wallet" element={<Wallet />} /> }
        </Route>
        
        {/* Ruta 404 para URLs que no existen */}
        <Route path="*" element={<div>404 - Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;