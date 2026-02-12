import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { nombre, categoria, tipo } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY; // O GOOGLE_API_KEY

    if (!apiKey) return NextResponse.json({ error: "Falta API KEY" }, { status: 500 });

    let prompt = "";
    
    // CONFIGURACIÓN PARA QUE SEA CORTO
    if (tipo === 'description') {
      prompt = `Sos un experto en marketing de fútbol retro. 
      Escribí una descripción MUY BREVE (máximo 3 oraciones o 40 palabras) para la camiseta "${nombre}" (${categoria}).
      Enfocate solo en la mística o el jugador.
      NO hables de la tela ni calidad, solo de la emoción.`;
    
    } else if (tipo === 'tags') {
      prompt = `Generá 10 etiquetas separadas por comas para: "${nombre}". Solo las palabras.`;
    } else if (tipo === 'seo_title') {
      prompt = `Título SEO de 60 caracteres para "${nombre}". Solo el texto.`;
    } else if (tipo === 'seo_description') {
      prompt = `Meta-descripción SEO de 150 caracteres para "${nombre}". Solo el texto.`;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      })
    });

    const data = await res.json();

    if (data.error) {
      console.error("ERROR DE GOOGLE:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    if (data.candidates && data.candidates.length > 0) {
        let text = data.candidates[0].content.parts[0].text.trim();
        
        // ACÁ OCURRE LA MAGIA: Si es descripción, le pegamos el texto fijo nosotros
        if (tipo === 'description') {
            const textoFijo = "\n\nCamiseta confeccionada en tela premium W15, diseñada para ofrecerte comodidad, resistencia y estilo en cada uso. Esta prenda exclusiva combina calidad y detalles que marcan la diferencia.";
            text = text + textoFijo;
        }

        return NextResponse.json({ resultado: text });
    } else {
        return NextResponse.json({ error: "Google no devolvió texto" }, { status: 500 });
    }

  } catch (error) {
    console.error("ERROR EN LA API:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}