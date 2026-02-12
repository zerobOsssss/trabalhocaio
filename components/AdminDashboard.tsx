import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useCustomRequest } from '../context/CustomRequestContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { Product, User, Order, CustomRequest, SizeMeasurement } from '../types';
import { 
  Trash2, Edit, Plus, X, Lock, LogOut, Package, Users, ShoppingBag, 
  Eye, RefreshCw, LayoutDashboard, TrendingUp, AlertTriangle, 
  Search, Truck, Clock, DollarSign, CreditCard, GripVertical, Settings, Palette, RotateCcw,
  Wand2, CheckSquare, MessageCircle, QrCode, Phone, Mail, MapPin, Calendar, Share2, Filter, Save, Image as ImageIcon, Ruler
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, reorderProducts } = useProducts();
  const { getAllUsers, updateOrderStatus } = useAuth();
  const { requests, updateRequestStatus, deleteRequest } = useCustomRequest(); 
  const { settings, updateSettings } = useSettings();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'custom_requests' | 'settings'>('dashboard');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<{order: Order, user: User} | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null); 
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
  
  // Search States
  const [searchTerm, setSearchTerm] = useState(''); // Produtos
  const [orderSearchTerm, setOrderSearchTerm] = useState(''); // Pedidos
  const [orderStatusFilter, setOrderStatusFilter] = useState('Todas'); // Pedidos Filter

  // Settings Form State (Buffer)
  const [settingsForm, setSettingsForm] = useState({
      pixKey: '',
      pixName: '',
      pixCity: ''
  });

  // Image Preview State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close preview on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
        setSelectedRequest(null);
        setSelectedUser(null);
        setSelectedOrder(null);
        setIsModalOpen(false);
      }
    };

    if (previewImage || selectedRequest || selectedUser || selectedOrder || isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewImage, selectedRequest, selectedUser, selectedOrder, isModalOpen]);

  // Sync settings form with context on load
  useEffect(() => {
    setSettingsForm({
        pixKey: settings.pixKey,
        pixName: settings.pixName,
        pixCity: settings.pixCity
    });
  }, [settings, activeTab]);

  // Theme State
  const [adminTheme, setAdminTheme] = useState(() => {
    const saved = localStorage.getItem('taos_admin_theme');
    const defaultTheme = { sidebar: '#1a1a1a', primary: '#1a1a1a', secondary: '#d4af37' };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { 
          ...defaultTheme, 
          ...parsed, 
          sidebar: parsed.sidebar || parsed.primary || defaultTheme.sidebar 
        };
      } catch {
        return defaultTheme;
      }
    }
    return defaultTheme;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('taos_admin_logged_in') === 'true';
  });
  
  const [password, setPassword] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  
  // Drag and Drop States
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  
  // Form Data for Product
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: '',
    sizes: '',
    stock: ''
  });

  // State for Size Measurement Table
  const [sizeMeasurements, setSizeMeasurements] = useState<SizeMeasurement[]>([]);

  const loadData = useCallback(() => {
      try {
        const users = getAllUsers();
        // Garante que users é um array
        setUsersList(Array.isArray(users) ? [...users] : []);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        setUsersList([]);
      }
  }, [getAllUsers]);

  // Carrega dados ao iniciar e ao focar na janela
  useEffect(() => {
    loadData();
    window.addEventListener('focus', loadData);
    return () => window.removeEventListener('focus', loadData);
  }, [loadData]);

  // Recarrega dados sempre que mudar de aba para garantir atualização
  useEffect(() => {
      loadData();
  }, [activeTab, loadData]);

  useEffect(() => {
    localStorage.setItem('taos_admin_theme', JSON.stringify(adminTheme));
  }, [adminTheme]);

  const dashboardStats = useMemo(() => {
    const allOrders: Order[] = [];
    usersList.forEach(u => {
        if(u.orders && Array.isArray(u.orders)) {
            allOrders.push(...u.orders);
        }
    });
    allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalRevenue = allOrders.reduce((acc, order) => acc + (order.total || 0), 0);
    const totalOrders = allOrders.length;
    const totalCustomers = usersList.length;
    const lowStockProducts = products.filter(p => p.stock < 5).length;
    const pendingRequests = requests.filter(r => r.status === 'Novo').length; 
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return { totalRevenue, totalOrders, totalCustomers, lowStockProducts, averageTicket, allOrders, pendingRequests };
  }, [usersList, products, requests]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'taos') {
      setIsAuthenticated(true);
      localStorage.setItem('taos_admin_logged_in', 'true');
    } else {
      alert('Senha incorreta!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('taos_admin_logged_in');
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toFixed(2).replace('.', ','),
        category: product.category,
        image: product.image,
        description: product.description,
        sizes: product.sizes.join(', '),
        stock: product.stock.toString()
      });
      setSizeMeasurements(product.sizeTable || []);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: '', image: '', description: '', sizes: 'P, M, G', stock: '10' });
      setSizeMeasurements([]);
    }
    setIsModalOpen(true);
  };

  const generateMeasurementsFields = () => {
    const sizesArray = formData.sizes.split(',').map(s => s.trim()).filter(s => s !== '');
    
    // Preserve existing measurements if size still exists
    const newMeasurements: SizeMeasurement[] = sizesArray.map(size => {
        const existing = sizeMeasurements.find(m => m.size === size);
        return existing || { size, bust: '', waist: '', hip: '', length: '' };
    });
    
    setSizeMeasurements(newMeasurements);
  };

  const handleMeasurementChange = (index: number, field: keyof SizeMeasurement, value: string) => {
      const updated = [...sizeMeasurements];
      updated[index] = { ...updated[index], [field]: value };
      setSizeMeasurements(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(formData.price.replace(',', '.'));
    const stock = parseInt(formData.stock);
    if (isNaN(price) || isNaN(stock)) return alert("Verifique preço e estoque.");

    const productData = {
      name: formData.name,
      price,
      category: formData.category,
      image: formData.image,
      description: formData.description,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s !== ''),
      stock,
      sizeTable: sizeMeasurements.length > 0 ? sizeMeasurements : undefined
    };

    if (editingProduct) updateProduct(editingProduct.id, productData);
    else addProduct(productData);
    setIsModalOpen(false);
  };

  const requestDelete = (id: number) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete !== null) {
      deleteProduct(productToDelete);
      setDeleteModalOpen(false);
      setProductToDelete(null);
      addToast('Produto excluído com sucesso!', 'info');
    }
  };

  const handleStatusChange = (newStatus: string, orderId?: string) => {
    const idToUpdate = orderId || selectedOrder?.order.id;
    if (idToUpdate) {
        // Atualiza no Contexto/Storage
        updateOrderStatus(idToUpdate, newStatus as any);

        // Atualiza no Modal se estiver aberto
        if (selectedOrder && selectedOrder.order.id === idToUpdate) {
            setSelectedOrder({
                ...selectedOrder,
                order: { ...selectedOrder.order, status: newStatus as any }
            });
        }

        // Atualiza na Lista Local imediatamente (para refletir na tabela sem recarregar tudo)
        setUsersList(prevUsers => prevUsers.map(u => {
            const orderIndex = u.orders.findIndex(o => o.id === idToUpdate);
            if (orderIndex > -1) {
                const newOrders = [...u.orders];
                newOrders[orderIndex] = { ...newOrders[orderIndex], status: newStatus as any };
                return { ...u, orders: newOrders };
            }
            return u;
        }));
        
        addToast('Status do pedido atualizado!', 'success');
    }
  };

  const handleShareProduct = (product: Product) => {
    const baseUrl = window.location.href.split('#')[0];
    const link = `${baseUrl}#/?product=${product.id}`;
    navigator.clipboard.writeText(link);
    addToast('Link do produto copiado!', 'success');
  };

  const handleSaveSettings = () => {
    updateSettings(settingsForm);
    addToast('Configurações salvas com sucesso!', 'success');
  };

  // Lógica para obter e filtrar pedidos
  const getFilteredOrders = () => {
    const orders: {order: Order, user: User}[] = [];
    usersList.forEach(user => {
      if(user.orders && Array.isArray(user.orders)){
        user.orders.forEach(order => orders.push({ order, user }));
      }
    });

    let result = orders.sort((a, b) => new Date(b.order.date).getTime() - new Date(a.order.date).getTime());

    // Filtro por Status
    if (orderStatusFilter !== 'Todas') {
        result = result.filter(item => item.order.status === orderStatusFilter);
    }

    // Filtro por Busca (ID Pedido, Nome Cliente, Email Cliente, ID Cliente)
    if (orderSearchTerm.trim()) {
        const term = orderSearchTerm.toLowerCase();
        result = result.filter(item => 
            item.order.id.toLowerCase().includes(term) ||
            item.user.name.toLowerCase().includes(term) ||
            item.user.email.toLowerCase().includes(term) ||
            item.user.id.toLowerCase().includes(term) ||
            (item.order.shipping?.fullName || '').toLowerCase().includes(term)
        );
    }

    return result;
  };

  if (!isAuthenticated) return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full border-t-4" style={{ borderColor: adminTheme.secondary }}>
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full text-white shadow-lg" style={{ backgroundColor: adminTheme.primary }}>
                <Lock size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-center mb-6" style={{ color: adminTheme.primary }}>Painel Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full border border-gray-300 rounded shadow-sm py-2.5 px-4" placeholder="Senha" />
            <button type="submit" className="w-full py-2.5 text-white rounded shadow-md hover:opacity-90" style={{ backgroundColor: adminTheme.primary }}>Acessar</button>
            <div className="text-center mt-4"><Link to="/" className="text-xs text-gray-500 hover:text-brand-gold">Voltar para a loja</Link></div>
          </form>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      <div className="text-white md:w-64 flex-shrink-0 flex flex-col transition-colors duration-300" style={{ backgroundColor: adminTheme.sidebar }}>
         <div className="p-6 border-b border-white/10 font-serif font-bold text-xl" style={{ color: adminTheme.secondary }}>TAOS Admin</div>
         <nav className="flex-1 p-4 space-y-2">
            {[
                {id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral'},
                {id: 'orders', icon: Package, label: 'Pedidos'},
                {id: 'products', icon: ShoppingBag, label: 'Produtos'},
                {id: 'custom_requests', icon: Wand2, label: 'Ateliê Virtual'},
                {id: 'customers', icon: Users, label: 'Clientes'},
                {id: 'settings', icon: Settings, label: 'Configurações'}
            ].map(item => (
                <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id as any)} 
                    className={`flex items-center w-full px-4 py-3 text-sm rounded-md transition-all duration-200 ${
                        activeTab === item.id ? 'text-white shadow-md' : 'text-gray-300 hover:bg-white/10'
                    }`}
                    style={activeTab === item.id ? { backgroundColor: adminTheme.secondary } : {}}
                >
                    <item.icon size={18} className="mr-3" /> {item.label}
                    {item.id === 'custom_requests' && dashboardStats.pendingRequests > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {dashboardStats.pendingRequests}
                        </span>
                    )}
                </button>
            ))}
         </nav>
         <div className="p-4"><button onClick={handleLogout} className="flex items-center text-gray-400 hover:text-white"><LogOut size={16} className="mr-3"/> Sair</button></div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-gray-800 capitalize">
                    {/* Correção da tradução do título da aba */}
                    {activeTab === 'custom_requests' ? 'Solicitações do Ateliê' : 
                     activeTab === 'settings' ? 'Configurações' : 
                     activeTab === 'products' ? 'Produtos' :
                     activeTab === 'customers' ? 'Clientes' :
                     activeTab === 'orders' ? 'Pedidos' :
                     'Visão Geral'}
                </h2>
                <div className="flex gap-2">
                    <button 
                        onClick={loadData} 
                        className="p-2 bg-white rounded-full shadow hover:opacity-80 transition-opacity flex items-center gap-2 px-4 text-sm font-medium"
                        style={{ color: adminTheme.secondary }}
                    >
                        <RefreshCw size={18}/> Atualizar Dados
                    </button>
                </div>
            </div>

            {/* TAB CONTENT (Dashboard, Orders, etc) - Keeping existing content... */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm font-medium">Faturamento</p><p className="text-2xl font-bold text-gray-900 mt-1">R$ {dashboardStats.totalRevenue.toFixed(2).replace('.', ',')}</p></div><div className="p-3 bg-green-100 rounded-full text-green-600"><DollarSign size={20} /></div></div>
                        </div>
                        <div className="bg-white p-6 rounded shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm font-medium">Pedidos</p><p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.totalOrders}</p></div><div className="p-3 bg-blue-100 rounded-full text-blue-600"><ShoppingBag size={20} /></div></div>
                        </div>
                         <div className="bg-white p-6 rounded shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm font-medium">Clientes</p><p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.totalCustomers}</p></div><div className="p-3 bg-yellow-100 rounded-full text-yellow-600"><Users size={20} /></div></div>
                        </div>
                        <div className="bg-white p-6 rounded shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer hover:border-brand-gold transition-colors" onClick={() => setActiveTab('custom_requests')}>
                            <div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm font-medium">Ateliê Virtual</p><p className="text-2xl font-bold text-gray-900 mt-1">{requests.length}</p></div><div className="p-3 bg-purple-100 rounded-full text-purple-600"><Wand2 size={20} /></div></div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="space-y-4">
                    {/* Filtros de Pedidos */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded shadow-sm">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-3 text-gray-400"/>
                            <input
                                type="text"
                                placeholder="Buscar por ID do pedido, Nome, Email ou ID do Cliente..."
                                value={orderSearchTerm}
                                onChange={(e) => setOrderSearchTerm(e.target.value)}
                                className="pl-10 border rounded-md py-2.5 text-sm w-full focus:ring-brand-gold focus:border-brand-gold outline-none"
                            />
                        </div>
                        <div className="w-full md:w-56 relative">
                            <Filter size={16} className="absolute left-3 top-3 text-gray-400" />
                            <select
                                value={orderStatusFilter}
                                onChange={(e) => setOrderStatusFilter(e.target.value)}
                                className="w-full border rounded-md py-2.5 pl-10 pr-3 text-sm focus:ring-brand-gold focus:border-brand-gold outline-none bg-white cursor-pointer"
                            >
                                <option value="Todas">Todos os Status</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Em Processamento">Em Processamento</option>
                                <option value="Aprovado">Aprovado</option>
                                <option value="Enviado">Enviado</option>
                                <option value="Entregue">Entregue</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr><th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">ID</th><th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Cliente</th><th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-right text-xs text-gray-500 uppercase">Total</th><th className="px-6 py-3"></th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">{getFilteredOrders().length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum pedido encontrado com os filtros atuais.</td></tr>
                            ) : getFilteredOrders().map(({order, user}) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {order.shipping?.fullName || user.name} <br/> 
                                        <span className="text-xs text-gray-500">{user.email}</span>
                                    </td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${
                                    order.status === 'Entregue' ? 'bg-green-100 text-green-800' :
                                    order.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                                    order.status === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>{order.status}</span></td><td className="px-6 py-4 text-sm font-bold text-right">R$ {order.total.toFixed(2).replace('.', ',')}</td><td className="px-6 py-4 text-right"><button onClick={()=>setSelectedOrder({order, user})} className="bg-gray-100 p-2 rounded hover:bg-gray-200" style={{ color: adminTheme.primary }}><Eye size={18}/></button></td></tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'customers' && (
                 <div className="bg-white shadow rounded overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-center text-xs text-gray-500 uppercase">Pedidos</th>
                                <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase">Total Gasto</th>
                                <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">{usersList.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum cliente cadastrado ainda.</td></tr>
                        ) : usersList.map(u => {
                            const totalSpent = u.orders ? u.orders.reduce((acc, curr) => acc + curr.total, 0) : 0;
                            return (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                    <td className="px-6 py-4 text-center text-sm">{u.orders ? u.orders.length : 0}</td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">R$ {totalSpent.toFixed(2).replace('.', ',')}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setSelectedUser(u)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Ver Detalhes</button>
                                    </td>
                                </tr>
                            );
                        })}</tbody>
                    </table>
                 </div>
            )}

            {activeTab === 'products' && (
                <div className="space-y-4">
                    <div className="flex justify-between bg-white p-4 rounded shadow-sm">
                        <div className="relative"><Search size={18} className="absolute left-3 top-2.5 text-gray-400"/><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Buscar produto..." className="pl-10 border rounded-md py-2 text-sm w-64"/></div>
                        <button onClick={() => openModal()} className="flex items-center px-4 py-2 text-white rounded text-sm hover:opacity-90" style={{ backgroundColor: adminTheme.primary }}><Plus size={16} className="mr-2"/> Novo</button>
                    </div>
                     <div className="bg-white shadow rounded overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Produto</th><th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Preço</th><th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estoque</th><th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Ações</th></tr></thead>
                            <tbody className="divide-y divide-gray-200">{filteredProducts.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 flex items-center gap-4">
                                        <img src={p.image} className="w-10 h-10 object-cover rounded"/>
                                        <div>
                                            <div className="font-bold text-gray-900">{p.name}</div>
                                            <div className="text-xs text-gray-500">{p.category}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">R$ {p.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{p.stock}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={()=>handleShareProduct(p)} className="text-teal-600 mr-3 hover:text-teal-800" title="Compartilhar Link"><Share2 size={16}/></button>
                                        <button onClick={()=>openModal(p)} className="text-blue-600 mr-3 hover:text-blue-800"><Edit size={16}/></button>
                                        <button onClick={()=>requestDelete(p.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-8">
                        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <QrCode className="w-6 h-6 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900">Configuração de Pagamento (PIX)</h3>
                            </div>
                            <button
                                onClick={handleSaveSettings}
                                className="flex items-center px-4 py-2 text-white rounded text-sm font-medium hover:opacity-90 shadow-sm"
                                style={{ backgroundColor: adminTheme.secondary }}
                            >
                                <Save size={16} className="mr-2" /> Salvar Alterações
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
                                <input 
                                    type="text" 
                                    value={settingsForm.pixKey} 
                                    onChange={(e) => setSettingsForm({...settingsForm, pixKey: e.target.value})} 
                                    className="block w-full border border-gray-300 rounded shadow-sm py-2 px-4 focus:ring-brand-gold focus:border-brand-gold" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Beneficiário</label>
                                <input 
                                    type="text" 
                                    value={settingsForm.pixName} 
                                    onChange={(e) => setSettingsForm({...settingsForm, pixName: e.target.value})} 
                                    className="block w-full border border-gray-300 rounded shadow-sm py-2 px-4 focus:ring-brand-gold focus:border-brand-gold" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                                <input 
                                    type="text" 
                                    value={settingsForm.pixCity} 
                                    onChange={(e) => setSettingsForm({...settingsForm, pixCity: e.target.value})} 
                                    className="block w-full border border-gray-300 rounded shadow-sm py-2 px-4 focus:ring-brand-gold focus:border-brand-gold" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Modal: Edição/Criação de Produto (Adicionado) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
               <h3 className="text-xl font-serif font-bold text-gray-900">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
               <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="block w-full border border-gray-300 rounded shadow-sm py-2 px-4 focus:ring-brand-gold focus:border-brand-gold" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                    <input required type="text" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="block w-full border border-gray-300 rounded shadow-sm py-2 px-4 focus:ring-brand-gold focus:border-brand-gold" placeholder="0,00" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                    <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="block w-full border border-gray-300 rounded shadow-sm py-2 px-4 focus:ring-brand-gold focus:border-brand-gold" />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <input required type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="block w-full border border-gray-300 rounded shadow-sm py-2 px-4 focus:ring-brand-gold focus:border-brand-gold" placeholder="Ex: Vestidos" />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                    <div className="flex gap-2">
                        <input required type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="block w-full border border-gray-300 rounded shadow-sm py-2 px-4 focus:ring-brand-gold focus:border-brand-gold" placeholder="https://..." />
                        <button type="button" className="p-2 border rounded hover:bg-gray-50" title="Verificar Imagem" onClick={() => window.open(formData.image, '_blank')}><ImageIcon size={20} className="text-gray-500" /></button>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="block w-full border border-gray-300 rounded shadow-sm py-2 px-4 focus:ring-brand-gold focus:border-brand-gold"></textarea>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tamanhos Disponíveis</label>
                    <div className="flex gap-2">
                        <input type="text" value={formData.sizes} onChange={(e) => setFormData({...formData, sizes: e.target.value})} className="block w-full border border-gray-300 rounded shadow-sm py-2 px-4 focus:ring-brand-gold focus:border-brand-gold" placeholder="P, M, G, GG" />
                        <button 
                            type="button" 
                            onClick={generateMeasurementsFields} 
                            className="px-4 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                            title="Gerar campos de medidas para estes tamanhos"
                        >
                            Gerar Tabela
                        </button>
                    </div>
                </div>

                {/* Tabela de Medidas Dinâmica */}
                {sizeMeasurements.length > 0 && (
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded border border-gray-200">
                        <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                            <Ruler size={14} className="text-brand-gold"/> Tabela de Medidas (cm)
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {sizeMeasurements.map((measure, idx) => (
                                <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                                    <div className="text-xs font-bold text-gray-900 bg-white border px-2 py-2 rounded text-center">{measure.size}</div>
                                    <input type="text" placeholder="Busto" value={measure.bust} onChange={(e) => handleMeasurementChange(idx, 'bust', e.target.value)} className="text-xs border border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-brand-gold" />
                                    <input type="text" placeholder="Cintura" value={measure.waist} onChange={(e) => handleMeasurementChange(idx, 'waist', e.target.value)} className="text-xs border border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-brand-gold" />
                                    <input type="text" placeholder="Quadril" value={measure.hip} onChange={(e) => handleMeasurementChange(idx, 'hip', e.target.value)} className="text-xs border border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-brand-gold" />
                                    <input type="text" placeholder="Comp." value={measure.length || ''} onChange={(e) => handleMeasurementChange(idx, 'length', e.target.value)} className="text-xs border border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-brand-gold" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="md:col-span-2 mt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-brand-gold text-white font-medium rounded hover:opacity-90 shadow-sm" style={{ backgroundColor: adminTheme.secondary }}>Salvar Produto</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Pedido - (Mantido igual) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div><h3 className="text-xl font-bold font-serif text-gray-900">Pedido #{selectedOrder.order.id}</h3><p className="text-sm text-gray-500">{new Date(selectedOrder.order.date).toLocaleString()}</p></div>
                    <button onClick={()=>setSelectedOrder(null)}><X size={24} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="bg-white border rounded p-4 shadow-sm">
                            <h4 className="font-bold flex items-center text-sm uppercase text-brand-gold mb-3 border-b pb-2"><Users size={14} className="mr-2"/> Dados do Cliente</h4>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p><span className="font-semibold">Nome Conta:</span> {selectedOrder.user.name}</p>
                                <p><span className="font-semibold">Email:</span> {selectedOrder.user.email}</p>
                                <p><span className="font-semibold">Tel:</span> {selectedOrder.user.phone || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div className="bg-white border rounded p-4 shadow-sm">
                            <h4 className="font-bold flex items-center text-sm uppercase text-brand-gold mb-3 border-b pb-2"><Truck size={14} className="mr-2"/> Entrega</h4>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p><span className="font-semibold">Recebedor:</span> {selectedOrder.order.shipping?.fullName || 'N/A'}</p>
                                <p><span className="font-semibold">CPF:</span> {selectedOrder.order.shipping?.cpf || 'Não informado'}</p>
                                <div className="mt-2 p-2 bg-gray-50 rounded">
                                    <p className="font-medium text-gray-900">
                                        {selectedOrder.order.shipping?.address || 'Endereço não informado'}, {selectedOrder.order.shipping?.number || 'S/N'}
                                    </p>
                                    <p className="text-gray-600">
                                        {selectedOrder.order.shipping?.neighborhood || ''} 
                                        {selectedOrder.order.shipping?.complement ? ` - ${selectedOrder.order.shipping?.complement}` : ''}
                                    </p>
                                    <p className="text-gray-600">
                                        {selectedOrder.order.shipping?.city || ''} - {selectedOrder.order.shipping?.zipCode || ''}
                                    </p>
                                </div>
                                {selectedOrder.order.shipping?.observations && (
                                    <p className="mt-2 text-xs italic text-gray-500">Obs: "{selectedOrder.order.shipping.observations}"</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                         <div className="bg-white border rounded p-4 shadow-sm mb-4">
                            <h4 className="font-bold flex items-center text-sm uppercase text-brand-gold mb-3 border-b pb-2"><Clock size={14} className="mr-2"/> Status & Pagamento</h4>
                            <select className="w-full border rounded p-2 mb-3 bg-gray-50 text-sm font-medium text-gray-900" value={selectedOrder.order.status} onChange={(e)=>handleStatusChange(e.target.value)}>
                                <option value="Pendente">Pendente</option>
                                <option value="Em Processamento">Em Processamento</option>
                                <option value="Aprovado">Aprovado</option>
                                <option value="Enviado">Enviado</option>
                                <option value="Entregue">Entregue</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                            <p className="text-sm text-gray-600 flex items-center">
                                <CreditCard size={14} className="mr-2"/> 
                                {selectedOrder.order.shipping?.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}
                            </p>
                         </div>

                         <div className="bg-white border rounded p-4 shadow-sm">
                            <h4 className="font-bold flex items-center text-sm uppercase text-brand-gold mb-3 border-b pb-2"><ShoppingBag size={14} className="mr-2"/> Itens do Pedido</h4>
                            <div className="max-h-60 overflow-y-auto divide-y">
                                {selectedOrder.order.items && selectedOrder.order.items.length > 0 ? (
                                    selectedOrder.order.items.map((item, i) => (
                                        <div key={i} className="py-2 flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                                    <img src={item.image} className="w-full h-full object-cover"/>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-xs text-gray-500">Tam: {item.selectedSize}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-900">x{item.quantity}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-red-500 italic py-2">Lista de itens vazia ou indisponível.</p>
                                )}
                            </div>
                         </div>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 flex justify-between items-center border-t">
                    <span className="font-medium text-gray-600">Total do Pedido</span>
                    <span className="text-2xl font-bold" style={{ color: adminTheme.secondary }}>R$ {selectedOrder.order.total?.toFixed(2).replace('.', ',') || '0,00'}</span>
                </div>
            </div>
        </div>
      )}

      {/* Modal: Detalhes do Cliente - (Mantido igual) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-white rounded-lg w-full max-w-lg p-0 shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-500 shadow-sm">
                            {selectedUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{selectedUser.name}</h3>
                            <p className="text-xs text-gray-500">Cliente desde {new Date(parseInt(selectedUser.id)).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedUser(null)}
                        className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                            <Mail className="text-gray-400" size={18} />
                            <div className="overflow-hidden">
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-900 truncate" title={selectedUser.email}>{selectedUser.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                            <Phone className="text-gray-400" size={18} />
                            <div>
                                <p className="text-xs text-gray-500">Telefone</p>
                                <p className="text-sm font-medium text-gray-900">{selectedUser.phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <h4 className="font-bold flex items-center text-sm uppercase text-gray-500 mb-3 border-b pb-2">
                        <ShoppingBag size={14} className="mr-2"/> Histórico de Pedidos ({selectedUser.orders?.length || 0})
                    </h4>
                    
                    <div className="space-y-3">
                        {selectedUser.orders && selectedUser.orders.length > 0 ? (
                            selectedUser.orders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(order => (
                                <div key={order.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${
                                            order.status === 'Entregue' ? 'bg-green-100 text-green-600' :
                                            order.status === 'Cancelado' ? 'bg-red-100 text-red-600' :
                                            'bg-yellow-100 text-yellow-600'
                                        }`}>
                                            <Package size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Pedido #{order.id}</p>
                                            <p className="text-xs text-gray-500 flex items-center">
                                                <Calendar size={10} className="mr-1"/> {new Date(order.date).toLocaleDateString()}
                                                <span className="mx-1">•</span>
                                                {order.status}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm">
                                        R$ {order.total.toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4 italic bg-gray-50 rounded">Nenhum pedido realizado ainda.</p>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button 
                        onClick={() => {
                            const url = `https://wa.me/55${selectedUser.phone?.replace(/\D/g, '') || ''}`;
                            window.open(url, '_blank');
                        }}
                        disabled={!selectedUser.phone}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                    >
                        <MessageCircle size={16} /> WhatsApp
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão - (Mantido igual) */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Excluir Produto?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;