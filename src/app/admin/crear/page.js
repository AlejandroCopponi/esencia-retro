'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    team: '',
    category: 'Nacional', // Valor por defecto
    image_url: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    try {
      setUploadingImage(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('camisetas')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('camisetas').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });

    } catch (error) {
      alert('Error subiendo imagen: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.image_url) {
        alert("¡Falta subir la foto!");
        setLoading(false);
        return;
    }

    const priceNumber = parseFloat(formData.price);
    
    const { error } = await supabase
      .from('products')
      .insert([
        { 
            name: formData.name, 
            price: priceNumber, 
            team: formData.team, 
            category: formData.category, // Ahora sí mandamos la categoría correcta
            image_url: formData.image_url 
        }
      ]);

    if (error) {
      alert('Error al guardar: ' + error.message);
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        
        <Link href="/admin" className="text-gray-500 hover:text-black mb-6 inline-flex items-center font-bold">
            <ArrowLeft size={20} className="mr-2" /> Volver al Panel
        </Link>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
          <h1 className="text-2xl font-black text-gray-900 mb-6">Cargar Nueva Camiseta</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* IMAGEN */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Foto</label>
                <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg flex items-center border border-gray-300 transition-colors">
                        <Upload size={20} className="mr-2" />
                        {uploadingImage ? 'Subiendo...' : 'Elegir Archivo'}
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                    </label>
                    {formData.image_url && (
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                            <img src={formData.image_url} className="h-full w-full object-cover" />
                        </div>
                    )}
                </div>
            </div>

            {/* NOMBRE */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Producto (Título)</label>
                <input type="text" name="name" required placeholder="Ej: Real Madrid 2017 Final Cardiff" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} />
                <p className="text-xs text-gray-500 mt-1">Sé descriptivo, esto ayuda al buscador.</p>
            </div>

            {/* CATEGORÍA - NUEVO CAMPO IMPORTANTE */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categoría (Para los filtros)</label>
                <select 
                    name="category" 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    onChange={handleChange}
                    value={formData.category}
                >
                    <option value="Nacional">🇦🇷 Liga Argentina (Nacional)</option>
                    <option value="Internacional">🌍 Clubes Internacionales</option>
                    <option value="Selecciones">🏆 Selecciones</option>
                    <option value="Retro">⏳ Retro / Otros</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* EQUIPO */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Equipo (Corto)</label>
                    <input type="text" name="team" required placeholder="Ej: Real Madrid" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} />
                </div>
                {/* PRECIO */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Precio</label>
                    <input type="number" name="price" required placeholder="Ej: 95000" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} />
                </div>
            </div>

            <button type="submit" disabled={loading || uploadingImage} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center">
                {loading ? 'Guardando...' : (<><Save size={20} className="mr-2" /> Guardar Producto</>)}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}