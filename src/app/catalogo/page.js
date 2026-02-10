'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, ShoppingBag, CreditCard } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

function CatalogoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const initialCategory = searchParams.get('category') || 'todos';
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const COLORS = {
    gradient: 'linear-gradient(180deg, #f3ead7 0%, #efe3cf 100%)',
    ink: '#0f0f10',
    gold: '#c6a35a',
    muted: '#6f6f73'
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const paramCategory = searchParams.get('category');
    if (paramCategory) setCategoryFilter(paramCategory);
    else setCategoryFilter('todos');
  }, [searchParams]);

  useEffect(() => {
    if (products.length > 0) applyFilters();
  }, [searchTerm, categoryFilter, sortOrder, products]);

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    setLoading(false);
  }

  function normalize(text) {
    if (!text) return '';
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function applyFilters() {
    let temp = [...products];

    // 1. Buscador
    if (searchTerm) {
      const term = normalize(searchTerm);
      temp = temp.filter(p => 
        normalize(p.name).includes(term) || 
        normalize(p.team || '').includes(term)
      );
    }

    // 2. Categoría
    if (categoryFilter !== 'todos') {
      temp = temp.filter(p => {
        const productCat = normalize(p.category || ''); 
        const filterCat = normalize(categoryFilter); 
        
        if (filterCat === 'nacional') return productCat.includes('nacional') && !productCat.includes('internacional');
        if (filterCat === 'internacional') return productCat.includes('internacional');
        if (filterCat === 'selecciones') return productCat.includes('seleccion'); 
        if (filterCat === 'retro') return productCat.includes('retro') || productCat.includes('leyenda');
        
        return productCat === filterCat;
      });
    }

    // 3. Orden
    if (sortOrder === 'asc') {
      temp.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOrder === 'desc') {
      temp.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      temp.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredProducts(temp);
  }

  const updateFilter = (newCat) => {
    setCategoryFilter(newCat);
    setShowFiltersMobile(false);
    router.push(`/catalogo?category=${newCat}`, { scroll: false });
  };

  return (
    <div className="min-h-screen font-sans pt-28 pb-12 px-4 md:px-8" style={{ background: COLORS.gradient, color: COLORS.ink }}>
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 border-b border-[#0f0f10]/10 pb-6 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-2">
                Colección <span style={{ color: COLORS.gold }}>Completa</span>
            </h1>
            <p className="text-[#6f6f73] font-medium max-w-md text-sm md:text-base">
                {categoryFilter === 'todos' ? 'Mostrando todo el inventario' : `Categoría: ${categoryFilter.toUpperCase()}`}
            </p>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6f6f73]">Ordenar:</span>
            <select 
                className="bg-white/50 border border-[#0f0f10]/10 rounded px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-[#c6a35a]"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
            >
                <option value="newest">Más Nuevos</option>
                <option value="asc">Menor Precio</option>
                <option value="desc">Mayor Precio</option>
            </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTROS */}
        <aside className={`
            fixed inset-0 z-50 bg-[#efe3cf] p-6 transition-transform transform 
            ${showFiltersMobile ? 'translate-x-0' : '-translate-x-full'}
            lg:relative lg:translate-x-0 lg:block lg:z-0 lg:p-0 lg:bg-transparent
        `}>
            <div className="flex justify-between items-center lg:hidden mb-6">
                <h2 className="text-2xl font-black uppercase">Filtros</h2>
                <button onClick={() => setShowFiltersMobile(false)}><X size={24}/></button>
            </div>

            <div className="mb-8 relative">
                <input 
                    type="text" 
                    placeholder="Buscar equipo..." 
                    className="w-full bg-white/60 border border-[#0f0f10]/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-[#c6a35a] transition-colors text-sm font-bold placeholder-[#6f6f73]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-[#6f6f73]" size={18} />
            </div>

            <div className="mb-8">
                <h3 className="font-black uppercase tracking-widest text-xs mb-4 border-b border-[#0f0f10]/10 pb-2">Categorías</h3>
                <div className="space-y-3">
                    {[
                        { id: 'todos', label: 'Ver Todo' },
                        { id: 'nacional', label: 'Nacionales' },
                        { id: 'internacional', label: 'Internacionales' },
                        { id: 'selecciones', label: 'Selecciones' },
                        { id: 'retro', label: 'Leyendas / Retro' }
                    ].map((cat) => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="radio" 
                                name="category" 
                                className="peer sr-only"
                                checked={categoryFilter === cat.id}
                                onChange={() => updateFilter(cat.id)}
                            />
                            <div className="w-3 h-3 border border-[#0f0f10]/40 rounded-full peer-checked:bg-[#c6a35a] peer-checked:border-[#c6a35a] transition-all"></div>
                            <span className="text-sm font-bold text-[#6f6f73] peer-checked:text-[#0f0f10] group-hover:text-[#c6a35a] transition-colors uppercase tracking-wide">
                                {cat.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </aside>

        {/* GRILLA DE PRODUCTOS */}
        <div className="lg:col-span-3">
            
            <div className="flex lg:hidden gap-4 mb-6">
                <button 
                    onClick={() => setShowFiltersMobile(true)}
                    className="flex-1 bg-white/50 border border-[#0f0f10]/10 py-3 rounded-lg font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                >
                    <SlidersHorizontal size={16} /> Filtrar
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-[#0f0f10]/5 rounded-xl"></div>)}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-[#0f0f10]/20 rounded-xl">
                    <h3 className="font-black uppercase text-xl mb-2">No hay resultados</h3>
                    <button onClick={() => {setSearchTerm(''); updateFilter('todos');}} className="text-[#c6a35a] font-bold uppercase text-xs border-b border-[#c6a35a]">
                        Ver todo el catálogo
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 items-start">
                    {filteredProducts.map((product) => {
                        // LÓGICA DE PRECIO REAL
                        const price = Number(product.price || 0);
                        const oldPrice = Number(product.old_price || 0);
                        const hasDiscount = oldPrice > price;
                        
                        // Calculamos porcentaje real
                        const discountPercent = hasDiscount 
                            ? Math.round(((oldPrice - price) / oldPrice) * 100) 
                            : 0;

                        return (
                            <Link key={product.id} href={`/producto/${product.id}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#c6a35a] relative">
                                
                                {/* 1. IMAGEN */}
                                <div className="w-full relative bg-white">
                                    <img 
                                        src={product.image_url} 
                                        alt={product.name}
                                        className="w-full h-auto object-contain mix-blend-multiply p-4"
                                    />
                                    
                                    {/* BADGE DE DESCUENTO REAL */}
                                    {hasDiscount && (
                                        <span className="absolute top-2 left-2 bg-[#c6a35a] text-[#0f0f10] text-[10px] font-black px-2 py-1 uppercase tracking-tighter rounded-sm shadow-sm z-10">
                                            {discountPercent}% OFF
                                        </span>
                                    )}

                                    {/* BADGE NUEVO */}
                                    {new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                                        <span className="absolute top-2 right-2 bg-[#0f0f10] text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm z-10">
                                            New
                                        </span>
                                    )}
                                </div>
                                
                                {/* 2. INFO DEL PRODUCTO */}
                                <div className="p-4 pt-2 border-t border-gray-100 flex flex-col gap-1">
                                    <div className="text-[10px] text-[#6f6f73] font-bold uppercase tracking-widest">
                                        {product.team || 'Clásico'}
                                    </div>
                                    
                                    <h3 className="font-black text-[#0f0f10] text-xs md:text-sm uppercase leading-tight group-hover:text-[#c6a35a] transition-colors line-clamp-2 min-h-[2.5em]">
                                        {product.name}
                                    </h3>

                                    {/* BLOQUE DE PRECIOS */}
                                    <div className="mt-2">
                                        {/* Precio Tachado (Solo si hay descuento) */}
                                        {hasDiscount ? (
                                            <p className="text-xs text-gray-400 font-bold line-through decoration-red-500/50">
                                                ${oldPrice.toLocaleString('es-AR')}
                                            </p>
                                        ) : (
                                            <div className="h-4"></div> // Espacio vacío para alinear
                                        )}
                                        
                                        {/* Precio Nuevo Gigante */}
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-[#0f0f10] text-lg md:text-xl">
                                                ${price.toLocaleString('es-AR')}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#c6a35a] mt-1">
                                            <CreditCard size={12} />
                                            <span>3 cuotas sin interés</span>
                                        </div>
                                    </div>

                                    {/* BOTÓN "LA QUIERO" */}
                                    <button className="mt-4 w-full bg-[#0f0f10] text-white py-3 rounded-sm font-black uppercase text-xs tracking-widest hover:bg-[#c6a35a] hover:text-[#0f0f10] transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg">
                                        La Quiero <ShoppingBag size={14} />
                                    </button>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Cargando catálogo...</div>}>
      <CatalogoContent />
    </Suspense>
  );
}