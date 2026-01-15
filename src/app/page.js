'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, Star } from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      // Traemos solo las últimas 4 camisetas agregadas
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (data) setFeaturedProducts(data);
      setLoading(false);
    }
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. HERO SECTION (La Portada) */}
      <section className="relative bg-blue-900 text-white py-20 md:py-32 px-4 overflow-hidden">
        {/* Fondo decorativo abstracto */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
                LA HISTORIA <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    EN TU PIEL
                </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-10 font-medium">
                Las camisetas más icónicas del fútbol mundial. Calidad premium, detalles de época y la mística de siempre.
            </p>
            <Link 
                href="/catalogo" 
                className="inline-flex items-center bg-white text-blue-900 font-black py-4 px-8 rounded-full text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
            >
                Ver Colección Completa <ArrowRight className="ml-2" />
            </Link>
        </div>
      </section>

      {/* 2. SECCIÓN DE BENEFICIOS */}
      <section className="bg-gray-50 py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-blue-600">
                    <Truck size={32} />
                </div>
                <h3 className="font-bold text-lg mb-2">Envíos a todo el País</h3>
                <p className="text-gray-500 text-sm">Llegamos a cada rincón de Argentina con Andreani.</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-blue-600">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="font-bold text-lg mb-2">Compra Segura</h3>
                <p className="text-gray-500 text-sm">Tus datos protegidos y garantía de satisfacción.</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-blue-600">
                    <Star size={32} />
                </div>
                <h3 className="font-bold text-lg mb-2">Calidad Premium</h3>
                <p className="text-gray-500 text-sm">Detalles bordados y telas fieles a la época.</p>
            </div>
        </div>
      </section>

      {/* 3. ÚLTIMOS INGRESOS (Automático) */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Recién Llegadas</h2>
                <div className="h-1 w-20 bg-blue-600 rounded"></div>
            </div>
            <Link href="/catalogo" className="hidden md:block text-blue-600 font-bold hover:underline">
                Ver todo el catálogo
            </Link>
        </div>

        {loading ? (
            <div className="text-center py-10">Cargando novedades...</div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {featuredProducts.map((product) => (
                    <Link key={product.id} href={`/producto/${product.id}`} className="group block">
                        <div className="bg-gray-100 rounded-xl overflow-hidden aspect-[4/5] relative mb-3 flex items-center justify-center p-4">
                            <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                            />
                            <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                                NUEVO
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight mb-1 truncate">
                            {product.name}
                        </h3>
                        <p className="text-gray-600 font-medium">${product.price.toLocaleString('es-AR')}</p>
                    </Link>
                ))}
            </div>
        )}
        
        <div className="mt-8 text-center md:hidden">
            <Link href="/catalogo" className="text-blue-600 font-bold border border-blue-600 px-6 py-3 rounded-full inline-block w-full">
                Ver todo el catálogo
            </Link>
        </div>
      </section>

    </div>
  );
}