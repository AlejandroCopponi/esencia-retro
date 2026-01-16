'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, totalPrice } = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (!isMounted) return null;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-retro-base px-4 text-center pt-20">
        <h2 className="text-3xl font-black text-retro-main mb-4 uppercase tracking-tighter">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-8">Parece que todavía no elegiste tu próxima joya.</p>
        <Link 
          href="/catalogo" 
          className="bg-retro-main text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-black transition-transform hover:scale-105"
        >
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-base py-12 px-4 md:px-8 pt-32">
      <div className="max-w-6xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="flex items-center gap-4 mb-8">
            <Link href="/catalogo" className="text-retro-main hover:text-retro-accent transition-colors">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-retro-main uppercase tracking-tighter">
                Tu Carrito <span className="text-retro-gray text-2xl ml-2 font-medium normal-case">({cart.length} productos)</span>
            </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          
          {/* LISTA DE PRODUCTOS */}
          <div className="md:col-span-2 space-y-6">
            {cart.map((product) => (
              <div key={product.id} className="bg-white p-4 md:p-6 shadow-sm flex gap-6 items-center border border-transparent hover:border-retro-main/10 transition-colors relative group">
                
                {/* FOTO */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 flex-shrink-0 flex items-center justify-center p-2 relative">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply" 
                  />
                </div>

                {/* INFO */}
                <div className="flex-grow">
                  <h3 className="font-bold text-retro-main uppercase tracking-wide text-sm md:text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-xs uppercase mb-2">Talle: {product.size || 'Único'}</p>
                  <p className="font-black text-retro-accent text-lg">
                    {/* PROTECCIÓN CONTRA ERRORES DE NUMEROS */}
                    ${(product.price || 0).toLocaleString('es-AR')}
                  </p>
                </div>

                {/* BORRAR */}
                <button 
                  onClick={() => removeFromCart(product.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-2"
                  title="Eliminar producto"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* RESUMEN DE CUENTA */}
          <div className="md:col-span-1">
            <div className="bg-white p-8 shadow-lg sticky top-32 border-t-4 border-retro-main">
              <h2 className="text-xl font-black uppercase text-retro-main mb-6 tracking-widest">Resumen</h2>
              
              <div className="space-y-4 mb-8 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  {/* AQUÍ ESTABA EL ERROR EN TU FOTO: Ahora está protegido con (totalPrice || 0) */}
                  <span>${(totalPrice || 0).toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-xs italic">(Se calcula al finalizar)</span>
                </div>
                <div className="border-t border-dashed border-gray-300 pt-4 mt-4 flex justify-between items-end">
                  <span className="font-bold text-lg uppercase">Total</span>
                  <span className="font-black text-3xl text-retro-main">${(totalPrice || 0).toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* BOTÓN QUE LLEVA AL CHECKOUT */}
              <button 
                onClick={handleCheckout}
                className="w-full bg-retro-main text-white py-5 font-black uppercase tracking-[0.2em] hover:bg-retro-accent transition-colors flex items-center justify-center gap-3 group"
              >
                Iniciar Compra <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Compra protegida y segura
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}