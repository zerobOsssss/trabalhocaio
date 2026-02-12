import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { CustomRequestProvider } from './context/CustomRequestContext'; 
import { SettingsProvider } from './context/SettingsContext'; // Importar novo contexto
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import CartSidebar from './components/CartSidebar';
import Checkout from './components/Checkout';
import CustomDesign from './components/CustomDesign';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/AuthPage';
import UserProfile from './components/UserProfile';
import WhatsAppButton from './components/WhatsAppButton';
import { Scissors, Instagram, Facebook, Mail, Phone, MapPin, CreditCard, ArrowRight } from 'lucide-react';

const Footer: React.FC = () => {
    const { addToast } = useToast();

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        addToast('Obrigada por se inscrever! Verifique seu e-mail.', 'success');
    };

    return (
        <footer id="contact" className="bg-brand-dark text-white pt-16 pb-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-brand-gold p-1.5 rounded-full text-brand-dark">
                                <Scissors size={20} />
                            </div>
                            <span className="font-serif text-2xl font-bold tracking-tight">TAOS</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Moda feita à mão com amor e elegância. Criamos peças que contam histórias e realçam a beleza natural de cada mulher.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="text-gray-400 hover:text-brand-gold transition-colors"><Instagram size={20}/></a>
                            <a href="#" className="text-gray-400 hover:text-brand-gold transition-colors"><Facebook size={20}/></a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white font-serif">Navegação</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link to="/" className="hover:text-brand-gold transition-colors">Início</Link></li>
                            <li><a href="#shop" className="hover:text-brand-gold transition-colors">Coleção</a></li>
                            <li><Link to="/custom" className="hover:text-brand-gold transition-colors">Ateliê Virtual</Link></li>
                            <li><a href="#about" className="hover:text-brand-gold transition-colors">Sobre Nós</a></li>
                            <li><Link to="/login" className="hover:text-brand-gold transition-colors">Minha Conta</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white font-serif">Atendimento</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex items-start gap-3">
                                <Mail size={18} className="text-brand-gold mt-0.5" />
                                <span>contato@taosconfeccoes.com.br</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone size={18} className="text-brand-gold mt-0.5" />
                                <span>(11) 97018-7215 <br/> <span className="text-xs text-gray-500">Seg a Sex: 9h às 18h</span></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-brand-gold mt-0.5" />
                                <span>Rua das Flores, 123<br/>São Paulo - SP</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white font-serif">Newsletter</h4>
                        <p className="text-gray-400 text-sm mb-4">Receba novidades e descontos exclusivos.</p>
                        <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                            <input 
                                type="email" 
                                placeholder="Seu melhor e-mail" 
                                className="bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-sm focus:outline-none focus:border-brand-gold text-sm"
                                required 
                            />
                            <button type="submit" className="bg-brand-gold text-brand-dark font-bold py-2.5 px-4 rounded-sm hover:bg-white transition-colors text-sm uppercase tracking-wide flex justify-center items-center gap-2">
                                Inscrever-se <ArrowRight size={16}/>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs text-center md:text-left">
                        &copy; {new Date().getFullYear()} TAOS CONFECÇÕES. Todos os direitos reservados.
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 text-gray-500">
                           <CreditCard size={24} />
                           {/* Simulating other payment icons with text or repeated icons for layout */}
                           <div className="h-6 w-8 bg-gray-700 rounded flex items-center justify-center text-[10px] font-bold">PIX</div>
                           <div className="h-6 w-8 bg-gray-700 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
                           <div className="h-6 w-8 bg-gray-700 rounded flex items-center justify-center text-[10px] font-bold">MC</div>
                        </div>
                    </div>

                     <Link to="/admin" className="text-gray-600 hover:text-white text-xs transition-colors">Admin</Link>
                </div>
            </div>
        </footer>
    );
};

const Home: React.FC = () => (
  <>
    <Hero />
    <ProductList />
    <section id="about" className="bg-stone-50 py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Scissors className="h-12 w-12 text-brand-gold mx-auto mb-6" />
        <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6">A Arte da Costura</h2>
        <div className="w-16 h-1 bg-brand-gold mx-auto mb-8"></div>
        <p className="text-xl text-gray-600 leading-relaxed font-light">
          "A TAOS CONFECÇÕES nasceu do sonho de criar roupas que não apenas vestem, mas abraçam. 
          Cada peça é desenhada e costurada com meticulosa atenção aos detalhes, garantindo conforto, 
          durabilidade e uma elegância atemporal."
        </p>
      </div>
    </section>
    <Footer />
  </>
);

// Wrapper Component to use useToast inside App content (since ToastProvider is outside)
const AppContent: React.FC = () => {
    return (
        <div className="min-h-screen font-sans bg-white selection:bg-brand-gold selection:text-white relative flex flex-col">
            <Routes>
            <Route path="/" element={
                <>
                <Navbar />
                <Home />
                <CartSidebar />
                <WhatsAppButton />
                </>
            } />
            <Route path="/custom" element={
                <>
                <Navbar />
                <CustomDesign />
                <CartSidebar />
                <WhatsAppButton />
                <Footer />
                </>
            } />
            <Route path="/checkout" element={
                <>
                    <Navbar />
                    <Checkout />
                    <WhatsAppButton />
                    <Footer />
                </>
            } />
            <Route path="/login" element={
                <>
                    <Navbar />
                    <AuthPage />
                    <CartSidebar />
                    <Footer />
                </>
            } />
            <Route path="/profile" element={
                <>
                    <Navbar />
                    <UserProfile />
                    <CartSidebar />
                    <WhatsAppButton />
                    <Footer />
                </>
            } />
            <Route path="/admin" element={
                <>
                    <Navbar />
                    <AdminDashboard />
                </>
            } />
            </Routes>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
            <ProductProvider>
                <SettingsProvider>
                    <CustomRequestProvider>
                        <CartProvider>
                            <AppContent />
                        </CartProvider>
                    </CustomRequestProvider>
                </SettingsProvider>
            </ProductProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;