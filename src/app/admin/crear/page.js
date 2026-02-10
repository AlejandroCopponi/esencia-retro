'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Upload, ArrowLeft, Save, Eye, EyeOff, Layers, Copy, Loader2 } from 'lucide-react';
import Link from 'next/link';
// Importamos heic2any dinámicamente en el código para evitar errores de servidor

export default function CrearProducto() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false); // Nuevo estado para avisar conversión
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // --- LÓGICA DE VARIANTES ---
  const [activeTab, setActiveTab] = useState('adultos');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [variantDetails, setVariantDetails] = useState({});
  const [bulkStock, setBulkStock] = useState('');

  const SIZE_OPTIONS = {
    adultos: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    ninos: ['2', '4', '6', '8', '10', '12', '14', '16']
  };

  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(prev => prev.filter(s => s !== size));
      const newDetails = { ...variantDetails };
      delete newDetails[size];
      setVariantDetails(newDetails);
    } else {
      setSelectedSizes(prev => [...prev, size]);
      setVariantDetails(prev => ({ ...prev, [size]: { stock: 0 } }));
    }
  };

  const applyBulkStock = () => {
    if (!bulkStock) return;
    const val = parseInt(bulkStock);
    const newDetails = { ...variantDetails };
    selectedSizes.forEach(size => {
        newDetails[size] = { ...newDetails[size], stock: val };
    });
    setVariantDetails(newDetails);
  };

  const handleVariantStockChange = (size, value) => {
    setVariantDetails(prev => ({
        ...prev,
        [size]: { ...prev[size], stock: parseInt(value) || 0 }
    }));
  };
  // ----------------------------------

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    old_price: '',
    cost: '',
    sku: '',
    barcode: '',
    weight: '',
    depth: '',
    width: '',
    height: '',
    team: '',
    category: 'nacional',
    show_in_store: true,
    free_shipping: false
  });

  // --- FUNCIÓN DE IMAGEN MEJORADA (CONVERTIDOR HEIC) ---
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Chequeamos si es HEIC
    if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        setConverting(true);
        try {
            // Importamos la librería solo cuando la necesitamos (ahorra peso)
            const heic2any = (await import('heic2any')).default;
            
            // Convertimos a JPG
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.8 // Calidad del 80% para que no pese tanto
            });

            // Creamos un nuevo archivo JPG
            const newFile = new File(
                [convertedBlob], 
                file.name.replace(/\.heic$/i, ".jpg"), 
                { type: 'image/jpeg' }
            );

            setImageFile(newFile);
            setPreview(URL.createObjectURL(newFile));
        } catch (error) {
            alert("Error convirtiendo imagen HEIC. Probá con una JPG.");
            console.error(error);
        } finally {
            setConverting(false);
        }
    } else {
        // Si es JPG o PNG normal, pasa derecho
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalStock = selectedSizes.reduce((acc, size) => acc + (variantDetails[size]?.stock || 0), 0);
      
      let image_url = null;

      // 1. Subir imagen
      if (imageFile) {
        // Usamos una carpeta "publica" si querés organizar, o raíz.
        // Asegurate que el bucket sea PUBLICO en Supabase.
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('camisetas')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('camisetas').getPublicUrl(fileName);
        image_url = data.publicUrl;
      }

      // 2. Crear Producto Padre
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          old_price: formData.old_price ? Number(formData.old_price) : null,
          cost: formData.cost ? Number(formData.cost) : null,
          stock: totalStock,
          sku: formData.sku,
          barcode: formData.barcode,
          weight: formData.weight ? Number(formData.weight) : null,
          depth: formData.depth ? Number(formData.depth) : null,
          width: formData.width ? Number(formData.width) : null,
          height: formData.height ? Number(formData.height) : null,
          team: formData.team,
          category: formData.category,
          image_url: image_url,
          show_in_store: formData.show_in_store,
          free_shipping: formData.free_shipping,
          created_at: new Date()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Crear las Variantes
      const variantsToInsert = selectedSizes.map(size => ({
        product_id: newProduct.id,
        size: size,
        stock: variantDetails[size]?.stock || 0
      }));

      if (variantsToInsert.length > 0) {
        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);
        
        if (variantsError) throw variantsError;
      }

      alert('¡Producto creado con éxito!');
      router.push('/admin');

    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans pb-32">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="text-gray-400 hover:text-gray-600">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-black uppercase text-gray-800">Nuevo Producto</h1>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${formData.show_in_store ? 'bg-green-100 border-green-200 text-green-800' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                <input 
                    type="checkbox" 
                    id="show_in_store_top" 
                    name="show_in_store" 
                    checked={formData.show_in_store} 
                    onChange={handleChange} 
                    className="w-5 h-5 cursor-pointer accent-green-600"
                />
                <label htmlFor="show_in_store_top" className="font-bold text-sm cursor-pointer select-none flex items-center gap-2">
                    {formData.show_in_store ? <><Eye size={16}/> Visible en Tienda</> : <><EyeOff size={16}/> Oculto</>}
                </label>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

            {/* 1. INFO BÁSICA */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="font-bold text-lg mb-4 text-gray-800">Información Básica</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nombre</label>
                        <input name="name" type="text" required className="w-full border border-gray-200 p-3 rounded-lg font-bold" value={formData.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descripción</label>
                        <textarea name="description" rows="4" className="w-full border border-gray-200 p-3 rounded-lg text-sm" value={formData.description} onChange={handleChange} />
                    </div>
                </div>
            </div>

            {/* 2. FOTOS (CON LOADER DE CONVERSIÓN) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="font-bold text-lg mb-4 text-gray-800">Multimedia</h2>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
                    <input type="file" accept="image/*,.heic" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    
                    {converting ? (
                        <div className="flex flex-col items-center justify-center text-blue-600 py-8">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <span className="font-bold text-sm">Optimizando imagen...</span>
                        </div>
                    ) : preview ? (
                        <img src={preview} className="h-40 mx-auto object-contain mix-blend-multiply" />
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            <Upload size={32} className="mb-2" />
                            <span className="text-sm font-bold">Subir foto (Soporta iPhone/HEIC)</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. PRECIOS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="font-bold text-lg mb-4 text-gray-800">Precios</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Precio Final</label>
                        <input name="price" type="number" required className="w-full border border-gray-200 p-3 rounded-lg font-bold" value={formData.price} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Precio Tachado</label>
                        <input name="old_price" type="number" className="w-full border border-gray-200 p-3 rounded-lg text-gray-500" value={formData.old_price} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Costo</label>
                        <input name="cost" type="number" className="w-full border border-gray-200 p-3 rounded-lg text-gray-500 bg-gray-50" value={formData.cost} onChange={handleChange} />
                    </div>
                </div>
            </div>

            {/* 4. VARIANTES */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <Layers size={20} className="text-blue-600"/> Variantes
                    </h2>
                </div>
                
                <div className="mb-6">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">1. Elegí los talles:</label>
                    <div className="flex gap-4 mb-3 border-b border-gray-100 pb-2">
                        <button type="button" onClick={() => setActiveTab('adultos')} className={`text-sm font-bold px-3 py-1 rounded-md transition-colors ${activeTab === 'adultos' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Adultos</button>
                        <button type="button" onClick={() => setActiveTab('ninos')} className={`text-sm font-bold px-3 py-1 rounded-md transition-colors ${activeTab === 'ninos' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Niños</button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {SIZE_OPTIONS[activeTab].map(size => {
                            const isSelected = selectedSizes.includes(size);
                            return (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => toggleSize(size)}
                                    className={`
                                        px-4 py-2 rounded-lg border text-sm font-bold transition-all
                                        ${isSelected 
                                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {selectedSizes.length > 0 && (
                    <div className="mt-6 border-t border-gray-100 pt-6 animate-fadeIn">
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-200">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                <Copy size={16} />
                                <span>Edición Masiva:</span>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <input 
                                    type="number" 
                                    placeholder="Stock para todos" 
                                    className="border border-gray-300 rounded p-2 text-sm w-full md:w-40"
                                    value={bulkStock}
                                    onChange={(e) => setBulkStock(e.target.value)}
                                />
                                <button 
                                    type="button" 
                                    onClick={applyBulkStock}
                                    className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-bold hover:bg-black whitespace-nowrap"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>

                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">2. Definir Stock por Talle:</label>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-3 border-b">Talle</th>
                                        <th className="p-3 border-b">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedSizes.sort().map(size => (
                                        <tr key={size} className="bg-white">
                                            <td className="p-3 font-bold text-gray-800 w-1/2">
                                                {size}
                                            </td>
                                            <td className="p-3">
                                                <input 
                                                    type="number" 
                                                    className="border border-gray-200 rounded p-2 w-full md:w-32 font-medium focus:border-blue-500 outline-none"
                                                    value={variantDetails[size]?.stock}
                                                    onChange={(e) => handleVariantStockChange(size, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. OTROS DATOS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="font-bold text-lg mb-4 text-gray-800">Organización</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Equipo</label>
                        <input name="team" type="text" required className="w-full border border-gray-200 p-3 rounded-lg" value={formData.team} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Categoría</label>
                        <select name="category" className="w-full border border-gray-200 p-3 rounded-lg bg-white" value={formData.category} onChange={handleChange}>
                            <option value="nacional">Clubes Nacionales</option>
                            <option value="internacional">Clubes Internacionales</option>
                            <option value="selecciones">Selecciones</option>
                            <option value="retro">Leyendas / Retro</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 6. ENVÍO */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="font-bold text-lg mb-4 text-gray-800">Peso y Dimensiones</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Peso (kg)</label>
                        <input name="weight" type="number" step="0.01" className="w-full border border-gray-200 p-3 rounded-lg" value={formData.weight} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Profundidad</label>
                        <input name="depth" type="number" className="w-full border border-gray-200 p-3 rounded-lg" value={formData.depth} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ancho</label>
                        <input name="width" type="number" className="w-full border border-gray-200 p-3 rounded-lg" value={formData.width} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Alto</label>
                        <input name="height" type="number" className="w-full border border-gray-200 p-3 rounded-lg" value={formData.height} onChange={handleChange} />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="free_shipping" checked={formData.free_shipping} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Envío Gratis</span>
                    </label>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-200 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:relative md:bg-transparent md:border-0 md:shadow-none md:p-0 md:mt-8">
                <Link href="/admin" className="px-6 py-3 font-bold text-gray-500 hover:text-gray-800">Cancelar</Link>
                <button 
                    type="submit" 
                    disabled={loading || converting} // Bloqueamos si está guardando O convirtiendo
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center gap-2"
                >
                    {loading ? 'Guardando...' : <><Save size={20} /> Guardar Producto</>}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}