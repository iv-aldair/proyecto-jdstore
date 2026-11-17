import React, { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SgiReminders() {
  useEffect(() => {
    // Recordatorio de Pausa Activa (ISO 45001)
    // Se dispara cada 60 minutos (3600000 ms)
    const interval = setInterval(() => {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <span className="text-3xl">🧘‍♂️</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white">
                  ¡Hora de una pausa activa! (ISO 45001)
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Levántate, estira las piernas y descansa la vista de la pantalla por 5 minutos para prevenir la fatiga visual y muscular.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-slate-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-emerald-400 hover:text-emerald-300 focus:outline-none"
            >
              Cerrar
            </button>
          </div>
        </div>
      ), { duration: 15000 });
    }, 3600000); // 1 hora

    return () => clearInterval(interval);
  }, []);

  return null; // Este componente no renderiza nada visible
}
