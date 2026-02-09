'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, Search, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      // Si baja más de 40px, el menú se pega arriba
      if (window.scrollY > 40) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="w-full font-sans relative z-50">
      
      {/* 1. MARQUESINA (Se va al scrollear) */}
      <div className="bg-retro-base text-retro-ink text-[10px] md:text-xs font-bold py-2 overflow-hidden border-b border-retro-line">
        <div className="animate-marquee flex justify-start gap-12 uppercase tracking-widest pl-4">
            <span>🔥 4X3 EN TODA LA TIENDA • ENVÍO GRATIS A PARTIR DE $60.000</span>
            <span className="text-retro-gold">•</span>
            <span>🔥 4X3 EN TODA LA TIENDA • ENVÍO GRATIS A PARTIR DE $60.000</span>
            <span className="text-retro-gold">•</span>
            <span>🔥 4X3 EN TODA LA TIENDA • ENVÍO GRATIS A PARTIR DE $60.000</span>
        </div>
      </div>

      {/* Espacio fantasma para que no salte la pantalla al fijar el menú */}
      {isFixed && <div className="h-[105px] w-full"></div>}

      {/* 2. MENÚ PRINCIPAL */}
      <div 
        className={`w-full z-50 transition-all duration-300 shadow-sm border-b border-retro-line ${
          // AQUÍ LA CLAVE: Usamos 'bg-retro-base' (el color nuevo) siempre
          isFixed ? "fixed top-0 left-0 animate-slideDown bg-retro-base" : "relative bg-retro-base"
        }`}
      >
        
        {/* PARTE A: LOGO Y BUSCADOR */}
        <div className="px-4 py-3"> 
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                
                {/* LOGO */}
                <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                    {/* Reemplazalo por tu <img> si tenés el archivo, sino dejo el texto */}
                    <span className="font-black text-xl md:text-2xl tracking-tighter text-retro-ink uppercase">Esencia Retro</span>
                </Link>

                {/* BUSCADOR (Visible en PC) */}
                <div className="hidden md:flex flex-grow max-w-xl relative mx-auto">
                    <form onSubmit={handleSearch} className="w-full flex shadow-sm border border-retro-line rounded-sm overflow-hidden">
                        <input 
                            type="text" 
                            placeholder="Buscar camisetas..." 
                            className="w-full pl-4 pr-10 py-2 bg-white/60 focus:bg-white focus:outline-none placeholder-retro-muted text-sm transition-colors text-retro-ink"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="bg-retro-ink text-white px-5 hover:bg-black transition-colors flex items-center justify-center">
                            <Search size={18} />
                        </button>
                    </form>
                </div>

                {/* ICONOS */}
                <div className="flex items-center gap-5 text-retro-ink">
                    <Link href="/admin" className="hidden md:block hover:text-retro-gold transition-colors">
                        <User size={24} />
                    </Link>
                    <Link href="/carrito" className="relative group hover:text-retro-gold transition-colors">
                        <ShoppingCart size={24} />
                        {cart.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-retro-ink text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                {cart.length}
                            </span>
                        )}
                    </Link>
                    <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>
        </div>

        {/* PARTE B: CINTA NEGRA (Restaurada) */}
        <div className="hidden md:block bg-[#111111] text-white py-2.5 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 flex justify-center gap-10 text-[11px] font-bold tracking-[0.2em] uppercase">
                <Link href="/catalogo" className="hover:text-retro-gold transition-colors">Ver Todo</Link>
                <Link href="/catalogo?filter=nacional" className="hover:text-retro-gold transition-colors">Nacionales</Link>
                <Link href="/catalogo?filter=internacional" className="hover:text-retro-gold transition-colors">Internacionales</Link>
                <Link href="/catalogo?filter=selecciones" className="hover:text-retro-gold transition-colors">Selecciones</Link>
                <Link href="/catalogo?filter=retro" className="hover:text-retro-gold transition-colors">Leyendas</Link>
            </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isOpen && (
        <div className="md:hidden bg-retro-base fixed top-0 left-0 w-full h-screen z-[60] p-6 flex flex-col gap-6 overflow-y-auto">
             <div className="flex justify-between items-center mb-4 border-b border-retro-line pb-4">
                <span className="font-black text-lg text-retro-ink uppercase">Menú</span>
                <button onClick={() => setIsOpen(false)} className="text-retro-ink"><X size={32}/></button>
             </div>
             {/* Buscador Móvil */}
             <form onSubmit={handleSearch} className="relative">
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="w-full pl-4 pr-10 py-3 border border-retro-line rounded bg-white/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-3.5 text-retro-muted" size={20} />
            </form>
            <Link href="/" onClick={() => setIsOpen(false)} className="text-xl font-black uppercase text-retro-ink border-b border-retro-line pb-2">Inicio</Link>
            <Link href="/catalogo" onClick={() => setIsOpen(false)} className="text-xl font-black uppercase text-retro-ink border-b border-retro-line pb-2">Catálogo</Link>
        </div>
      )}
    </div>
  );
}