'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Para navegar al terminar
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    team: '',
    category: 'Nacional', // Valor por defecto
    image_url: ''
  });

  // Maneja los cambios en los inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función para guardar en Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Validamos que el precio sea número
    const priceNumber = parseFloat(formData.price);
    if (isNaN(priceNumber)) {
        alert("El precio tiene que ser un número");
        setLoading(false);
        return;
    }

    // 2. Insertamos en la base de datos
    const { error } = await supabase
      .from('products')
      .insert([
        { 
            name: formData.name, 
            price: priceNumber, 
            team: formData.team, 
            category: formData.category,
            image_url: formData.image_url 
        }
      ]);

    if (error) {
      alert('Error al guardar: ' + error.message);
      setLoading(false);
    } else {
      // 3. Éxito! Volvemos al panel
      alert('¡Camiseta creada con éxito!');
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
            
            {/* Nombre */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Producto</label>
                <input 
                    type="text" 
                    name="name"
                    required
                    placeholder="Ej: Manchester United 2008"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Equipo */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Equipo</label>
                    <input 
                        type="text" 
                        name="team"
                        required
                        placeholder="Ej: Manchester Utd"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={handleChange}
                    />
                </div>
                {/* Precio */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Precio</label>
                    <input 
                        type="number" 
                        name="price"
                        required
                        placeholder="Ej: 95000"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* URL de Imagen (Temporal) */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL de la Foto</label>
                <input 
                    type="text" 
                    name="image_url"
                    required
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                    onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-2">Por ahora pegá un link de Google Imágenes. Después configuramos la subida de archivos real.</p>
            </div>

            {/* Botón Guardar */}
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center"
            >
                {loading ? 'Guardando...' : (
                    <>
                        <Save size={20} className="mr-2" /> Guardar Producto
                    </>
                )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}