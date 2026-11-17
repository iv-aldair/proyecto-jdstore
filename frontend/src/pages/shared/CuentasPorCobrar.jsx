import { Wrench } from 'lucide-react';

export default function CuentasPorCobrar() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-blue-50 p-6 rounded-full mb-6 text-blue-500 shadow-sm">
        <Wrench size={64} strokeWidth={1.5} />
      </div>
      <h2 className="text-3xl font-black text-gray-800 mb-2 tracking-tight">Módulo en Desarrollo</h2>
      <p className="text-gray-500 max-w-md text-lg">
        El módulo de Cuentas por Cobrar está siendo programado en este momento. ¡Pronto estará disponible!
      </p>
    </div>
  );
}
