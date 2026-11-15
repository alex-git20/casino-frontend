import { create } from 'zustand';
import api from '../api/axios';

// Función para decodificar el JWT sin necesidad de instalar librerías extra
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    // Decodificación segura en base64 para evitar errores con caracteres especiales
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Inicialización segura
const initialToken = localStorage.getItem('token');
const initialUser = initialToken ? decodeToken(initialToken) : null;

export const useAuthStore = create((set) => ({
  token: initialToken || null,
  user: initialUser, // <-- AQUÍ YA TENEMOS AL USUARIO CON SU ROL
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,

  // Acción para Iniciar Sesión
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      
      const decodedUser = decodeToken(token); // Decodificamos el nuevo token
      
      set({ 
        token, 
        user: decodedUser, // Actualizamos el usuario
        isAuthenticated: true, 
        isLoading: false 
      });

    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Error al conectar con el servidor';
      set({ error: errorMsg, isLoading: false, isAuthenticated: false });
      throw new Error(errorMsg);
    }
  },

  // Acción para Registrarse
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/auth/register', userData);
      set({ isLoading: false });
      return response.data; 
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Error en el registro';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  // Acción para Cerrar Sesión
  logout: () => {
    localStorage.removeItem('token');
    set({ 
      token: null, 
      user: null, // Limpiamos el usuario
      isAuthenticated: false,
      error: null
    });
  }
}));