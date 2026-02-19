'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, ShieldCheck, Check, ShoppingBag, CreditCard, Minus, Plus, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';

export default function ProductPage() {
  const params = useParams();
  const { id } = params;
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

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
      const { data: currentProduct, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(currentProduct);
      setCurrentImage(currentProduct.image_url);

      if (currentProduct) {
        // CAMBIO 1: Traemos 10 productos para asegurar que el carrusel se llene
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category', currentProduct.category)
          .neq('id', currentProduct.id)
          .limit(10); 
        
        setRelatedProducts(related || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor, seleccioná un talle.");
      return;
    }
    setAdding(true);
    const productToSend = { ...product, size: selectedSize };
    addToCart(productToSend, quantity);
    setTimeout(() => {
      setAdding(false);
      setQuantity(1);
    }, 800);
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

  const price = Number(product.price || 0);
  const oldPrice = Number(product.old_price || 0);
  const hasDiscount = oldPrice > price;
  const discountPercent = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  const productImages = [
    product.image_url, 
    product.image_url2, 
    product.image_url3, 
    product.image_url4, 
    product.image_url5
  ].filter(Boolean);

  const isFav = isFavorite(product.id);

  return (
    <div className="min-h-screen font-sans pt-28 pb-12 px-4 md:px-8" style={{ background: COLORS.gradient, color: COLORS.ink }}>
      <div className="max-w-6xl mx-auto">
        <Link href="/catalogo" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6f6f73] hover:text-[#0f0f10] mb-8 transition-colors">
            <ArrowLeft size={16} /> Volver al Catálogo
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 mb-20 items-start">
            
            {/* GALERÍA */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-transparent hover:border-[#c6a35a] transition-all duration-500 overflow-hidden relative w-full">
                  <img 
                      src={currentImage} 
                      alt={product.name} 
                      className="w-full h-auto object-contain mix-blend-multiply p-4 md:p-8"
                  />
                  {hasDiscount && (
                      <span className="absolute top-4 left-4 bg-[#c6a35a] text-[#0f0f10] text-sm font-black px-3 py-1 uppercase tracking-tighter rounded-sm shadow-sm z-10">
                          {discountPercent}% OFF
                      </span>
                  )}
              </div>
              
              {productImages.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {productImages.map((img, index) => (
                    <button 
                      key={index} 
                      onClick={() => setCurrentImage(img)}
                      className={`w-20 h-20 bg-white border-2 rounded-lg p-2 transition-all ${currentImage === img ? 'border-[#0f0f10]' : 'border-transparent opacity-60'}`}
                    >
                      <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt={`Vista ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="flex flex-col">
                <span className="text-[#c6a35a] font-bold uppercase tracking-widest text-xs mb-2">
                    {product.category || 'Retro Football'}
                </span>
                
                {/* CONTENEDOR TÍTULO + CORAZÓN */}
                <div className="flex justify-between items-start gap-4 mb-4">
                    <h1 className="text-3xl md:text-4xl font-black uppercase leading-[0.9] tracking-tighter text-[#0f0f10]">
                        {product.name}
                    </h1>
                    
                    <button 
                        onClick={() => toggleFavorite(product)}
                        title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                        className={`p-3 rounded-full border transition-all flex-shrink-0 shadow-sm
                            ${isFav 
                                ? 'bg-red-50 border-red-200 text-red-500' 
                                : 'bg-white/50 border-[#0f0f10]/10 text-[#0f0f10]/40 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
                            }`}
                    >
                        <Heart size={24} className={isFav ? 'fill-current' : ''} />
                    </button>
                </div>
                
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

                <div className="mb-6">
                    <label className="font-black uppercase text-sm tracking-wide mb-3 block">1. Seleccionar Talle</label>
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
                </div>

                <div className="mb-8">
                    <label className="font-black uppercase text-sm tracking-wide mb-3 block">2. Cantidad</label>
                    <div className="flex items-center border border-[#0f0f10]/10 rounded overflow-hidden h-12 w-fit bg-white/50">
                        <button onClick={handleDecrease} className="w-12 h-full flex items-center justify-center hover:bg-[#0f0f10]/5 transition-colors text-[#0f0f10]"><Minus size={16} /></button>
                        <div className="w-12 h-full flex items-center justify-center font-black text-lg border-x border-[#0f0f10]/10">{quantity}</div>
                        <button onClick={handleIncrease} className="w-12 h-full flex items-center justify-center hover:bg-[#0f0f10]/5 transition-colors text-[#0f0f10]"><Plus size={16} /></button>
                    </div>
                </div>

                <button 
                    onClick={handleAddToCart}
                    disabled={!selectedSize || adding}
                    className={`w-full py-5 font-black uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1 shadow-xl flex items-center justify-center gap-3 rounded-sm mb-8
                        ${adding ? 'bg-green-600 text-white' : !selectedSize ? 'bg-gray-300 text-gray-500' : 'bg-[#c6a35a] text-[#0f0f10] hover:bg-[#0f0f10] hover:text-[#c6a35a]'}
                    `}
                >
                    {adding ? <>Agregado <Check size={20}/></> : <>Agregar al Carrito <ShoppingBag size={20}/></>}
                </button>

                {/* DESCRIPCIÓN CORTA (IA) */}
                <div className="mb-10 whitespace-pre-line text-sm leading-relaxed text-[#0f0f10] opacity-90 border-t border-[#0f0f10]/5 pt-8">
                  {product.description}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-[#6f6f73] uppercase tracking-wide">
                    <div className="flex items-center gap-3 p-3 border border-[#0f0f10]/10 rounded bg-white/50"><Truck className="text-[#c6a35a]" size={20} /> Envíos a todo el país</div>
                    <div className="flex items-center gap-3 p-3 border border-[#0f0f10]/10 rounded bg-white/50"><ShieldCheck className="text-[#c6a35a]" size={20} /> Compra Protegida</div>
                </div>
            </div>
        </div>
        
        {/* CAMBIO 2: CARRUSEL HORIZONTAL FORZADO */}
        {relatedProducts.length > 0 && (
            <div className="border-t border-[#0f0f10]/10 pt-16 mb-20">
                <h2 className="text-xl font-black uppercase mb-8 tracking-tighter">También te puede interesar</h2>
                
                {/* flex-nowrap: obliga a estar en una linea. overflow-x-auto: activa el scroll */}
                <div 
                    className="flex flex-nowrap overflow-x-auto gap-4 pb-8 px-1 snap-x snap-mandatory" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {relatedProducts.map((rel) => {
                         const relPrice = Number(rel.price || 0);
                        return (
                        <Link key={rel.id} href={`/producto/${rel.id}`} 
                            /* CAMBIO 3: flex-none y w-48 (ancho fijo) para que no se achiquen */
                            className="flex-none w-44 md:w-56 snap-start group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#c6a35a] relative"
                        >
                            <img src={rel.image_url} alt={rel.name} className="w-full h-36 md:h-48 object-contain mix-blend-multiply p-6 scale-90" />
                            <div className="p-3 border-t border-gray-100">
                                <h3 className="font-black text-[#0f0f10] text-[10px] uppercase truncate group-hover:text-[#c6a35a] transition-colors">{rel.name}</h3>
                                <p className="font-bold text-[#0f0f10] text-xs">${relPrice.toLocaleString('es-AR')}</p>
                            </div>
                        </Link>
                    )})}
                </div>
            </div>
        )}

        {/* TEXTO FIJO ABAJO DEL TODO */}
        <div className="max-w-3xl mx-auto border-t border-[#0f0f10]/10 pt-16 text-sm leading-relaxed text-[#0f0f10]/80">
            <h3 className="font-black uppercase tracking-widest mb-6 text-xs text-[#0f0f10]">Características destacadas:</h3>
            <p className="mb-2">⭐ Estampado en vinilo premium que garantiza durabilidad y un acabado impecable.</p>
            <p className="mb-2">🪡 Escudo y marca bordados, aportando un toque auténtico y elegante.</p>
            <p className="mb-2">🛡️ Cuello reforzado para mayor resistencia y comodidad.</p>
            <p className="mb-6">✂️ Tiras cocidas, que aseguran una mayor vida útil de la camiseta.</p>

            <p className="font-bold mb-10 text-[#0f0f10]">Esta camiseta es la elección perfecta para quienes valoran la calidad, el confort y el estilo en una sola prenda.</p>

            <h3 className="font-black uppercase tracking-widest mb-6 text-xs text-[#0f0f10]">Consejos para lavar tu camiseta:</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li>Voltea tu camiseta para mayor seguridad.</li>
                <li>Lavar a mano usando agua fria.</li>
                <li>Evitar remojar la prenda por más de una hora.</li>
                <li>Uso moderado de detergentes (evitar suavizantes).</li>
                <li>Secar a la sombra, colgada en una percha.</li>
                <li>Evitar secadora y plancha electrica.</li>
            </ul>
        </div>

      </div>
    </div>
  );
}