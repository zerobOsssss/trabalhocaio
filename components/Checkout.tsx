import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Banknote, CheckCircle, Loader2, Lock, FileText, MapPin, User, AlertTriangle, Phone, Package, Home, Copy, CheckSquare, Save, ShoppingBag } from 'lucide-react';
import { Order, ShippingDetails } from '../types';
import { generatePixPayload } from '../utils/pix';

// Algoritmo de validação de CPF real
const isValidCPF = (cpf: string) => {
    if (!cpf) return false;
    const cleanCPF = cpf.replace(/[^\d]+/g, '');
    if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) return false;
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i-1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i-1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
    return true;
};

// Formatação visual (Máscaras)
const formatCPF = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
};
const formatCEP = (value: string) => value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
const formatPhone = (value: string) => value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15);

const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { decrementStock } = useProducts();
  const { user, addOrderToHistory } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'payment_pending' | 'success'>('form');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [pixPayload, setPixPayload] = useState('');
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  
  const [formData, setFormData] = useState<ShippingDetails>({
    fullName: user?.name || '',
    cpf: '',
    phone: user?.phone || '',
    address: '',
    number: '',
    neighborhood: '',
    complement: '',
    city: '',
    zipCode: '',
    paymentMethod: 'pix',
    observations: ''
  });

  useEffect(() => {
    if (cart.length === 0 && step === 'form') {
      navigate('/');
      return;
    }
    if (!user) {
      navigate('/login', { state: { from: '/checkout', message: 'Faça login para finalizar sua compra.' } });
    }
  }, [cart, user, navigate, step]);

  // Carrega dados do usuário e endereço salvo
  useEffect(() => {
    if (user) {
      // Tenta carregar endereço salvo
      const savedAddressStr = localStorage.getItem('taos_default_address');
      let savedData = {};
      
      if (savedAddressStr) {
        try {
            savedData = JSON.parse(savedAddressStr);
            setSaveAddress(true); // Se já tinha salvo, mantém a opção marcada
        } catch (e) {
            console.error("Erro ao ler endereço salvo", e);
        }
      }

      setFormData(prev => ({
        ...prev, 
        ...savedData, // Sobrescreve com dados salvos se existirem
        fullName: prev.fullName || user.name, // Mantém nome atual ou usa do perfil
        phone: prev.phone || user.phone || '' // Mantém telefone atual ou usa do perfil
      }));
    }
  }, [user]);

  const fetchAddressByCEP = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade && data.uf ? `${data.localidade} - ${data.uf}` : '',
            zipCode: cep
          }));
          
          // Limpar erros de endereço
          setErrors(prev => { 
            const newErrors = {...prev}; 
            delete newErrors.address; 
            delete newErrors.neighborhood; 
            delete newErrors.city; 
            delete newErrors.zip; 
            return newErrors; 
          });

          // Focar no campo de número após carregar (ux improvement)
          setTimeout(() => {
             document.getElementById('number')?.focus();
          }, 100);

        } else {
           setErrors(prev => ({...prev, zip: 'CEP não encontrado.'}));
           // Limpa campos se CEP não for encontrado para permitir digitação manual limpa
           setFormData(prev => ({ ...prev, address: '', neighborhood: '', city: '' }));
        }
      } catch (error) {
        setErrors(prev => ({...prev, zip: 'Erro ao buscar endereço.'}));
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    let finalValue = value;
    if (id === 'cpf') finalValue = formatCPF(value);
    if (id === 'zip') finalValue = formatCEP(value);
    if (id === 'phone') finalValue = formatPhone(value);

    setFormData(prev => {
        const newData = { ...prev };
        if (id === 'fullname') newData.fullName = finalValue;
        else if (id === 'cpf') newData.cpf = finalValue;
        else if (id === 'phone') newData.phone = finalValue;
        else if (id === 'zip') {
            newData.zipCode = finalValue;
            if (finalValue.length === 9) fetchAddressByCEP(finalValue);
        }
        else if (id === 'address') newData.address = finalValue;
        else if (id === 'number') newData.number = finalValue;
        else if (id === 'neighborhood') newData.neighborhood = finalValue;
        else if (id === 'complement') newData.complement = finalValue;
        else if (id === 'city') newData.city = finalValue;
        else if (id === 'observations') newData.observations = finalValue;
        return newData;
    });
    
    if (errors[id]) { setErrors(prev => { const newErrors = {...prev}; delete newErrors[id]; return newErrors; }); }
  };

  const validateForm = () => {
      const newErrors: {[key: string]: string} = {};
      if (!formData.fullName.trim()) newErrors.fullname = 'Nome completo é obrigatório';
      if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
      else if (!isValidCPF(formData.cpf)) newErrors.cpf = 'CPF inválido.';
      if (!formData.phone || formData.phone.length < 14) newErrors.phone = 'Telefone inválido';
      
      if (!formData.zipCode.trim() || formData.zipCode.length < 9) newErrors.zip = 'CEP inválido';
      if (!formData.address.trim()) newErrors.address = 'Endereço obrigatório';
      if (!formData.number.trim()) newErrors.number = 'Número obrigatório';
      if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro obrigatório';
      if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const generatePix = () => {
    const tempId = Math.floor(Math.random() * 900000 + 100000).toString();
    setOrderId(tempId);

    const payload = generatePixPayload({
      key: settings.pixKey,
      name: settings.pixName,
      city: settings.pixCity,
      amount: cartTotal,
      id: tempId
    });

    setPixPayload(payload);
    setStep('payment_pending');
    setLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGeneratePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    
    if (!settings.pixKey) {
        alert("Erro de configuração: Chave PIX não cadastrada pelo administrador.");
        return;
    }

    // Salvar ou Remover Endereço Padrão
    if (saveAddress) {
        const addressToSave = {
            zipCode: formData.zipCode,
            address: formData.address,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            observations: formData.observations,
            cpf: formData.cpf // Opcional: salvar CPF junto para facilitar
        };
        localStorage.setItem('taos_default_address', JSON.stringify(addressToSave));
    } else {
        // Se desmarcou, remove o padrão (opcional, mas boa prática de UX)
        // Comentado para não perder o dado se o usuário apenas esqueceu de marcar, 
        // mas você pode descomentar se quiser forçar a remoção.
        // localStorage.removeItem('taos_default_address'); 
    }

    setLoading(true);
    setStep('processing');
    
    setTimeout(() => {
      generatePix();
    }, 1500);
  };

  const handleConfirmPayment = () => {
      setLoading(true);
      cart.forEach(item => decrementStock(item.id, item.quantity));
      
      if (user) {
        const newOrder: Order = {
          id: orderId,
          date: new Date().toISOString(),
          items: [...cart], 
          total: cartTotal,
          shipping: formData, 
          status: 'Pendente'
        };
        addOrderToHistory(newOrder);
      }
      
      setStep('success');
      clearCart();
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!user) return null;

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center p-4 text-center">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full animate-fade-in border-t-4 border-green-500">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4 shadow-sm">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Pedido Realizado!</h2>
          <p className="text-gray-500 mb-6">Seu pedido #{orderId} foi registrado.</p>
          
          <div className="bg-yellow-50 rounded-md p-4 mb-8 text-sm text-yellow-800 border border-yellow-100">
            Aguardaremos a compensação do seu PIX para iniciar o envio. Você receberá atualizações no seu perfil.
          </div>

          <div className="flex flex-col gap-3">
             <button 
                onClick={() => navigate('/profile')} 
                className="w-full bg-brand-dark text-white font-bold py-3.5 px-4 rounded shadow-md hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
             >
               <Package className="w-5 h-5 group-hover:scale-110 transition-transform" /> Acompanhar Meus Pedidos
             </button>
             
             <button 
                onClick={() => navigate('/')} 
                className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded hover:bg-gray-50 hover:border-brand-gold hover:text-brand-dark transition-all flex items-center justify-center gap-2"
             >
               <ShoppingBag className="w-5 h-5" /> Continuar Comprando
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center p-4">
        <Loader2 className="h-16 w-16 text-brand-gold animate-spin mb-4" />
        <h2 className="text-2xl font-serif text-gray-900">Gerando QR Code...</h2>
      </div>
    );
  }

  if (step === 'payment_pending') {
      return (
        <div className="min-h-screen bg-stone-50 py-12 px-4 flex justify-center items-start">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full text-center border-t-4 border-brand-gold animate-fade-in">
                <div className="mb-6">
                    <Banknote className="h-12 w-12 text-brand-gold mx-auto mb-2" />
                    <h2 className="text-2xl font-serif font-bold text-gray-900">Pagamento via PIX</h2>
                    <p className="text-gray-500">Escaneie o QR Code ou use o Copia e Cola.</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6 flex flex-col items-center">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`} 
                        alt="QR Code PIX" 
                        className="w-48 h-48 mix-blend-multiply mb-4"
                    />
                    <p className="text-xl font-bold text-gray-900 mb-1">R$ {cartTotal.toFixed(2).replace('.', ',')}</p>
                    <p className="text-xs text-gray-400">Destinatário: {settings.pixName}</p>
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Pix Copia e Cola</label>
                    <div className="flex gap-2">
                        <input 
                            readOnly 
                            value={pixPayload} 
                            className="block w-full text-xs border-gray-300 rounded-md bg-gray-50 text-gray-500 p-3 border"
                        />
                        <button 
                            onClick={copyToClipboard}
                            className={`p-3 rounded-md text-white transition-colors ${copied ? 'bg-green-500' : 'bg-brand-dark hover:bg-gray-800'}`}
                            title="Copiar"
                        >
                            {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                        </button>
                    </div>
                    {copied && <p className="text-green-600 text-xs mt-1 text-left font-bold">Código copiado!</p>}
                </div>

                <button
                    onClick={handleConfirmPayment}
                    className="w-full py-4 px-4 bg-brand-gold hover:bg-yellow-600 text-white font-bold rounded-sm shadow-md transition-colors text-lg"
                >
                    Já realizei o pagamento
                </button>
                <p className="text-xs text-gray-400 mt-4">
                    Ao clicar acima, seu pedido será registrado e processado após a confirmação do banco.
                </p>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Finalizar Compra</h1>
        
        {Object.keys(errors).length > 0 && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm max-w-4xl mx-auto">
                <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700 font-medium">Por favor, corrija os erros abaixo.</p>
                </div>
            </div>
        )}

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          <div className="mb-10 lg:mb-0">
            <form onSubmit={handleGeneratePayment} className="space-y-8 bg-white p-8 shadow rounded-lg border-t-4 border-brand-gold">
              
              <div>
                <div className="flex items-center mb-6 border-b pb-2">
                    <ShieldCheck className="h-5 w-5 text-brand-gold mr-2"/>
                    <h2 className="text-lg font-medium text-gray-900">Dados do Recebedor</h2>
                </div>
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                        <input type="text" id="fullname" value={formData.fullName} onChange={handleInputChange} className={`block w-full pl-10 sm:text-sm rounded-md py-3 px-4 border ${errors.fullname ? 'border-red-300' : 'border-gray-300'} focus:ring-brand-gold focus:border-brand-gold`} placeholder="Nome de quem vai receber"/>
                    </div>
                    {errors.fullname && <p className="mt-1 text-xs text-red-600">{errors.fullname}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                        <input type="tel" id="phone" maxLength={15} value={formData.phone} onChange={handleInputChange} className={`block w-full pl-10 sm:text-sm rounded-md py-3 px-4 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} focus:ring-brand-gold focus:border-brand-gold`} placeholder="(11) 99999-9999"/>
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FileText className="h-4 w-4 text-gray-400" /></div>
                        <input type="text" id="cpf" maxLength={14} value={formData.cpf} onChange={handleInputChange} className={`block w-full pl-10 sm:text-sm rounded-md py-3 px-4 border ${errors.cpf ? 'border-red-300' : 'border-gray-300'} focus:ring-brand-gold focus:border-brand-gold`} placeholder="000.000.000-00"/>
                    </div>
                    {errors.cpf && <p className="mt-1 text-xs text-red-600">{errors.cpf}</p>}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-6 border-b pb-2">
                    <MapPin className="h-5 w-5 text-brand-gold mr-2"/>
                    <h2 className="text-lg font-medium text-gray-900">Endereço de Entrega</h2>
                </div>
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 gap-x-4">
                  
                  {/* CEP */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">CEP</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <input type="text" id="zip" maxLength={9} value={formData.zipCode} onChange={handleInputChange} className={`block w-full sm:text-sm rounded-md py-3 px-4 border ${errors.zip ? 'border-red-300' : 'border-gray-300'} focus:ring-brand-gold focus:border-brand-gold pr-10`} placeholder="00000-000"/>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">{cepLoading ? <Loader2 className="h-4 w-4 text-brand-gold animate-spin" /> : <span className="text-gray-400 text-xs">Busca</span>}</div>
                    </div>
                    {errors.zip && <p className="mt-1 text-xs text-red-600">{errors.zip}</p>}
                  </div>

                  {/* Cidade/Estado - Agora editável mas com preenchimento */}
                  <div className="sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Cidade / Estado</label>
                    <input type="text" id="city" value={formData.city} onChange={handleInputChange} className={`block w-full sm:text-sm rounded-md py-3 px-4 border ${errors.city ? 'border-red-300' : 'border-gray-300'} bg-gray-50 focus:ring-brand-gold focus:border-brand-gold`} placeholder="Preenchimento automático"/>
                    {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                  </div>

                  {/* Endereço */}
                  <div className="sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Endereço (Rua, Av...)</label>
                    <input type="text" id="address" value={formData.address} onChange={handleInputChange} className={`block w-full sm:text-sm rounded-md py-3 px-4 border ${errors.address ? 'border-red-300' : 'border-gray-300'} focus:ring-brand-gold focus:border-brand-gold`} placeholder="Logradouro"/>
                    {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                  </div>

                  {/* Número */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Número</label>
                    <input type="text" id="number" value={formData.number} onChange={handleInputChange} className={`block w-full sm:text-sm rounded-md py-3 px-4 border ${errors.number ? 'border-red-300' : 'border-gray-300'} focus:ring-brand-gold focus:border-brand-gold`} placeholder="123"/>
                    {errors.number && <p className="mt-1 text-xs text-red-600">{errors.number}</p>}
                  </div>

                  {/* Bairro */}
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Bairro</label>
                    <input type="text" id="neighborhood" value={formData.neighborhood} onChange={handleInputChange} className={`block w-full sm:text-sm rounded-md py-3 px-4 border ${errors.neighborhood ? 'border-red-300' : 'border-gray-300'} focus:ring-brand-gold focus:border-brand-gold`} placeholder="Bairro"/>
                    {errors.neighborhood && <p className="mt-1 text-xs text-red-600">{errors.neighborhood}</p>}
                  </div>

                  {/* Complemento */}
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Complemento <span className="text-gray-400 font-normal">(Opcional)</span></label>
                    <input type="text" id="complement" value={formData.complement || ''} onChange={handleInputChange} className="block w-full sm:text-sm rounded-md py-3 px-4 border border-gray-300 focus:ring-brand-gold focus:border-brand-gold" placeholder="Apto, Bloco..."/>
                  </div>
                  
                  <div className="sm:col-span-6 mt-2">
                    <label className="block text-sm font-medium text-gray-700">Observações de Entrega</label>
                    <textarea id="observations" value={formData.observations || ''} onChange={handleInputChange} rows={2} className="block w-full sm:text-sm rounded-md py-3 px-4 border border-gray-300 focus:ring-brand-gold focus:border-brand-gold" placeholder="Ponto de referência, instruções..."/>
                  </div>

                  {/* Opção para Salvar Endereço */}
                  <div className="sm:col-span-6 mt-4 flex items-center bg-gray-50 p-3 rounded border border-gray-200">
                    <input
                      id="save-address"
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="h-4 w-4 text-brand-gold focus:ring-brand-gold border-gray-300 rounded"
                    />
                    <label htmlFor="save-address" className="ml-2 block text-sm text-gray-900 font-medium flex items-center cursor-pointer">
                      <Save size={16} className="mr-2 text-gray-500" />
                      Salvar este endereço como padrão para futuras compras
                    </label>
                  </div>

                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center mb-4">
                    <div className="bg-brand-light p-2 rounded-full mr-3">
                        <Lock className="h-5 w-5 text-brand-gold"/>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">Forma de Pagamento</h2>
                </div>
                
                <div className="p-4 border-2 border-brand-gold rounded-lg bg-yellow-50/20 flex items-center relative">
                    <div className="bg-brand-gold text-white p-1 rounded-full absolute -top-3 -right-3 shadow-sm"><CheckCircle size={16}/></div>
                    <Banknote className="mr-3 h-6 w-6 text-brand-gold" /> 
                    <div>
                        <span className="block text-sm font-bold text-gray-900">PIX (QR Code)</span>
                        <span className="block text-xs text-gray-500">Aprovação instantânea e segura.</span>
                    </div>
                </div>

                <div className="pt-6">
                     <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-4 px-4 border border-transparent rounded-sm shadow-sm text-sm font-bold text-white bg-brand-dark hover:bg-gray-800 focus:outline-none transition-colors uppercase tracking-wider disabled:bg-gray-400"
                    >
                      {loading ? 'Processando...' : `Gerar QR Code (R$ ${cartTotal.toFixed(2).replace('.', ',')})`}
                    </button>
                  </div>
              </div>
            </form>
          </div>

          <div className="mt-10 lg:mt-0">
             <div className="bg-white shadow overflow-hidden rounded-lg sticky top-24">
              <ul className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <li key={`${item.id}-${item.selectedSize}`} className="flex py-6 px-4 sm:px-6">
                    <div className="flex-shrink-0 h-16 w-16 border border-gray-200 rounded-md overflow-hidden">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                    </div>
                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3 className="text-sm">{item.name}</h3>
                          <p className="text-sm">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Tam: {item.selectedSize} | Qtd: {item.quantity}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
                  <p>Total</p>
                  <p>R$ {cartTotal.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;