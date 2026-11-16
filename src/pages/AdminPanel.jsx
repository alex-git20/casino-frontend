import { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminPanel = () => {
  // Estado general
  const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'retiros'
  const [error, setError] = useState('');

  // Estados para Usuarios
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [userPagination, setUserPagination] = useState({ page: 1, totalPages: 1 });
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  // Estados para Retiros
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsPagination, setWithdrawalsPagination] = useState({ page: 1, totalPages: 1 });
  const [isWithdrawalsLoading, setIsWithdrawalsLoading] = useState(false);

  // Estados para Historial Global  
  const [transactions, setTransactions] = useState([]);
  const [txFilters, setTxFilters] = useState({ search: '', tipo: '', estado: '' });
  const [txPagination, setTxPagination] = useState({ page: 1, totalPages: 1 });
  const [isTxLoading, setIsTxLoading] = useState(false);

  // Estado para métricas ejecutivas
  const [kpis, setKpis] = useState({
    totalDepositado: 0,
    totalRetirado: 0,
    montoRetirosPendientes: 0,
    conteoRetirosPendientes: 0,
    ggr: 0,
    usuariosActivos: 0,
    totalUsuarios: 0
  });

  const fetchKPIs = async () => {
    try {
      const res = await api.get('/api/admin/kpis');
      const payload = res.data?.data || res.data;
      setKpis(payload);
    } catch (err) {
      console.error('Error al cargar KPIs:', err);
    }
  };

  // --- LÓGICA DE USUARIOS ---
  const fetchUsers = async (pageNumber = 1, searchTerm = search) => {
    setIsUsersLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/admin/users?page=${pageNumber}&limit=10&search=${searchTerm}`);
      const payload = res.data?.data || res.data;
      setUsers(payload.users || []);
      setUserPagination(payload.pagination || { page: pageNumber, totalPages: 1 });
    } catch (err) {
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'activo' ? 'baneado' : 'activo';
    if (!window.confirm(`¿Cambiar estado a ${newStatus.toUpperCase()}?`)) return;

    try {
      await api.patch(`/api/admin/users/${id}/status`, { estado: newStatus });
      setUsers(users.map(u => u.id_usuario === id ? { ...u, estado: newStatus } : u));
    } catch (err) {
      alert('Error al actualizar el estado del usuario.');
    }
  };

  // --- LÓGICA DE RETIROS ---
  const fetchWithdrawals = async (pageNumber = 1) => {
    setIsWithdrawalsLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/admin/withdrawals?page=${pageNumber}&limit=10`);
      const payload = res.data?.data || res.data;
      setWithdrawals(payload.withdrawals || []);
      setWithdrawalsPagination(payload.pagination || { page: pageNumber, totalPages: 1 });
    } catch (err) {
      setError('No se pudieron cargar los retiros pendientes.');
    } finally {
      setIsWithdrawalsLoading(false);
    }
  };

  const handleResolveWithdrawal = async (id_transaccion, accion) => {
    if (!window.confirm(`¿Estás seguro de que deseas ${accion.toUpperCase()} este retiro?`)) return;

    try {
      await api.patch(`/api/admin/withdrawals/${id_transaccion}/resolve`, { accion });
      // Removemos la transacción de la lista al procesarla
      setWithdrawals(withdrawals.filter(w => w.id_transaccion !== id_transaccion));

      // LLAMAS A fetchKPIs() PARA REFRESCAR LAS TARJETAS
      fetchKPIs();

      alert(`Retiro ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} con éxito.`);
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Error procesando el retiro.';
      alert(errorMsg);
    }
  };

  // --- LÓGICA DE HISTORIAL GLOBAL ---
  const fetchTransactions = async (pageNumber = 1, currentFilters = txFilters) => {
  setIsTxLoading(true);
  setError('');
  try {
    const params = new URLSearchParams({
      page: pageNumber,
      limit: 15,
      ...(currentFilters.search && { search: currentFilters.search }),
      ...(currentFilters.tipo && { tipo: currentFilters.tipo }),
      ...(currentFilters.estado && { estado: currentFilters.estado })
    });

    const res = await api.get(`/api/admin/transactions?${params.toString()}`);
    const payload = res.data?.data || res.data;
    setTransactions(payload.transactions || []);
    setTxPagination(payload.pagination || { page: pageNumber, totalPages: 1 });
  } catch (err) {
    setError('No se pudo cargar el historial global de transacciones.');
  } finally {
    setIsTxLoading(false);
  }
};

const handleTxFilterSubmit = (e) => {
  e.preventDefault();
  fetchTransactions(1, txFilters);
};

  // --- EFECTOS ---
  useEffect(() => {
    fetchKPIs();
  }, []);
  
  useEffect(() => {
  if (activeTab === 'usuarios') {
    fetchUsers(1, search);
  } else if (activeTab === 'retiros') {
    fetchWithdrawals(1);
  } else if (activeTab === 'historial') {
    fetchTransactions(1, txFilters);
  }
  // eslint-disable-next-line
}, [activeTab]);

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-6">
            Panel de Administración
          </h1>

          {/* ================= TARJETAS KPI EJECUTIVAS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            {/* Tarjeta 1: Total Depositado */}
            <div className="bg-[#16181d] border border-gray-800 rounded-xl p-5 shadow-lg">
              <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Total Depositado
              </div>
              <div className="text-2xl font-mono font-black text-emerald-400">
                ${Number(kpis.totalDepositado).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Ingresos confirmados vía pasarela
              </div>
            </div>

            {/* Tarjeta 2: Total Retirado + Pendientes */}
            <div className="bg-[#16181d] border border-gray-800 rounded-xl p-5 shadow-lg">
              <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Total Retirado
              </div>
              <div className="text-2xl font-mono font-black text-rose-400">
                ${Number(kpis.totalRetirado).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-yellow-500 mt-2 font-medium">
                {kpis.conteoRetirosPendientes} pendientes (${Number(kpis.montoRetirosPendientes).toFixed(2)})
              </div>
            </div>

            {/* Tarjeta 3: Ganancia Neta (GGR) */}
            <div className="bg-[#16181d] border border-gray-800 rounded-xl p-5 shadow-lg">
              <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Ganancia Casa (GGR)
              </div>
              <div className={`text-2xl font-mono font-black ${kpis.ggr >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                {kpis.ggr >= 0 ? '+' : '-'}${Math.abs(Number(kpis.ggr)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Apuestas menos premios pagados
              </div>
            </div>

            {/* Tarjeta 4: Jugadores Activos */}
            <div className="bg-[#16181d] border border-gray-800 rounded-xl p-5 shadow-lg">
              <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Jugadores Activos
              </div>
              <div className="text-2xl font-mono font-black text-blue-400">
                {kpis.usuariosActivos} <span className="text-sm font-normal text-gray-500">/ {kpis.totalUsuarios}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Cuentas habilitadas en plataforma
              </div>
            </div>

          </div>
          
          {/* Navegación por Pestañas */}
          <div className="flex space-x-4 border-b border-gray-800 pb-2">
            <button 
              onClick={() => setActiveTab('usuarios')}
              className={`px-4 py-2 font-bold transition-colors ${activeTab === 'usuarios' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Gestión de Usuarios
            </button>

            <button 
              onClick={() => setActiveTab('historial')}
              className={`px-4 py-2 font-bold transition-colors ${activeTab === 'historial' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Historial Global
            </button>

            <button 
              onClick={() => setActiveTab('retiros')}
              className={`px-4 py-2 font-bold transition-colors ${activeTab === 'retiros' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Retiros Pendientes
            </button>
          </div>
        </header>

        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {/* ================= VISTA: USUARIOS ================= */}
        {activeTab === 'usuarios' && (
          <div className="animate-fadeIn">
            <form onSubmit={handleSearch} className="flex w-full sm:w-auto mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-500"
              />
              <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-r-lg">
                Buscar
              </button>
            </form>

            <div className="bg-[#16181d] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1f222a] border-b border-gray-700 text-xs uppercase text-gray-400">
                      <th className="p-4">Usuario</th>
                      <th className="p-4 text-right">Saldo Real</th>
                      <th className="p-4 text-center">Estado</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {isUsersLoading ? (
                      <tr><td colSpan="4" className="p-8 text-center text-gray-500">Cargando...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-center text-gray-500">No hay usuarios.</td></tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id_usuario} className="hover:bg-gray-800/50">
                          <td className="p-4">
                            <div className="font-bold">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </td>
                          <td className="p-4 text-right font-mono text-emerald-400 font-bold">${Number(user.saldo_real).toFixed(2)}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.estado === 'activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {user.estado.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleToggleStatus(user.id_usuario, user.estado)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${user.estado === 'activo' ? 'bg-red-950/50 text-red-400' : 'bg-emerald-950/50 text-emerald-400'}`}>
                              {user.estado === 'activo' ? 'Banear' : 'Activar'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Paginación Usuarios */}
              {userPagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-800 flex justify-between bg-[#1a1c23]">
                  <button disabled={userPagination.page <= 1} onClick={() => fetchUsers(userPagination.page - 1)} className="px-4 py-2 bg-gray-800 rounded-lg text-sm disabled:opacity-50">Anterior</button>
                  <span className="text-sm text-gray-400">Página {userPagination.page} de {userPagination.totalPages}</span>
                  <button disabled={userPagination.page >= userPagination.totalPages} onClick={() => fetchUsers(userPagination.page + 1)} className="px-4 py-2 bg-gray-800 rounded-lg text-sm disabled:opacity-50">Siguiente</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VISTA: RETIROS ================= */}
        {activeTab === 'retiros' && (
          <div className="animate-fadeIn">
            <div className="bg-[#16181d] rounded-xl border border-gray-800 overflow-hidden shadow-2xl mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1f222a] border-b border-gray-700 text-xs uppercase text-gray-400">
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Jugador</th>
                      <th className="p-4">Cuenta de Destino</th>
                      <th className="p-4 text-right">Monto</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {isWithdrawalsLoading ? (
                      <tr><td colSpan="4" className="p-8 text-center text-gray-500">Cargando retiros...</td></tr>
                    ) : withdrawals.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-center text-gray-500">No hay retiros pendientes en este momento.</td></tr>
                    ) : (
                      withdrawals.map((tx) => (
                        <tr key={tx.id_transaccion} className="hover:bg-gray-800/50">
                          <td className="p-4 text-gray-400">{new Date(tx.fecha).toLocaleString()}</td>
                          <td className="p-4">
                            <div className="font-bold">{tx.username}</div>
                            <div className="text-xs text-gray-500">{tx.email}</div>
                          </td>
                          <td className="p-4">
                            {tx.cuenta_destino ? (
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs bg-gray-800 border border-gray-700 px-2.5 py-1 rounded text-gray-200">
                                  {tx.cuenta_destino}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(tx.cuenta_destino);
                                    alert('Cuenta copiada al portapapeles');
                                  }}
                                  className="text-xs text-yellow-500 hover:text-yellow-400 underline"
                                  title="Copiar cuenta"
                                >
                                  Copiar
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-600 italic">No especificada</span>
                            )}
                          </td>
                          <td className="p-4 text-right font-mono text-yellow-500 font-bold">
                            ${Number(tx.monto).toFixed(2)}
                          </td>
                          <td className="p-4 text-center space-x-2">
                            <button 
                              onClick={() => handleResolveWithdrawal(tx.id_transaccion, 'aprobar')}
                              className="px-3 py-1.5 bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 rounded-lg text-xs font-bold transition-colors"
                            >
                              Aprobar
                            </button>
                            <button 
                              onClick={() => handleResolveWithdrawal(tx.id_transaccion, 'rechazar')}
                              className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900 border border-red-800 text-red-400 rounded-lg text-xs font-bold transition-colors"
                            >
                              Rechazar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación Retiros */}
              {withdrawalsPagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-800 flex justify-between bg-[#1a1c23]">
                  <button disabled={withdrawalsPagination.page <= 1} onClick={() => fetchWithdrawals(withdrawalsPagination.page - 1)} className="px-4 py-2 bg-gray-800 rounded-lg text-sm disabled:opacity-50">Anterior</button>
                  <span className="text-sm text-gray-400">Página {withdrawalsPagination.page} de {withdrawalsPagination.totalPages}</span>
                  <button disabled={withdrawalsPagination.page >= withdrawalsPagination.totalPages} onClick={() => fetchWithdrawals(withdrawalsPagination.page + 1)} className="px-4 py-2 bg-gray-800 rounded-lg text-sm disabled:opacity-50">Siguiente</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VISTA: HISTORIAL GLOBAL ================= */}
        {activeTab === 'historial' && (
          <div className="animate-fadeIn">
            {/* Barra de Filtros */}
            <form onSubmit={handleTxFilterSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
              <input
                type="text"
                placeholder="Usuario o email..."
                value={txFilters.search}
                onChange={(e) => setTxFilters({ ...txFilters, search: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-500"
              />

              <select
                value={txFilters.tipo}
                onChange={(e) => setTxFilters({ ...txFilters, tipo: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-500"
              >
                <option value="">Todos los tipos</option>
                <option value="deposito">Depósito</option>
                <option value="retiro">Retiro</option>
                <option value="apuesta">Apuesta</option>
                <option value="premio">Premio</option>
              </select>

              <select
                value={txFilters.estado}
                onChange={(e) => setTxFilters({ ...txFilters, estado: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-500"
              >
                <option value="">Todos los estados</option>
                <option value="completado">Completado</option>
                <option value="pendiente">Pendiente</option>
                <option value="rechazado">Rechazado</option>
              </select>

              <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-lg transition-colors">
                Filtrar
              </button>
            </form>

            {/* Tabla de Auditoría */}
            <div className="bg-[#16181d] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1f222a] border-b border-gray-700 text-xs uppercase text-gray-400">
                      <th className="p-4">ID / Fecha</th>
                      <th className="p-4">Jugador</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4 text-right">Monto</th>
                      <th className="p-4 text-right">Saldo Real Post.</th>
                      <th className="p-4 text-right">Saldo Bono Post.</th>
                      <th className="p-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {isTxLoading ? (
                      <tr><td colSpan="7" className="p-8 text-center text-gray-500">Cargando movimientos...</td></tr>
                    ) : transactions.length === 0 ? (
                      <tr><td colSpan="7" className="p-8 text-center text-gray-500">No se encontraron transacciones con esos filtros.</td></tr>
                    ) : (
                      transactions.map((tx) => {
                        const isPositive = ['deposito', 'premio'].includes(tx.tipo_transaccion.toLowerCase());
                        return (
                          <tr key={tx.id_transaccion} className="hover:bg-gray-800/50">
                            <td className="p-4">
                              <div className="font-mono text-xs text-gray-400">#{tx.id_transaccion}</div>
                              <div className="text-xs text-gray-500">{new Date(tx.fecha).toLocaleString()}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold">{tx.username}</div>
                              <div className="text-xs text-gray-500">{tx.email}</div>
                            </td>
                            <td className="p-4 capitalize font-medium text-gray-300">
                              {tx.tipo_transaccion}
                            </td>
                            <td className={`p-4 text-right font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPositive ? '+' : '-'}${Number(tx.monto).toFixed(2)}
                            </td>
                            <td className="p-4 text-right font-mono text-gray-300">
                              ${Number(tx.saldo_real_posterior).toFixed(2)}
                            </td>
                            <td className="p-4 text-right font-mono text-gray-400">
                              ${Number(tx.saldo_bono_posterior).toFixed(2)}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                tx.estado === 'completado' ? 'bg-emerald-500/20 text-emerald-400' :
                                tx.estado === 'pendiente' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {tx.estado.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {txPagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-800 flex justify-between items-center bg-[#1a1c23]">
                  <button
                    disabled={txPagination.page <= 1}
                    onClick={() => fetchTransactions(txPagination.page - 1)}
                    className="px-4 py-2 bg-gray-800 rounded-lg text-sm disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-400">
                    Página {txPagination.page} de {txPagination.totalPages}
                  </span>
                  <button
                    disabled={txPagination.page >= txPagination.totalPages}
                    onClick={() => fetchTransactions(txPagination.page + 1)}
                    className="px-4 py-2 bg-gray-800 rounded-lg text-sm disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;