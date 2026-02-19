'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

function CatalogoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // NUEVO: Estado para categorías de la DB
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros actuales desde la URL
  const categoryFilter = searchParams.get('category') || 'todos';
  const subcategoryFilter = searchParams.get('subcategory') || null;
  const sortOrder = searchParams.get('sort') || 'newest';
  
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const COLORS = {
    gradient: 'linear-gradient(180deg, #f3ead7 0%, #efe3cf 100%)',
    ink: '#0f0f10',
    gold: '#c6a35a',
    muted: '#6f6f73'
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Recalcular filtros cuando cambian los parámetros de la URL o los productos
  useEffect(() => {
    applyFilters();
  }, [categoryFilter, subcategoryFilter, sortOrder, products]);

  async function fetchInitialData() {
    setLoading(true);
    try {
      // 1. Traer Productos
      const { data: prodData } = await supabase.from('products').select('*');
      setProducts(prodData || []);

      // 2. Traer Categorías Reales
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      setCategories(catData || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let result = [...products];

    // Filtro Categoría Madre
    if (categoryFilter !== 'todos') {
      result = result.filter(p => p.category === categoryFilter);
    }

    // Filtro Subcategoría
    if (subcategoryFilter) {
      result = result.filter(p => p.subcategory === subcategoryFilter);
    }

    // Orden
    if (sortOrder === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortOrder === 'price-desc') result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredProducts(result);
  }

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.push(`/catalogo?${params.toString()}`);
  };

  // Buscamos si la categoría actual tiene subcategorías para mostrar a la izquierda
  const currentCatData = categories.find(c => c.name === categoryFilter);

  return (
    <div className="min-h-screen font-sans pt-28 pb-12 px-4 md:px-8" style={{ background: COLORS.gradient }}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER DEL CATÁLOGO */}
        <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4" style={{ color: COLORS.ink }}>
                {categoryFilter === 'todos' ? 'Catálogo' : categoryFilter}
            </h1>
            <p className="text-sm md:text-base font-bold uppercase tracking-widest" style={{ color: COLORS.gold }}>
                {subcategoryFilter ? `> ${subcategoryFilter}` : 'Explorá nuestra colección retro'}
            </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            
            {/* --- SIDEBAR IZQUIERDA --- */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="sticky top-28 space-y-8">
                    
                    {/* BUSCADOR INTERNO */}
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Buscar en esta sección..."
                            className="w-full bg-white/50 border-b-2 border-[#0f0f10]/10 p-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#c6a35a] transition-all"
                            onChange={(e) => {
                                const term = e.target.value.toLowerCase();
                                setFilteredProducts(products.filter(p => 
                                    p.name.toLowerCase().includes(term) && 
                                    (categoryFilter === 'todos' || p.category === categoryFilter)
                                ));
                            }}
                        />
                        <Search className="absolute right-3 top-3 text-[#0f0f10]/30" size={16} />
                    </div>

                    {/* CATEGORÍAS MADRE (DINÁMICAS) */}
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-[#6f6f73]">Categorías</h3>
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => updateFilters({ category: 'todos', subcategory: null })}
                                className={`text-left py-1 font-black uppercase text-sm transition-all ${categoryFilter === 'todos' ? 'text-[#c6a35a] translate-x-2' : 'text-[#0f0f10] hover:translate-x-1'}`}
                            >
                                Ver Todo
                            </button>
                            {categories.map((cat) => (
                                <div key={cat.name} className="flex flex-col">
                                    <button 
                                        onClick={() => updateFilters({ category: cat.name, subcategory: null })}
                                        className={`text-left py-1 font-black uppercase text-sm transition-all ${categoryFilter === cat.name ? 'text-[#c6a35a] translate-x-2' : 'text-[#0f0f10] hover:translate-x-1'}`}
                                    >
                                        {cat.name}
                                    </button>
                                    
                                    {/* Mostrar Subcategorías si esta categoría está seleccionada */}
                                    {categoryFilter === cat.name && cat.subcategories && (
                                        <div className="ml-4 mt-2 mb-4 flex flex-col gap-1 border-l-2 border-[#c6a35a]/30 pl-3">
                                            {cat.subcategories.map(sub => (
                                                <button 
                                                    key={sub}
                                                    onClick={() => updateFilters({ subcategory: sub })}
                                                    className={`text-left py-1 text-[11px] font-bold uppercase tracking-tighter transition-all ${subcategoryFilter === sub ? 'text-[#c6a35a]' : 'text-[#6f6f73] hover:text-[#0f0f10]'}`}
                                                >
                                                    {sub}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ORDENAR */}
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-[#6f6f73]">Ordenar por</h3>
                        <select 
                            value={sortOrder}
                            onChange={(e) => updateFilters({ sort: e.target.value })}
                            className="w-full bg-transparent font-bold uppercase text-xs border-b border-[#0f0f10]/10 py-2 outline-none cursor-pointer"
                        >
                            <option value="newest">Lo más nuevo</option>
                            <option value="price-asc">Menor precio</option>
                            <option value="price-desc">Mayor precio</option>
                        </select>
                    </div>

                </div>
            </aside>

            {/* --- GRILLA DE PRODUCTOS --- */}
            <div className="flex-grow">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
                        {[1,2,3,4,5,6].map(n => <div key={n} className="bg-white/30 aspect-[3/4] rounded-sm"></div>)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-white/50 border-2 border-dashed border-[#0f0f10]/10 rounded-sm p-20 text-center">
                        <p className="font-black uppercase text-[#6f6f73]">No hay productos en esta sección todavía.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10">
                        {filteredProducts.map((product) => {
                            const price = Number(product.price || 0);
                            const oldPrice = Number(product.old_price || 0);
                            const hasDiscount = oldPrice > price;

                            return (
                                <Link key={product.id} href={`/producto/${product.id}`} className="group">
                                    <div className="relative aspect-[3/4] bg-white rounded-sm overflow-hidden border border-transparent group-hover:border-[#c6a35a] transition-all duration-500 shadow-sm mb-4">
                                        <img 
                                            src={product.image_url} 
                                            alt={product.name}
                                            className="w-full h-full object-contain mix-blend-multiply p-4 md:p-8 transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        {hasDiscount && (
                                            <span className="absolute top-3 left-3 bg-[#c6a35a] text-[#0f0f10] text-[10px] font-black px-2 py-1 uppercase tracking-tighter">
                                                OFF
                                            </span>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>

                                    <div className="px-1">
                                        <h3 className="font-black text-[11px] md:text-xs uppercase tracking-tighter leading-tight mb-2 group-hover:text-[#c6a35a] transition-colors line-clamp-2 min-h-[2rem]">
                                            {product.name}
                                        </h3>
                                        
                                        <div className="flex flex-col">
                                            {hasDiscount && (
                                                <span className="text-[10px] text-gray-400 font-bold line-through mb-0.5">
                                                    ${oldPrice.toLocaleString('es-AR')}
                                                </span>
                                            )}
                                            <div className="flex items-end justify-between">
                                                <p className="font-black text-[#0f0f10] text-lg md:text-xl leading-none">
                                                    ${price.toLocaleString('es-AR')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 text-[9px] font-bold text-[#c6a35a] mt-2 uppercase tracking-wide">
                                            <CreditCard size={12} />
                                            <span>3 cuotas sin interés</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
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