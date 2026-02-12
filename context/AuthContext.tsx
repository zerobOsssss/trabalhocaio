import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { User, Order } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, phone: string) => boolean;
  logout: () => void;
  addOrderToHistory: (order: Order) => void;
  getAllUsers: () => User[];
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Inicialização robusta do usuário logado (Sessão)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('taos_current_user');
      if (!storedUser) return null;
      return JSON.parse(storedUser);
    } catch (e) {
      console.error("Erro ao restaurar sessão:", e);
      return null;
    }
  });

  // 2. Funções auxiliares de Storage (puras, sem dependências de estado)
  const getStoredUsers = (): User[] => {
    try {
      const usersStr = localStorage.getItem('taos_users');
      return usersStr ? JSON.parse(usersStr) : [];
    } catch (e) {
      console.error("Erro ao ler usuários:", e);
      return [];
    }
  };

  const setStoredUsers = (users: User[]) => {
    try {
      localStorage.setItem('taos_users', JSON.stringify(users));
    } catch (e) {
      console.error("Erro ao salvar usuários:", e);
    }
  };

  // 3. Login: Lê sempre do storage fresco para garantir dados atualizados
  const login = useCallback((email: string, password: string): boolean => {
    const users = getStoredUsers();
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('taos_current_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  }, []);

  // 4. Register: Lê, verifica duplicidade e salva atomicamente
  const register = useCallback((name: string, email: string, password: string, phone: string): boolean => {
    const users = getStoredUsers();
    
    // Verifica se email já existe
    if (users.some(u => u.email === email)) {
      return false; 
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password,
      phone,
      orders: []
    };

    // Adiciona novo usuário à lista e salva
    const updatedUsers = [...users, newUser];
    setStoredUsers(updatedUsers);
    
    // Define sessão atual
    setUser(newUser);
    localStorage.setItem('taos_current_user', JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('taos_current_user');
  }, []);

  // 5. Atualização de Pedidos: Garante sincronia entre sessão e banco de dados
  const addOrderToHistory = useCallback((order: Order) => {
    setUser((currentUser) => {
        if (!currentUser) return null;

        const updatedUser = { ...currentUser, orders: [order, ...currentUser.orders] };
        
        // Atualiza storage da sessão
        localStorage.setItem('taos_current_user', JSON.stringify(updatedUser));

        // Atualiza banco de usuários
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex >= 0) {
            users[userIndex] = updatedUser;
        } else {
            // Self-healing: Se o usuário logado não estiver no banco (por erro anterior), adiciona agora.
            users.push(updatedUser);
        }
        setStoredUsers(users);

        return updatedUser;
    });
  }, []);

  // 6. Atualização de Status (Admin): Atualiza banco e reflete na sessão se for o usuário logado
  const updateOrderStatus = useCallback((orderId: string, newStatus: Order['status']) => {
    const users = getStoredUsers();
    let updated = false;
    let targetUserId: string | null = null;

    const updatedUsersList = users.map(u => {
      const orderIndex = u.orders.findIndex(o => o.id === orderId);
      if (orderIndex > -1) {
        const updatedOrders = [...u.orders];
        updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], status: newStatus };
        updated = true;
        targetUserId = u.id;
        return { ...u, orders: updatedOrders };
      }
      return u;
    });

    if (updated) {
      setStoredUsers(updatedUsersList);
      
      // Se o usuário afetado for o mesmo que está logado, atualiza o estado local dele
      setUser((currentUser) => {
          if (currentUser && currentUser.id === targetUserId) {
              const updatedCurrentUser = updatedUsersList.find(u => u.id === currentUser.id) || currentUser;
              localStorage.setItem('taos_current_user', JSON.stringify(updatedCurrentUser));
              return updatedCurrentUser;
          }
          return currentUser;
      });
    }
  }, []);

  const getAllUsers = useCallback(() => {
      return getStoredUsers();
  }, []);

  const contextValue = useMemo(() => ({
    user, 
    login, 
    register, 
    logout, 
    addOrderToHistory,
    getAllUsers,
    updateOrderStatus,
    isAuthenticated: !!user 
  }), [user, login, register, logout, addOrderToHistory, getAllUsers, updateOrderStatus]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};