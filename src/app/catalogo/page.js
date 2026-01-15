'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function CatalogoPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS PARA LOS FILTROS
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    async function fetchProducts() {
      // Traemos TODO de la base de datos
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // LÓGICA DE FILTRADO (El Cerebro)
  const filteredProducts = products.filter((product) => {
    // 1. Filtro por Categoría
    const categoryMatch = selectedCategory === 'Todos' || product.category === selectedCategory;
    
    // 2. Filtro por Buscador (busca en nombre o en equipo)
    const searchMatch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.team.toLowerCase().includes(searchTerm.toLowerCase());

    return categoryMatch && searchMatch;
  });

  // Lista de botones para los filtros
  const categories = ["Todos", "Nacional", "Internacional", "Selecciones", "Retro"];

  return (
    <div className="min-h-screen bg-white">
      
      {/* HEADER DEL CATÁLOGO */}
      <div className="bg-gray-50 border-b border-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Nuestra Colección</h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
                Explorá las camisetas más icónicas de la historia. Calidad premium y detalles únicos.
            </p>
            
            {/* BUSCADOR */}
            <div className="mt-8 max-w-md mx-auto relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar equipo, jugador o año..." 
                    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* FILTROS DE CATEGORÍA */}
      <div className="border-b border-gray-100 sticky top-16 bg-white/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
            <div className="flex space-x-2 py-4 md:justify-center min-w-max">
                {categories.map((cat) => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                            selectedCategory === cat 
                            ? 'bg-black text-white shadow-md' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* GRILLA DE PRODUCTOS (DISEÑO NUEVO) */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
            <div className="text-center py-20 text-gray-400">Cargando camisetas...</div>
        ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
                <p className="text-xl font-bold text-gray-400">No encontramos nada con esa búsqueda 😢</p>
                <button 
                    onClick={() => {setSearchTerm(''); setSelectedCategory('Todos');}}
                    className="mt-4 text-blue-600 font-bold hover:underline"
                >
                    Ver todas las camisetas
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
                <Link key={product.id} href={`/producto/${product.id}`} className="group block">
                
                {/* CAJA DE FOTO: Vertical (4/5) + Padding (p-4) + Contain */}
                <div className="bg-gray-100 rounded-xl overflow-hidden aspect-[4/5] relative mb-3 flex items-center justify-center p-4">
                    <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                    />
                    
                    {/* Etiqueta pequeña */}
                    <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded text-gray-800 border border-gray-200 shadow-sm">
                        {product.team}
                    </span>
                </div>

                {/* Textos */}
                <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight mb-1 group-hover:text-blue-600 transition-colors truncate">
                    {product.name}
                </h3>
                <p className="text-gray-600 text-sm font-medium">${product.price.toLocaleString('es-AR')}</p>
                </Link>
            ))}
            </div>
        )}
      </div>
    </div>
  );
}