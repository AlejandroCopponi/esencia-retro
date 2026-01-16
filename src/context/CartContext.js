'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Inicializamos el carrito buscando en localStorage si existe (para no perderlo al F5)
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // 1. CARGAR CARRITO GUARDADO AL INICIAR
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('retroCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error cargando carrito:", error);
    }
  }, []);

  // 2. CADA VEZ QUE CAMBIA EL CARRITO, GUARDAMOS Y RECALCULAMOS TOTAL
  useEffect(() => {
    // Guardar en navegador
    localStorage.setItem('retroCart', JSON.stringify(cart));

    // Calcular Total (Asegurando que sean números)
    const total = cart.reduce((acc, item) => {
      const price = Number(item.price) || 0; // Convertimos a numero por seguridad
      const quantity = Number(item.quantity) || 1;
      return acc + (price * quantity);
    }, 0);
    
    setTotalPrice(total);
  }, [cart]);

  // AGREGAR AL CARRITO
  const addToCart = (product) => {
    setCart((prev) => {
      // Si ya existe, sumamos cantidad
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Si es nuevo, lo agregamos con precio numérico asegurado
      return [...prev, { ...product, quantity: 1, price: Number(product.price) }];
    });
  };

  // SACAR DEL CARRITO
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // LIMPIAR CARRITO
  const clearCart = () => {
    setCart([]);
    setTotalPrice(0);
    localStorage.removeItem('retroCart');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);