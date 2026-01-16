'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(4);
      if (data) setFeaturedProducts(data);
      setLoading(false);
    }
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen font-sans">
      
      {/* 1. HERO */}
      <section className="relative py-24 md:py-36 px-4 max-w-6xl mx-auto text-center">
        
        <div className="flex justify-center mb-6">
            <Star className="text-retro-accent fill-retro-accent" size={24} />
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-retro-main leading-[0.9] mb-8 tracking-tighter uppercase">
            LA HISTORIA<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-retro-main to-gray-600">
                EN TU PIEL
            </span>
        </h1>
        
        {/* TEXTO CAMBIADO A PEDIDO */}
        <p className="text-lg md:text-xl text-gray-800 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Las camisetas más icónicas del fútbol mundial. Calidad premium, detalles de época y la mística de siempre.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link 
                href="/catalogo" 
                className="bg-retro-main text-retro-base px-10 py-4 font-bold text-sm tracking-[0.2em] uppercase hover:bg-retro-accent hover:text-white transition-all shadow-xl hover:scale-105"
            >
                Ver Colección
            </Link>
        </div>
      </section>

      {/* 2. BARRA DE BENEFICIOS */}
      <section className="border-y border-retro-main/10 py-12 bg-white/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-retro-main">
            <div className="flex flex-col items-center text-center">
                <Truck className="mb-4 text-retro-main" size={28} /> 
                <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Envíos Nacionales</h3>
                <p className="text-gray-700 text-sm">A todo el país por Andreani</p>
            </div>
            <div className="flex flex-col items-center text-center">
                <ShieldCheck className="mb-4 text-retro-main" size={28} /> 
                <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Compra Protegida</h3>
                <p className="text-gray-700 text-sm">Garantía total de satisfacción</p>
            </div>
            <div className="flex flex-col items-center text-center">
                <Star className="mb-4 text-retro-main" size={28} /> 
                <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Calidad Premium</h3>
                <p className="text-gray-700 text-sm">Detalles fieles a la época</p>
            </div>
        </div>
      </section>

      {/* 3. NOVEDADES */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16 border-b border-retro-main/10 pb-6">
            <h2 className="text-4xl md:text-5xl font-black text-retro-main tracking-tighter uppercase">
                Recién <span className="text-retro-accent">Llegadas</span>
            </h2>
            <Link href="/catalogo" className="hidden md:block text-xs font-bold uppercase tracking-widest text-retro-main hover:text-retro-accent transition-colors">
                Ver Todo el Catálogo
            </Link>
        </div>

        {loading ? (
            <div className="text-center py-20 text-gray-500">Cargando tesoros...</div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                {featuredProducts.map((product) => (
                    <Link key={product.id} href={`/producto/${product.id}`} className="group block">
                        <div className="rounded-xl relative mb-4 flex items-center justify-center aspect-[4/5] overflow-hidden transition-all duration-500">
                            <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                            />
                            <span className="absolute top-2 right-2 bg-retro-main text-retro-accent text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-sm">
                                Nuevo
                            </span>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="font-bold text-retro-main text-sm md:text-base uppercase tracking-wide truncate group-hover:text-retro-accent transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-gray-700 font-bold text-sm mt-1">${product.price.toLocaleString('es-AR')}</p>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </section>
    </div>
  );
}