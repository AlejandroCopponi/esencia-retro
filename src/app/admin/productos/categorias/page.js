'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Trash2, Pencil, Layers, Info, FileText, Tag } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    subcategories: '', // NUEVO CAMPO (Texto separado por comas)
    ai_context: '',
    technical_text: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
    if (error) console.error(error);
    else setCategories(data || []);
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!formData.name) return alert("El nombre es obligatorio");

    // Convertimos el texto "Boca, River" en un Array ["Boca", "River"] para la base de datos
    const subcatsArray = formData.subcategories
      ? formData.subcategories.split(',').map(s => s.trim()).filter(s => s !== '')
      : [];

    const categoryData = {
      name: formData.name,
      subcategories: subcatsArray, // Guardamos el array
      ai_context: formData.ai_context,
      technical_text: formData.technical_text
    };

    let error;
    if (formData.id) {
      const res = await supabase.from('categories').update(categoryData).eq('id', formData.id);
      error = res.error;
    } else {
      const res = await supabase.from('categories').insert([categoryData]);
      error = res.error;
    }

    if (!error) {
      resetForm();
      fetchCategories();
    } else {
      alert("Error al guardar: " + error.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Seguro que querés borrar esta categoría?")) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) fetchCategories();
  }

  function handleEdit(cat) {
    setFormData({
      id: cat.id,
      name: cat.name,
      // Convertimos el Array de vuelta a Texto para editarlo fácil
      subcategories: cat.subcategories ? cat.subcategories.join(', ') : '',
      ai_context: cat.ai_context || '',
      technical_text: cat.technical_text || ''
    });
  }

  function resetForm() {
    setFormData({ id: null, name: '', subcategories: '', ai_context: '', technical_text: '' });
  }

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      
      {/* HEADER */}
      <div className="flex items-center gap-5 mb-10">
        <div className="p-4 bg-[#0f0f10] text-white rounded-xl">
            <Layers size={32} />
        </div>
        <div>
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Categorías Madre</h1>
            <p className="text-lg text-gray-500 mt-1">Definí las categorías, sus subcategorías y las reglas para la IA.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* --- FORMULARIO --- */}
        <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 sticky top-6">
                <h2 className="font-black text-2xl mb-8 flex items-center gap-3 text-gray-900 uppercase">
                    {formData.id ? <Pencil size={24} className="text-[#c6a35a]"/> : <Save size={24} className="text-[#c6a35a]"/>}
                    {formData.id ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                
                <form onSubmit={handleSave} className="space-y-8">
                    
                    {/* NOMBRE */}
                    <div>
                        <label className="block text-base font-black uppercase text-gray-800 mb-3">Nombre Categoría</label>
                        <input 
                            type="text" 
                            className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg font-bold outline-none focus:border-[#c6a35a] text-gray-900"
                            placeholder="Ej: Camisetas"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    {/* SUBCATEGORÍAS (NUEVO) */}
                    <div>
                        <label className="block text-base font-black uppercase text-gray-800 mb-3 flex justify-between items-center">
                            Subcategorías
                            <Tag size={20} className="text-orange-500" />
                        </label>
                        <input 
                            type="text" 
                            className="w-full p-4 border-2 border-gray-300 rounded-xl text-base font-bold outline-none focus:border-[#c6a35a] text-gray-900 placeholder-gray-400"
                            placeholder="Ej: Nacionales, Europeas, Selecciones"
                            value={formData.subcategories}
                            onChange={e => setFormData({...formData, subcategories: e.target.value})}
                        />
                        <p className="text-sm text-gray-500 mt-2 font-medium">Separalas con comas. Sirven para filtrar.</p>
                    </div>

                    {/* CONTEXTO IA */}
                    <div>
                        <label className="block text-base font-black uppercase text-gray-800 mb-3 flex justify-between items-center">
                            Contexto IA
                            <Info size={20} className="text-blue-500" />
                        </label>
                        <textarea 
                            rows="4"
                            className="w-full p-4 border-2 border-gray-300 rounded-xl text-base leading-relaxed outline-none focus:border-[#c6a35a] text-gray-700"
                            placeholder="Instrucción para la descripción..."
                            value={formData.ai_context}
                            onChange={e => setFormData({...formData, ai_context: e.target.value})}
                        />
                    </div>

                    {/* TEXTO TÉCNICO */}
                    <div>
                        <label className="block text-base font-black uppercase text-gray-800 mb-3 flex justify-between items-center">
                            Texto Fijo (Footer)
                            <FileText size={20} className="text-green-600" />
                        </label>
                        <textarea 
                            rows="5"
                            className="w-full p-4 border-2 border-gray-300 rounded-xl text-base leading-relaxed outline-none focus:border-[#c6a35a] font-mono text-gray-700"
                            placeholder="Detalles técnicos fijos..."
                            value={formData.technical_text}
                            onChange={e => setFormData({...formData, technical_text: e.target.value})}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        {formData.id && (
                            <button type="button" onClick={resetForm} className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold text-base uppercase hover:bg-gray-200">
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="flex-1 px-6 py-4 bg-[#0f0f10] text-white rounded-xl font-bold text-base uppercase hover:bg-[#c6a35a] hover:text-black shadow-lg">
                            {formData.id ? 'Guardar' : 'Crear'}
                        </button>
                    </div>

                </form>
            </div>
        </div>

        {/* --- LISTADO --- */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 text-sm uppercase font-black tracking-wider">
                        <tr>
                            <th className="p-6">Nombre</th>
                            <th className="p-6">Subcategorías</th>
                            <th className="p-6">Contexto IA</th>
                            <th className="p-6 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-base text-gray-700">
                        {categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-6 font-black text-gray-900 align-top text-lg">
                                    <span className="bg-[#f3ead7] text-[#8c7335] px-4 py-2 rounded-lg block w-fit mb-2">
                                        {cat.name}
                                    </span>
                                </td>
                                <td className="p-6 align-top">
                                    <div className="flex flex-wrap gap-2">
                                        {cat.subcategories && cat.subcategories.length > 0 ? (
                                            cat.subcategories.map((sub, idx) => (
                                                <span key={idx} className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded border border-gray-200 uppercase">
                                                    {sub}
                                                </span>
                                            ))
                                        ) : <span className="text-gray-400 italic text-sm">Sin definir</span>}
                                    </div>
                                </td>
                                <td className="p-6 align-top leading-relaxed text-gray-600 text-sm">
                                    <div className="line-clamp-3">{cat.ai_context || '-'}</div>
                                </td>
                                <td className="p-6 text-right align-top">
                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(cat)} className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={22}/></button>
                                        <button onClick={() => handleDelete(cat.id)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={22}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}