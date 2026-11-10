import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fecha_nacimiento: ''
  });
  
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviamos el objeto completo con los 4 campos exactos que pide el backend
      await register(formData);
      
      // Mostramos mensaje de éxito y redirigimos al login tras 2 segundos
      setSuccessMsg('¡Cuenta creada con éxito! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      // Si hay error, Zustand ya lo capturó en la variable 'error'.
      // Solo limpiamos la contraseña por seguridad.
      setFormData(prev => ({ ...prev, password: '' }));
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2 className="register-title">Crear Cuenta</h2>
        
        {error && (
          <div className="error-alert">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {successMsg && (
          <div className="success-alert">
            <span className="alert-icon">✅</span>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input 
              id="username"
              name="username"
              type="text" 
              value={formData.username}
              onChange={handleChange}
              placeholder="Ej. HighRoller99"
              required 
              disabled={isLoading || successMsg}
              className="casino-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              id="email"
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="jugador@casino.com"
              required 
              disabled={isLoading || successMsg}
              className="casino-input"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              id="password"
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required 
              disabled={isLoading || successMsg}
              className="casino-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
            <input 
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              type="date" 
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              required 
              disabled={isLoading || successMsg}
              className="casino-input"
            />
          </div>

          <button type="submit" disabled={isLoading || successMsg} className="btn-submit">
            {isLoading ? 'Registrando...' : 'Comenzar a Jugar'}
          </button>
        </form>

        <p className="login-prompt">
          ¿Ya tienes una cuenta? <Link to="/login" className="login-link">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;