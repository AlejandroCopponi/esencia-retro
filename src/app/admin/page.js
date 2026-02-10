export default function AdminDashboard() {
  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">Visión General</h1>
          <p className="text-gray-500">Bienvenido al panel de control de Esencia Retro.</p>
        </div>
        <div className="text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-lg shadow-sm">
           📅 {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Tarjetas de Resumen (Ejemplo Visual) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Ventas Hoy', value: '$0', color: 'text-emerald-600', icon: '💰' },
          { title: 'Pedidos Pendientes', value: '0', color: 'text-amber-600', icon: '📦' },
          { title: 'Carritos Abandonados', value: '0', color: 'text-purple-600', icon: '🛒' },
          { title: 'Productos Activos', value: '-', color: 'text-blue-600', icon: '👕' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">{card.title}</h3>
                <span className="text-xl opacity-50">{card.icon}</span>
            </div>
            <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Área de trabajo vacía */}
      <div className="p-12 border-2 border-dashed border-gray-300 rounded-xl text-center">
        <p className="text-gray-400 font-medium">Seleccioná una opción del menú lateral para comenzar a trabajar.</p>
      </div>
    </div>
  );
}