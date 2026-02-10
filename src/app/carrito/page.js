'use client';

import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Trash2, ArrowRight, Minus, Plus, CreditCard, ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CarritoPage() {
  const { cart, removeFromCart, decreaseQuantity, increaseQuantity, addToCart, total } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  useEffect(() => {
    setIsMounted(true);
    fetchSuggested();
  }, [cart]);

  async function fetchSuggested() {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        const cartIds = cart.map(item => item.id);
        const filtered = data.filter(p => !cartIds.includes(p.id));
        setSuggestedProducts(filtered.slice(0, 4));
      }
    } catch (error) {
      console.error("Error cargando sugeridos", error);
    }
  }

  const COLORS = {
    gradient: 'linear-gradient(180deg, #f3ead7 0%, #efe3cf 100%)',
    ink: '#0f0f10',
    gold: '#c6a35a',
  };

  if (!isMounted) {
    return (
        <div className="min-h-screen flex items-center justify-center font-sans" style={{ background: COLORS.gradient }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f0f10]"></div>
        </div>
    );
  }

  // CARRITO VACÍO
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans px-4 text-center" style={{ background: COLORS.gradient }}>
        <h2 className="text-3xl font-black uppercase mb-4 text-[#0f0f10]">Tu carrito está vacío</h2>
        <p className="text-[#6f6f73] mb-8 font-medium">Parece que todavía no elegiste tu próxima piel.</p>
        <Link 
          href="/catalogo" 
          className="bg-[#0f0f10] text-white px-8 py-4 font-black uppercase tracking-widest hover:bg-[#c6a35a] hover:text-[#0f0f10] transition-colors shadow-lg rounded-sm"
        >
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans pt-28 pb-12 px-4 md:px-8" style={{ background: COLORS.gradient, color: COLORS.ink }}>
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b border-[#0f0f10]/10 pb-4 flex items-baseline gap-3">
          Tu Carrito <span className="text-[#c6a35a] text-2xl">({cart.reduce((a, b) => a + (b.quantity || 0), 0)} items)</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* COLUMNA IZQUIERDA: LISTA + SUGERIDOS */}
          <div className="lg:col-span-2">
            
            {/* 1. LISTA DE PRODUCTOS */}
            <div className="space-y-6 mb-12">
                {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="bg-white p-4 rounded-xl shadow-sm border border-[#0f0f10]/5 flex gap-4 items-center relative group hover:border-[#c6a35a]/30 transition-colors">
                    
                    {/* Imagen */}
                    <div className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-2" />
                    </div>

                    {/* Info */}
                    <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                        <h3 className="font-black text-sm md:text-base uppercase leading-tight text-[#0f0f10]">{item.name}</h3>
                        <p className="text-xs font-bold text-[#6f6f73] uppercase mt-1">Talle: <span className="text-[#0f0f10] bg-[#f3ead7] px-2 py-0.5 rounded text-[10px]">{item.size}</span></p>
                        </div>
                        
                        <button 
                        type="button"
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-[#6f6f73] hover:text-red-600 transition-colors p-2"
                        >
                        <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                        
                        {/* CONTROL DE CANTIDAD */}
                        <div className="flex items-center border border-[#0f0f10]/10 rounded-lg bg-gray-50 h-9 shadow-sm">
                            <button 
                                type="button"
                                onClick={() => decreaseQuantity(item.id, item.size)}
                                className="w-9 h-full flex items-center justify-center hover:bg-[#0f0f10]/5 transition-colors text-[#0f0f10]"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="w-10 h-full flex items-center justify-center font-bold text-sm bg-white border-x border-[#0f0f10]/10 text-[#0f0f10]">
                                {item.quantity}
                            </span>
                            <button 
                                type="button"
                                onClick={() => increaseQuantity(item.id, item.size)}
                                className="w-9 h-full flex items-center justify-center hover:bg-[#0f0f10]/5 transition-colors text-[#0f0f10]"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        <div className="text-right">
                            <p className="text-[10px] text-[#6f6f73] uppercase font-bold mb-0.5">Subtotal</p>
                            <p className="font-black text-lg text-[#0f0f10] font-mono">${(Number(item.price) * Number(item.quantity)).toLocaleString('es-AR')}</p>
                        </div>
                    </div>
                    </div>
                </div>
                ))}
            </div>

            {/* 2. BOTÓN SEGUIR COMPRANDO (SOLO TEXTO) */}
            <div className="mb-16">
                <Link 
                    href="/catalogo" 
                    className="inline-flex items-center gap-2 font-black text-[#6f6f73] hover:text-[#0f0f10] transition-colors text-base uppercase tracking-widest group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                    Seguir Comprando
                </Link>
            </div>

            {/* 3. SUGERIDOS */}
            {suggestedProducts.length > 0 && (
                <div className="border-t border-[#0f0f10]/10 pt-10">
                    <h3 className="font-black uppercase text-xl mb-6 flex items-center gap-2 text-[#0f0f10]">
                        <Sparkles size={20} className="text-[#c6a35a]" /> Quizás te interese
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {suggestedProducts.map(prod => (
                            <Link key={prod.id} href={`/producto/${prod.id}`} className="group bg-white rounded-xl p-3 border border-transparent hover:border-[#c6a35a] shadow-sm hover:shadow-lg transition-all relative">
                                <div className="absolute top-2 left-2 bg-[#0f0f10] text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-widest rounded-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    New
                                </div>
                                <div className="aspect-[4/5] mb-3 relative overflow-hidden rounded-lg bg-gray-50">
                                    <img src={prod.image_url} alt={prod.name} className="w-full h-full object-contain mix-blend-multiply p-2 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <h4 className="font-bold text-xs uppercase line-clamp-1 text-[#0f0f10] group-hover:text-[#c6a35a] transition-colors">{prod.name}</h4>
                                <p className="font-black text-sm text-[#0f0f10] mt-1">${(prod.price || 0).toLocaleString('es-AR')}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

          </div>

          {/* COLUMNA DERECHA: RESUMEN (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#0f0f10]/10 sticky top-32">
              <h2 className="font-black uppercase text-xl mb-6 border-b border-[#0f0f10]/10 pb-2">Resumen</h2>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-[#6f6f73]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#0f0f10]">${total.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-[#6f6f73]">
                  <span>Envío</span>
                  <span className="font-bold text-[#0f0f10] uppercase text-xs bg-gray-100 px-2 py-1 rounded">A calcular</span>
                </div>
                
                <div className="w-full h-px bg-[#0f0f10]/10 my-2"></div>
                
                <div className="flex justify-between text-[#0f0f10] text-xl font-black">
                  <span>Total</span>
                  <span>${total.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="bg-[#f3ead7] p-3 rounded-lg mb-6 flex gap-3 items-start border border-[#c6a35a]/20">
                  <CreditCard className="text-[#c6a35a] flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-bold text-[#6f6f73] uppercase leading-tight mb-1">Pagá en cuotas</p>
                    <p className="text-xs font-bold text-[#0f0f10]">
                        3 de <span className="text-sm">${(total/3).toLocaleString('es-AR', {maximumFractionDigits: 0})}</span> sin interés
                    </p>
                  </div>
              </div>

              {/* AQUÍ ESTÁ EL CAMBIO CLAVE: AHORA ES UN LINK A /checkout */}
              <Link 
                href="/checkout" 
                className="w-full bg-[#0f0f10] text-white py-4 font-black uppercase tracking-widest hover:bg-[#c6a35a] hover:text-[#0f0f10] transition-all transform hover:-translate-y-1 shadow-xl flex justify-center items-center gap-2 mb-4 rounded-sm"
              >
                Iniciar Compra <ArrowRight size={18} />
              </Link>
              
              <div className="flex items-center justify-center gap-2 text-[#6f6f73] text-[10px] uppercase font-bold opacity-70">
                <ShieldCheck size={14} /> Compra 100% Protegida
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}