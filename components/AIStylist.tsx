import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { getStylingAdvice } from '../services/geminiService';
import { Product } from '../types';

interface AIStylistProps {
  product: Product;
  onClose: () => void;
}

const AIStylist: React.FC<AIStylistProps> = ({ product, onClose }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdvice = async () => {
      setLoading(true);
      const result = await getStylingAdvice(product.name, product.description);
      setAdvice(result);
      setLoading(false);
    };

    fetchAdvice();
  }, [product]);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100 relative animate-fade-in">
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="text-purple-600" size={18} />
        <h4 className="font-serif font-bold text-purple-900 text-sm">Consultora de Estilo IA</h4>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-4 text-purple-600">
           <Loader2 className="animate-spin mb-2" size={24} />
           <span className="text-xs font-medium">Criando dicas exclusivas...</span>
        </div>
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
           {advice}
        </div>
      )}
    </div>
  );
};

export default AIStylist;