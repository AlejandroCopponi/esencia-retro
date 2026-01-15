'use client';

import { Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext'; // Importamos el cerebro

export default function CartPage() {
  // Traemos las funciones reales del contexto
  const { cart, removeFromCart, cartTotal } = useCart();

  // El envío sigue siendo gratis por ahora
  const shipping = 0;
  const total = cartTotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-black text-gray-900 mb-8">Tu Carrito ({cart.length})</h1>

        {cart.length === 0 ? (
          // ESTADO VACÍO
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
             <h2 className="text-2xl font-bold text-gray-400 mb-4">Tu carrito está vacío 😢</h2>
             <Link href="/catalogo" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors">
                Ir a buscar camisetas
             </Link>
          </div>
        ) : (
          // ESTADO CON PRODUCTOS
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            
            {/* LISTA DE PRODUCTOS */}
            <div className="lg:col-span-8">
              <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    // Usamos una clave compuesta (ID + Talle) por si compró la misma en distintos talles
                    <li key={`${item.id}-${item.size}`} className="p-6 flex items-center">
                      
                      {/* Imagen */}
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.image_url} // Ahora usa image_url real de Supabase
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      {/* Info */}
                      <div className="ml-4 flex-1 flex flex-col justify-between h-24">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-base font-bold text-gray-900">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">Talle: {item.size}</p>
                          </div>
                          <p className="text-base font-bold text-gray-900">
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                          </p>
                        </div>

                        {/* Controles */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                              {/* Por ahora deshabilitamos cambiar cantidad en carrito para simplificar */}
                              <span className="px-3 py-1 text-sm font-bold text-gray-600">Cant: {item.quantity}</span>
                          </div>

                          <button 
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                          >
                            <Trash2 size={18} className="mr-1" /> Eliminar
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4 text-center lg:text-left">
                  <Link href="/catalogo" className="text-blue-600 font-bold hover:underline text-sm">
                      ← Seguir comprando
                  </Link>
              </div>
            </div>

            {/* RESUMEN DE COMPRA */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen de la orden</h2>
                
                <div className="flow-root">
                  <dl className="-my-4 divide-y divide-gray-100">
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Subtotal</dt>
                      <dd className="text-sm font-bold text-gray-900">${cartTotal.toLocaleString('es-AR')}</dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Envío</dt>
                      <dd className="text-sm font-bold text-green-600">Gratis</dd>
                    </div>
                    <div className="py-4 flex items-center justify-between border-t border-gray-200">
                      <dt className="text-base font-black text-gray-900">Total</dt>
                      <dd className="text-xl font-black text-blue-600">${total.toLocaleString('es-AR')}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6">
                  {/* Botón de Checkout con WhatsApp */}
                  <a 
                    href={`https://wa.me/5491100000000?text=Hola! Quiero comprar estas camisetas: ${cart.map(i => `${i.name} (${i.size})`).join(', ')}. Total: $${total}`}
                    target="_blank"
                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-colors flex justify-center items-center"
                  >
                    Finalizar por WhatsApp <ArrowRight className="ml-2" size={20} />
                  </a>
                </div>

                <div className="mt-6 flex justify-center items-center text-gray-500 text-xs">
                  <ShieldCheck size={16} className="mr-2 text-green-600" />
                  Compra protegida
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}