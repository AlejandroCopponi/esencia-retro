'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit, Search } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar productos al iniciar
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    setLoading(false);
  }

  // Función para borrar
  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que querés borrar esta camiseta?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error al borrar: ' + error.message);
    } else {
      // Actualizamos la lista localmente para no recargar
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Filtrar productos por buscador
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black text-gray-900">Panel de Control</h1>
          <Link href="/admin/crear" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center shadow-lg transition-all w-full md:w-auto justify-center">
            <Plus size={20} className="mr-2" />
            Nueva Camiseta
          </Link>
        </div>

        {/* BUSCADOR */}
        <div className="bg-white p-4 rounded-t-xl border-b border-gray-100 flex items-center">
            <Search className="text-gray-400 mr-3" />
            <input 
                type="text" 
                placeholder="Buscar por nombre o equipo..." 
                className="flex-1 outline-none text-gray-700 font-medium"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* TABLA CON SCROLL LATERAL (La solución al problema) */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto"> {/* <--- ESTA ES LA CLAVE DEL SCROLL */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
                  <th className="p-4">Foto</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Equipo</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">Cargando inventario...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay camisetas cargadas.</td></tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="h-12 w-12 rounded bg-gray-100 border border-gray-200 overflow-hidden">
                            <img src={product.image_url} className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">{product.name}</td>
                      <td className="p-4 text-gray-600">{product.team}</td>
                      <td className="p-4 font-medium text-blue-600">${product.price.toLocaleString('es-AR')}</td>
                      <td className="p-4 text-right">
                        <button 
                            onClick={() => handleDelete(product.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}