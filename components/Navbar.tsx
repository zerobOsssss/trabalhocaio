import React, { useState } from 'react';
import { ShoppingBag, Menu, Scissors, Wand2, X, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { cart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-brand-accent shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          <div className="flex items-center">
            {/* Mobile Menu Button - Reduzi o tamanho do ícone */}
            <button 
              className="p-1.5 rounded-md text-gray-600 hover:text-gray-900 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <Link 
              to="/" 
              className="flex items-center gap-1.5 lg:ml-0 ml-1 cursor-pointer" 
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo({top: 0, behavior: 'smooth'});
              }}
            >
              <div className="bg-brand-gold p-1 md:p-1.5 rounded-full text-white">
                <Scissors size={16} className="md:w-5 md:h-5" />
              </div>
              <span className="font-serif text-lg md:text-2xl font-bold text-brand-dark tracking-tight">
                TAOS
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-8 items-center">
            <Link to="/" className="text-gray-600 hover:text-brand-gold px-3 py-2 text-sm font-medium transition-colors">Início</Link>
            <button onClick={() => handleNavigation('shop')} className="text-gray-600 hover:text-brand-gold px-3 py-2 text-sm font-medium transition-colors bg-transparent border-none cursor-pointer">
              Coleção
            </button>
            <button onClick={() => handleNavigation('about')} className="text-gray-600 hover:text-brand-gold px-3 py-2 text-sm font-medium transition-colors bg-transparent border-none cursor-pointer">
              Sobre
            </button>
            <Link 
                to="/custom" 
                className="flex items-center gap-1 text-brand-gold border border-brand-gold/30 bg-brand-gold/5 hover:bg-brand-gold hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
            >
                <Wand2 size={16} /> Ateliê Virtual
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link 
              to={user ? "/profile" : "/login"}
              className="flex items-center text-gray-600 hover:text-brand-dark transition-colors p-1.5"
              title={user ? "Minha Conta" : "Entrar / Cadastrar"}
            >
              <User className="h-5 w-5 md:h-6 md:w-6" />
              {user && <span className="hidden md:block ml-2 text-sm font-medium max-w-[100px] truncate">{user.name.split(' ')[0]}</span>}
            </Link>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 text-gray-600 hover:text-brand-gold transition-colors"
            >
              <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] md:text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-dark rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg animate-fade-in z-40">
          <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
            <Link 
              to={user ? "/profile" : "/login"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-bold text-brand-dark bg-gray-50 mb-1"
            >
              <User className="h-5 w-5" />
              {user ? `Minha Conta (${user.name.split(' ')[0]})` : 'Entrar ou Cadastrar'}
            </Link>

            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700"
            >
              Início
            </Link>
            
            <button 
              onClick={() => handleNavigation('shop')}
              className="block w-full text-left px-3 py-2.5 rounded-md text-base font-medium text-gray-700"
            >
              Coleção
            </button>
            
            <button 
              onClick={() => handleNavigation('about')}
              className="block w-full text-left px-3 py-2.5 rounded-md text-base font-medium text-gray-700"
            >
              Sobre Nós
            </button>

            <Link 
              to="/custom"
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium text-brand-gold bg-brand-gold/5"
            >
               <Wand2 size={18} /> Ateliê Virtual
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;