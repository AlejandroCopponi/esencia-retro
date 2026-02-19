'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Al entrar a la página, buscamos en la memoria del celular (LocalStorage)
  useEffect(() => {
    setIsMounted(true);
    const savedFavorites = localStorage.getItem('esencia-favoritos');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Error leyendo favoritos", error);
      }
    }
  }, []);

  // 2. Cada vez que agregás/sacás un favorito, actualizamos la memoria del celular
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('esencia-favoritos', JSON.stringify(favorites));
    }
  }, [favorites, isMounted]);

  // 3. Función para agregar o quitar (el botón del corazón)
  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        // Si ya estaba, lo saca
        return prev.filter((item) => item.id !== product.id);
      } else {
        // Si no estaba, guarda los datos básicos para mostrarlo en una lista después
        return [...prev, {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url
        }];
      }
    });
  };

  // 4. Función para saber si un producto ya es favorito (para pintar el corazón de rojo)
  const isFavorite = (id) => {
    return favorites.some((item) => item.id === id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, isMounted }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook para usarlo fácilmente en cualquier lado
export const useFavorites = () => useContext(FavoritesContext);