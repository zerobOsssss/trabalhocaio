import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomRequest } from '../types';
import { useToast } from './ToastContext';

interface CustomRequestContextType {
  requests: CustomRequest[];
  addRequest: (data: Omit<CustomRequest, 'id' | 'date' | 'status'>) => void;
  updateRequestStatus: (id: string, status: CustomRequest['status']) => void;
  deleteRequest: (id: string) => void;
}

const CustomRequestContext = createContext<CustomRequestContextType | undefined>(undefined);

export const CustomRequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState<CustomRequest[]>(() => {
    try {
      const saved = localStorage.getItem('taos_custom_requests');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Erro ao carregar banco de dados do Ateliê:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('taos_custom_requests', JSON.stringify(requests));
  }, [requests]);

  const addRequest = (data: Omit<CustomRequest, 'id' | 'date' | 'status'>) => {
    const newRequest: CustomRequest = {
      ...data,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: 'Novo',
    };
    setRequests(prev => [newRequest, ...prev]);
    addToast('Solicitação enviada para o nosso sistema!', 'success');
  };

  const updateRequestStatus = (id: string, status: CustomRequest['status']) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    addToast('Status da solicitação atualizado.', 'info');
  };

  const deleteRequest = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    addToast('Solicitação removida do sistema.', 'info');
  };

  return (
    <CustomRequestContext.Provider value={{ requests, addRequest, updateRequestStatus, deleteRequest }}>
      {children}
    </CustomRequestContext.Provider>
  );
};

export const useCustomRequest = () => {
  const context = useContext(CustomRequestContext);
  if (context === undefined) {
    throw new Error('useCustomRequest must be used within a CustomRequestProvider');
  }
  return context;
};