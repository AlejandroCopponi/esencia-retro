'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. CARGA INICIAL
  useEffect(() => {
    const savedCart = localStorage.getItem('esencia_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setCart([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // 2. GUARDADO
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('esencia_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // --- FUNCIONES ---

  // Agregar (Desde la ficha de producto)
  const addToCart = (product, amount = 1) => {
    setCart((prevCart) => {
      const quantityToAdd = Number(amount);
      const { quantity, ...productClean } = product; // Limpiamos

      const existingIndex = prevCart.findIndex(
        (item) => item.id === productClean.id && item.size === productClean.size
      );

      if (existingIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantityToAdd;
        return newCart;
      } else {
        return [...prevCart, { ...productClean, quantity: quantityToAdd }];
      }
    });
  };

  // Remover Item
  const removeFromCart = (id, size) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  };

  // Restar 1 (Botón Menos)
  const decreaseQuantity = (id, size) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id && item.size === size) {
          return { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 };
        }
        return item;
      });
    });
  };

  // NUEVA: Sumar 1 (Botón Más) - Exclusiva para el carrito
  const increaseQuantity = (id, size) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id && item.size === size) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
    });
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, decreaseQuantity, increaseQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);