import { create } from 'zustand';
import api from '../api/axios'; // Tu instancia de Axios configurada

export const useAuthStore = create((set) => ({
  // Estado inicial leyendo lo que haya en localStorage
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // Acción para Iniciar Sesión
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Petición POST exacta a la ruta que armó el backend
      const response = await api.post('/api/auth/login', { email, password });
      
      // 2. Extraer el token de la respuesta exitosa
      const { token } = response.data;
      
      // 3. Guardar en localStorage para persistir la sesión
      localStorage.setItem('token', token);
      
      // 4. Actualizar el estado global
      set({ 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });

    } catch (error) {
      // Leer exactamente la estructura de error anidada de tu backend
      const errorMsg = error.response?.data?.error?.message || 'Error al conectar con el servidor';
      
      set({ 
        error: errorMsg, 
        isLoading: false, 
        isAuthenticated: false 
      });
      
      throw new Error(errorMsg);
    }
  },

  // Acción para Registrarse
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      // userData trae: username, email, password, fecha_nacimiento
      const response = await api.post('/api/auth/register', userData);
      set({ isLoading: false });
      
      return response.data; // Devuelve { success, data: { usuario, billetera } }
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
      isAuthenticated: false,
      error: null
    });
  }
}));