'use client';

import { useState, useEffect, use } from 'react';
import { Star, Truck, Minus, Plus, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext'; // <--- Importamos el hook

export default function ProductPage({ params }) {
  const { id } = use(params);
  const { addToCart } = useCart(); // <--- Usamos la función del carrito

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(data);
      setLoading(false);
    }
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-20">Cargando...</div>;
  if (!product) return <div className="text-center py-20">No encontrado</div>;

  const galleryImages = [product.image_url]; // Simplificado
  const sizes = ["S", "M", "L", "XL", "XXL"];

  // FUNCIÓN PARA EL BOTÓN
  const handleAddToCart = () => {
    if (!selectedSize) {
        alert("Por favor elegí un talle");
        return;
    }
    addToCart(product, selectedSize, quantity);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:grid lg:grid-cols-2 gap-0">
          
          {/* FOTO */}
          <div className="p-8 bg-gray-50 flex items-center justify-center">
            <img src={product.image_url} className="max-w-full rounded-lg shadow-md" />
          </div>

          {/* INFO */}
          <div className="p-6 lg:p-10 flex flex-col justify-center">
            <h1 className="text-4xl font-black text-gray-900 mb-2">{product.name}</h1>
            <div className="text-4xl font-bold text-blue-600 mb-8">${product.price.toLocaleString('es-AR')}</div>

            {/* TALLES */}
            <div className="mb-6">
              <span className="font-bold text-gray-900 block mb-2">Talle</span>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg font-bold transition-all ${selectedSize === size ? 'bg-black text-white' : 'bg-white border border-gray-200'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-xl">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full px-3 text-gray-500 hover:bg-gray-100"><Minus size={16} /></button>
                 <span className="w-10 text-center font-bold">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full px-3 text-gray-500 hover:bg-gray-100"><Plus size={16} /></button>
              </div>

              {/* Botón con el evento onClick */}
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all"
              >
                 AGREGAR AL CARRITO
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}