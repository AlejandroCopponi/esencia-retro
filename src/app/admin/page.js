'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar productos al entrar
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  // 2. Función para borrar (¡Sin piedad!)
  async function handleDelete(id) {
    if (confirm('¿Seguro que querés borrar esta camiseta para siempre?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      
      if (error) {
        alert('Error al borrar: ' + error.message);
      } else {
        // Actualizamos la lista visualmente sin recargar
        setProducts(products.filter(p => p.id !== id));
      }
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando panel...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Panel de Control</h1>
            <p className="text-gray-500">Gestioná tu stock desde acá.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="flex items-center text-gray-600 hover:text-black font-bold px-4">
               <ArrowLeft size={20} className="mr-2" /> Ir a la Web
            </Link>
            <Link href="/admin/crear" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-lg">
               <Plus size={20} className="mr-2" /> Nueva Camiseta
            </Link>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold text-gray-600 text-sm">FOTO</th>
                <th className="p-4 font-bold text-gray-600 text-sm">NOMBRE</th>
                <th className="p-4 font-bold text-gray-600 text-sm">EQUIPO</th>
                <th className="p-4 font-bold text-gray-600 text-sm">PRECIO</th>
                <th className="p-4 font-bold text-gray-600 text-sm text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <img src={product.image_url} alt="foto" className="w-12 h-12 rounded object-cover border border-gray-200" />
                  </td>
                  <td className="p-4 font-bold text-gray-900">{product.name}</td>
                  <td className="p-4 text-gray-500">{product.team}</td>
                  <td className="p-4 text-gray-900 font-mono">${product.price.toLocaleString('es-AR')}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                      title="Borrar producto"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {products.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              No hay camisetas cargadas. ¡Apretá el botón azul!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}