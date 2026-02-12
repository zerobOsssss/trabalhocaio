
export interface SizeMeasurement {
  size: string;
  bust: string;
  waist: string;
  hip: string;
  length?: string; // Comprimento da peça
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  sizes: string[];
  stock: number;
  sizeTable?: SizeMeasurement[]; // Nova tabela de medidas personalizada
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

export interface ShippingDetails {
  fullName: string;
  cpf: string;
  phone: string;
  address: string; // Logradouro (Rua/Av)
  number: string; // Novo: Número da casa
  complement?: string; // Novo: Complemento
  neighborhood: string; // Novo: Bairro
  city: string; // Cidade - UF
  zipCode: string;
  paymentMethod: 'credit_card' | 'pix';
  observations?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  shipping: ShippingDetails;
  status: 'Pendente' | 'Em Processamento' | 'Aprovado' | 'Enviado' | 'Entregue' | 'Cancelado';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  orders: Order[];
}

export interface CustomRequest {
  id: string;
  date: string;
  clientName: string;
  clientContact: string;
  occasion: string;
  originalIdea: string;
  aiRefinement: string;
  status: 'Novo' | 'Em Análise' | 'Aprovado' | 'Finalizado';
}
