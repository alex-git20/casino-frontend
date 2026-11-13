// Roulette.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext'; // <-- Ajusta la ruta si tu archivo se llama wallet.context.jsx
import api from '../api/axios';

const styles = {
  container: "min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden flex flex-col",
  navBar: "w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gray-800 border-b border-gray-700 shadow-lg",
  btnBack: "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white text-xs sm:text-sm font-semibold rounded-lg transition-all border border-gray-600 shadow-sm",
  logoTitle: "text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 tracking-widest uppercase drop-shadow-sm",
  mainContent: "w-full flex flex-col items-center p-2 sm:p-6 flex-1",
  layout: "w-full max-w-4xl flex justify-between items-center px-1 sm:px-4 mb-6",
  chipsPanel: "flex flex-col gap-1 sm:gap-2 rounded-full bg-gray-800 p-1 sm:p-2 shadow-inner border border-gray-700",
  chipBtn: "flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-full border-[3px] text-xs sm:text-sm font-bold shadow-lg transition-transform",
  chipActive: "border-emerald-400 bg-emerald-900 scale-110",
  chipInactive: "border-gray-500 bg-gray-700 hover:bg-gray-600",
  wheelOuter: "relative flex h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80 items-center justify-center rounded-full border-[8px] sm:border-[12px] md:border-[16px] border-[#3E2723] shadow-2xl",
  wheelPointer: "absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 text-yellow-500 text-2xl sm:text-3xl md:text-4xl z-20 drop-shadow-md",
  wheelInner: "absolute inset-0 rounded-full transition-transform duration-[2000ms]",
  isSpinning: "animate-[spin_0.3s_linear_infinite]",
  wheelCenter: "relative z-10 flex h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 flex-col items-center justify-center rounded-full border-[3px] sm:border-4 border-yellow-700 bg-gray-800 shadow-[inset_0_0_15px_black]",
  boardContainer: "select-none bg-green-800 p-1 sm:p-2 md:p-4 rounded-lg md:rounded-xl shadow-2xl w-full max-w-4xl border-2 sm:border-4 border-[#3E2723] mb-6",
  boardBtn: "flex items-center justify-center border border-white/50 font-bold hover:bg-white/20 transition-colors",
  boardBtnNum: "flex-1 py-1.5 sm:py-2 md:py-3 text-[9px] sm:text-xs md:text-lg hover:opacity-80 transition-opacity",
  boardBtnZero: "w-[8%] text-[10px] sm:text-sm md:text-xl",
  boardBtn2to1: "w-[10%] text-[7px] sm:text-[9px] md:text-sm",
  boardBtnSpecial: "flex-1 py-1.5 sm:py-2 text-[8px] sm:text-xs md:text-base",
  betSelected: "ring-[3px] ring-yellow-400 z-10"
};

const Roulette = () => {
  const navigate = useNavigate();
  // 1. Usamos tu WalletContext real
  const { balances, fetchWallet } = useWallet();
  const realBalance = Number(balances?.real || 0);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastNumber, setLastNumber] = useState(null);
  const [selectedBet, setSelectedBet] = useState(null);
  const [selectedChip, setSelectedChip] = useState(1); // Iniciamos en 1 porque apuesta_min en tu BD es 1.00
  const [errorMsg, setErrorMsg] = useState(null);

  const chips = [1, 5, 10, 25];
  const topRow = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
  const midRow = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
  const botRow = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const wheelNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

  const getNumberColor = (num) => redNumbers.includes(num) ? 'bg-red-600' : 'bg-black';
  const isSelected = (bet) => selectedBet === bet ? styles.betSelected : '';

  const getWheelBackground = () => {
    let gradient = 'conic-gradient(from -4.86deg, ';
    const step = 360 / 37;
    wheelNumbers.forEach((num, i) => {
      const color = num === 0 ? '#16a34a' : (redNumbers.includes(num) ? '#dc2626' : '#111827');
      gradient += `${color} ${i * step}deg ${(i + 1) * step}deg${i === 36 ? '' : ', '}`;
    });
    return gradient + ')';
  };

  // Helper para traducir la selección del tablero al formato exacto de tu backend (roulette.logic.js)
  const construirPayloadApuesta = (bet, tiposBD) => {
    let nombreTipo = '';
    let seleccion = {};

    if (typeof bet === 'number') {
      nombreTipo = 'pleno';
      seleccion = { numeros: [bet] };
    } else if (bet.startsWith('col')) {
      nombreTipo = 'columna';
      // En el tablero: col1 es la fila superior (3,6,9... -> n%3 === 0 -> valor 3), col2 es midRow (valor 2), col3 es botRow (valor 1)
      const mapCol = { col1: 3, col2: 2, col3: 1 };
      seleccion = { valor: mapCol[bet] };
    } else if (bet.endsWith('12')) {
      nombreTipo = 'docena';
      const mapDoc = { '1st12': 1, '2nd12': 2, '3rd12': 3 };
      seleccion = { valor: mapDoc[bet] };
    } else {
      const mapSencillas = {
        'red': 'rojo',
        'black': 'negro',
        'even': 'par',
        'odd': 'impar',
        '1-18': 'bajo',
        '19-36': 'alto'
      };
      nombreTipo = mapSencillas[bet];
      seleccion = {};
    }

    // Buscamos el id_tipo_apuesta real en la lista que devuelve la BD
    const tipoEncontrado = tiposBD.find(t => t.nombre.toLowerCase() === nombreTipo);
    if (!tipoEncontrado) {
      throw new Error(`El tipo de apuesta '${nombreTipo}' no está registrado en la tabla tipo_apuesta.`);
    }

    return { id_tipo_apuesta: tipoEncontrado.id_tipo_apuesta, seleccion };
  };

  const handleSpin = async () => {
    if (selectedBet === null) return setErrorMsg('Selecciona una apuesta en el tablero');
    if (realBalance < selectedChip) return setErrorMsg('Saldo insuficiente');
    
    setErrorMsg(null);
    setIsSpinning(true);
    setLastNumber(null);

    try {
      const idJuego = 1;

      // 1. Obtener tipos de apuesta de la BD y la ronda actual
      const [resTipos, resRonda] = await Promise.all([
        api.get(`/api/games/${idJuego}/tipos-apuesta`),
        api.get(`/api/games/${idJuego}/ronda-actual`)
      ]);

      const tiposBD = resTipos.data?.data || [];
      let idRonda = resRonda.data?.data?.id_ronda;

      // Si no hay ronda abierta, abrimos una
      if (!idRonda) {
        const resAbrir = await api.post('/api/games/rondas/abrir', { id_juego: idJuego });
        idRonda = resAbrir.data?.data?.id_ronda;
      }

      // 2. Armar payload compatible con roulette.logic.js
      const { id_tipo_apuesta, seleccion } = construirPayloadApuesta(selectedBet, tiposBD);

      // 3. Registrar la apuesta
      await api.post('/api/games/apuesta', {
        id_ronda: idRonda,
        id_tipo_apuesta,
        monto: selectedChip,
        seleccion
      });

      // 4. Cerrar y liquidar la ronda
      const resCerrar = await api.post('/api/games/rondas/cerrar', { id_ronda: idRonda });
      const liquidacion = resCerrar.data?.data;

      // Extraemos el número ganador desde resultado (construirResultado devuelve { numero_ganador, color })
      const winningNumber = liquidacion?.resultado?.numero_ganador ?? liquidacion?.numero_ganador ?? 0;

      // 5. Esperar animación y refrescar el WalletContext global
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setLastNumber(winningNumber);
      await fetchWallet(); // Actualiza balances.real en toda la app (incluyendo el Header)

    } catch (error) {
      setErrorMsg(
        error.response?.data?.error?.message || 
        error.message || 
        'Error al procesar la apuesta'
      );
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        <button onClick={() => navigate('/dashboard')} className={styles.btnBack}>
          ← Volver al Lobby
        </button>
        <h1 className={styles.logoTitle}>Roulette</h1>
        <div className="w-[120px] hidden sm:block"></div>
      </nav>

      <main className={styles.mainContent}>
        {errorMsg && (
          <div className="mb-4 text-red-400 font-semibold bg-red-950/60 border border-red-800 px-4 py-2 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        {/* --- Fichas y Rueda --- */}
        <div className={styles.layout}>
          <div className={styles.chipsPanel}>
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => setSelectedChip(chip)}
                className={`${styles.chipBtn} ${selectedChip === chip ? styles.chipActive : styles.chipInactive}`}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className={styles.wheelOuter}>
            <div className={styles.wheelPointer}>▼</div>

            <div 
              className={`${styles.wheelInner} ${isSpinning ? styles.isSpinning : ''}`}
              style={{ background: getWheelBackground() }}
            >
              {wheelNumbers.map((num, i) => (
                <div 
                  key={num} 
                  className="absolute inset-0 flex justify-center" 
                  style={{ transform: `rotate(${i * (360/37)}deg)` }}
                >
                   <span className="pt-1 text-[8px] sm:text-[10px] md:text-xs font-bold text-white drop-shadow-md">
                     {num}
                   </span>
                </div>
              ))}
            </div>
            
            <div className={styles.wheelCenter}>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-700 shadow-md border border-gray-500 z-0"></div>
               
               <div className="relative z-10 bg-black/70 px-2 sm:px-4 py-1 sm:py-2 rounded-lg backdrop-blur-sm shadow-xl">
                 {lastNumber !== null ? (
                    <span className={`text-2xl sm:text-4xl md:text-5xl font-bold ${lastNumber === 0 ? 'text-green-500' : redNumbers.includes(lastNumber) ? 'text-red-500' : 'text-white'}`}>
                      {lastNumber}
                    </span>
                 ) : (
                    <span className="text-gray-400 text-[8px] sm:text-[10px] md:text-sm font-semibold">APUESTA</span>
                 )}
               </div>
            </div>
          </div>
          
          <div className="w-10 sm:w-12 md:w-14"></div>
        </div>

        {/* --- Tablero de Apuestas --- */}
        <div className={styles.boardContainer}>
          <div className="w-full flex flex-col gap-[2px] sm:gap-1">
            <div className="flex gap-[2px] sm:gap-1 w-full">
              <button onClick={() => setSelectedBet(0)} className={`${styles.boardBtn} ${styles.boardBtnZero} ${isSelected(0)}`}>
                0
              </button>
              
              <div className="flex flex-col gap-[2px] sm:gap-1 flex-1">
                {[topRow, midRow, botRow].map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-[2px] sm:gap-1 w-full">
                    {row.map(num => (
                      <button key={num} onClick={() => setSelectedBet(num)} className={`${styles.boardBtn} ${styles.boardBtnNum} ${getNumberColor(num)} ${isSelected(num)}`}>
                        {num}
                      </button>
                    ))}
                    <button onClick={() => setSelectedBet(`col${rowIndex + 1}`)} className={`${styles.boardBtn} ${styles.boardBtn2to1} ${isSelected(`col${rowIndex + 1}`)}`}>
                      2to1
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-[2px] sm:gap-1 w-full mt-[2px] sm:mt-1">
              <div className="w-[8%]"></div>
              <div className="flex-1 flex gap-[2px] sm:gap-1">
                <button onClick={() => setSelectedBet('1st12')} className={`${styles.boardBtn} ${styles.boardBtnSpecial} ${isSelected('1st12')}`}>1st 12</button>
                <button onClick={() => setSelectedBet('2nd12')} className={`${styles.boardBtn} ${styles.boardBtnSpecial} ${isSelected('2nd12')}`}>2nd 12</button>
                <button onClick={() => setSelectedBet('3rd12')} className={`${styles.boardBtn} ${styles.boardBtnSpecial} ${isSelected('3rd12')}`}>3rd 12</button>
              </div>
              <div className="w-[10%]"></div>
            </div>

            <div className="flex gap-[2px] sm:gap-1 w-full mt-[2px] sm:mt-1">
              <div className="w-[8%]"></div>
              <div className="flex-1 flex gap-[2px] sm:gap-1">
                <button onClick={() => setSelectedBet('1-18')} className={`${styles.boardBtn} ${styles.boardBtnSpecial} ${isSelected('1-18')}`}>1-18</button>
                <button onClick={() => setSelectedBet('even')} className={`${styles.boardBtn} ${styles.boardBtnSpecial} ${isSelected('even')}`}>Par</button>
                <button onClick={() => setSelectedBet('red')} className={`${styles.boardBtn} bg-red-600 hover:bg-red-500 flex-1 ${isSelected('red')}`}>
                  <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-red-500 rotate-45 border border-white/30"></div>
                </button>
                <button onClick={() => setSelectedBet('black')} className={`${styles.boardBtn} bg-black hover:bg-gray-900 flex-1 ${isSelected('black')}`}>
                   <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-black rotate-45 border border-white/50"></div>
                </button>
                <button onClick={() => setSelectedBet('odd')} className={`${styles.boardBtn} ${styles.boardBtnSpecial} ${isSelected('odd')}`}>Impar</button>
                <button onClick={() => setSelectedBet('19-36')} className={`${styles.boardBtn} ${styles.boardBtnSpecial} ${isSelected('19-36')}`}>19-36</button>
              </div>
              <div className="w-[10%]"></div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 w-full max-w-xs sm:max-w-md">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full rounded-full bg-emerald-500 py-3 sm:py-4 text-sm sm:text-lg md:text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-600 disabled:scale-100 disabled:opacity-50"
          >
            {isSpinning ? 'Girando...' : `Apostar $${selectedChip}`}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Roulette;