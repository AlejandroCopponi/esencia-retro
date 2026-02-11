import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { nombre, categoria, tipo } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Falta API KEY" }, { status: 500 });

    let prompt = "";
    if (tipo === 'description') {
      prompt = `Sos un experto en marketing de indumentaria retro. Escribí una descripción persuasiva de 3 párrafos para una camiseta llamada "${nombre}" de la categoría "${categoria}". Resaltá la nostalgia y la calidad. Sin negritas ni asteriscos.`;
    } else if (tipo === 'tags') {
      prompt = `Generá 10 etiquetas separadas por comas para: "${nombre}". Solo las palabras.`;
    } else if (tipo === 'seo_title') {
      prompt = `Título SEO de 60 caracteres para "${nombre}". Solo el texto.`;
    } else if (tipo === 'seo_description') {
      prompt = `Meta-descripción SEO de 150 caracteres para "${nombre}". Solo el texto.`;
    }

    // USAMOS EL MODELO QUE TE SALIÓ EN LA LISTA: gemini-2.5-flash
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

    const text = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ resultado: text.trim() });

  } catch (error) {
    console.error("ERROR EN LA API:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}