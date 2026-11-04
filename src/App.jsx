import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Roulette from './pages/Roulette';

// Componente temporal para proteger rutas (luego lo conectaremos a useAuthStore)
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // Validación básica temporal
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componentes placeholder (los crearemos en el siguiente paso)
const Register = () => <div className="p-10 text-white">Página de Registro</div>;

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 font-sans">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas Privadas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ruleta" 
            element={
              <ProtectedRoute>
                <Roulette />
              </ProtectedRoute>
            } 
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;