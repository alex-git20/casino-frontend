import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import './Login.css'; // La hoja de estilos

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard'); 
    } catch (err) {
      setPassword(''); // Limpiamos el campo por seguridad tras un fallo
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Bienvenido al Casino</h2>
        
        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jugador@casino.com"
              required 
              disabled={isLoading}
              className="casino-input"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
              disabled={isLoading}
              className="casino-input"
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-submit">
            {isLoading ? 'Conectando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="register-prompt">
          ¿No tienes cuenta? <Link to="/register" className="register-link">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;