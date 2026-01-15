'use client';

import { useState } from "react"; // Necesitamos estado para abrir/cerrar
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react"; // Importamos íconos de menú
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar el menú móvil

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="px-8 py-4 flex items-center justify-between">
        
        {/* BOTÓN MENÚ MÓVIL (Izquierda) */}
        <button 
          className="md:hidden text-gray-700" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* LOGO (Centro en móvil, Izquierda en PC) */}
        <Link href="/" className="text-2xl font-black tracking-tighter text-blue-900">
          ESENCIA<span className="text-blue-600">RETRO</span>
        </Link>

        {/* LINKS DE PC (Ocultos en celular) */}
        <div className="hidden md:flex gap-8 font-medium text-gray-600">
          <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
          <Link href="/catalogo" className="hover:text-black transition-colors">Camisetas</Link>
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-bold">Admin</Link>
        </div>

        {/* CARRITO (Derecha) */}
        <Link href="/carrito" className="relative group p-2">
          <ShoppingCart className="w-7 h-7 text-gray-700 group-hover:text-blue-600 transition-colors" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-bounce">
              {cart.length}
            </span>
          )}
        </Link>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL (Solo se ve si isOpen es true) */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-8 flex flex-col gap-4 shadow-lg">
          <Link 
            href="/" 
            className="text-lg font-medium text-gray-700 py-2 border-b border-gray-50"
            onClick={() => setIsOpen(false)} // Cerramos menú al hacer clic
          >
            Inicio
          </Link>
          <Link 
            href="/catalogo" 
            className="text-lg font-medium text-gray-700 py-2 border-b border-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Camisetas
          </Link>
          <Link 
            href="/admin" 
            className="text-lg font-bold text-blue-600 py-2"
            onClick={() => setIsOpen(false)}
          >
            Panel Admin
          </Link>
        </div>
      )}
    </nav>
  );
}