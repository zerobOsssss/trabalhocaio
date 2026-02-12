
import { Product } from './types';

// Medidas Padrão Brasileiras para uso inicial
const STANDARD_SIZES = [
    { size: "PP", bust: "80-84", waist: "62-66", hip: "90-94", length: "-" },
    { size: "P", bust: "84-90", waist: "66-70", hip: "94-98", length: "-" },
    { size: "M", bust: "90-96", waist: "70-76", hip: "98-104", length: "-" },
    { size: "G", bust: "96-102", waist: "76-82", hip: "104-110", length: "-" },
    { size: "GG", bust: "102-110", waist: "82-88", hip: "110-116", length: "-" }
];

export const PRODUCTS: Product[] = [
  // Jalecos e Scrubs
  {
    id: 101,
    name: "Jaleco Pediátrico 'Mundo Encantado'",
    price: 149.90,
    category: "Jalecos",
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Jaleco acinturado com estampa de personagens lúdicos. Tecido gabardine premium que não amassa, punhos de malha e bolsos profundos.",
    sizes: ["PP", "P", "M", "G", "GG"],
    stock: 15,
    sizeTable: STANDARD_SIZES
  },
  {
    id: 102,
    name: "Scrub Hospitalar Comfort Flex",
    price: 189.00,
    category: "Jalecos",
    image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Conjunto Scrub (blusa + calça) em tecido tecnológico com elastano. Disponível em Azul Marinho, Vinho e Verde Musgo.",
    sizes: ["P", "M", "G", "GG", "XG"],
    stock: 8,
    sizeTable: STANDARD_SIZES
  },
  {
    id: 103,
    name: "Jaleco Luxo Gola Padre",
    price: 219.90,
    category: "Jalecos",
    image: "https://images.unsplash.com/photo-1584820927907-458fc89a350f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Sofisticação para profissionais. Jaleco branco com detalhes em renda guipir, botões dourados e corte alfaiataria.",
    sizes: ["PP", "P", "M", "G"],
    stock: 4, // Estoque baixo
    sizeTable: STANDARD_SIZES
  },
  
  // Vestidos e Moda Festa
  {
    id: 1,
    name: "Vestido Floral de Verão",
    price: 189.90,
    category: "Vestidos",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Um vestido leve e elegante, perfeito para dias ensolarados. Confeccionado em viscose premium com estampa floral delicada.",
    sizes: ["P", "M", "G"],
    stock: 12,
    sizeTable: [
        { size: "P", bust: "88", waist: "70", hip: "96", length: "100" },
        { size: "M", bust: "94", waist: "76", hip: "102", length: "102" },
        { size: "G", bust: "100", waist: "82", hip: "108", length: "104" }
    ]
  },
  {
    id: 5,
    name: "Vestido de Festa Noturno",
    price: 349.00,
    category: "Festa",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Brilhe em ocasiões especiais. Vestido longo com fenda lateral, decote elegante e tecido com brilho sutil.",
    sizes: ["P", "M", "G"],
    stock: 2, // Estoque crítico
    sizeTable: STANDARD_SIZES
  },
  
  // Casual e Alfaiataria
  {
    id: 2,
    name: "Blusa de Seda Off-White",
    price: 129.50,
    category: "Blusas",
    image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Elegância atemporal. Blusa de toque sedoso, ideal para compor looks de trabalho ou eventos sociais.",
    sizes: ["P", "M", "G", "GG"],
    stock: 20,
    sizeTable: STANDARD_SIZES
  },
  {
    id: 4,
    name: "Conjunto Alfaiataria Linho",
    price: 299.90,
    category: "Conjuntos",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Conjunto moderno e confortável em linho misto. Composto por colete e calça pantacourt.",
    sizes: ["M", "G", "GG"],
    stock: 0, // Esgotado para teste
    sizeTable: STANDARD_SIZES
  },
  {
    id: 7,
    name: "Calça Pantalona Fluida",
    price: 179.90,
    category: "Calças",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Conforto e estilo. Calça pantalona cintura alta em tecido duna, não amassa e veste super bem.",
    sizes: ["38", "40", "42", "44", "46"],
    stock: 10,
    sizeTable: [
        { size: "38", bust: "-", waist: "70", hip: "98", length: "108" },
        { size: "40", bust: "-", waist: "74", hip: "102", length: "109" },
        { size: "42", bust: "-", waist: "78", hip: "106", length: "110" },
        { size: "44", bust: "-", waist: "82", hip: "110", length: "111" },
        { size: "46", bust: "-", waist: "86", hip: "114", length: "112" }
    ]
  },
  {
    id: 6,
    name: "Jaqueta Jeans Bordada",
    price: 210.00,
    category: "Casacos",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Peça única feita à mão. Jaqueta jeans com detalhes bordados florais nas costas.",
    sizes: ["U"],
    stock: 1,
    sizeTable: [
        { size: "Único", bust: "90-100", waist: "70-90", hip: "90-110", length: "55" }
    ]
  }
];
