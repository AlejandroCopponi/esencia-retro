import Link from "next/link";
import { ArrowRight, Star, Truck, ShieldCheck } from "lucide-react";

export default function Home() {
  // DATOS DE PRUEBA (MOCK DATA)
  // Esto es solo para diseñar. Después vendrán de tu base de datos real.
  const featuredProducts = [
    { id: 1, name: "Napoli 1987 (Maradona)", price: "$85.000", img: "https://placehold.co/400x400/1e3a8a/white?text=Napoli+87" },
    { id: 2, name: "Argentina 1994 (Visitante)", price: "$92.000", img: "https://placehold.co/400x400/102C57/white?text=Arg+94" },
    { id: 3, name: "Boca 2000 (Intercontinental)", price: "$88.000", img: "https://placehold.co/400x400/003366/yellow?text=Boca+2000" },
    { id: 4, name: "River 1996 (Libertadores)", price: "$88.000", img: "https://placehold.co/400x400/white/red?text=River+96" },
  ];

  return (
    <main className="min-h-screen bg-white">
      
      {/* 1. HERO SECTION (El Banner Principal con imagen de fondo) */}
      <section className="relative h-[85vh] flex items-center justify-center bg-blue-900 text-white overflow-hidden">
        {/* Capa oscura para que se lea el texto */}
        <div className="absolute inset-0 bg-black/50 z-10" />
        
        {/* Imagen de fondo (Usamos una foto genérica de fútbol por ahora) */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2000&auto=format&fit=crop')" }}
        />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <span className="text-yellow-400 font-bold tracking-widest text-sm md:text-base mb-2 block animate-pulse">
            NUEVA COLECCIÓN RETRO
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            LA HISTORIA <br/> EN TU PIEL
          </h1>
          <p className="text-lg md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Camisetas que reviven los momentos más gloriosos. Calidad premium, detalles de época y entrega inmediata.
          </p>
          <Link 
            href="/catalogo" 
            className="inline-flex items-center bg-white text-blue-900 font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-transform hover:scale-105"
          >
            Ver Camisetas <ArrowRight className="ml-2" />
          </Link>
        </div>
      </section>

      {/* 2. BARRA DE CONFIANZA (Iconos) */}
      <section className="py-10 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-4">
                <Truck className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-900 text-lg">Envíos a todo el país</h3>
                <p className="text-gray-500">Llegamos a cada rincón de Argentina</p>
            </div>
            <div className="flex flex-col items-center p-4">
                <ShieldCheck className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-900 text-lg">Compra Segura</h3>
                <p className="text-gray-500">Pagá con MP o Transferencia (-10%)</p>
            </div>
            <div className="flex flex-col items-center p-4">
                <Star className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-900 text-lg">Calidad Premium</h3>
                <p className="text-gray-500">Bordados y telas idénticas a la época</p>
            </div>
        </div>
      </section>

      {/* 3. PRODUCTOS DESTACADOS (La Vidriera) */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900">Recién Llegadas</h2>
              <p className="text-gray-500 mt-2">Las joyas que acaban de entrar al stock.</p>
            </div>
            <Link href="/catalogo" className="hidden md:flex items-center text-blue-600 font-bold hover:underline">
                Ver todo el catálogo <ArrowRight size={16} className="ml-1" />
            </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
                <Link key={product.id} href={`/producto/${product.id}`} className="group">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                            {/* Etiqueta de Nuevo */}
                            <span className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 rounded z-10">
                              NUEVO
                            </span>
                            {/* Imagen del producto */}
                            <img 
                                src={product.img} 
                                alt={product.name}
                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                            />
                            {/* Botón flotante al hacer hover */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <button className="w-full bg-white text-black font-bold py-3 rounded-xl shadow-lg hover:bg-gray-50">
                                Ver Detalle
                              </button>
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{product.name}</h3>
                            <p className="text-blue-600 font-bold text-xl">{product.price}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
        
        {/* Botón ver más para móviles */}
        <div className="mt-8 md:hidden text-center">
            <Link href="/catalogo" className="inline-block bg-gray-100 text-gray-900 font-bold py-3 px-8 rounded-full">
                Ver todo el catálogo
            </Link>
        </div>
      </section>

    </main>
  );
}