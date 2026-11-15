import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const PrivateRoutes = ({ requireAdmin = false }) => {
  // Leemos el estado de autenticación y los datos del usuario desde la tienda global
  const { isAuthenticated, user } = useAuthStore();

  // 1. Si no está autenticado, lo redirigimos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si la ruta exige ser Admin, verificamos su rol
  if (requireAdmin && user?.rol_nombre !== 'admin' && user?.id_rol !== 1) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Si pasa las validaciones, renderiza las rutas hijas (<Outlet />)
  return <Outlet />;
};

export default PrivateRoutes;