import { useState, useEffect } from 'react';
import api from '../api/axios'; // Ajusta la ruta si es necesario

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async (pageNumber = 1, searchTerm = search) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/admin/users?page=${pageNumber}&limit=10&search=${searchTerm}`);
      const payload = res.data?.data || res.data;
      
      setUsers(payload.users || []);
      setPagination(payload.pagination || { page: pageNumber, totalPages: 1 });
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('No se pudo cargar la lista de usuarios. Verifica tus permisos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, '');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'activo' ? 'baneado' : 'activo';
    
    // Confirmación de seguridad
    if (!window.confirm(`¿Estás seguro de que deseas cambiar el estado a ${newStatus.toUpperCase()}?`)) return;

    try {
      await api.patch(`/api/admin/users/${id}/status`, { estado: newStatus });
      // Actualizamos la fila en la tabla sin recargar toda la página
      setUsers(users.map(u => u.id_usuario === id ? { ...u, estado: newStatus } : u));
    } catch (err) {
      console.error('Error actualizando estado:', err);
      alert('Error al intentar actualizar el estado del usuario.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
              Panel de Administración
            </h1>
            <p className="text-gray-400 mt-1">Gestión de usuarios y auditoría de saldos</p>
          </div>
          
          {/* Buscador */}
          <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por usuario o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
            />
            <button 
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-r-lg transition-colors"
            >
              Buscar
            </button>
          </form>
        </header>

        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {/* Tabla de Usuarios */}
        <div className="bg-[#16181d] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1f222a] border-b border-gray-700 text-xs uppercase tracking-wider text-gray-400">
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Registro</th>
                  <th className="p-4 text-right">Saldo Real</th>
                  <th className="p-4 text-right">Saldo Bono</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {isLoading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">Cargando usuarios...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No se encontraron usuarios.</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id_usuario} className="hover:bg-gray-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-200">{user.username}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(user.fecha_registro).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right font-mono text-emerald-400 font-bold">
                        ${Number(user.saldo_real).toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-mono text-yellow-500">
                        ${Number(user.saldo_bono).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.estado === 'activo' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {user.estado.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(user.id_usuario, user.estado)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            user.estado === 'activo'
                              ? 'bg-red-950/50 hover:bg-red-900 text-red-400 border border-red-800'
                              : 'bg-emerald-950/50 hover:bg-emerald-900 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {user.estado === 'activo' ? 'Banear' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-800 flex justify-between items-center bg-[#1a1c23]">
              <button
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => fetchUsers(pagination.page - 1)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-400">
                Página <strong className="text-gray-200">{pagination.page}</strong> de {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => fetchUsers(pagination.page + 1)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;