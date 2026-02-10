export default function DevolucionPage() {
  return (
    <div className="min-h-screen bg-[#efe3cf] text-[#0f0f10] pt-32 px-4 pb-20 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black uppercase mb-8 text-center">Política de <span className="text-[#c6a35a]">Cambios</span></h1>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-[#0f0f10]/10 space-y-6">
          <div>
            <h3 className="font-black uppercase text-lg mb-2">1. Plazos</h3>
            <p className="text-[#6f6f73]">Tenés hasta 30 días corridos desde que recibís el producto para realizar el cambio.</p>
          </div>
          <div>
            <h3 className="font-black uppercase text-lg mb-2">2. Condiciones</h3>
            <p className="text-[#6f6f73]">La prenda debe estar sin uso, con etiqueta puesta y en su bolsa original. No aceptamos prendas lavadas.</p>
          </div>
          <div>
            <h3 className="font-black uppercase text-lg mb-2">3. Costos</h3>
            <p className="text-[#6f6f73]">Si el cambio es por falla nuestra, el envío corre por nuestra cuenta. Si es por talle o modelo, el envío corre por cuenta del comprador.</p>
          </div>
        </div>
      </div>
    </div>
  );
}