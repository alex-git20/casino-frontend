import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore'; 

// 1. Instancia base de Axios
const api = axios.create({
  // Asegúrate de que esta sea la URL y puerto de tu backend local
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. INTERCEPTOR DE PETICIONES (Lo que enviamos al Backend)
api.interceptors.request.use(
  (config) => {
    // Buscamos el token en el localStorage antes de que la petición salga
    const token = localStorage.getItem('token');
    
    // Si existe, lo inyectamos exactamente en el formato que pide tu auth.middleware.js
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. INTERCEPTOR DE RESPUESTAS (Lo que recibimos del Backend)
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (200, 201), la dejamos pasar normal
    return response;
  },
  (error) => {
    // Si el backend responde con 401 (UNAUTHORIZED - Token expirado o inválido)
    if (error.response && error.response.status === 401) {
      console.warn("Token expirado o inválido. Cerrando sesión...");
      
      // Llamamos a la acción logout de Zustand por fuera de React usando getState()
      useAuthStore.getState().logout();
      
      // Redirigimos al usuario a la página de login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;