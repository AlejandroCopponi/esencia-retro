'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Star, ShieldCheck, Truck } from 'lucide-react';

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
    <div className="min-h-screen font-sans text-retro-ink">
      
      {/* 1. HERO (Restaurado el dorado) */}
      <section className="relative py-24 md:py-36 px-4 text-center border-b border-retro-line">
        
        <div className="flex justify-center mb-6">
            {/* ESTRELLA DORADA */}
            <Star className="text-retro-gold fill-retro-gold" size={24} />
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] mb-8 tracking-tighter uppercase text-retro-ink">
            LA HISTORIA<br/>
            {/* TEXTO DORADO */}
            <span className="text-retro-gold">
                EN TU PIEL
            </span>
        </h1>
        
        <p className="text-lg md:text-xl text-retro-muted max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Las camisetas más icónicas del fútbol mundial. Calidad premium, detalles de época y la mística de siempre.
        </p>
        
        <div className="flex justify-center">
            <Link 
                href="/catalogo" 
                className="bg-retro-ink text-white px-10 py-4 font-bold text-sm tracking-[0.2em] uppercase hover:bg-black transition-all shadow-xl hover:-translate-y-1"
            >
                Ver Colección
            </Link>
        </div>
      </section>

      {/* 2. BARRA DE BENEFICIOS */}
      <section className="py-12 bg-retro-base2 border-b border-retro-line">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
                <Truck className="mb-4 text-retro-ink opacity-80" size={28} /> 
                <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Envíos Nacionales</h3>
                <p className="text-retro-muted text-sm">A todo el país por Andreani</p>
            </div>
            <div className="flex flex-col items-center text-center border-y md:border-y-0 md:border-x border-retro-line py-4 md:py-0">
                <ShieldCheck className="mb-4 text-retro-ink opacity-80" size={28} /> 
                <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Compra Protegida</h3>
                <p className="text-retro-muted text-sm">Garantía total de satisfacción</p>
            </div>
            <div className="flex flex-col items-center text-center">
                <Star className="mb-4 text-retro-ink opacity-80" size={28} /> 
                <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Calidad Premium</h3>
                <p className="text-retro-muted text-sm">Detalles fieles a la época</p>
            </div>
        </div>
      </section>

      {/* 3. NOVEDADES */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16 border-b border-retro-line pb-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-retro-ink">
                Recién <span className="text-retro-gold">Llegadas</span>
            </h2>
            <Link href="/catalogo" className="hidden md:block text-xs font-bold uppercase tracking-widest hover:text-retro-gold transition-colors">
                Ver Todo el Catálogo
            </Link>
        </div>

        {loading ? (
            <div className="text-center py-20 text-retro-muted font-bold tracking-widest uppercase animate-pulse">Cargando tesoros...</div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                {featuredProducts.map((product) => (
                    <Link key={product.id} href={`/producto/${product.id}`} className="group block">
                        <div className="relative flex items-center justify-center aspect-[4/5] mb-4 bg-white/40 border border-retro-line rounded-xl overflow-hidden group-hover:border-retro-gold transition-colors">
                            <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                            />
                            <span className="absolute top-2 right-2 bg-retro-ink text-retro-gold text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                                Nuevo
                            </span>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="font-bold text-retro-ink text-sm md:text-base uppercase tracking-wide truncate group-hover:text-retro-gold transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-retro-muted font-bold text-sm mt-1">
                                ${(Number(product.price) || 0).toLocaleString('es-AR')}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </section>
    </div>
  );
}