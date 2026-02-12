import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StoreSettings {
  pixKey: string;
  pixName: string;
  pixCity: string;
}

interface SettingsContextType {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
}

const defaultSettings: StoreSettings = {
  pixKey: '',
  pixName: 'TAOS CONFECCOES', // Sem acento por padrão para evitar erro no PIX
  pixCity: 'SAO PAULO'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('taos_store_settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch (error) {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('taos_store_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
