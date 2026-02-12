import React from 'react';
import { X, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartSidebar: React.FC = () => {
  const { cart, removeFromCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-[60]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsCartOpen(false)} />
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900 font-serif">Seu Carrinho</h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      type="button"
                      className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                      onClick={() => setIsCartOpen(false)}
                    >
                      <span className="sr-only">Fechar painel</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flow-root">
                    {cart.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Seu carrinho está vazio.</p>
                        <button 
                          onClick={() => setIsCartOpen(false)}
                          className="text-brand-gold font-medium hover:underline"
                        >
                          Continuar comprando
                        </button>
                      </div>
                    ) : (
                      <ul role="list" className="-my-6 divide-y divide-gray-200">
                        {cart.map((item) => (
                          <li key={`${item.id}-${item.selectedSize}`} className="py-6 flex">
                            <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-center object-cover"
                              />
                            </div>

                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{item.name}</h3>
                                  {/* Fixed: changed 'class' to 'className' to comply with React standards */}
                                  <p className="ml-4">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">Tamanho: {item.selectedSize}</p>
                              </div>
                              <div className="flex-1 flex items-end justify-between text-sm">
                                <p className="text-gray-500">Qtd {item.quantity}</p>

                                <div className="flex">
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                                    className="font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
                                  >
                                    <Trash2 size={16} /> Remova
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                    <p>Subtotal</p>
                    <p>R$ {cartTotal.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 mb-6">Frete calculado no checkout.</p>
                  <div className="mt-6">
                    <Link
                      to="/checkout"
                      onClick={() => setIsCartOpen(false)}
                      className="flex justify-center items-center px-6 py-3 border border-transparent rounded-sm shadow-sm text-base font-medium text-white bg-brand-dark hover:bg-gray-800 w-full"
                    >
                      Finalizar Compra <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;