'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation'; // <--- OJO: Usamos useParams acá
import { Upload, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditarProducto() { // Ya no recibimos params por props para evitar líos de versiones
  const router = useRouter();
  const params = useParams(); // Usamos el hook oficial
  const id = params?.id; 
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    team: '',
    category: 'nacional',
    image_url: ''
  });

  // 1. CARGAR DATOS AL INICIAR
  useEffect(() => {
    if (!id) return; // Si no hay ID, esperamos

    async function fetchProduct() {
      console.log("Buscando producto ID:", id); // DEBUG PARA VOS

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single(); // .single() tira error si no encuentra NADA

      if (error) {
        console.error("Error detallado:", error); // Mitalo en F12
        alert('ERROR DE SUPABASE: ' + error.message + ' (Código: ' + error.code + ')');
        // No redirigimos para que puedas leer el error
      } else {
        setFormData({
            name: data.name,
            price: data.price,
            team: data.team,
            category: data.category || 'nacional',
            image_url: data.image_url
        });
        setPreview(data.image_url);
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let final_image_url = formData.image_url;

      // 1. Si eligió foto nueva, la subimos
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('camisetas')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('camisetas')
          .getPublicUrl(fileName);
        
        final_image_url = data.publicUrl;
      }

      // 2. ACTUALIZAMOS EL PRODUCTO
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          price: Number(formData.price),
          team: formData.team,
          category: formData.category,
          image_url: final_image_url
        })
        .eq('id', id);

      if (updateError) throw updateError;

      alert('¡Producto actualizado!');
      router.push('/admin');

    } catch (error) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p>Cargando datos del ID: {id}...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-black uppercase text-gray-800">Editar Camiseta</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* NOMBRE */}
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nombre</label>
                <input 
                    type="text" required
                    className="w-full border border-gray-200 rounded-lg p-3 font-bold text-gray-800"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* PRECIO */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Precio ($)</label>
                    <input 
                        type="number" required
                        className="w-full border border-gray-200 rounded-lg p-3 font-bold text-gray-800"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                </div>
                
                {/* EQUIPO */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Equipo</label>
                    <input 
                        type="text" required
                        className="w-full border border-gray-200 rounded-lg p-3 font-bold text-gray-800"
                        value={formData.team}
                        onChange={(e) => setFormData({...formData, team: e.target.value})}
                    />
                </div>
            </div>

            {/* CATEGORÍA */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label className="block text-xs font-black uppercase text-yellow-700 mb-2">Categoría</label>
                <select 
                    className="w-full border border-gray-200 rounded-lg p-3 font-bold text-gray-800 bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                    <option value="nacional">Clubes Nacionales</option>
                    <option value="internacional">Clubes Internacionales</option>
                    <option value="selecciones">Selecciones</option>
                    <option value="retro">Leyendas / Retro</option>
                </select>
            </div>

            {/* IMAGEN */}
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Foto</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                    <input 
                        type="file" accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {preview ? (
                        <div className="relative h-40 mx-auto w-fit">
                             <img src={preview} className="h-full object-contain mix-blend-multiply" />
                             <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-lg">Cambiar</div>
                        </div>
                    ) : (
                        <div className="text-gray-400 py-8"><Upload size={32} className="mx-auto" /></div>
                    )}
                </div>
            </div>

            {/* BOTÓN GUARDAR */}
            <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black uppercase py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex justify-center items-center gap-2"
            >
                {saving ? 'Guardando...' : <><Save size={20} /> Guardar Cambios</>}
            </button>

        </form>
      </div>
    </div>
  );
}