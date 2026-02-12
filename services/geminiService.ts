import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getStylingAdvice = async (productName: string, productDescription: string): Promise<string> => {
  if (!apiKey) {
    return "O consultor de estilo virtual está indisponível no momento.";
  }

  try {
    const prompt = `
      Atue como uma consultora de moda experiente e elegante da loja 'TAOS CONFECÇÕES'.
      Eu estou interessada no produto: "${productName}".
      Descrição do produto: "${productDescription}".

      Por favor, me dê 3 dicas curtas e sofisticadas de como usar esta peça.
      Sugira combinações de acessórios, sapatos ou ocasiões ideais.
      O tom deve ser amigável, profissional e encorajador.
      Responda em português do Brasil. Use no máximo 100 palavras.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Desculpe, não consegui gerar dicas no momento.";
  } catch (error) {
    console.error("Error fetching styling advice:", error);
    return "Não foi possível conectar ao consultor de estilo.";
  }
};

export const refineDesignIdea = async (userIdea: string, occasion: string): Promise<string> => {
    if (!apiKey) {
      return "Serviço de IA indisponível (Chave API ausente).";
    }
  
    try {
      const prompt = `
        Você é uma costureira profissional e estilista sênior da 'TAOS CONFECÇÕES'.
        Uma cliente tem uma ideia para uma roupa sob medida, mas não sabe os termos técnicos.
        
        Ideia da cliente: "${userIdea}"
        Ocasião de uso: "${occasion}"
  
        Sua tarefa: Transforme essa ideia vaga em uma "Ficha Técnica" preliminar elegante e detalhada para costura.
        Sugira:
        1. Tecidos recomendados (ex: Seda, Linho, Gabardine).
        2. Tipo de corte e caimento.
        3. Detalhes de acabamento.
        
        Mantenha o tom profissional, inspirador e criativo. Responda em Português do Brasil.
        Não use markdown complexo, apenas parágrafos claros.
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
  
      return response.text || "Não consegui processar sua ideia no momento.";
    } catch (error) {
      console.error("Error refining design:", error);
      return "Erro ao consultar a IA estilista.";
    }
  };