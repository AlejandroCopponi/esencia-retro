'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search, ImageIcon, Package, Layers, ClipboardList } from 'lucide-react';

export default function ProductosAdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ESTADO PARA LAS PESTAÑAS (Subcategorías visuales)
  const [activeTab, setActiveTab] = useState('listado'); 

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error cargando productos:', error);
    else setProducts(data || []);
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('¿Estás seguro de eliminar este producto? No hay vuelta atrás.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert('Error al borrar: ' + error.message);
    else setProducts(products.filter(p => p.id !== id));
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Gestión de Productos</h1>
        </div>
        {/* BOTÓN QUE CONECTA CON TU CARPETA 'CREAR' */}
        <Link 
          href="/admin/crear" 
          className="bg-[#111] text-white px-6 py-3 rounded-lg font-bold uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-[#c6a35a] hover:text-black transition-colors shadow-lg"
        >
          <Plus size={16} /> Nuevo Producto
        </Link>
      </div>

      {/* --- SUB-CATEGORÍAS (PESTAÑAS) --- */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
        
        <button 
          onClick={() => setActiveTab('listado')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'listado' 
              ? 'border-[#c6a35a] text-black bg-white' 
              : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Package size={18} /> Listado
        </button>

        <button 
          onClick={() => setActiveTab('inventario')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'inventario' 
              ? 'border-[#c6a35a] text-black bg-white' 
              : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ClipboardList size={18} /> Inventario
        </button>

        <button 
          onClick={() => setActiveTab('categorias')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'categorias' 
              ? 'border-[#c6a35a] text-black bg-white' 
              : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Layers size={18} /> Categorías
        </button>

      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      {activeTab === 'listado' && (
        <>
            {/* BARRA DE BÚSQUEDA */}
            <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex items-center gap-3">
                <Search className="text-gray-400" size={20} />
                <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                className="flex-1 outline-none text-sm text-gray-700 font-medium bg-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* TABLA */}
            <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm overflow-hidden">
                {loading ? (
                <div className="p-12 text-center text-gray-400 animate-pulse">Cargando catálogo...</div>
                ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                    <p>No hay productos que coincidan.</p>
                </div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                        <th className="p-4 w-24 text-center">Imagen</th>
                        <th className="p-4">Producto</th>
                        <th className="p-4">Categoría</th>
                        <th className="p-4">Precio</th>
                        <th className="p-4 text-center">Stock</th>
                        <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="p-4">
                            <div className="w-12 h-12 bg-white border border-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                                {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
                                ) : <ImageIcon size={16} className="text-gray-300" />}
                            </div>
                            </td>
                            <td className="p-4">
                            <p className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">ID: {product.id}</p>
                            </td>
                            <td className="p-4">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">{product.category || 'General'}</span>
                            </td>
                            <td className="p-4 font-mono font-bold text-gray-900">${product.price?.toLocaleString('es-AR')}</td>
                            <td className="p-4 text-center">
                                {product.stock !== undefined ? (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.stock}
                                    </span>
                                ) : <span className="text-gray-400">-</span>}
                            </td>
                            <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                {/* BOTÓN QUE CONECTA CON TU CARPETA 'EDITAR' */}
                                <Link href={`/admin/editar/${product.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Pencil size={18} /></Link>
                                <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={18} /></button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
        </>
      )}

      {/* PESTAÑAS VACÍAS (Placeholder) */}
      {activeTab === 'inventario' && (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Inventario</h3>
            <p className="text-gray-500">Próximamente: Gestión de stock avanzado.</p>
        </div>
      )}

      {activeTab === 'categorias' && (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
             <h3 className="text-lg font-bold text-gray-800 mb-2">Categorías</h3>
             <p className="text-gray-500">Próximamente: Creación de categorías.</p>
        </div>
      )}
      
    </div>
  );
}