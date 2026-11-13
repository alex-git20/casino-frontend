import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  // Traemos la función logout de nuestra tienda global
  const { logout } = useAuthStore();

  const handleLogout = () => {
    // 1. Ejecutamos la limpieza del token en Zustand y localStorage
    logout();
    // 2. Redirigimos al usuario a la pantalla de inicio de sesión
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      {/* Barra de navegación superior */}
      <nav className="dashboard-nav">
        <h1 className="logo">🎰 Casino Imperial</h1>
        <button onClick={handleLogout} className="btn-logout">
          Cerrar Sesión
        </button>
      </nav>

      {/* Contenido principal del Lobby */}
      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>¡Bienvenido al Lobby!</h2>
          <p>Has ingresado a la zona segura. Tu sesión está protegida por un token JWT.</p>
          
          <div className="modules-grid">
            <div className="module-card">
              <h3>💰 Mi Billetera</h3>
              <p>Gestiona tus depósitos y retiros.</p>
              <button className="btn-submit" onClick={() => navigate('/wallet')} style={{ marginTop: '1rem', width: '100%' }}>
                Abrir Billetera
              </button>
            </div>
            
            <div className="module-card">
              <h3>🎡 Ruleta</h3>
              <p>Haz tus apuestas y gira la rueda.</p>
              <button className="btn-submit" onClick={() => navigate('/roulette')} style={{ marginTop: '1rem', width: '100%' }}>
                 Roulette
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;