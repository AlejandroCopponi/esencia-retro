'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Upload, ArrowLeft, Save, Loader2, Tag, Globe, Package, X, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CrearProducto() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  
  // MANEJO DE MÚLTIPLES FOTOS
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // LÓGICA DE VARIANTES Y STOCK
  const [activeTab, setActiveTab] = useState('adultos');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [bulkStock, setBulkStock] = useState('');

  const SIZES = {
    adultos: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    ninos: ['2', '4', '6', '8', '10', '12', '14', '16']
  };

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    compare_at_price: '', // Este mapea a old_price en tu DB
    category: 'nacional',
    description: '',
    sku: '',
    tags: '',
    seo_title: '',
    seo_description: '',
    weight: '0.5',
    length: '30',
    width: '20',
    height: '5',
    // Campos de stock para el estado interno
    stock_s: 0, stock_m: 0, stock_l: 0, stock_xl: 0, stock_xxl: 0, stock_xxxl: 0,
    stock_2: 0, stock_4: 0, stock_6: 0, stock_8: 0, stock_10: 0, stock_12: 0, stock_14: 0, stock_16: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(prev => prev.filter(s => s !== size));
      setFormData(prev => ({ ...prev, [`stock_${size.toLowerCase()}`]: 0 }));
    } else {
      setSelectedSizes(prev => [...prev, size]);
    }
  };

  const applyBulkStock = () => {
    if (!bulkStock) return;
    const updates = {};
    selectedSizes.forEach(size => {
      updates[`stock_${size.toLowerCase()}`] = Number(bulkStock);
    });
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // CONVERTIDOR HEIC INTEGRADO
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setConverting(true);
    const newFiles = [...imageFiles];
    const newPreviews = [...previews];

    for (const file of files) {
      if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
        try {
          const heic2any = (await import('heic2any')).default;
          const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.7 });
          const convertedFile = new File([convertedBlob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
          newFiles.push(convertedFile);
          newPreviews.push(URL.createObjectURL(convertedBlob));
        } catch (err) { console.error("Error HEIC:", err); }
      } else {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }
    setImageFiles(newFiles);
    setPreviews(newPreviews);
    setConverting(false);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Subir fotos al bucket 'camisetas'
      const uploadedUrls = [];
      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('camisetas').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('camisetas').getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }

      // 2. Insertar Producto en 'products'
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          old_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
          sku: formData.sku,
          tags: formData.tags,
          seo_title: formData.seo_title,
          seo_description: formData.seo_description,
          image_url: uploadedUrls[0] || '',
          images_gallery: uploadedUrls,
          category: formData.category,
          weight: Number(formData.weight),
          width: Number(formData.width),
          height: Number(formData.height),
          depth: Number(formData.length), // Usamos length para depth según tu tabla
          created_at: new Date()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Insertar Variantes en 'product_variants'
      const variantsToInsert = selectedSizes.map(size => ({
        product_id: newProduct.id,
        size: size,
        stock: parseInt(formData[`stock_${size.toLowerCase()}`]) || 0
      }));

      if (variantsToInsert.length > 0) {
        const { error: variantsError } = await supabase.from('product_variants').insert(variantsToInsert);
        if (variantsError) throw variantsError;
      }

      router.push('/admin/productos');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 text-lg px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={28}/></Link>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900">Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          
       {/* INFORMACIÓN PRINCIPAL */}
<section className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-300">
  <h2 className="font-black uppercase text-sm mb-6 text-[#c6a35a] tracking-widest flex items-center gap-2">
    <Package size={20}/> Información Principal
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="md:col-span-2">
      <label className="block text-xs font-black uppercase text-gray-500 mb-2">Nombre del Producto</label>
      <input name="name" onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg font-bold focus:border-black outline-none transition-all text-xl" required />
    </div>
    
    {/* CAMPO CATEGORÍA REINTEGRADO */}
    <div className="md:col-span-2">
      <label className="block text-xs font-black uppercase text-gray-500 mb-2">Categoría del Producto</label>
      <select 
        name="category" 
        value={formData.category} 
        onChange={handleChange} 
        className="w-full p-4 border-2 border-gray-300 rounded-lg font-bold bg-white focus:border-black outline-none transition-all text-lg"
      >
        <option value="nacional">Clubes Nacionales</option>
        <option value="internacional">Clubes Internacionales</option>
        <option value="selecciones">Selecciones</option>
        <option value="retro">Leyendas / Retro</option>
      </select>
    </div>

    <div>
      <label className="block text-xs font-black uppercase text-gray-500 mb-2">SKU / Referencia</label>
      <input name="sku" onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg font-mono focus:border-black outline-none transition-all" />
    </div>
    <div>
      <label className="block text-xs font-black uppercase text-gray-500 mb-2">Tags</label>
      <input name="tags" onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-black outline-none transition-all" />
    </div>
    <div className="md:col-span-2">
      <label className="block text-xs font-black uppercase text-gray-500 mb-2">Descripción Detallada</label>
      <textarea name="description" rows="5" onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg focus:border-black outline-none transition-all" />
    </div>
  </div>
</section>

          {/* VARIANTES Y STOCK */}
          <section className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black uppercase text-sm text-[#c6a35a] tracking-widest">Variantes y Stock</h2>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button type="button" onClick={() => setActiveTab('adultos')} className={`px-6 py-2 rounded-md font-black text-[10px] uppercase transition-all ${activeTab === 'adultos' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Adultos</button>
                <button type="button" onClick={() => setActiveTab('ninos')} className={`px-6 py-2 rounded-md font-black text-[10px] uppercase transition-all ${activeTab === 'ninos' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Niños</button>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider italic">1. Seleccioná los talles para cargar:</p>
            <div className="flex flex-wrap gap-3 mb-8">
              {SIZES[activeTab].map(size => (
                <button key={size} type="button" onClick={() => toggleSize(size)} className={`px-6 py-3 rounded-lg border-2 font-black transition-all ${selectedSizes.includes(size) ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}>
                  {size}
                </button>
              ))}
            </div>

            {selectedSizes.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-end gap-4 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                   <div className="flex-1">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 italic tracking-widest">Carga rápida de Stock (Todos)</label>
                      <input type="number" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} placeholder="Ej: 50" className="w-full p-4 border-2 border-gray-300 rounded-lg font-bold outline-none focus:border-black transition-all" />
                   </div>
                   <button type="button" onClick={applyBulkStock} className="bg-[#111] text-white p-4 rounded-lg hover:bg-[#c6a35a] hover:text-black transition-colors">
                      <CheckCircle2 size={32} />
                   </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {selectedSizes.map(size => (
                    <div key={size} className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm text-center">
                       <label className="block text-xs font-black uppercase mb-2 text-gray-400 italic">Talle {size}</label>
                       <input type="number" name={`stock_${size.toLowerCase()}`} value={formData[`stock_${size.toLowerCase()}`]} onChange={handleChange} className="w-full p-3 border-2 border-gray-300 rounded-lg text-center font-mono font-black text-xl focus:border-black outline-none transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* SEO SECTION */}
          <section className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <h2 className="font-black uppercase text-sm mb-6 text-[#c6a35a] tracking-widest flex items-center gap-2"><Globe size={20}/> SEO Avanzado</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 font-bold tracking-widest">Meta Title (Google)</label>
                <input name="seo_title" onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-black outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 font-bold tracking-widest">Meta Description</label>
                <textarea name="seo_description" rows="3" onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg text-base focus:border-black outline-none transition-all" />
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <h2 className="font-black uppercase text-sm mb-6 text-gray-400 tracking-widest flex items-center justify-between font-bold">Galería Fotos <span className="bg-black text-white px-2 py-1 rounded text-[10px]">{previews.length}</span></h2>
            <div className="grid grid-cols-2 gap-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg border-2 border-gray-200 overflow-hidden group">
                  <img src={src} className="w-full h-full object-contain p-1" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X size={14}/></button>
                </div>
              ))}
              <label className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-black transition-all">
                <Upload className="text-gray-300 mb-2" size={32} />
                <span className="text-[10px] font-black uppercase text-gray-400">Subir</span>
                <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*,.heic" />
              </label>
            </div>
            {converting && <p className="text-xs text-blue-600 font-bold mt-4 animate-pulse uppercase text-center italic tracking-widest">Optimizando HEIC...</p>}
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-300 bg-[#fafafa]">
            <h2 className="font-black uppercase text-sm mb-6 text-gray-400 tracking-widest text-center font-bold">Precios</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 font-bold tracking-widest">Precio Venta</label>
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-2xl text-gray-400">$</span>
                <input type="number" name="price" onChange={handleChange} className="w-full p-5 pl-10 border-2 border-black rounded-xl font-black text-3xl focus:shadow-xl outline-none" placeholder="0" required /></div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 italic font-bold tracking-widest text-gray-400">Precio Tachado</label>
                <div className="relative opacity-60"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl text-gray-400">$</span>
                <input type="number" name="compare_at_price" onChange={handleChange} className="w-full p-4 pl-10 border-2 border-gray-400 rounded-lg font-bold text-xl line-through outline-none" placeholder="0" /></div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <h2 className="font-black uppercase text-sm mb-6 text-gray-400 tracking-widest font-bold">Logística</h2>
            <div className="grid grid-cols-2 gap-4">
              {['weight', 'length', 'width', 'height'].map(dim => (
                <div key={dim}><label className="block text-[10px] font-black uppercase mb-1 text-gray-400">{dim}</label>
                <input type="number" step="0.1" name={dim} value={formData[dim]} onChange={handleChange} className="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-black outline-none" /></div>
              ))}
            </div>
          </section>

          <button type="submit" disabled={loading || converting} className="w-full bg-[#111] text-white py-6 rounded-xl font-black uppercase tracking-[0.3em] hover:bg-[#c6a35a] hover:text-black transition-all shadow-2xl flex items-center justify-center gap-3 text-xl">
            {loading ? <Loader2 className="animate-spin" size={28} /> : 'Finalizar y Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}