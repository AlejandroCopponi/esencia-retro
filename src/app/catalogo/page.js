'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Importamos el conector

export default function CatalogPage() {
  const [products, setProducts] = useState([]); // Estado para guardar los productos
  const [loading, setLoading] = useState(true); // Estado de carga

  // Esta función corre apenas entras a la página
  useEffect(() => {
    async function fetchProducts() {
      // 1. Pedimos todo a Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error('Error bajando productos:', error);
      } else {
        setProducts(data); // 2. Guardamos los datos reales
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-black text-gray-900">Catálogo Real (BD)</h1>
        </div>

        <div className="pt-6 pb-24 lg:grid lg:grid-cols-4 lg:gap-x-8">
          
          {/* FILTROS (Visuales por ahora) */}
          <aside className="hidden lg:block">
            <div className="border-b border-gray-200 py-6">
              <h3 className="font-bold text-gray-900 mb-4">Equipos</h3>
              <p className="text-sm text-gray-500">Pronto activaremos los filtros...</p>
            </div>
          </aside>

          {/* GRILLA DE PRODUCTOS */}
          <div className="lg:col-span-3">
             
             {/* Mostramos "Cargando..." mientras baja la data */}
             {loading && (
               <div className="text-center py-20">
                 <p className="text-xl text-gray-400 animate-pulse">Buscando camisetas en la base de datos...</p>
               </div>
             )}

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <Link key={product.id} href={`/producto/${product.id}`} className="group">
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                                <img 
                                    src={product.image_url} 
                                    alt={product.name}
                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 text-base mb-1">{product.name}</h3>
                                <p className="text-blue-600 font-bold text-lg">${product.price.toLocaleString('es-AR')}</p>
                            </div>
                        </div>
                    </Link>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}