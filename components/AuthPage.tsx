import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, LogIn, AlertCircle, Phone, Eye, EyeOff, ArrowLeft, CheckCircle, Send } from 'lucide-react';

// Função auxiliar de máscara de telefone
const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Se o usuário foi redirecionado do checkout, capturamos a mensagem e o caminho
  const from = location.state?.from?.pathname || location.state?.from || '/profile';
  const message = location.state?.message;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estado para erros específicos de cada campo
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Limpa o erro do campo específico ao digitar
    if (errors[field]) {
        setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors[field];
            return newErrors;
        });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatPhone(e.target.value);
    setFormData({ ...formData, phone: value });
    if (errors.phone) {
        setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.phone;
            return newErrors;
        });
    }
  };

  const validateForm = () => {
      const newErrors: {[key: string]: string} = {};

      if (!formData.email) {
          newErrors.email = 'E-mail é obrigatório.';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'E-mail inválido.';
      }

      if (!isForgotPassword) {
        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória.';
        }

        if (!isLogin) {
            if (!formData.name.trim()) newErrors.name = 'Nome completo é obrigatório.';
            
            if (!formData.phone || formData.phone.length < 14) {
                newErrors.phone = 'Telefone inválido.';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'As senhas não coincidem.';
            }
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setResetStatus('loading');
    
    // Simula chamada de API
    setTimeout(() => {
        setResetStatus('success');
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLogin) {
      const success = login(formData.email, formData.password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setErrors({ password: 'Email ou senha incorretos.' }); // Exibe erro no campo de senha
      }
    } else {
      const success = register(formData.name, formData.email, formData.password, formData.phone);
      if (success) {
         navigate(from, { replace: true });
      } else {
        setErrors({ email: 'Este e-mail já está cadastrado.' });
      }
    }
  };

  const getInputClass = (fieldName: string) => {
      return `block w-full pl-10 border rounded-md shadow-sm py-2.5 text-sm transition-colors ${
          errors[fieldName] 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
            : 'border-gray-300 focus:ring-brand-gold focus:border-brand-gold'
      }`;
  };

  // Renderização do Formulário de Reset de Senha
  if (isForgotPassword) {
      return (
        <div className="min-h-[calc(100vh-64px)] bg-stone-50 flex items-center justify-center p-4 py-8">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full p-8 md:p-10 relative">
                <button 
                    onClick={() => {
                        setIsForgotPassword(false);
                        setResetStatus('idle');
                        setErrors({});
                    }}
                    className="absolute top-4 left-4 text-gray-400 hover:text-brand-dark transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>

                {resetStatus === 'success' ? (
                    <div className="text-center animate-fade-in">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">E-mail Enviado!</h2>
                        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                            Se houver uma conta associada a <strong>{formData.email}</strong>, você receberá um link para redefinir sua senha em instantes.
                        </p>
                        <button
                            onClick={() => {
                                setIsForgotPassword(false);
                                setResetStatus('idle');
                            }}
                            className="w-full py-2.5 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-brand-dark hover:bg-gray-800 transition-colors"
                        >
                            Voltar para o Login
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8 mt-4">
                            <div className="mx-auto bg-brand-light w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <Lock className="h-6 w-6 text-brand-gold" />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-gray-900">Recuperar Senha</h3>
                            <p className="text-gray-500 text-sm mt-2">
                                Digite seu e-mail abaixo e enviaremos um link seguro para você redefinir sua senha.
                            </p>
                        </div>

                        <form onSubmit={handleResetSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">E-mail Cadastrado</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={getInputClass('email')}
                                        placeholder="seu@email.com"
                                        disabled={resetStatus === 'loading'}
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={resetStatus === 'loading'}
                                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600 transition-colors disabled:bg-gray-400"
                            >
                                {resetStatus === 'loading' ? 'Enviando...' : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" /> Enviar Link
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
      );
  }

  // Renderização Principal (Login/Registro)
  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50 flex items-center justify-center p-4 py-8">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        
        {/* Lado Esquerdo - Decorativo */}
        <div className="md:w-1/2 bg-brand-dark p-8 md:p-12 text-white flex flex-col justify-center relative overflow-hidden min-h-[160px] md:min-h-[500px]">
          <div className="absolute inset-0 opacity-30">
             <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Costura" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Bem-vinda</h2>
            <p className="text-gray-300 text-sm md:text-base hidden md:block">
              Crie sua conta para acompanhar seus pedidos, salvar suas medidas e receber novidades exclusivas.
            </p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="md:w-1/2 p-6 md:p-12">
          
          {/* Mensagem de Redirecionamento (ex: vindo do checkout) */}
          {message && (
             <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700 font-medium">
                            {message}
                        </p>
                    </div>
                </div>
             </div>
          )}

          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900">
              {isLogin ? 'Acesse sua Conta' : 'Crie sua Conta'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={getInputClass('name')}
                      placeholder="Seu nome"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Telefone (Whatsapp)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      className={getInputClass('phone')}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={getInputClass('email')}
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`${getInputClass('password')} pr-10`} // pr-10 para o ícone do olho
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              
              {/* Link Esqueci minha senha */}
              {isLogin && (
                  <div className="flex justify-end mt-1">
                      <button 
                        type="button"
                        onClick={() => {
                            setErrors({});
                            setIsForgotPassword(true);
                        }}
                        className="text-xs text-brand-gold hover:text-yellow-700 font-medium hover:underline"
                      >
                          Esqueci minha senha
                      </button>
                  </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirmar Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`${getInputClass('confirmPassword')} pr-10`}
                    placeholder="••••••••"
                  />
                   <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600 transition-colors mt-2"
            >
              {isLogin ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Entrar
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Cadastrar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setFormData({name: '', email: '', password: '', confirmPassword: '', phone: ''});
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className="text-xs font-medium text-brand-dark hover:text-brand-gold underline"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;