import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const PrivateRoutes = () => {
  // Leemos el estado de autenticación desde nuestra tienda global
  const { isAuthenticated } = useAuthStore();

  // Si está autenticado, renderiza las rutas hijas (<Outlet />)
  // Si no, lo redirige a /login borrando el historial de esa visita (replace)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoutes;