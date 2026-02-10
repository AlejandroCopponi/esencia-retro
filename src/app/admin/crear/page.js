'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Upload, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CrearProducto() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    team: '',
    category: 'nacional', // Valor por defecto
    description: ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let image_url = null;

      // 1. Subir imagen a Supabase Storage
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('camisetas')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data } = supabase.storage
          .from('camisetas')
          .getPublicUrl(fileName);
        
        image_url = data.publicUrl;
      }

      // 2. Guardar producto en Base de Datos (CON CATEGORÍA)
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          price: Number(formData.price),
          team: formData.team,
          category: formData.category, // <--- ACÁ ESTÁ LA CLAVE
          image_url: image_url,
          created_at: new Date()
        });

      if (insertError) throw insertError;

      alert('¡Camiseta cargada con éxito!');
      router.push('/admin'); // Volver al panel

    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-black uppercase text-gray-800">Nueva Camiseta</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* NOMBRE */}
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nombre del Producto</label>
                <input 
                    type="text" 
                    required
                    placeholder="Ej: Boca Juniors 2000 Riquelme"
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 font-bold text-gray-800"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* PRECIO */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Precio ($)</label>
                    <input 
                        type="number" 
                        required
                        placeholder="Ej: 45000"
                        className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 font-bold text-gray-800"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                </div>
                
                {/* EQUIPO */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Equipo / Club</label>
                    <input 
                        type="text" 
                        required
                        placeholder="Ej: Boca Juniors"
                        className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 font-bold text-gray-800"
                        value={formData.team}
                        onChange={(e) => setFormData({...formData, team: e.target.value})}
                    />
                </div>
            </div>

            {/* CATEGORÍA (NUEVO CAMPO FUNDAMENTAL) */}
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Categoría</label>
                <select 
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 font-bold text-gray-800 bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                    <option value="nacional">Clubes Nacionales</option>
                    <option value="internacional">Clubes Internacionales</option>
                    <option value="selecciones">Selecciones</option>
                    <option value="retro">Leyendas / Retro</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Esto define dónde aparece en el catálogo.</p>
            </div>

            {/* IMAGEN */}
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Foto del Producto</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
                    <input 
                        type="file" 
                        accept="image/*"
                        required
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {preview ? (
                        <img src={preview} className="h-40 mx-auto object-contain mix-blend-multiply" />
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            <Upload size={32} className="mb-2" />
                            <span className="text-sm font-bold">Hacé clic para subir foto</span>
                        </div>
                    )}
                </div>
            </div>

            {/* BOTÓN GUARDAR */}
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex justify-center items-center gap-2"
            >
                {loading ? 'Subiendo...' : <><Save size={20} /> Guardar Camiseta</>}
            </button>

        </form>
      </div>
    </div>
  );
}