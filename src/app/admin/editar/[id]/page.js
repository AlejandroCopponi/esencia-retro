export default function AdminPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-black text-gray-900 mb-6">Resumen</h2>
      
      {/* Tarjetas Simples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Ventas Hoy</p>
            <p className="text-3xl font-black text-gray-900">$0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Pedidos Pendientes</p>
            <p className="text-3xl font-black text-gray-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Productos</p>
            <p className="text-3xl font-black text-gray-900">-</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-lg border border-dashed border-gray-300 text-center text-gray-400">
        <p>Seleccioná una opción del menú izquierdo para empezar.</p>
      </div>
    </div>
  );
}