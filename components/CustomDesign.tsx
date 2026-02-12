import React, { useState } from 'react';
import { Wand2, Send, Loader2, Scissors, Save, MessageCircle, Lock, LogIn } from 'lucide-react';
import { refineDesignIdea } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { useCustomRequest } from '../context/CustomRequestContext';
import { useNavigate, Link } from 'react-router-dom';

const CustomDesign: React.FC = () => {
  const { user } = useAuth(); // Pegamos os dados do usuário logado
  const { addRequest } = useCustomRequest(); // Função para salvar no banco
  const navigate = useNavigate();

  const [idea, setIdea] = useState('');
  const [occasion, setOccasion] = useState('');
  const [refinedDescription, setRefinedDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formStep, setFormStep] = useState<'input' | 'result' | 'sent'>('input');

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) return;

    setLoading(true);
    const result = await refineDesignIdea(idea, occasion);
    setRefinedDescription(result);
    setLoading(false);
    setFormStep('result');
  };

  const handleSaveToSystem = () => {
    if (!refinedDescription || !user) return;

    // Salva no "Banco de Dados" (Contexto)
    addRequest({
        clientName: user.name,
        clientContact: user.phone || user.email, // Garante que temos um contato
        occasion: occasion,
        originalIdea: idea,
        aiRefinement: refinedDescription
    });

    setFormStep('sent');
  };

  const openWhatsApp = () => {
     // Número do WhatsApp da Loja
     const phoneNumber = "5511970187215"; 
     const message = 
      `🧵 *NOVO PEDIDO - ATELIÊ VIRTUAL* 🧵\n\n` +
      `🎉 *Ocasião:* ${occasion}\n` +
      `💡 *Ideia Original:* ${idea}\n\n` +
      `📝 *Ficha Técnica Sugerida (IA):*\n${refinedDescription}\n`;
     
     const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
     window.open(url, '_blank');
  };

  // Bloqueio de Acesso se não estiver logado
  if (!user) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-serif font-bold text-brand-dark mb-4">Ateliê Virtual</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Crie modelos exclusivos com nossa Inteligência Artificial.
                </p>
            </div>

            <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden border-t-4 border-brand-gold p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-stone-100 mb-6">
                    <Lock className="h-8 w-8 text-brand-gold" />
                </div>
                
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Identifique-se para continuar</h2>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Para que possamos desenhar seu modelo e enviar o orçamento corretamente via WhatsApp, precisamos saber quem você é.
                </p>

                <button
                    onClick={() => navigate('/login', { state: { from: '/custom', message: 'Faça login para acessar o Ateliê Virtual.' } })}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-sm shadow-sm text-base font-medium text-white bg-brand-dark hover:bg-gray-800 transition-colors mb-4"
                >
                    <LogIn className="mr-2 h-5 w-5" /> Entrar na minha conta
                </button>

                <p className="text-sm text-gray-500">
                    Ainda não é cliente? <Link to="/login" className="text-brand-gold font-bold hover:underline">Cadastre-se rapidinho.</Link>
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-brand-dark mb-4">Ateliê Virtual</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Olá, <span className="font-bold text-brand-gold">{user.name.split(' ')[0]}</span>! Não achou o que procurava? 
          Conte sua ideia e nossa Inteligência Artificial ajudará a definir os detalhes técnicos para a costura.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-brand-accent">
        
        {/* Step 1: Input */}
        {formStep === 'input' && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-brand-gold p-2 rounded-full text-white">
                    <Scissors size={24} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900">Descreva seu Modelo</h2>
            </div>
            
            <form onSubmit={handleRefine} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Para qual ocasião é a roupa?
                </label>
                <input
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="Ex: Casamento, Trabalho, Jaleco para Pediatria..."
                  className="w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Como você imagina a peça?
                </label>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={5}
                  placeholder="Ex: Quero um vestido vermelho longo, mas que não seja muito justo. Gosto de mangas bufantes e quero algo elegante..."
                  className="w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-brand-gold focus:border-brand-gold"
                />
                <p className="text-xs text-gray-500 mt-2">
                    Não se preocupe com termos técnicos. Digite do seu jeito e nossa IA vai traduzir para "linguagem de costureira".
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !idea}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-sm shadow-sm text-base font-medium text-white bg-brand-dark hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" /> Criando Especificação...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" /> Transformar em Projeto
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Result & Confirmation */}
        {formStep === 'result' && (
          <div className="p-8 bg-stone-50">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Sugestão Técnica da IA</h2>
            <div className="bg-white p-6 rounded border border-gray-200 shadow-sm mb-6 prose prose-stone text-gray-700">
                <p className="whitespace-pre-line leading-relaxed">{refinedDescription}</p>
            </div>

            <div className="flex gap-4 flex-col sm:flex-row">
                <button
                    onClick={() => setFormStep('input')}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-sm text-gray-700 bg-white hover:bg-gray-50 font-medium"
                >
                    Editar Ideia
                </button>
                <button
                    onClick={handleSaveToSystem}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-sm text-white bg-brand-dark hover:bg-black font-medium shadow-sm transition-colors"
                >
                    <Save className="mr-2 h-5 w-5" /> Enviar Solicitação
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
                Sua solicitação será salva no nosso sistema e entraremos em contato pelo seu telefone cadastrado: <strong>{user.phone || user.email}</strong>.
            </p>
          </div>
        )}

        {/* Step 3: Success */}
        {formStep === 'sent' && (
            <div className="p-12 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <Scissors className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Solicitação Recebida!</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Obrigada, <strong>{user.name.split(' ')[0]}</strong>! Seu pedido de modelo exclusivo já está no nosso sistema. 
                    Nossa equipe analisará a ficha técnica da IA e chamará você no WhatsApp/Email.
                </p>
                
                <div className="flex flex-col gap-3 justify-center items-center">
                     <button
                        onClick={openWhatsApp}
                        className="inline-flex items-center text-green-600 font-bold hover:underline"
                    >
                        <MessageCircle size={18} className="mr-2"/> Tem pressa? Avise no WhatsApp
                    </button>

                    <button
                        onClick={() => {
                            setFormStep('input');
                            setIdea('');
                            setOccasion('');
                            setRefinedDescription(null);
                        }}
                        className="text-brand-gold font-medium hover:underline mt-4"
                    >
                        Criar outro modelo
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CustomDesign;