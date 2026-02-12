
import React, { useState } from 'react';
import { X, ShoppingBag, AlertCircle, Ruler, Check } from 'lucide-react';
import { Product, SizeMeasurement } from '../types';
import { useCart } from '../context/CartContext';
import AIStylist from './AIStylist';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

// Medidas Padrão Brasileiras (ABNT NBR 13377 Aproximada)
const DEFAULT_BRAZILIAN_SIZES: SizeMeasurement[] = [
    { size: "PP (36)", bust: "80-84", waist: "62-66", hip: "90-94", length: "-" },
    { size: "P (38)", bust: "84-90", waist: "66-70", hip: "94-98", length: "-" },
    { size: "M (40/42)", bust: "90-98", waist: "70-80", hip: "98-106", length: "-" },
    { size: "G (44)", bust: "98-105", waist: "80-88", hip: "106-114", length: "-" },
    { size: "GG (46/48)", bust: "105-112", waist: "88-96", hip: "114-122", length: "-" },
];

const SizeGuideModal: React.FC<{ onClose: () => void; measurements?: SizeMeasurement[] }> = ({ onClose, measurements }) => {
  // Se o produto tiver medidas cadastradas, usa elas. Se não, usa o padrão.
  const displaySizes = (measurements && measurements.length > 0) ? measurements : DEFAULT_BRAZILIAN_SIZES;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-2 mb-2 text-brand-dark">
          <Ruler className="text-brand-gold" />
          <h3 className="text-xl font-serif font-bold">Guia de Medidas</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">Compare suas medidas corporais com a tabela abaixo para encontrar o caimento perfeito.</p>

        <div className="overflow-hidden rounded border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
            <thead className="bg-brand-gold/10">
              <tr>
                <th className="px-4 py-3 font-bold text-gray-700">Tamanho</th>
                <th className="px-4 py-3 font-medium text-gray-600">Busto</th>
                <th className="px-4 py-3 font-medium text-gray-600">Cintura</th>
                <th className="px-4 py-3 font-medium text-gray-600">Quadril</th>
                <th className="px-4 py-3 font-medium text-gray-600">Comp.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {displaySizes.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="font-bold px-4 py-3 text-brand-dark">{row.size}</td>
                      <td className="px-4 py-3 text-gray-600">{row.bust} cm</td>
                      <td className="px-4 py-3 text-gray-600">{row.waist} cm</td>
                      <td className="px-4 py-3 text-gray-600">{row.hip} cm</td>
                      <td className="px-4 py-3 text-gray-600">{row.length && row.length !== '-' ? `${row.length} cm` : '-'}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 bg-gray-50 p-3 rounded text-xs text-gray-500 text-center border border-gray-100">
           <strong>Dica:</strong> Se suas medidas ficarem entre dois tamanhos, recomendamos escolher o maior para mais conforto.
           <br/>*Medidas em centímetros.
        </div>
      </div>
    </div>
  );
};

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showStylist, setShowStylist] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  if (!isOpen) return null;

  const isSoldOut = product.stock === 0;

  const handleAddToCart = () => {
    if (selectedSize && !isSoldOut) {
      addToCart(product, selectedSize);
      onClose();
      // Reset state
      setSelectedSize('');
      setShowStylist(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full animate-fade-in">
            <div className="absolute top-0 right-0 pt-3 pr-3 z-10">
              <button
                type="button"
                className="bg-white/80 backdrop-blur-sm rounded-full p-2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                onClick={onClose}
              >
                <span className="sr-only">Fechar</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="bg-white">
              <div className="sm:flex sm:items-stretch">
                {/* Imagem */}
                <div className="sm:w-1/2 relative h-96 sm:h-auto">
                  <img
                    className={`w-full h-full object-cover ${isSoldOut ? 'grayscale' : ''}`}
                    src={product.image}
                    alt={product.name}
                  />
                   {isSoldOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                          <span className="bg-white text-black px-6 py-2 font-bold text-lg uppercase tracking-widest border-2 border-black">Esgotado</span>
                      </div>
                  )}
                </div>
                
                <div className="text-left p-6 sm:p-10 sm:w-1/2 flex flex-col">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 leading-tight" id="modal-title">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center mt-2 pb-4 border-b border-gray-100">
                        <p className="text-xl font-medium text-brand-dark">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                        </p>
                        {product.stock > 0 && product.stock < 5 && (
                            <span className="flex items-center text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                <AlertCircle size={12} className="mr-1"/> Restam {product.stock}
                            </span>
                        )}
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-base text-gray-600 leading-relaxed">{product.description}</p>
                    </div>

                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Tamanhos Disponíveis</h4>
                        <button 
                          onClick={() => setShowSizeGuide(true)}
                          className="text-xs text-brand-gold hover:text-brand-dark underline flex items-center gap-1 font-medium"
                        >
                          <Ruler size={14} /> Tabela de Medidas
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            disabled={isSoldOut}
                            onClick={() => setSelectedSize(size)}
                            className={`
                              w-12 h-12 flex items-center justify-center rounded-full text-sm font-bold transition-all relative
                              ${isSoldOut ? 'cursor-not-allowed opacity-30 bg-gray-100 text-gray-400' : 'cursor-pointer'}
                              ${selectedSize === size && !isSoldOut
                                ? 'bg-brand-dark text-white shadow-md transform scale-105' 
                                : 'bg-white text-gray-900 border border-gray-200 hover:border-brand-gold'}
                            `}
                          >
                            {size}
                            {selectedSize === size && !isSoldOut && (
                                <span className="absolute -top-1 -right-1 bg-brand-gold text-white rounded-full p-0.5">
                                    <Check size={10} />
                                </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    <button
                      type="button"
                      disabled={!selectedSize || isSoldOut}
                      onClick={handleAddToCart}
                      className={`
                        w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-sm shadow-md text-base font-bold text-white transition-all duration-300 uppercase tracking-wide
                        ${selectedSize && !isSoldOut ? 'bg-brand-dark hover:bg-gray-800 hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'}
                      `}
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      {isSoldOut ? 'Produto Esgotado' : selectedSize ? 'Adicionar à Sacola' : 'Selecione um Tamanho'}
                    </button>
                    
                    {!showStylist && !isSoldOut && (
                      <button 
                        onClick={() => setShowStylist(true)}
                        className="text-sm text-gray-500 hover:text-brand-gold hover:underline text-center font-medium py-2 transition-colors"
                      >
                        Quero dicas de como usar esta peça (IA)
                      </button>
                    )}
                  </div>

                  {showStylist && (
                    <div className="mt-4 max-h-48 overflow-y-auto custom-scrollbar">
                      <AIStylist product={product} onClose={() => setShowStylist(false)} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} measurements={product.sizeTable} />}
    </>
  );
};

export default ProductModal;
