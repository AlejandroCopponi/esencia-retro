'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, ShieldCheck, Check, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductPage() {
  const params = useParams();
  const { id } = params;
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [adding, setAdding] = useState(false);

  const COLORS = {
    gradient: 'linear-gradient(180deg, #f3ead7 0%, #efe3cf 100%)',
    ink: '#0f0f10',
    gold: '#c6a35a',
    muted: '#6f6f73'
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      // 1. Producto principal
      const { data: currentProduct, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(currentProduct);

      // 2. Productos relacionados
      if (currentProduct) {
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category', currentProduct.category)
          .neq('id', currentProduct.id)
          .limit(4);
        
        setRelatedProducts(related || []);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor, seleccioná un talle.");
      return;
    }
    setAdding(true);
    addToCart({ ...product, size: selectedSize });
    
    setTimeout(() => {
      setAdding(false);
    }, 1500);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#efe3cf]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f0f10]"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#efe3cf]">
        <h1 className="text-2xl font-black uppercase mb-4">Producto no encontrado</h1>
        <Link href="/catalogo" className="border-b-2 border-[#0f0f10] font-bold">Volver al catálogo</Link>
    </div>
  );

  // CÁLCULOS DE PRECIO
  const price = Number(product.price || 0);
  const oldPrice = Number(product.old_price || 0);
  const hasDiscount = oldPrice > price;
  const discountPercent = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <div className="min-h-screen font-sans pt-28 pb-12 px-4 md:px-8" style={{ background: COLORS.gradient, color: COLORS.ink }}>
      
      <div className="max-w-6xl mx-auto">
        
        {/* BREADCRUMB */}
        <Link href="/catalogo" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6f6f73] hover:text-[#0f0f10] mb-8 transition-colors">
            <ArrowLeft size={16} /> Volver al Catálogo
        </Link>

        {/* FICHA DE PRODUCTO */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 mb-20 items-start">
            
            {/* COLUMNA IZQUIERDA: FOTO */}
            <div className="bg-white rounded-xl shadow-sm border border-transparent hover:border-[#c6a35a] transition-all duration-500 overflow-hidden relative w-full">
                <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-auto object-contain mix-blend-multiply p-4 md:p-8"
                />
                {/* Badge Descuento */}
                {hasDiscount && (
                    <span className="absolute top-4 left-4 bg-[#c6a35a] text-[#0f0f10] text-sm font-black px-3 py-1 uppercase tracking-tighter rounded-sm shadow-sm z-10">
                        {discountPercent}% OFF
                    </span>
                )}
            </div>

            {/* COLUMNA DERECHA: INFO */}
            <div className="flex flex-col">
                
                <span className="text-[#c6a35a] font-bold uppercase tracking-widest text-xs mb-2">
                    {product.category || 'Retro Football'}
                </span>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tighter mb-4 text-[#0f0f10]">
                    {product.name}
                </h1>
                
                {/* PRECIOS */}
                <div className="mb-6">
                    {hasDiscount && (
                        <p className="text-xl text-gray-400 font-bold line-through decoration-red-500/50 mb-1">
                            ${oldPrice.toLocaleString('es-AR')}
                        </p>
                    )}
                    <p className="text-4xl font-black text-[#0f0f10] font-mono">
                        ${price.toLocaleString('es-AR')}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#c6a35a] mt-2 uppercase tracking-wide">
                        <CreditCard size={16} />
                        <span>3 cuotas sin interés de ${(price/3).toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
                    </div>
                </div>
                
                <div className="w-full h-px bg-[#0f0f10]/10 mb-8"></div>

                {/* SELECTOR DE TALLE */}
                <div className="mb-8">
                    <div className="flex justify-between mb-3">
                        <label className="font-black uppercase text-sm tracking-wide">Seleccionar Talle</label>
                        <Link href="/guia-talles" className="text-xs font-bold text-[#c6a35a] hover:underline">Ver Guía de Talles</Link>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`w-14 h-14 flex items-center justify-center font-bold text-sm border-2 rounded transition-all
                                    ${selectedSize === size 
                                        ? 'bg-[#0f0f10] text-white border-[#0f0f10] shadow-lg scale-110' 
                                        : 'bg-transparent border-[#0f0f10]/20 text-[#6f6f73] hover:border-[#0f0f10] hover:text-[#0f0f10]'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                    {!selectedSize && <p className="text-xs text-red-500 font-bold mt-2 animate-pulse">* Elegí un talle para comprar</p>}
                </div>

                {/* BOTÓN DE COMPRA */}
                <button 
                    onClick={handleAddToCart}
                    disabled={!selectedSize || adding}
                    className={`w-full py-5 font-black uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1 shadow-xl flex items-center justify-center gap-3 rounded-sm mb-8
                        ${adding 
                            ? 'bg-green-600 text-white cursor-default'
                            : !selectedSize 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#c6a35a] text-[#0f0f10] hover:bg-[#0f0f10] hover:text-[#c6a35a]'
                        }
                    `}
                >
                    {adding ? (
                        <>Agregado <Check size={20}/></>
                    ) : (
                        <>Agregar al Carrito <ShoppingBag size={20}/></>
                    )}
                </button>

                {/* GARANTÍAS */}
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-[#6f6f73] uppercase tracking-wide">
                    <div className="flex items-center gap-3 p-3 border border-[#0f0f10]/10 rounded bg-white/50">
                        <Truck className="text-[#c6a35a]" size={20} /> Envíos a todo el país
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-[#0f0f10]/10 rounded bg-white/50">
                        <ShieldCheck className="text-[#c6a35a]" size={20} /> Compra Protegida
                    </div>
                </div>

            </div>
        </div>

        {/* RELACIONADOS */}
        {relatedProducts.length > 0 && (
            <div className="border-t border-[#0f0f10]/10 pt-16">
                <h2 className="text-2xl font-black uppercase mb-8 tracking-tighter">También te puede interesar</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 items-start">
                    {relatedProducts.map((rel) => {
                        const relPrice = Number(rel.price || 0);
                        const relOld = Number(rel.old_price || 0);
                        const relDiscount = relOld > relPrice;

                        return (
                            <Link key={rel.id} href={`/producto/${rel.id}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#c6a35a] relative">
                                <div className="w-full relative">
                                    <img src={rel.image_url} alt={rel.name} className="w-full h-auto object-contain mix-blend-multiply p-4" />
                                    {relDiscount && (
                                        <span className="absolute top-2 left-2 bg-[#c6a35a] text-[#0f0f10] text-[10px] font-black px-2 py-1 uppercase rounded-sm">
                                            OFF
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 border-t border-gray-100">
                                    <h3 className="font-black text-[#0f0f10] text-xs uppercase truncate group-hover:text-[#c6a35a] transition-colors">{rel.name}</h3>
                                    <div className="mt-1">
                                        {relDiscount && <p className="text-[10px] text-gray-400 line-through">${relOld.toLocaleString('es-AR')}</p>}
                                        <p className="font-bold text-[#0f0f10] text-sm">${relPrice.toLocaleString('es-AR')}</p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}