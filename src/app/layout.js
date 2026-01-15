import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Asegurate que esta ruta esté bien
import { CartProvider } from "@/context/CartContext"; // Importamos la bolsa

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Esencia Retro",
  description: "Camisetas de fútbol históricas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>
            {/* Navbar aparece en todas las páginas */}
            <Navbar /> 
            {children}
        </CartProvider>
      </body>
    </html>
  );
}