import { useState, useEffect } from 'react';
import api from '../api/axios';
import './TransactionHistory.css';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async (pageNumber = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/wallet/history?page=${pageNumber}&limit=5`);
      const payload = response.data.data || response.data;
      
      // Adaptabilidad a la respuesta de backend
      const list = payload.transactions || payload.history || (Array.isArray(payload) ? payload : []);
      const pageInfo = payload.pagination || { page: pageNumber, totalPages: 1 };

      setTransactions(list);
      setPagination(pageInfo);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudo cargar el historial de transacciones.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const getStatusBadge = (status) => {
    const s = String(status).toUpperCase();
    if (s === 'COMPLETED' || s === 'COMPLETADO' || s === 'APPROVED') {
      return <span className="badge badge-success">Completado</span>;
    }
    if (s === 'PENDING' || s === 'PENDIENTE') {
      return <span className="badge badge-warning">Pendiente</span>;
    }
    return <span className="badge badge-danger">Fallido / Rechazado</span>;
  };

  const getTypeLabel = (tx) => {
    const t = String(tx.tipo || tx.type || '').toUpperCase();
    const isCredit = String(tx.naturaleza || '').toLowerCase() === 'credito' || t === 'DEPOSIT' || t === 'DEPOSITO' || t === 'PREMIO';

    const labels = {
      DEPOSIT: '📥 Depósito',
      DEPOSITO: '📥 Depósito',
      PREMIO: '🏆 Premio',
      WITHDRAW: '📤 Retiro',
      RETIRO: '📤 Retiro',
      APUESTA: '🎲 Apuesta',
    };

    return (
      <span className={`tx-type ${isCredit ? 'type-deposit' : 'type-withdraw'}`}>
        {labels[t] || (isCredit ? '📥 Crédito' : '📤 Débito')}
      </span>
    );
  };

  return (
    <div className="history-container">
      <h3>📜 Historial de Movimientos</h3>

      {error && <div className="history-error">{error}</div>}

      {isLoading ? (
        <div className="history-loading">Cargando transacciones...</div>
      ) : transactions.length === 0 ? (
        <div className="history-empty">Aún no registras ningún movimiento en tu billetera.</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={tx.id_transaccion || tx.id || idx}>
                    <td>{getTypeLabel(tx)}</td>
                    <td className="tx-amount">
                      ${Number(tx.monto || tx.amount || 0).toFixed(2)}
                    </td>
                    <td>{getStatusBadge(tx.estado || tx.status)}</td>
                    <td className="tx-date">
                      {new Date(tx.fecha || tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="pagination-wrapper">
              <button
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => fetchHistory(pagination.page - 1)}
                className="btn-page"
              >
                Anterior
              </button>
              <span className="page-info">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => fetchHistory(pagination.page + 1)}
                className="btn-page"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionHistory;