'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Cargar carrito guardado en el navegador (si existe) al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('esencia-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Guardar en el navegador cada vez que cambia el carrito
  useEffect(() => {
    localStorage.setItem('esencia-cart', JSON.stringify(cart));
  }, [cart]);

  // Función: Agregar producto
  const addToCart = (product, size, quantity) => {
    // Chequear si ya existe ese producto con ese talle
    const existingItem = cart.find((item) => item.id === product.id && item.size === size);

    if (existingItem) {
      // Si ya está, solo sumamos la cantidad
      setCart(cart.map((item) => 
        item.id === product.id && item.size === size 
        ? { ...item, quantity: item.quantity + quantity }
        : item
      ));
    } else {
      // Si no está, lo agregamos nuevo
      setCart([...cart, { ...product, size, quantity }]);
    }
    alert("¡Agregado al carrito!");
  };

  // Función: Eliminar producto
  const removeFromCart = (id, size) => {
    setCart(cart.filter((item) => !(item.id === id && item.size === size)));
  };

  // Calcular total
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook para usar el carrito fácil
export const useCart = () => useContext(CartContext);