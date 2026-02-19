'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';

export default function ActualizarPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Esta función actualiza la clave del usuario LOGUEADO (el link del mail ya te logueó)
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) throw error;

      setMessage('Contraseña actualizada. Redirigiendo...');
      setTimeout(() => {
        router.push('/admin');
      }, 2000);

    } catch (error) {
      alert('Error al actualizar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (message) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="inline-flex text-green-500 mb-4"><CheckCircle2 size={64}/></div>
                <h2 className="text-2xl font-bold text-gray-900">¡Todo listo!</h2>
                <p className="text-gray-500">Tu contraseña fue cambiada.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-900 text-white mb-4">
                <Lock size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Nueva Contraseña</h1>
            <p className="text-sm text-gray-500">Ingresá tu nueva clave segura</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
            <div>
                <input 
                    type="password" 
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:border-gray-900"
                    placeholder="Escribí la nueva contraseña..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-black transition-all flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Guardar y Entrar'}
            </button>
        </form>
      </div>
    </div>
  );
}