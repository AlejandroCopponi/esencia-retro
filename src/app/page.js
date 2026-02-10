'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Star, ShieldCheck, Truck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colores Hardcoded para asegurar que se vea bien sin depender de config
  const COLORS = {
    gradient: 'linear-gradient(180deg, #f3ead7 0%, #efe3cf 100%)',
    ink: '#0f0f10',
    gold: '#c6a35a',
    muted: '#6f6f73'
  };

  useEffect(() => {
    async function fetchFeatured() {
      // Traemos 4 u 8 productos
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);
        
      if (data) setFeaturedProducts(data);
      setLoading(false);
    }
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen font-sans" style={{ background: COLORS.gradient, color: COLORS.ink }}>
      
      {/* 1. HERO (Tu versión con la Estrella y Tipografía) */}
      <section className="relative py-24 md:py-36 px-4 text-center border-b border-[#0f0f10]/10">
        
        <div className="flex justify-center mb-6 animate-fadeIn">
            {/* ESTRELLA DORADA */}
            <Star className="text-[#c6a35a] fill-[#c6a35a]" size={24} />
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] mb-8 tracking-tighter uppercase text-[#0f0f10]">
            LA HISTORIA<br/>
            <span className="text-[#c6a35a]">
                EN TU PIEL
            </span>
        </h1>
        
        <p className="text-lg md:text-xl text-[#6f6f73] max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Las camisetas más icónicas del fútbol mundial. Calidad premium, detalles de época y la mística de siempre.
        </p>
        
        <div className="flex justify-center">
            <Link 
                href="/catalogo" 
                className="bg-[#0f0f10] text-white px-10 py-4 font-black text-sm tracking-[0.2em] uppercase hover:bg-[#c6a35a] hover:text-[#0f0f10] transition-all shadow-xl hover:-translate-y-1 flex items-center gap-2"
            >
                Ver Colección <ArrowRight size={16}/>
            </Link>
        </div>
      </section>

      {/* 2. NOVEDADES (Con las Tarjetas tipo Catálogo) */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 border-b border-[#0f0f10]/10 pb-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-[#0f0f10]">
                Recién <span className="text-[#c6a35a]">Llegadas</span>
            </h2>
            <Link href="/catalogo" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-[#c6a35a] transition-colors">
                Ver Todo <ArrowRight size={14}/>
            </Link>
        </div>

        {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-80 bg-[#0f0f10]/5 rounded-xl"></div>)}
            </div>
        ) : (
            // GRILLA DEL CATÁLOGO (items-start + Tarjetas Blancas adaptables)
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 items-start">
                {featuredProducts.map((product) => (
                    <Link key={product.id} href={`/producto/${product.id}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#c6a35a]">
                        
                        {/* IMAGEN ADAPTABLE */}
                        <div className="w-full relative">
                            <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-auto object-contain mix-blend-multiply p-2"
                            />
                            {/* BADGE NUEVO */}
                            {new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                                <span className="absolute top-2 right-2 bg-[#0f0f10] text-[#c6a35a] text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">
                                    New
                                </span>
                            )}
                        </div>
                        
                        {/* INFO DE LA TARJETA */}
                        <div className="p-3 pt-1 border-t border-gray-100">
                            <h3 className="font-black text-[#0f0f10] text-xs md:text-sm uppercase tracking-tight leading-tight group-hover:text-[#c6a35a] transition-colors mb-1 line-clamp-2">
                                {product.name}
                            </h3>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-[#6f6f73] font-bold uppercase">{product.team || 'Retro'}</span>
                                <span className="font-bold text-[#0f0f10] text-sm">
                                    ${(Number(product.price) || 0).toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
        
        <div className="mt-12 text-center md:hidden">
            <Link href="/catalogo" className="inline-block border-b-2 border-[#0f0f10] pb-1 font-bold uppercase text-xs tracking-widest">Ver toda la tienda</Link>
        </div>
      </section>

      {/* 3. BARRA DE BENEFICIOS (Fondo Negro + Vivos Dorados) */}
      <section className="py-16 bg-[#111111] text-[#efe3cf] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            
            {/* ITEM 1 */}
            <div className="flex flex-col items-center group">
                <div className="bg-[#c6a35a] text-[#0f0f10] p-4 rounded-full mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(198,163,90,0.4)]">
                    <Truck size={32} strokeWidth={2} />
                </div>
                <h3 className="font-black uppercase text-lg mb-2 tracking-wide text-white">Envíos Nacionales</h3>
                <p className="text-sm opacity-60 max-w-xs font-medium">
                    Llegamos a cada rincón del país con embalaje reforzado.
                </p>
            </div>

            {/* ITEM 2 */}
            <div className="flex flex-col items-center group">
                <div className="bg-[#c6a35a] text-[#0f0f10] p-4 rounded-full mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(198,163,90,0.4)]">
                    <ShieldCheck size={32} strokeWidth={2} />
                </div>
                <h3 className="font-black uppercase text-lg mb-2 tracking-wide text-white">Compra Protegida</h3>
                <p className="text-sm opacity-60 max-w-xs font-medium">
                    Garantía total. Si no es lo que esperabas, lo cambiamos.
                </p>
            </div>

            {/* ITEM 3 */}
            <div className="flex flex-col items-center group">
                <div className="bg-[#c6a35a] text-[#0f0f10] p-4 rounded-full mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(198,163,90,0.4)]">
                    <Star size={32} strokeWidth={2} />
                </div>
                <h3 className="font-black uppercase text-lg mb-2 tracking-wide text-white">Calidad Premium</h3>
                <p className="text-sm opacity-60 max-w-xs font-medium">
                    Detalles fieles a la época. Telas y bordados de colección.
                </p>
            </div>

        </div>
      </section>

    </div>
  );
}