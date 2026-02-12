import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, LogOut, Calendar, MapPin, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { Order } from '../types';

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row justify-between md:items-center cursor-pointer hover:bg-gray-100 transition-colors border-l-4 border-l-transparent hover:border-l-brand-gold"
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 flex-1">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Data</p>
            <p className="text-sm font-medium text-gray-900 flex items-center mt-1">
              <Calendar size={14} className="mr-1 text-gray-400" />
              {new Date(order.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              R$ {order.total.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">ID Pedido</p>
            <p className="text-sm font-medium text-gray-900 mt-1">#{order.id}</p>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-4 min-w-[160px]">
           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
              ${order.status === 'Entregue' ? 'bg-green-100 text-green-800' : 
                order.status === 'Cancelado' ? 'bg-red-100 text-red-800' : 
                order.status === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                order.status === 'Em Processamento' ? 'bg-indigo-100 text-indigo-800' :
                'bg-yellow-100 text-yellow-800'}`}>
              {order.status}
           </span>
           {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-6 border-t border-gray-200 bg-white animate-fade-in">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                      <MapPin size={16} className="mr-2 text-brand-gold" /> Endereço de Entrega
                  </h4>
                  <p className="text-sm text-gray-600 font-medium">
                    {order.shipping.address}, {order.shipping.number}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shipping.neighborhood} {order.shipping.complement ? `- ${order.shipping.complement}` : ''}
                  </p>
                  <p className="text-sm text-gray-600">{order.shipping.city} - {order.shipping.zipCode}</p>
                  <p className="text-sm text-gray-500 mt-1">Recebedor: {order.shipping.fullName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                   <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                      <ShoppingBag size={16} className="mr-2 text-brand-gold" /> Resumo
                   </h4>
                   <p className="text-sm text-gray-600 flex justify-between">
                     <span>Método de Pagamento:</span> 
                     <span className="font-medium">{order.shipping.paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}</span>
                   </p>
                   <p className="text-sm text-gray-600 flex justify-between mt-1">
                     <span>Qtd. Itens:</span> 
                     <span className="font-medium">{order.items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                   </p>
              </div>
           </div>
           
           <h4 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Itens do Pedido</h4>
           <ul className="divide-y divide-gray-100">
             {order.items.map((item, index) => (
               <li key={`${order.id}-${index}`} className="py-4 flex items-center">
                 <div className="flex-shrink-0 h-16 w-16 border border-gray-200 rounded-md overflow-hidden">
                   <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                 </div>
                 <div className="ml-4 flex-1">
                   <div className="flex justify-between font-medium text-gray-900">
                     <h4 className="text-sm">{item.name}</h4>
                     <p className="text-sm">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                   </div>
                   <p className="mt-1 text-sm text-gray-500">Tamanho: {item.selectedSize} | Quantidade: {item.quantity}</p>
                 </div>
               </li>
             ))}
           </ul>
        </div>
      )}
    </div>
  );
};

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex flex-col md:flex-row justify-between items-center border-t-4 border-brand-gold">
          <div className="flex items-center mb-4 md:mb-0 w-full md:w-auto">
            <div className="h-16 w-16 bg-brand-dark rounded-full flex items-center justify-center text-white text-2xl font-serif shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-serif font-bold text-gray-900">Olá, {user.name}</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-sm text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-sm font-medium transition-colors w-full md:w-auto justify-center"
          >
            <LogOut size={16} className="mr-2" /> Sair da conta
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
              <Package className="mr-3 text-brand-gold" /> Meus Pedidos
            </h2>
            {user.orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-100">
                <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Você ainda não fez nenhum pedido</h3>
                <p className="text-gray-500 mb-6 mt-2">Explore nossa coleção e encontre algo especial para você.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-brand-dark hover:bg-gray-800 transition-colors"
                >
                  Ir para a Loja
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {user.orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
