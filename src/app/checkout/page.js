'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Truck, CreditCard, Lock, CheckCircle } from 'lucide-react';

// --- LÓGICA DE ENVÍO ---
const cotizarEnvio = async (cpInput) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simula red
  const cp = parseInt(cpInput);
  if (!cp) return [];

  let basePrice = 5500;
  if (cp > 2000) basePrice = 6800; // Interior
  if (cp > 8000) basePrice = 8500; // Patagonia

  return [
    { id: 'correo-arg', provider: 'Correo Argentino', name: 'Clásico', price: basePrice, delivery_days: '3-6 días' },
    { id: 'andreani', provider: 'Andreani', name: 'Estándar', price: basePrice + 1500, delivery_days: '2-3 días' },
    { id: 'pickit', provider: 'Punto Pickit', name: 'Retiro', price: basePrice - 1000, delivery_days: '2-4 días' }
  ];
};

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  
  // ESTADO DE CARGA (Para evitar errores de hidratación)
  const [isMounted, setIsMounted] = useState(false);

  // ESTADOS DEL FORMULARIO
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', dni: '', telefono: '',
    calle: '', altura: '', cp: '', ciudad: '', provincia: ''
  });

  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // SOLUCIÓN AL ERROR DE PANTALLA
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- PASO 1: EMAIL ---
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('abandoned_checkouts').insert({ email, cart_snapshot: cart, recovered: false });
    } catch (e) { console.log("Log error:", e); }
    setLoading(false);
    setStep(2);
  };

  // --- PASO 2: ENVÍO ---
  const handleShippingCalc = async () => {
    if (formData.cp.length < 4) return;
    setLoadingShipping(true);
    try {
      const opciones = await cotizarEnvio(formData.cp);
      setShippingOptions(opciones);
    } catch (e) { setShippingOptions([]); }
    setLoadingShipping(false);
  };

  // --- PASO 3: FINALIZAR ---
  const handleFinalizeOrder = async () => {
    setLoading(true);
    const shippingCost = selectedShipping?.price || 0;
    // SOLUCIÓN CLAVE: Usamos (totalPrice || 0) para que nunca sea undefined
    const finalTotal = (totalPrice || 0) + shippingCost;

    try {
      const { data: order, error } = await supabase.from('orders').insert({
        user_email: email,
        subtotal: (totalPrice || 0),
        shipping_cost: shippingCost,
        total: finalTotal,
        shipping_provider: selectedShipping?.provider,
        shipping_address: formData,
        customer_data: { nombre: formData.nombre },
        status: 'approved'
      }).select().single();

      if (error) throw error;

      // Crear Items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id, // Asegurate que esto coincida con tu DB (int o uuid)
        quantity: item.quantity,
        price: item.price,
        product_name: item.name
      }));
      await supabase.from('order_items').insert(orderItems);

      await supabase.from('abandoned_checkouts').update({ recovered: true }).eq('email', email);
      
      clearCart();
      alert(`¡Compra exitosa! Pedido #${order.id.slice(0,8)}`);
      router.push('/');
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-retro-base"></div>;

  if (cart.length === 0) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-retro-base text-retro-main pt-20">
            <h2 className="text-2xl font-black uppercase">Carrito Vacío</h2>
            <button onClick={() => router.push('/catalogo')} className="mt-4 bg-retro-main text-white px-6 py-2 font-bold">Volver</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-base py-10 px-4 pt-32">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: PASOS */}
        <div className="md:col-span-2 space-y-4">
            
            {/* 1. CONTACTO */}
            <div className={`bg-white p-6 shadow-sm border-l-4 ${step >= 1 ? 'border-retro-main' : 'border-gray-200 opacity-50'}`}>
                <h2 className="text-lg font-black uppercase text-retro-main mb-4">1. Contacto</h2>
                {step === 1 ? (
                    <form onSubmit={handleEmailSubmit}>
                        <input type="email" required className="w-full border p-3 mb-4 bg-gray-50" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <button type="submit" disabled={loading} className="w-full bg-retro-main text-white py-3 font-bold uppercase">{loading ? '...' : 'Continuar'}</button>
                    </form>
                ) : <p className="font-bold text-gray-700">{email} <span className="text-green-600 ml-2">✓</span></p>}
            </div>

            {/* 2. ENVÍO */}
            <div className={`bg-white p-6 shadow-sm border-l-4 ${step >= 2 ? 'border-retro-main' : 'border-gray-200 opacity-50'}`}>
                <h2 className="text-lg font-black uppercase text-retro-main mb-4">2. Envío</h2>
                {step === 2 && (
                    <div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input required placeholder="Nombre" className="border p-2 bg-gray-50" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                            <input required placeholder="Apellido" className="border p-2 bg-gray-50" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                            <input required placeholder="CP" className="border p-2 bg-gray-50 font-bold" value={formData.cp} onChange={e => setFormData({...formData, cp: e.target.value})} />
                            <input required placeholder="Calle" className="border p-2 bg-gray-50" value={formData.calle} onChange={e => setFormData({...formData, calle: e.target.value})} />
                        </div>
                        
                        {shippingOptions.length === 0 ? (
                            <button onClick={handleShippingCalc} disabled={formData.cp.length < 4 || loadingShipping} className="w-full bg-retro-accent text-white py-3 font-bold uppercase text-sm">
                                {loadingShipping ? 'Cotizando...' : 'Calcular Envío'}
                            </button>
                        ) : (
                            <div className="space-y-2">
                                {shippingOptions.map((opt) => (
                                    <div key={opt.id} onClick={() => setSelectedShipping(opt)} className={`border p-3 cursor-pointer flex justify-between ${selectedShipping?.id === opt.id ? 'border-retro-main ring-1 ring-retro-main' : ''}`}>
                                        <div><p className="font-bold text-sm">{opt.provider}</p><p className="text-xs">{opt.delivery_days}</p></div>
                                        <span className="font-bold">${opt.price}</span>
                                    </div>
                                ))}
                                <button onClick={() => selectedShipping && setStep(3)} disabled={!selectedShipping} className="w-full mt-4 bg-retro-main text-white py-3 font-bold uppercase">Confirmar</button>
                            </div>
                        )}
                    </div>
                )}
                {step > 2 && selectedShipping && <p className="text-sm text-gray-600">{selectedShipping.provider} - CP: {formData.cp}</p>}
            </div>

            {/* 3. PAGO */}
            <div className={`bg-white p-6 shadow-sm border-l-4 ${step >= 3 ? 'border-retro-main' : 'border-gray-200 opacity-50'}`}>
                <h2 className="text-lg font-black uppercase text-retro-main mb-4">3. Pago</h2>
                {step === 3 && (
                    <div className="text-center">
                        <button onClick={handleFinalizeOrder} disabled={loading} className="w-full bg-green-600 text-white py-4 font-black text-lg uppercase shadow-xl animate-pulse">
                            {loading ? 'Procesando...' : 'PAGAR AHORA'}
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN (PROTEGIDO) */}
        <div className="md:col-span-1">
            <div className="bg-white p-6 shadow-lg sticky top-32">
                <h3 className="font-black uppercase text-sm text-gray-400 mb-4 border-b pb-2">Tu Pedido</h3>
                <div className="space-y-4 mb-6 max-h-[250px] overflow-y-auto">
                    {cart.map((item) => (
                        <div key={item.id} className="flex gap-3 text-sm">
                            <img src={item.image_url} alt={item.name} className="w-10 h-10 object-contain" />
                            <div className="flex-grow">
                                <p className="font-bold text-xs line-clamp-2">{item.name}</p>
                                <p className="text-gray-500 text-xs">${Number(item.price).toLocaleString('es-AR')}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        {/* AQUÍ ESTÁ LA PROTECCIÓN: (totalPrice || 0) */}
                        <span className="font-bold">${(totalPrice || 0).toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between text-retro-accent">
                        <span>Envío</span>
                        <span className="font-bold">{selectedShipping ? `$${selectedShipping.price.toLocaleString('es-AR')}` : '---'}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-black mt-4 pt-4 border-t border-dashed">
                        <span>Total</span>
                        <span>${((totalPrice || 0) + (selectedShipping?.price || 0)).toLocaleString('es-AR')}</span>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}