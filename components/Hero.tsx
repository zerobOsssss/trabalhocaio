import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-brand-dark overflow-hidden">
      {/* Imagem de Fundo com Overlay */}
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover opacity-60"
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Mulher vestindo roupa elegante"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <div className="md:w-2/3 lg:w-1/2 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-8 bg-brand-gold"></span>
            <span className="text-brand-gold font-medium tracking-wider text-sm uppercase">Nova Coleção 2026</span>
          </div>
          
          <h1 className="text-4xl tracking-tight font-serif font-extrabold text-white sm:text-5xl md:text-6xl mb-6">
            Elegância feita <br/>
            <span className="text-brand-gold italic">sob medida</span> para você.
          </h1>
          
          <p className="mt-4 text-lg text-gray-300 max-w-xl leading-relaxed">
            Descubra peças exclusivas que unem o clássico ao moderno. Na TAOS, cada costura conta uma história de sofisticação e conforto.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="#shop"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-sm text-brand-dark bg-white hover:bg-brand-gold hover:text-white transition-all duration-300 shadow-lg"
            >
              Ver Coleção <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <Link
              to="/custom"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-400 text-base font-medium rounded-sm text-white hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm"
            >
              <Wand2 className="mr-2 h-5 w-5 text-brand-gold" />
              Ateliê Virtual
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;