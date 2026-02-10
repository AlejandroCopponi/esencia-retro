import { Star } from 'lucide-react';
export default function CalidadPage() {
  return (
    <div className="min-h-screen bg-[#efe3cf] text-[#0f0f10] pt-32 px-4 pb-20 font-sans">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase mb-6">Calidad <span className="text-[#c6a35a]">Premium</span></h1>
        <p className="text-lg font-medium max-w-xl mx-auto mb-10 text-[#6f6f73]">No vendemos disfraces. Vendemos réplicas exactas que respetan la historia.</p>
        
        <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-white p-6 rounded-xl border border-[#c6a35a]">
                <Star className="text-[#c6a35a] mb-4" size={32} />
                <h3 className="font-black uppercase text-lg mb-2">Tela de Época</h3>
                <p className="text-sm">Si la camiseta original era de piqué, la nuestra es de piqué. Respetamos los gramajes y texturas de los 80s y 90s.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#c6a35a]">
                <Star className="text-[#c6a35a] mb-4" size={32} />
                <h3 className="font-black uppercase text-lg mb-2">Escudos Bordados</h3>
                <p className="text-sm">Nada de estampados baratos que se salen. Bordados de alta densidad y etiquetas cosidas.</p>
            </div>
        </div>
      </div>
    </div>
  );
}