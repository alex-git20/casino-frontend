import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useWalletStore from '../store/useWalletStore';

const Roulette = () => {
  const navigate = useNavigate();
  const { balance, setBalance } = useWalletStore(); 
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastNumber, setLastNumber] = useState(null);
  const [selectedBet, setSelectedBet] = useState(null);
  const [selectedChip, setSelectedChip] = useState(0.1);

  const chips = [0.1, 0.5, 1, 5];
  const topRow = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
  const midRow = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
  const botRow = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const wheelNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

  const getNumberColor = (num) => redNumbers.includes(num) ? 'bg-red-600' : 'bg-black';
  const isSelected = (bet) => selectedBet === bet ? 'ring-[3px] ring-yellow-400 z-10' : '';

  const getWheelBackground = () => {
    let gradient = 'conic-gradient(from -4.86deg, ';
    const step = 360 / 37;
    wheelNumbers.forEach((num, i) => {
      const color = num === 0 ? '#16a34a' : (redNumbers.includes(num) ? '#dc2626' : '#111827');
      gradient += `${color} ${i * step}deg ${(i + 1) * step}deg${i === 36 ? '' : ', '}`;
    });
    return gradient + ')';
  };

  const handleSpin = async () => {
    if (selectedBet === null) return alert('Selecciona una apuesta en el tablero');
    if (balance < selectedChip) return alert('Saldo insuficiente');
    
    setBalance(balance - selectedChip);
    setIsSpinning(true);
    setLastNumber(null);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLastNumber(Math.floor(Math.random() * 37));
    setIsSpinning(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden">
      <nav className="flex items-center justify-between bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 shadow-md">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors text-xs sm:text-base">
          ← Volver
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-gray-400 text-[10px] sm:text-sm">Saldo:</span>
          <span className="font-mono text-base sm:text-xl font-bold text-yellow-400">
            ${balance.toFixed(2)}
          </span>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl p-2 sm:p-6 flex flex-col items-center">
        {/* Fichas y Rueda Realista (Escalado responsivo) */}
        <div className="mb-6 flex w-full max-w-4xl justify-between items-center px-1 sm:px-4">
          <div className="flex flex-col gap-1 sm:gap-2 rounded-full bg-gray-800 p-1 sm:p-2 shadow-inner border border-gray-700">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => setSelectedChip(chip)}
                className={`flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-full border-[3px] text-xs sm:text-sm font-bold shadow-lg transition-transform ${
                  selectedChip === chip 
                    ? 'border-emerald-400 bg-emerald-900 scale-110' 
                    : 'border-gray-500 bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="relative flex h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80 items-center justify-center rounded-full border-[8px] sm:border-[12px] md:border-[16px] border-[#3E2723] shadow-2xl">
            <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 text-yellow-500 text-2xl sm:text-3xl md:text-4xl z-20 drop-shadow-md">
              ▼
            </div>

            <div 
              className={`absolute inset-0 rounded-full transition-transform duration-[2000ms] ${isSpinning ? 'animate-[spin_0.3s_linear_infinite]' : ''}`}
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
            
            <div className="relative z-10 flex h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 flex-col items-center justify-center rounded-full border-[3px] sm:border-4 border-yellow-700 bg-gray-800 shadow-[inset_0_0_15px_black]">
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

        {/* Tablero de Apuestas (Fluido y 100% ancho, sin scroll) */}
        <div className="mb-6 select-none bg-green-800 p-1 sm:p-2 md:p-4 rounded-lg md:rounded-xl shadow-2xl w-full max-w-4xl border-2 sm:border-4 border-[#3E2723]">
          <div className="w-full flex flex-col gap-[2px] sm:gap-1">
            
            <div className="flex gap-[2px] sm:gap-1 w-full">
              {/* Cero: 8% del ancho */}
              <button onClick={() => setSelectedBet(0)} className={`w-[8%] flex items-center justify-center border border-white/50 text-[10px] sm:text-sm md:text-xl font-bold hover:bg-white/20 transition-colors ${isSelected(0)}`}>
                0
              </button>
              
              <div className="flex flex-col gap-[2px] sm:gap-1 flex-1">
                {[topRow, midRow, botRow].map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-[2px] sm:gap-1 w-full">
                    {row.map(num => (
                      <button key={num} onClick={() => setSelectedBet(num)} className={`flex-1 py-1.5 sm:py-2 md:py-3 flex items-center justify-center border border-white/50 font-bold text-[9px] sm:text-xs md:text-lg hover:opacity-80 transition-opacity ${getNumberColor(num)} ${isSelected(num)}`}>
                        {num}
                      </button>
                    ))}
                    {/* 2to1: 10% del ancho interno */}
                    <button onClick={() => setSelectedBet(`col${rowIndex + 1}`)} className={`w-[10%] flex items-center justify-center border border-white/50 font-bold text-[7px] sm:text-[9px] md:text-sm hover:bg-white/20 transition-colors ${isSelected(`col${rowIndex + 1}`)}`}>
                      2to1
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-[2px] sm:gap-1 w-full mt-[2px] sm:mt-1">
              <div className="w-[8%]"></div>
              <div className="flex-1 flex gap-[2px] sm:gap-1">
                <button onClick={() => setSelectedBet('1st12')} className={`flex-1 py-1.5 sm:py-2 border border-white/50 font-bold text-[8px] sm:text-xs md:text-base hover:bg-white/20 transition-colors ${isSelected('1st12')}`}>1st 12</button>
                <button onClick={() => setSelectedBet('2nd12')} className={`flex-1 py-1.5 sm:py-2 border border-white/50 font-bold text-[8px] sm:text-xs md:text-base hover:bg-white/20 transition-colors ${isSelected('2nd12')}`}>2nd 12</button>
                <button onClick={() => setSelectedBet('3rd12')} className={`flex-1 py-1.5 sm:py-2 border border-white/50 font-bold text-[8px] sm:text-xs md:text-base hover:bg-white/20 transition-colors ${isSelected('3rd12')}`}>3rd 12</button>
              </div>
              <div className="w-[10%]"></div>
            </div>

            <div className="flex gap-[2px] sm:gap-1 w-full mt-[2px] sm:mt-1">
              <div className="w-[8%]"></div>
              <div className="flex-1 flex gap-[2px] sm:gap-1">
                <button onClick={() => setSelectedBet('1-18')} className={`flex-1 py-1.5 sm:py-2 border border-white/50 font-bold text-[8px] sm:text-xs md:text-base hover:bg-white/20 transition-colors ${isSelected('1-18')}`}>1-18</button>
                <button onClick={() => setSelectedBet('even')} className={`flex-1 py-1.5 sm:py-2 border border-white/50 font-bold text-[8px] sm:text-xs md:text-base hover:bg-white/20 transition-colors ${isSelected('even')}`}>Par</button>
                <button onClick={() => setSelectedBet('red')} className={`flex-1 py-1.5 sm:py-2 border border-white/50 bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center ${isSelected('red')}`}>
                  <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-red-500 rotate-45 border border-white/30"></div>
                </button>
                <button onClick={() => setSelectedBet('black')} className={`flex-1 py-1.5 sm:py-2 border border-white/50 bg-black hover:bg-gray-900 transition-colors flex items-center justify-center ${isSelected('black')}`}>
                   <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-black rotate-45 border border-white/50"></div>
                </button>
                <button onClick={() => setSelectedBet('odd')} className={`flex-1 py-1.5 sm:py-2 border border-white/50 font-bold text-[8px] sm:text-xs md:text-base hover:bg-white/20 transition-colors ${isSelected('odd')}`}>Impar</button>
                <button onClick={() => setSelectedBet('19-36')} className={`flex-1 py-1.5 sm:py-2 border border-white/50 font-bold text-[8px] sm:text-xs md:text-base hover:bg-white/20 transition-colors ${isSelected('19-36')}`}>19-36</button>
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