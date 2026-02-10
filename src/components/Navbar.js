'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, Search, User, ChevronDown } from "lucide-react";
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
      if (window.scrollY > 40) setIsFixed(true);
      else setIsFixed(false);
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

  // DEFINIMOS EL TEXTO DE LA MARQUESINA UNA VEZ
  const marqueeText = (
    <div className="flex items-center gap-12 px-6">
      <span>🔥 4X3 EN TODA LA TIENDA</span>
      <span className="text-retro-gold">•</span>
      <span>ENVÍO GRATIS A PARTIR DE $60.000</span>
      <span className="text-retro-gold">•</span>
      <span>3 CUOTAS SIN INTERÉS</span>
      <span className="text-retro-gold">•</span>
    </div>
  );

  return (
    <div className="w-full font-sans relative z-50">
      
      {/* 1. MARQUESINA INFINITA (SOLUCIÓN DEFINITIVA) */}
      <div className="bg-retro-base text-retro-ink text-[10px] md:text-xs font-bold py-2 overflow-hidden border-b border-retro-line relative z-50">
        {/* Usamos w-max para que el div sea tan ancho como su contenido y flex-nowrap */}
        <div className="animate-marquee flex whitespace-nowrap w-max">
            {/* Repetimos el bloque 4 veces para asegurar el loop infinito perfecto */}
            {marqueeText}
            {marqueeText}
            {marqueeText}
            {marqueeText}
        </div>
      </div>

      {/* Espacio fantasma */}
      {isFixed && <div className="h-[105px] w-full"></div>}

      {/* 2. HEADER PRINCIPAL */}
      <div 
        className={`w-full z-40 transition-all duration-300 shadow-sm border-b border-retro-line ${
          isFixed ? "fixed top-0 left-0 animate-slideDown bg-retro-base" : "relative bg-retro-base"
        }`}
      >
        <div className="px-4 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* LOGO */}
                <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                    <span className="font-black text-2xl md:text-3xl tracking-tighter text-retro-ink uppercase">Esencia Retro</span>
                </Link>

                {/* BUSCADOR */}
                <div className="hidden md:flex flex-grow max-w-lg relative mx-auto">
                    <form onSubmit={handleSearch} className="w-full flex shadow-sm border border-retro-line rounded-sm overflow-hidden">
                        <input 
                            type="text" 
                            placeholder="Buscar camisetas..." 
                            className="w-full pl-4 pr-10 py-2.5 bg-white/60 focus:bg-white focus:outline-none placeholder-retro-muted text-sm transition-colors text-retro-ink"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="bg-retro-ink text-white px-5 hover:bg-black transition-colors flex items-center justify-center">
                            <Search size={20} />
                        </button>
                    </form>
                </div>

                {/* ICONOS */}
                <div className="flex items-center gap-6 text-retro-ink">
                    <Link href="/admin" className="hidden md:block hover:text-retro-gold transition-colors"><User size={26} /></Link>
                    <Link href="/carrito" className="relative group hover:text-retro-gold transition-colors">
                        <ShoppingCart size={26} />
                        {cart.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-retro-ink text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {cart.length}
                            </span>
                        )}
                    </Link>
                    <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X size={30} /> : <Menu size={30} />}</button>
                </div>
            </div>
        </div>

        {/* 3. BARRA DE NAVEGACIÓN (TEXTO AGRANDADO A text-sm / 14px) */}
        <div className="hidden md:block bg-[#111111] text-white border-t border-white/10 relative">
            <div className="max-w-7xl mx-auto px-4 flex justify-center items-center h-[50px]">
                
                <nav className="flex gap-8 text-sm font-bold tracking-[0.15em] uppercase">
                    
                    <Link href="/" className="hover:text-gray-400 transition-colors flex items-center">
                        Inicio
                    </Link>

                    {/* COLECCIÓN */}
                    <div className="group relative flex items-center cursor-pointer h-[50px]">
                        <span className="group-hover:text-gray-400 transition-colors flex items-center gap-1">
                            Colección <ChevronDown size={14}/>
                        </span>
                        
                        {/* MENÚ DESPLEGABLE */}
                        <div className="absolute top-full left-0 w-52 bg-white text-retro-ink shadow-xl rounded-b-lg border border-retro-line hidden group-hover:block animate-fadeIn z-50">
                            <div className="flex flex-col py-2">
                                <Link href="/catalogo" className="px-5 py-3 hover:bg-gray-50 hover:text-retro-gold border-b border-gray-100 text-xs font-bold tracking-widest">VER TODO</Link>
                                <Link href="/catalogo?category=nacional" className="px-5 py-3 hover:bg-gray-50 hover:text-retro-gold border-b border-gray-100 text-xs font-bold tracking-widest">NACIONALES</Link>
                                <Link href="/catalogo?category=internacional" className="px-5 py-3 hover:bg-gray-50 hover:text-retro-gold border-b border-gray-100 text-xs font-bold tracking-widest">INTERNACIONALES</Link>
                                <Link href="/catalogo?category=selecciones" className="px-5 py-3 hover:bg-gray-50 hover:text-retro-gold border-b border-gray-100 text-xs font-bold tracking-widest">SELECCIONES</Link>
                                <Link href="/catalogo?category=retro" className="px-5 py-3 hover:bg-gray-50 hover:text-retro-gold text-xs font-bold tracking-widest">LEYENDAS</Link>
                            </div>
                        </div>
                    </div>

                    <Link href="/catalogo?sort=newest" className="hover:text-gray-400 transition-colors flex items-center">
                        Novedades
                    </Link>

                    <Link href="/guia-talles" className="hover:text-gray-400 transition-colors flex items-center">
                        Guía de Talles
                    </Link>

                    <Link href="/calidad" className="hover:text-gray-400 transition-colors flex items-center">
                        Calidad
                    </Link>

                    <Link href="/politica-devolucion" className="hover:text-gray-400 transition-colors flex items-center">
                        Política
                    </Link>

                </nav>
            </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isOpen && (
        <div className="md:hidden bg-retro-base fixed top-0 left-0 w-full h-screen z-[60] p-6 flex flex-col gap-6 overflow-y-auto">
             <div className="flex justify-between items-center mb-4 border-b border-retro-line pb-4">
                <span className="font-black text-xl text-retro-ink uppercase">Menú</span>
                <button onClick={() => setIsOpen(false)} className="text-retro-ink"><X size={32}/></button>
             </div>
             
             <Link href="/" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase text-retro-ink border-b border-retro-line pb-3">Inicio</Link>
             
             <div className="flex flex-col gap-4 border-b border-retro-line pb-4">
                <span className="text-2xl font-black uppercase text-retro-ink opacity-50">Colección</span>
                <Link href="/catalogo?category=nacional" onClick={() => setIsOpen(false)} className="pl-4 text-lg font-bold text-retro-ink">Nacionales</Link>
                <Link href="/catalogo?category=internacional" onClick={() => setIsOpen(false)} className="pl-4 text-lg font-bold text-retro-ink">Internacionales</Link>
                <Link href="/catalogo?category=selecciones" onClick={() => setIsOpen(false)} className="pl-4 text-lg font-bold text-retro-ink">Selecciones</Link>
                <Link href="/catalogo?category=retro" onClick={() => setIsOpen(false)} className="pl-4 text-lg font-bold text-retro-ink">Leyendas</Link>
             </div>

             <Link href="/catalogo?sort=newest" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase text-retro-ink border-b border-retro-line pb-3">Novedades</Link>
             <Link href="/guia-talles" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase text-retro-ink border-b border-retro-line pb-3">Guía de Talles</Link>
        </div>
      )}
    </div>
  );
}