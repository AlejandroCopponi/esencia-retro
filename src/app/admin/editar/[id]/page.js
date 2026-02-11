'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Upload, X, Globe, Package, Tag, CheckCircle2 } from 'lucide-react';

export default function EditarProducto() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);

  // ESTADOS PARA IMÁGENES
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);

  // ESTADOS PARA VARIANTES
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
    old_price: '',
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
    image_url: ''
  });

  // CARGA DE DATOS EXISTENTES
  useEffect(() => {
    async function fetchProductData() {
      // 1. Traer datos del producto
      const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
      
      if (product) {
        setFormData({
          ...product,
          compare_at_price: product.old_price || '', // Mapeo para el form
        });
        setExistingGallery(product.images_gallery || []);
        setPreviews(product.images_gallery || []);
      }

      // 2. Traer variantes de stock
      const { data: variants } = await supabase.from('product_variants').select('*').eq('product_id', id);
      
      if (variants) {
        const sizesLoaded = variants.map(v => v.size);
        setSelectedSizes(sizesLoaded);
        
        const stockUpdates = {};
        variants.forEach(v => {
          stockUpdates[`stock_${v.size.toLowerCase()}`] = v.stock;
        });
        setFormData(prev => ({ ...prev, ...stockUpdates }));
      }

      setLoading(false);
    }
    fetchProductData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // GESTIÓN DE STOCK
  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(prev => prev.filter(s => s !== size));
    } else {
      setSelectedSizes(prev => [...prev, size]);
    }
  };

  const applyBulkStock = () => {
    const updates = {};
    selectedSizes.forEach(size => {
      updates[`stock_${size.toLowerCase()}`] = Number(bulkStock);
    });
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // GESTIÓN DE IMÁGENES (HEIC + MULTI)
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
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
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Subir nuevas imágenes si hay
      let finalGallery = [...existingGallery];
      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${file.name}`;
        await supabase.storage.from('camisetas').upload(fileName, file);
        const { data } = supabase.storage.from('camisetas').getPublicUrl(fileName);
        finalGallery.push(data.publicUrl);
      }

      // 2. Update Producto
      const { error: prodError } = await supabase.from('products').update({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        old_price: Number(formData.compare_at_price),
        sku: formData.sku,
        tags: formData.tags,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        image_url: finalGallery[0] || formData.image_url,
        images_gallery: finalGallery,
        category: formData.category,
        weight: Number(formData.weight),
        width: Number(formData.width),
        height: Number(formData.height),
        depth: Number(formData.length)
      }).eq('id', id);

      if (prodError) throw prodError;

      // 3. Update Variantes (Borramos y re-insertamos para simplificar)
      await supabase.from('product_variants').delete().eq('product_id', id);
      const variantsToInsert = selectedSizes.map(size => ({
        product_id: id,
        size: size,
        stock: parseInt(formData[`stock_${size.toLowerCase()}`]) || 0
      }));
      await supabase.from('product_variants').insert(variantsToInsert);

      router.push('/admin/productos');
    } catch (error) {
      alert(error.message);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-gray-400">CARGANDO PRODUCTO...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-32 px-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <Link href="/admin/productos" className="p-2 hover:bg-gray-200 rounded-full transition-colors w-fit"><ArrowLeft size={28}/></Link>
        <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">Editar: {formData.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        
        <div className="lg:col-span-2 space-y-8">
          {/* INFORMACIÓN PRINCIPAL */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <h2 className="font-black uppercase text-sm mb-6 text-[#c6a35a] tracking-widest flex items-center gap-2">
              <Package size={20}/> Datos del Producto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Nombre</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg font-bold text-xl outline-none focus:border-black" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest text-gray-400">Categoría</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg font-bold bg-white focus:border-black outline-none transition-all text-lg">
                  <option value="nacional">Clubes Nacionales</option>
                  <option value="internacional">Clubes Internacionales</option>
                  <option value="selecciones">Selecciones</option>
                  <option value="retro">Leyendas / Retro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">SKU</label>
                <input name="sku" value={formData.sku || ''} onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg font-mono outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Tags</label>
                <input name="tags" value={formData.tags || ''} onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg outline-none focus:border-black" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Descripción</label>
                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="5" className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg outline-none focus:border-black" />
              </div>
            </div>
          </section>

          {/* VARIANTES Y STOCK */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="font-black uppercase text-sm text-[#c6a35a] tracking-widest">Gestión de Inventario</h2>
              <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                <button type="button" onClick={() => setActiveTab('adultos')} className={`flex-1 px-4 py-2 rounded-md font-black text-[10px] uppercase transition-all ${activeTab === 'adultos' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Adultos</button>
                <button type="button" onClick={() => setActiveTab('ninos')} className={`flex-1 px-4 py-2 rounded-md font-black text-[10px] uppercase transition-all ${activeTab === 'ninos' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Niños</button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 mb-8">
              {SIZES[activeTab].map(size => (
                <button key={size} type="button" onClick={() => toggleSize(size)} className={`py-3 sm:px-6 rounded-lg border-2 font-black transition-all ${selectedSizes.includes(size) ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400'}`}>
                  {size}
                </button>
              ))}
            </div>

            {selectedSizes.length > 0 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                   <div className="w-full">
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest italic">Carga Rápida (Sincronizar todos)</label>
                      <input type="number" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} placeholder="Ej: 10" className="w-full p-4 border-2 border-gray-300 rounded-lg font-bold outline-none focus:border-black" />
                   </div>
                   <button type="button" onClick={applyBulkStock} className="w-full sm:w-auto bg-[#111] text-white p-4 rounded-lg hover:bg-[#c6a35a] hover:text-black transition-colors flex justify-center">
                      <CheckCircle2 size={32} />
                   </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedSizes.map(size => (
                    <div key={size} className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm text-center">
                       <label className="block text-[10px] font-black uppercase mb-1 text-gray-400 italic">Stock {size}</label>
                       <input type="number" name={`stock_${size.toLowerCase()}`} value={formData[`stock_${size.toLowerCase()}`] || 0} onChange={handleChange} className="w-full p-2 border-2 border-gray-200 rounded text-center font-mono font-black text-lg focus:border-black outline-none" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* SEO */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <h2 className="font-black uppercase text-sm mb-6 text-[#c6a35a] tracking-widest flex items-center gap-2"><Globe size={20}/> SEO</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 font-bold tracking-widest">Meta Title</label>
                <input name="seo_title" value={formData.seo_title || ''} onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-lg outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 font-bold tracking-widest">Meta Description</label>
                <textarea name="seo_description" value={formData.seo_description || ''} onChange={handleChange} rows="3" className="w-full p-4 border-2 border-gray-300 rounded-lg outline-none focus:border-black" />
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA LATERAL */}
        <div className="space-y-8">
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <h2 className="font-black uppercase text-sm mb-6 text-gray-400 tracking-widest flex items-center justify-between font-bold">Galería <span className="bg-black text-white px-2 py-1 rounded text-[10px]">{previews.length}</span></h2>
            <div className="grid grid-cols-2 gap-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg border-2 border-gray-100 overflow-hidden group shadow-sm">
                  <img src={src} className="w-full h-full object-contain p-1" alt="Galería" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                </div>
              ))}
              <label className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-black transition-all">
                <Upload className="text-gray-300 mb-2" size={32} />
                <span className="text-[10px] font-black uppercase text-gray-400">Subir</span>
                <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*,.heic" />
              </label>
            </div>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border-2 border-gray-300 bg-gray-50">
            <h2 className="font-black uppercase text-sm mb-6 text-gray-400 tracking-widest text-center font-bold italic underline underline-offset-8">Precios</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 font-bold tracking-widest">Venta</label>
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-2xl text-gray-400">$</span>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-5 pl-10 border-2 border-black rounded-xl font-black text-3xl outline-none" required /></div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 italic font-bold tracking-widest text-gray-400">Tachado (Lista)</label>
                <div className="relative opacity-60"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl text-gray-400">$</span>
                <input type="number" name="compare_at_price" value={formData.compare_at_price || ''} onChange={handleChange} className="w-full p-4 pl-10 border-2 border-gray-400 rounded-lg font-bold text-xl line-through outline-none" /></div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border-2 border-gray-300">
            <h2 className="font-black uppercase text-sm mb-6 text-gray-400 tracking-widest font-bold">Logística</h2>
            <div className="grid grid-cols-2 gap-4">
              {['weight', 'length', 'width', 'height'].map(dim => (
                <div key={dim}>
                  <label className="block text-[10px] font-black uppercase mb-1 text-gray-400 tracking-tighter">{dim === 'weight' ? 'Peso (kg)' : dim}</label>
                  <input type="number" step="0.1" name={dim} value={formData[dim] || ''} onChange={handleChange} className="w-full p-3 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-black outline-none shadow-inner" />
                </div>
              ))}
            </div>
          </section>

          <button type="submit" disabled={saving || converting} className="w-full bg-[#111] text-white py-6 rounded-xl font-black uppercase tracking-[0.3em] hover:bg-[#c6a35a] hover:text-black transition-all shadow-2xl flex items-center justify-center gap-3 text-lg md:text-xl active:scale-95">
            {saving ? <Loader2 className="animate-spin" size={28} /> : 'Actualizar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}