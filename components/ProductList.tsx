import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import ProductModal from './ProductModal';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ProductList: React.FC = () => {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Estado local para simular wishlist (em um app real, iria para o context)
  const [wishlist, setWishlist] = useState<number[]>([]);
  const location = useLocation();

  // Verifica se existe um produto na URL para abrir automaticamente (Deep Linking)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('product');

    if (productId && products.length > 0) {
        const foundProduct = products.find(p => p.id === Number(productId));
        if (foundProduct) {
            setSelectedProduct(foundProduct);
        }
    }
  }, [location.search, products]);

  const toggleWishlist = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (wishlist.includes(id)) {
        setWishlist(prev => prev.filter(item => item !== id));
        addToast('Removido da lista de desejos', 'info');
    } else {
        setWishlist(prev => [...prev, id]);
        addToast('Adicionado à lista de desejos!', 'success');
    }
  };

  const quickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.sizes.length > 0) {
        // Se tiver tamanhos, abre o modal para escolher
        setSelectedProduct(product);
    } else {
        // Se for tamanho único
        addToCart(product, 'U');
        addToast(`${product.name} adicionado ao carrinho!`);
    }
  };

  return (
    <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
      <div className="text-center mb-16">
        <span className="text-brand-gold font-bold tracking-widest text-xs uppercase block mb-2">Shop Online</span>
        <h2 className="text-4xl font-serif font-bold text-brand-dark mb-4">Nossa Coleção</h2>
        <div className="w-24 h-1 bg-brand-gold mx-auto rounded-full"></div>
        <p className="mt-4 text-gray-500 max-w-2xl mx-auto">Peças selecionadas com rigoroso padrão de qualidade para realçar o seu estilo único.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
        {products.map((product) => {
           const isNew = product.id > 100; // Logica simples para "Novo"
           const isLastUnits = product.stock > 0 && product.stock < 5;
           const isSoldOut = product.stock === 0;

           return (
            <div key={product.id} className="group relative flex flex-col">
                <div 
                className="aspect-[3/4] w-full overflow-hidden rounded-sm bg-gray-200 cursor-pointer relative shadow-sm group-hover:shadow-md transition-all duration-300"
                onClick={() => setSelectedProduct(product)}
                >
                <img
                    src={product.image}
                    alt={product.name}
                    className={`h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110 ${isSoldOut ? 'grayscale opacity-80' : ''}`}
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isSoldOut && <span className="bg-stone-800 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Esgotado</span>}
                    {!isSoldOut && isNew && <span className="bg-white/90 backdrop-blur text-brand-dark px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm">Novo</span>}
                    {!isSoldOut && isLastUnits && <span className="bg-red-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Últimas Peças</span>}
                </div>

                {/* Wishlist Button */}
                <button 
                    onClick={(e) => toggleWishlist(e, product.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition-colors shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300 z-10"
                >
                    <Heart size={18} fill={wishlist.includes(product.id) ? "currentColor" : "none"} className={wishlist.includes(product.id) ? "text-red-500" : ""} />
                </button>

                {/* Overlay Action Buttons (Desktop) */}
                {!isSoldOut && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
                        <button 
                            onClick={(e) => quickAdd(e, product)}
                            className="flex-1 bg-brand-dark text-white py-3 text-sm font-bold uppercase tracking-wide hover:bg-black transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={16} /> Comprar
                        </button>
                    </div>
                )}
                </div>

                <div className="mt-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</p>
                            <h3 className="text-base font-medium text-gray-900 leading-tight group-hover:text-brand-gold transition-colors cursor-pointer" onClick={() => setSelectedProduct(product)}>
                                {product.name}
                            </h3>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-lg font-bold text-gray-900">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                        </p>
                        {/* Mobile Action Icon */}
                        <button 
                             onClick={() => setSelectedProduct(product)}
                             className="lg:hidden text-gray-400 hover:text-brand-gold"
                        >
                            <Eye size={20} />
                        </button>
                    </div>
                </div>
            </div>
        )})}
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          isOpen={!!selectedProduct} 
          onClose={() => {
              setSelectedProduct(null);
              // Opcional: Limpar a URL ao fechar o modal para evitar reabertura no refresh
              // window.history.replaceState(null, '', window.location.pathname);
          }} 
        />
      )}
    </section>
  );
};

export default ProductList;