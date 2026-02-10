'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
// import { Truck, CreditCard, Lock, CheckCircle } from 'lucide-react'; // Si querés usarlos, descomentalos

// --- LÓGICA DE ENVÍO (Simulación) ---
const cotizarEnvio = async (cpInput) => {
  await new Promise(resolve => setTimeout(resolve, 800)); 
  const cp = parseInt(cpInput);
  if (!cp) return [];

  let basePrice = 5500;
  if (cp > 2000) basePrice = 6800; 
  if (cp > 8000) basePrice = 8500; 

  return [
    { id: 'correo-arg', provider: 'Correo Argentino', name: 'Clásico', price: basePrice, delivery_days: '3-6 días' },
    { id: 'andreani', provider: 'Andreani', name: 'Estándar', price: basePrice + 1500, delivery_days: '2-3 días' },
    { id: 'pickit', provider: 'Punto Pickit', name: 'Retiro', price: basePrice - 1000, delivery_days: '2-4 días' }
  ];
};

export default function CheckoutPage() {
  // CORRECCIÓN: Usamos 'total' en vez de 'totalPrice' para coincidir con tu Context
  const { cart, total, clearCart } = useCart(); 
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- PASO 1: CAPTURA DE MAIL (ABANDONED CART) ---
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Guardamos el intento de compra
      await supabase.from('abandoned_checkouts').insert({ 
        email, 
        cart_snapshot: cart, 
        recovered: false 
      });
    } catch (e) { 
      console.log("Error guardando carrito abandonado (no bloqueante):", e); 
    }
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

  // --- PASO 3: FINALIZAR ORDEN ---
  const handleFinalizeOrder = async () => {
    setLoading(true);
    const shippingCost = selectedShipping?.price || 0;
    const finalTotal = (total || 0) + shippingCost; // Usamos 'total'

    try {
      // 1. Crear la Orden Principal
      const { data: order, error } = await supabase.from('orders').insert({
        user_email: email,
        subtotal: (total || 0),
        shipping_cost: shippingCost,
        total: finalTotal,
        shipping_provider: selectedShipping?.provider,
        shipping_address: formData,
        customer_data: { nombre: formData.nombre, apellido: formData.apellido, tel: formData.telefono },
        status: 'pending_payment' // Estado inicial
      }).select().single();

      if (error) throw error;

      // 2. Guardar los Items de la Orden
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id, 
        quantity: item.quantity,
        price: item.price,
        product_name: item.name
      }));
      
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 3. Marcar el carrito abandonado como "Recuperado" (porque compró)
      await supabase.from('abandoned_checkouts')
        .update({ recovered: true })
        .eq('email', email)
        .order('created_at', { ascending: false }) // El último
        .limit(1);
      
      clearCart();
      
      // ACÁ IRÍAMOS A MERCADO PAGO, POR AHORA ÉXITO
      alert(`¡Pedido Creado! ID: ${order.id}. Te enviamos un mail a ${email}`);
      router.push('/'); // O a una página de "Gracias"

    } catch (error) {
      alert("Error al procesar la orden: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-[#f3ead7]"></div>;

  if (cart.length === 0) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3ead7] pt-20">
            <h2 className="text-2xl font-black uppercase mb-4 text-[#0f0f10]">Carrito Vacío</h2>
            <button onClick={() => router.push('/catalogo')} className="bg-[#0f0f10] text-white px-6 py-3 font-bold uppercase tracking-widest rounded-sm">Volver al Catálogo</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3ead7] py-10 px-4 pt-32 font-sans text-[#0f0f10]">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: PASOS */}
        <div className="md:col-span-2 space-y-4">
            
            {/* 1. CONTACTO */}
            <div className={`bg-white p-6 shadow-sm border-l-4 ${step >= 1 ? 'border-[#c6a35a]' : 'border-gray-200 opacity-50'}`}>
                <h2 className="text-lg font-black uppercase mb-4">1. Contacto</h2>
                {step === 1 ? (
                    <form onSubmit={handleEmailSubmit}>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tu Email</label>
                        <input type="email" required className="w-full border p-3 mb-4 bg-gray-50 rounded-sm outline-none focus:border-[#c6a35a]" placeholder="ejemplo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <button type="submit" disabled={loading} className="w-full bg-[#0f0f10] text-white py-3 font-bold uppercase tracking-widest hover:bg-[#c6a35a] hover:text-[#0f0f10] transition-colors">{loading ? '...' : 'Continuar'}</button>
                    </form>
                ) : <p className="font-bold text-gray-700 flex items-center gap-2">{email} <span className="text-green-600 font-black">✓</span></p>}
            </div>

            {/* 2. ENVÍO */}
            <div className={`bg-white p-6 shadow-sm border-l-4 ${step >= 2 ? 'border-[#c6a35a]' : 'border-gray-200 opacity-50'}`}>
                <h2 className="text-lg font-black uppercase mb-4">2. Envío</h2>
                {step === 2 && (
                    <div className="animate-fadeIn">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input required placeholder="Nombre" className="border p-3 bg-gray-50 rounded-sm" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                            <input required placeholder="Apellido" className="border p-3 bg-gray-50 rounded-sm" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                            <input required placeholder="CP (Ej: 1414)" className="border p-3 bg-gray-50 font-bold rounded-sm" value={formData.cp} onChange={e => setFormData({...formData, cp: e.target.value})} />
                            <input required placeholder="Teléfono" className="border p-3 bg-gray-50 rounded-sm" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                            <input required placeholder="Calle y Altura" className="col-span-2 border p-3 bg-gray-50 rounded-sm" value={formData.calle} onChange={e => setFormData({...formData, calle: e.target.value})} />
                        </div>
                        
                        {shippingOptions.length === 0 ? (
                            <button onClick={handleShippingCalc} disabled={formData.cp.length < 4 || loadingShipping} className="w-full bg-[#6f6f73] text-white py-3 font-bold uppercase text-xs tracking-widest mt-2 hover:bg-[#0f0f10] transition-colors">
                                {loadingShipping ? 'Cotizando...' : 'Calcular Costo de Envío'}
                            </button>
                        ) : (
                            <div className="space-y-3 mt-4">
                                {shippingOptions.map((opt) => (
                                    <div key={opt.id} onClick={() => setSelectedShipping(opt)} className={`border p-4 cursor-pointer flex justify-between items-center rounded-sm transition-all ${selectedShipping?.id === opt.id ? 'border-[#c6a35a] bg-[#c6a35a]/10 ring-1 ring-[#c6a35a]' : 'hover:border-gray-400'}`}>
                                        <div><p className="font-bold text-sm uppercase">{opt.provider}</p><p className="text-xs text-gray-500">{opt.delivery_days}</p></div>
                                        <span className="font-black">${opt.price.toLocaleString('es-AR')}</span>
                                    </div>
                                ))}
                                <button onClick={() => selectedShipping && setStep(3)} disabled={!selectedShipping} className="w-full mt-4 bg-[#0f0f10] text-white py-3 font-bold uppercase tracking-widest hover:bg-[#c6a35a] hover:text-[#0f0f10] transition-colors">Confirmar Envío</button>
                            </div>
                        )}
                    </div>
                )}
                {step > 2 && selectedShipping && <p className="text-sm text-gray-600 font-bold">{selectedShipping.provider} (${selectedShipping.price}) - CP: {formData.cp}</p>}
            </div>

            {/* 3. PAGO */}
            <div className={`bg-white p-6 shadow-sm border-l-4 ${step >= 3 ? 'border-[#c6a35a]' : 'border-gray-200 opacity-50'}`}>
                <h2 className="text-lg font-black uppercase mb-4">3. Pago</h2>
                {step === 3 && (
                    <div className="text-center animate-fadeIn">
                        <p className="text-sm text-gray-500 mb-4">Vas a ser redirigido para completar el pago de forma segura.</p>
                        <button onClick={handleFinalizeOrder} disabled={loading} className="w-full bg-green-600 text-white py-4 font-black text-lg uppercase shadow-xl hover:bg-green-700 transition-transform transform hover:-translate-y-1">
                            {loading ? 'Procesando...' : 'PAGAR AHORA'}
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN (Sticky) */}
        <div className="md:col-span-1">
            <div className="bg-white p-6 shadow-lg sticky top-32 rounded-xl border border-[#0f0f10]/10">
                <h3 className="font-black uppercase text-sm text-gray-400 mb-4 border-b pb-2">Tu Pedido</h3>
                <div className="space-y-4 mb-6 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                        <div key={`${item.id}-${item.size}`} className="flex gap-3 text-sm items-center">
                            <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 border rounded-md overflow-hidden">
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                <span className="absolute top-0 right-0 bg-[#0f0f10] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center">{item.quantity}</span>
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold text-xs uppercase line-clamp-2">{item.name}</p>
                                <p className="text-[#c6a35a] font-bold text-[10px] uppercase">{item.size}</p>
                            </div>
                            <p className="font-mono text-xs font-bold">${(item.price * item.quantity).toLocaleString('es-AR')}</p>
                        </div>
                    ))}
                </div>
                <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span className="font-bold text-[#0f0f10]">${(total || 0).toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between text-[#c6a35a]">
                        <span>Envío</span>
                        <span className="font-bold">{selectedShipping ? `$${selectedShipping.price.toLocaleString('es-AR')}` : 'A calcular'}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-black mt-4 pt-4 border-t border-dashed border-gray-300">
                        <span>Total</span>
                        <span>${((total || 0) + (selectedShipping?.price || 0)).toLocaleString('es-AR')}</span>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}