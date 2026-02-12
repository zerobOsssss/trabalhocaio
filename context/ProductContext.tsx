import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, updatedData: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  decrementStock: (id: number, quantity: number) => void;
  reorderProducts: (newOrder: Product[]) => void;
  resetStock: () => void; // Apenas para debug/reset
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Carregar produtos do localStorage ou usar os iniciais
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('taos_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        // Validação básica para garantir que é um array
        if (Array.isArray(parsed)) {
            setProducts(parsed);
        } else {
            setProducts(INITIAL_PRODUCTS);
        }
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (e) {
      console.error("Erro ao carregar produtos:", e);
      setProducts(INITIAL_PRODUCTS);
    }
  }, []);

  // Salvar no localStorage sempre que houver mudança
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('taos_products', JSON.stringify(products));
    }
  }, [products]);

  const addProduct = (newProductData: Omit<Product, 'id'>) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id), 0) + 1 : 1;
    const newProduct = { ...newProductData, id: newId };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: number, updatedData: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const decrementStock = (id: number, quantity: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, stock: Math.max(0, p.stock - quantity) };
      }
      return p;
    }));
  };

  const reorderProducts = (newOrder: Product[]) => {
    setProducts(newOrder);
  };

  const resetStock = () => {
    setProducts(INITIAL_PRODUCTS);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, decrementStock, reorderProducts, resetStock }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};