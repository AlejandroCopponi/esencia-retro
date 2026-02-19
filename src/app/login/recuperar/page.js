'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Envía el mail de recuperación
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
   // Le decimos: "Andá al traductor (callback) y decile que después vaya a actualizar-password"
   redirectTo: `${window.location.origin}/auth/callback?next=/admin/actualizar-password`,
});

      if (error) throw error;

      setMessage('¡Listo! Revisá tu correo (y spam) para restablecer la clave.');
    } catch (err) {
      setError('Hubo un error o el email no existe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-sans text-gray-900">
      <div className="w-full max-w-sm">
        
        {/* CABECERA */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-900 text-white mb-4 shadow-lg">
                <KeyRound size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Recuperar Acceso</h1>
            <p className="text-sm text-gray-500 mt-1">Te enviaremos un enlace seguro</p>
        </div>

        {/* TARJETA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
                
                {message ? (
                    <div className="text-center py-4">
                        <div className="inline-flex text-green-500 mb-3"><CheckCircle2 size={48}/></div>
                        <h3 className="font-bold text-lg mb-2">Correo enviado</h3>
                        <p className="text-sm text-gray-500 mb-6">{message}</p>
                        <Link href="/login" className="block w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-black transition-all text-sm">
                            Volver al Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-md border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider">Email registrado</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    required
                                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="nombre@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Enviar Enlace'}
                        </button>

                        <div className="text-center pt-2">
                            <Link href="/login" className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center justify-center gap-1 transition-colors">
                                <ArrowLeft size={14} /> Volver
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}