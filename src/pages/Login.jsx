import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import api from '../api/axios'; // Listo para conectarse a tu backend

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulación de petición al backend. 
      // Cuando tu módulo auth esté listo, reemplazaremos el setTimeout con:
      // const response = await api.post('/auth/login', { email, password });
      // localStorage.setItem('token', response.data.token);
      
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Retraso simulado
      
      if (email && password) {
        localStorage.setItem('token', 'jwt_simulado_temporal');
        navigate('/dashboard');
      } else {
        setError('Por favor, ingresa correo y contraseña.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error de credenciales');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">Iniciar Sesión</h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-500/20 p-3 text-sm text-red-400 border border-red-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="jugador@casino.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
          >
            {isLoading ? 'Conectando...' : 'Entrar al Casino'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;