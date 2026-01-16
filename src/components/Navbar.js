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

  // Sensor de scroll para fijar el menú
  useEffect(() => {
    const handleScroll = () => {
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
      
      {/* 1. MARQUESINA (Desaparece al bajar) */}
      <div className="bg-retro-base text-retro-main text-[10px] md:text-xs font-bold py-2 overflow-hidden border-b border-retro-main/5">
        <div className="animate-marquee flex justify-start gap-12 uppercase tracking-widest pl-4">
            <span>🔥 4X3 EN TODA LA TIENDA • ENVÍO GRATIS A PARTIR DE $60.000</span>
            <span>🔥 4X3 EN TODA LA TIENDA • ENVÍO GRATIS A PARTIR DE $60.000</span>
            <span>🔥 4X3 EN TODA LA TIENDA • ENVÍO GRATIS A PARTIR DE $60.000</span>
            <span>🔥 4X3 EN TODA LA TIENDA • ENVÍO GRATIS A PARTIR DE $60.000</span>
            <span>🔥 4X3 EN TODA LA TIENDA • ENVÍO GRATIS A PARTIR DE $60.000</span>
        </div>
      </div>

      {/* 2. ESPACIO RESERVADO (Para que no salte la pantalla) */}
      {isFixed && <div className="h-[105px] w-full"></div>}

      {/* 3. MENÚ PRINCIPAL (Se fija al bajar) */}
      <div 
        className={`w-full z-50 transition-all duration-300 shadow-sm ${
          // ACÁ ESTÁ EL CAMBIO: Usamos #F5F2EB para que sea idéntico al fondo nuevo
          isFixed ? "fixed top-0 left-0 animate-slideDown bg-[#F5F2EB]" : "relative bg-retro-base"
        }`}
      >
        
        {/* PARTE A: LOGO Y BUSCADOR */}
        <div className="px-4 py-3"> 
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <Link href="/" className="flex-shrink-0">
                    <img src="/logo.jpeg" alt="Esencia Retro" className="h-10 md:h-14 mix-blend-multiply object-contain" />
                </Link>

                <div className="hidden md:flex flex-grow max-w-xl relative mx-auto">
                    <form onSubmit={handleSearch} className="w-full flex shadow-sm border border-retro-main/10 rounded-sm">
                        <input 
                            type="text" 
                            placeholder="¿Qué estás buscando?" 
                            className="w-full pl-3 pr-10 py-2 bg-white/60 focus:bg-white focus:outline-none placeholder-gray-500 text-sm transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="bg-retro-main text-white px-5 hover:bg-black transition-colors flex items-center justify-center">
                            <Search size={18} />
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-5">
                    <Link href="/admin" className="hidden md:block text-retro-main hover:text-retro-accent">
                        <User size={24} />
                    </Link>
                    <Link href="/carrito" className="relative group text-retro-main hover:text-retro-accent">
                        <ShoppingCart size={24} />
                        {cart.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-retro-main text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                {cart.length}
                            </span>
                        )}
                    </Link>
                    <button className="md:hidden text-retro-main" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>
        </div>

        {/* PARTE B: CINTA NEGRA */}
        <div className="hidden md:block bg-retro-main text-white py-2 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 flex justify-center gap-10 text-xs font-bold tracking-[0.2em] uppercase">
                <Link href="/catalogo" className="hover:text-retro-accent transition-colors">Ver Todo</Link>
                <Link href="/catalogo?filter=nacional" className="hover:text-retro-accent transition-colors">Nacionales</Link>
                <Link href="/catalogo?filter=internacional" className="hover:text-retro-accent transition-colors">Internacionales</Link>
                <Link href="/catalogo?filter=selecciones" className="hover:text-retro-accent transition-colors">Selecciones</Link>
                <Link href="/catalogo?filter=retro" className="hover:text-retro-accent transition-colors">Leyendas</Link>
            </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isOpen && (
        <div className="md:hidden bg-retro-base fixed top-0 left-0 w-full h-screen z-[60] p-6 flex flex-col gap-6 overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">MENÚ</span>
                <button onClick={() => setIsOpen(false)}><X size={32}/></button>
             </div>
             <form onSubmit={handleSearch} className="relative">
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="w-full pl-4 pr-10 py-3 border border-gray-400 rounded bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-3.5 text-gray-500" size={20} />
            </form>
            <Link href="/" onClick={() => setIsOpen(false)} className="text-xl font-black uppercase text-retro-main border-b border-gray-300 pb-2">Inicio</Link>
            <Link href="/catalogo" onClick={() => setIsOpen(false)} className="text-xl font-black uppercase text-retro-main border-b border-gray-300 pb-2">Catálogo</Link>
        </div>
      )}
    </div>
  );
}