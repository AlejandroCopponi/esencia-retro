export default function GuiaTallesPage() {
  return (
    <div className="min-h-screen bg-[#efe3cf] text-[#0f0f10] pt-32 px-4 pb-20 font-sans">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase mb-8">Guía de <span className="text-[#c6a35a]">Talles</span></h1>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-[#0f0f10]/10">
          <p className="mb-6 font-medium">Nuestras camisetas son fieles a las medidas de la época (Retro Fit). Recomendamos comprar tu talle habitual.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#0f0f10] text-white uppercase text-xs">
                    <tr><th className="p-3">Talle</th><th className="p-3">Axila a Axila (A)</th><th className="p-3">Largo (B)</th></tr>
                </thead>
                <tbody className="font-bold text-gray-700 divide-y divide-gray-200">
                    <tr><td className="p-3">S</td><td className="p-3">50 cm</td><td className="p-3">70 cm</td></tr>
                    <tr><td className="p-3">M</td><td className="p-3">52 cm</td><td className="p-3">72 cm</td></tr>
                    <tr><td className="p-3">L</td><td className="p-3">54 cm</td><td className="p-3">74 cm</td></tr>
                    <tr><td className="p-3">XL</td><td className="p-3">56 cm</td><td className="p-3">76 cm</td></tr>
                    <tr><td className="p-3">XXL</td><td className="p-3">59 cm</td><td className="p-3">79 cm</td></tr>
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}