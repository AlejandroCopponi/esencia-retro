'use client';

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext"; // <--- Importamos el cerebro

export default function Navbar() {
  const { cart } = useCart(); // <--- Le preguntamos cuántas cosas hay

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
      
      {/* LOGO */}
      <Link href="/" className="text-2xl font-black tracking-tighter text-blue-900">
        ESENCIA<span className="text-blue-600">RETRO</span>
      </Link>

      {/* LINKS DEL CENTRO (Ocultos en celular) */}
      <div className="hidden md:flex gap-8 font-medium text-gray-600">
        <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
        <Link href="/catalogo" className="hover:text-black transition-colors">Camisetas</Link>
        <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-bold">Admin</Link>
      </div>

      {/* CARRITO */}
      <Link href="/carrito" className="relative group p-2">
        <ShoppingCart className="w-7 h-7 text-gray-700 group-hover:text-blue-600 transition-colors" />
        
        {/* El puntito rojo con el número */}
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-bounce">
            {cart.length}
          </span>
        )}
      </Link>

    </nav>
  );
}