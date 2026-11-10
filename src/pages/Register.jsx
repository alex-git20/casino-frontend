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
  // NUEVO: Estado para guardar errores de validación del frontend
  const [validationError, setValidationError] = useState(''); 
  
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiamos el mensaje de error local si el usuario empieza a corregir
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(''); // Limpiar errores previos al intentar de nuevo

    // 🛡️ 1. VALIDACIÓN FRONTAL: Contraseña
    if (formData.password.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres.');
      return; // Detiene la ejecución, no envía la petición al backend
    }

    // 🛡️ 2. VALIDACIÓN FRONTAL: Mayoría de edad
    const fechaNac = new Date(formData.fecha_nacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    if (edad < 18) {
      setValidationError('Debes ser mayor de 18 años para jugar en el casino.');
      return; // Detiene la ejecución
    }

    // Si pasa nuestras validaciones locales, contactamos al servidor
    try {
      await register(formData);
      
      setSuccessMsg('¡Cuenta creada con éxito! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setFormData(prev => ({ ...prev, password: '' }));
    }
  };

  // Variable auxiliar: Si hay un error local lo mostramos, si no, mostramos el del backend
  const displayError = validationError || error;

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2 className="register-title">Crear Cuenta</h2>
        
        {/* Mostramos displayError en lugar de solo error */}
        {displayError && (
          <div className="error-alert">
            <span className="alert-icon">⚠️</span>
            {displayError}
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