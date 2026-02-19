'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-sans text-gray-900">
      
      <div className="w-full max-w-sm">
        
        {/* CABECERA SOBRIA */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-900 text-white mb-4 shadow-lg">
                <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panel de Control</h1>
            <p className="text-sm text-gray-500 mt-1">Ingresá tus credenciales de administrador</p>
        </div>

        {/* TARJETA DE LOGIN TIPO SISTEMA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <form onSubmit={handleLogin} className="p-8 space-y-5">
                
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-md border border-red-100 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                        {error}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider">Email</label>
                    <div className="relative">
                        <input 
                            type="email" 
                            required
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400"
                            placeholder="nombre@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider">Contraseña</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            required
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {/* ENLACE DE RECUPERACIÓN */}
                <div className="flex justify-end">
                    <Link href="/login/recuperar" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Iniciar Sesión'}
                </button>

            </form>
            
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">Sistema seguro v1.0 • Esencia Retro Admin</p>
            </div>
        </div>
      </div>
    </div>
  );
}