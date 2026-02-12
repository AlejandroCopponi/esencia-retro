'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Upload, ArrowLeft, Loader2, Globe, Package, X, CheckCircle2, Sparkles, Tag } from 'lucide-react';
import Link from 'next/link';

export default function CrearProducto() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [loadingIA, setLoadingIA] = useState(null);
  
  // --- NUEVO: ESTADO PARA CATEGORÍAS ---
  const [categories, setCategories] = useState([]);
  
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
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
    compare_at_price: '',
    category: '', // Ahora empieza vacío
    subcategory: '', // NUEVO CAMPO
    description: '',
    sku: '',
    tags: '',
    seo_title: '',
    seo_description: '',
    weight: '0.5',
    length: '30',
    width: '20',
    height: '5',
    stock_s: 0, stock_m: 0, stock_l: 0, stock_xl: 0, stock_xxl: 0, stock_xxxl: 0,
    stock_2: 0, stock_4: 0, stock_6: 0, stock_8: 0, stock_10: 0, stock_12: 0, stock_14: 0, stock_16: 0
  });

  // --- CARGAR CATEGORÍAS AL INICIO ---
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  // Helpers para obtener info de la categoría actual
  const activeCategory = categories.find(c => c.name === formData.category);
  const currentSubcategories = activeCategory ? activeCategory.subcategories : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia la categoría, reseteamos la subcategoría
    if (name === 'category') {
        setFormData(prev => ({ ...prev, category: value, subcategory: '' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const generarIA = async (campo) => {
    if (!formData.name) return alert("Ponele un nombre primero, Ale.");
    if (!formData.category) return alert("Seleccioná una categoría para que la IA sepa el contexto.");
    
    setLoadingIA(campo);

    try {
      // Buscamos el contexto de la categoría seleccionada
      const contextToSend = activeCategory ? activeCategory.ai_context : '';

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: formData.name, 
          categoria: formData.category,
          subcategoria: formData.subcategory, // Le mandamos la sub
          contexto: contextToSend, // LE MANDAMOS EL CONTEXTO DEFINIDO EN EL ADMIN
          tipo: campo 
        }),
      });

      const data = await res.json();

      if (data.resultado) {
        setFormData(prev => ({ ...prev, [campo]: data.resultado }));
      } else {
        alert("La IA tiró un error. Revisá la API KEY.");
      }
    } catch (error) {
      console.error("Error conectando con Gemini:", error);
      alert("Error de red.");
    } finally {
      setLoadingIA(null);
    }
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
        } catch (err) { console.error(err); }
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
    if (!formData.category) return alert("Por favor seleccioná una categoría.");
    
    setLoading(true);
    try {
      const uploadedUrls = [];
      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('camisetas').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('camisetas').getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }

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
          
          category: formData.category, // Guardamos categoría real
          subcategory: formData.subcategory, // Guardamos subcategoría nueva
          
          weight: Number(formData.weight),
          width: Number(formData.width),
          height: Number(formData.height),
          depth: Number(formData.length),
          created_at: new Date()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const variantsToInsert = selectedSizes.map(size => ({
        product_id: newProduct.id,
        size: size,
        stock: parseInt(formData[`stock_${size.toLowerCase()}`]) || 0
      }));

      if (variantsToInsert.length > 0) {
        await supabase.from('product_variants').insert(variantsToInsert);
      }

      router.push('/admin/productos');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto pb-32 px-4 md:px-6">
      <div className="flex items-center gap-4 mb-8 pt-4">
        <Link href="/admin/productos" className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={28}/></Link>
        <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-gray-900">Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          <section className="bg-white p-5 md:p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <h2 className="font-black uppercase text-sm mb-6 text-[#c6a35a] tracking-widest flex items-center gap-2">
              <Package size={20}/> Información Principal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Nombre del Producto</label>
                <input name="name" onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg font-bold focus:border-black outline-none transition-all text-xl" required placeholder="Ej: Camiseta Retro 1986" />
              </div>

              {/* --- SELECTOR DE CATEGORÍA DINÁMICO --- */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">Categoría</label>
                <select 
                    name="category" 
                    onChange={handleChange} 
                    value={formData.category} 
                    className="w-full p-4 border-2 border-gray-300 rounded-lg font-bold bg-white focus:border-black outline-none transition-all text-lg"
                >
                  <option value="">Seleccionar...</option>
                  {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* --- SELECTOR DE SUBCATEGORÍA --- */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest flex items-center gap-2">
                    Subcategoría <Tag size={12}/>
                </label>
                <select 
                    name="subcategory" 
                    onChange={handleChange} 
                    value={formData.subcategory} 
                    disabled={!currentSubcategories || currentSubcategories.length === 0}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg font-bold bg-white focus:border-black outline-none transition-all text-lg disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">{currentSubcategories && currentSubcategories.length > 0 ? 'Seleccionar...' : '---'}</option>
                  {currentSubcategories && currentSubcategories.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">SKU / Referencia</label>
                <input name="sku" onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg font-mono focus:border-black outline-none transition-all" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-black uppercase text-gray-500">Tags</label>
                    <button type="button" onClick={() => generarIA('tags')} className="text-[10px] bg-purple-600 text-white px-2 py-1 rounded font-black flex items-center gap-1 hover:bg-black transition-all">
                        {loadingIA === 'tags' ? <Loader2 className="animate-spin" size={10}/> : <Sparkles size={10}/>} IA
                    </button>
                </div>
                <input name="tags" value={formData.tags} onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-black outline-none transition-all" placeholder="retro, argentina, 86" />
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-black uppercase text-gray-500">Descripción Detallada</label>
                    <button type="button" onClick={() => generarIA('description')} className="text-[10px] bg-purple-600 text-white px-3 py-1 rounded font-black flex items-center gap-1 hover:bg-black transition-all shadow-sm">
                        {loadingIA === 'description' ? <Loader2 className="animate-spin" size={12}/> : <Sparkles size={12}/>} 
                        {formData.category ? `GENERAR DESCRIPCIÓN (${formData.category})` : 'GENERAR CON IA'}
                    </button>
                </div>
                <textarea name="description" value={formData.description} rows="5" onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg focus:border-black outline-none transition-all" placeholder={formData.category ? `La IA usará el estilo de "${formData.category}"...` : "Seleccioná una categoría primero..."} />
              </div>
            </div>
          </section>

          {/* VARIANTES Y STOCK */}
          <section className="bg-white p-5 md:p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="font-black uppercase text-sm text-[#c6a35a] tracking-widest">Inventario</h2>
              <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                <button type="button" onClick={() => setActiveTab('adultos')} className={`flex-1 sm:flex-none px-6 py-2 rounded-md font-black text-[10px] uppercase transition-all ${activeTab === 'adultos' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Adultos</button>
                <button type="button" onClick={() => setActiveTab('ninos')} className={`flex-1 sm:flex-none px-6 py-2 rounded-md font-black text-[10px] uppercase transition-all ${activeTab === 'ninos' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Niños</button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 md:gap-3 mb-8">
              {SIZES[activeTab].map(size => (
                <button key={size} type="button" onClick={() => toggleSize(size)} className={`py-3 sm:px-6 rounded-lg border-2 font-black text-sm transition-all ${selectedSizes.includes(size) ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}>
                  {size}
                </button>
              ))}
            </div>

            {selectedSizes.length > 0 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                   <div className="w-full">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 italic">Carga rápida Stock</label>
                      <input type="number" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} placeholder="0" className="w-full p-4 border-2 border-gray-300 rounded-lg font-bold outline-none focus:border-black transition-all text-lg" />
                   </div>
                   <button type="button" onClick={applyBulkStock} className="w-full sm:w-auto bg-[#111] text-white p-4 rounded-lg hover:bg-[#c6a35a] hover:text-black transition-colors flex justify-center">
                      <CheckCircle2 size={32} />
                   </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {selectedSizes.map(size => (
                    <div key={size} className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm text-center">
                       <label className="block text-[10px] font-black uppercase mb-2 text-gray-400 italic">Stock {size}</label>
                       <input type="number" name={`stock_${size.toLowerCase()}`} value={formData[`stock_${size.toLowerCase()}`]} onChange={handleChange} className="w-full p-3 border-2 border-gray-200 rounded-lg text-center font-mono font-black text-xl focus:border-black outline-none" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* SEO AVANZADO */}
          <section className="bg-white p-5 md:p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <h2 className="font-black uppercase text-sm mb-6 text-[#c6a35a] tracking-widest flex items-center gap-2"><Globe size={20}/> SEO Avanzado</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-black uppercase text-gray-500 font-bold">Meta Title</label>
                    <button type="button" onClick={() => generarIA('seo_title')} className="text-[10px] bg-purple-600 text-white px-2 py-1 rounded font-black flex items-center gap-1 hover:bg-black transition-all">
                        {loadingIA === 'seo_title' ? <Loader2 className="animate-spin" size={10}/> : <Sparkles size={10}/>} IA
                    </button>
                </div>
                <input name="seo_title" value={formData.seo_title} onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-black outline-none transition-all" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-black uppercase text-gray-500 font-bold tracking-widest">Meta Description</label>
                    <button type="button" onClick={() => generarIA('seo_description')} className="text-[10px] bg-purple-600 text-white px-2 py-1 rounded font-black flex items-center gap-1 hover:bg-black transition-all">
                        {loadingIA === 'seo_description' ? <Loader2 className="animate-spin" size={10}/> : <Sparkles size={10}/>} IA
                    </button>
                </div>
                <textarea name="seo_description" value={formData.seo_description} rows="3" onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg text-sm focus:border-black outline-none transition-all" />
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
          <section className="bg-white p-5 md:p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <h2 className="font-black uppercase text-sm mb-6 text-gray-400 tracking-widest flex items-center justify-between font-bold italic">Galería <span className="bg-black text-white px-2 py-1 rounded text-[10px]">{previews.length}</span></h2>
            <div className="grid grid-cols-2 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg border-2 border-gray-200 overflow-hidden group">
                  <img src={src} className="w-full h-full object-contain p-1" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={14}/></button>
                </div>
              ))}
              <label className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-black transition-all">
                <Upload className="text-gray-300 mb-2" size={32} />
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Subir</span>
                <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*,.heic" />
              </label>
            </div>
          </section>

          <section className="bg-white p-5 md:p-8 rounded-xl shadow-sm border-2 border-gray-300 bg-[#fafafa]">
            <h2 className="font-black uppercase text-sm mb-6 text-gray-400 tracking-widest text-center font-bold italic underline decoration-black decoration-2 underline-offset-8">Precios</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 font-bold tracking-widest">Precio Venta</label>
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-gray-400">$</span>
                <input type="number" name="price" onChange={handleChange} className="w-full p-4 pl-10 border-2 border-black rounded-xl font-black text-2xl focus:shadow-lg outline-none" placeholder="0" required /></div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 italic tracking-widest">Precio Lista</label>
                <div className="relative opacity-60"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg text-gray-400">$</span>
                <input type="number" name="compare_at_price" onChange={handleChange} className="w-full p-3 pl-10 border-2 border-gray-400 rounded-lg font-bold text-lg line-through outline-none" placeholder="0" /></div>
              </div>
            </div>
          </section>

          <section className="bg-white p-5 md:p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <h2 className="font-black uppercase text-sm mb-6 text-gray-400 tracking-widest font-bold">Logística</h2>
            <div className="grid grid-cols-2 gap-4">
              {['weight', 'length', 'width', 'height'].map(dim => (
                <div key={dim}><label className="block text-[10px] font-black uppercase mb-1 text-gray-400">{dim}</label>
                <input type="number" step="0.1" name={dim} value={formData[dim]} onChange={handleChange} className="w-full p-3 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-black outline-none" /></div>
              ))}
            </div>
          </section>

          <button type="submit" disabled={loading || converting} className="w-full bg-[#111] text-white py-6 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-[#c6a35a] hover:text-black transition-all shadow-2xl flex items-center justify-center gap-3 text-lg md:text-xl active:scale-95">
            {loading ? <Loader2 className="animate-spin" size={28} /> : 'Finalizar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}