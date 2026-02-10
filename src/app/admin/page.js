'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, Edit, Search, LogOut } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Función para limpiar texto (para el buscador)
  function normalize(text) {
    if (!text) return '';
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Filtrar productos por buscador
  const filteredProducts = products.filter(p => {
    const term = normalize(searchTerm);
    return normalize(p.name).includes(term) || normalize(p.team || '').includes(term);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Panel de Control</h1>
            <p className="text-gray-500 text-sm">Gestioná tu inventario.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
             <Link href="/admin/crear" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center shadow-lg transition-all flex-1 md:flex-none">
                <Plus size={20} className="mr-2" />
                Nueva
             </Link>
             <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-4 rounded-xl font-bold transition-colors">
                <LogOut size={20} />
             </button>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="bg-white p-4 rounded-t-xl border-b border-gray-100 flex items-center">
            <Search className="text-gray-400 mr-3" />
            <input 
                type="text" 
                placeholder="Buscar por nombre o equipo..." 
                className="flex-1 outline-none text-gray-700 font-medium placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* TABLA CON SCROLL LATERAL */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
                  <th className="p-4">Foto</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Equipo / Cat</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500 animate-pulse">Cargando inventario...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay camisetas cargadas.</td></tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4">
                        <div className="h-12 w-12 rounded bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                            {product.image_url ? (
                                <img src={product.image_url} className="h-full w-full object-cover" alt="" />
                            ) : (
                                <span className="text-xs text-gray-400">Sin foto</span>
                            )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        {product.name}
                      </td>
                      <td className="p-4">
                        <div className="text-gray-900 font-medium">{product.team}</div>
                        <div className="text-xs text-gray-400 uppercase">{product.category || 'Sin cat.'}</div>
                      </td>
                      <td className="p-4 font-medium text-blue-600">
                        ${(product.price || 0).toLocaleString('es-AR')}
                      </td>
                      
                      {/* ACÁ ESTABA EL ERROR - ESTA ES LA PARTE CORREGIDA */}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                            {/* Botón Editar (Lápiz) */}
                            <Link 
                                href={`/admin/editar/${product.id}`}
                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Edit size={20} />
                            </Link>

                            {/* Botón Borrar (Tacho) */}
                            <button 
                                onClick={() => handleDelete(product.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
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