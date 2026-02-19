'use client';

import Link from 'next/link';
import { useFavorites } from '@/context/FavoritesContext';
import { Heart, Trash2, ArrowLeft } from 'lucide-react';

export default function FavoritosPage() {
  const { favorites, toggleFavorite, isMounted } = useFavorites();

  // Evita errores visuales mientras carga la memoria del celu
  if (!isMounted) return null;

  return (
    <div className="min-h-screen font-sans pt-28 pb-12 px-4 md:px-8 bg-[#efe3cf] text-[#0f0f10]">
      <div className="max-w-6xl mx-auto">
        <Link href="/catalogo" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6f6f73] hover:text-[#0f0f10] mb-8 transition-colors">
            <ArrowLeft size={16} /> Volver al Catálogo
        </Link>

        <div className="flex items-center gap-3 mb-10">
            <Heart size={32} className="text-[#c6a35a] fill-current" />
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#0f0f10]">
                Mis Favoritos
            </h1>
        </div>

        {favorites.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-xl border border-[#0f0f10]/10">
                <Heart size={48} className="mx-auto mb-4 text-[#0f0f10]/20" />
                <h2 className="text-xl font-bold uppercase mb-2">Tu lista está vacía</h2>
                <p className="text-[#6f6f73] mb-6">Aún no guardaste ninguna camiseta en tus favoritos.</p>
                <Link href="/catalogo" className="bg-[#0f0f10] text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest hover:bg-[#c6a35a] transition-colors inline-block">
                    Explorar Tienda
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {favorites.map((product) => {
                    const price = Number(product.price || 0);
                    return (
                        <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#c6a35a] relative group flex flex-col">
                            {/* BOTÓN PARA ELIMINAR */}
                            <button 
                                onClick={() => toggleFavorite(product)}
                                className="absolute top-3 right-3 p-2 bg-white/80 rounded-full shadow-sm hover:bg-red-50 text-red-500 z-10 transition-colors"
                                title="Quitar de favoritos"
                            >
                                <Trash2 size={16} />
                            </button>
                            
                            <Link href={`/producto/${product.id}`} className="block flex-1">
                                <div className="w-full aspect-square bg-gray-50 flex items-center justify-center p-4">
                                    <img 
                                        src={product.image_url} 
                                        alt={product.name} 
                                        className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" 
                                    />
                                </div>
                                <div className="p-4 border-t border-gray-100 flex flex-col justify-between flex-1">
                                    <h3 className="font-black text-[#0f0f10] text-[11px] md:text-xs uppercase group-hover:text-[#c6a35a] transition-colors mb-2 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <p className="font-bold text-[#0f0f10] text-sm md:text-base">
                                        ${price.toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}