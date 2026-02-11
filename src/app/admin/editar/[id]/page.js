'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function EditarProducto() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) setFormData(data);
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('products').update(formData).eq('id', id);
    if (!error) router.push('/admin/productos');
    setSaving(false);
  }

  if (loading || !formData) return <div className="p-20 text-center font-bold uppercase tracking-widest animate-pulse text-gray-400">Cargando producto...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft /></Link>
        <h1 className="text-3xl font-black uppercase italic">Editar: {formData.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-black uppercase text-xs mb-6 text-[#c6a35a] tracking-widest">Información Base</h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Nombre</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full p-4 bg-gray-50 border rounded-lg font-bold focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Descripción</label>
                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="4" className="w-full p-4 bg-gray-50 border rounded-lg text-sm focus:bg-white transition-colors" />
              </div>
            </div>
          </section>

          {/* Aquí iría el bloque de talles igual al de crear */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-black uppercase text-xs mb-6 text-[#c6a35a] tracking-widest">Stock Disponible</h2>
            <div className="grid grid-cols-5 gap-4 italic">
              {['s', 'm', 'l', 'xl', 'xxl'].map(t => (
                <div key={t}>
                  <label className="block text-[10px] font-black uppercase mb-1 text-center">{t}</label>
                  <input type="number" name={`stock_${t}`} value={formData[`stock_${t}`] || 0} onChange={handleChange} className="w-full p-2 border text-center font-mono rounded" />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <img src={formData.image_url} className="w-full h-48 object-contain mb-4 bg-gray-50 rounded" alt="Preview" />
             <label className="block text-[10px] font-black uppercase mb-1">URL de Imagen</label>
             <input name="image_url" value={formData.image_url} onChange={handleChange} className="w-full p-2 text-xs border rounded" />
          </section>

          <button type="submit" disabled={saving} className="w-full bg-[#111] text-white py-5 rounded-xl font-black uppercase tracking-widest hover:bg-[#c6a35a] hover:text-black transition-all shadow-xl">
             {saving ? 'Guardando...' : 'Actualizar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}