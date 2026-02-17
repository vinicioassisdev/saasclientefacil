
import { GoogleGenAI } from "@google/genai";
import { Client, ClientStatus, PaymentStatus } from "../types";

export const generateFollowUpMessage = async (client: Client): Promise<string> => {
  // Initialize GoogleGenAI using process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let context = "";
  if (client.paymentStatus === PaymentStatus.VENCIDO) {
    context = "cobrança de pagamento vencido de forma educada e profissional";
  } else if (client.status === ClientStatus.PROPOSTA_ENVIADA) {
    context = "lembrete amigável sobre uma proposta enviada há alguns dias";
  } else if (client.status === ClientStatus.NEGOCIACAO) {
    context = "retomada de contato para fechar o serviço";
  } else {
    context = "manter contato e saber se precisa de algo mais";
  }

  const prompt = `
    Você é um assistente de CRM para autônomos brasileiros. 
    Gere uma mensagem curta, direta e amigável para enviar via WhatsApp para o cliente ${client.name}.
    O serviço é: ${client.service}.
    O objetivo é: ${context}.
    Escreva em Português do Brasil (PT-BR). 
    A mensagem deve ser pronta para ser enviada, sem placeholders como [Nome].
    Não use emojis em excesso.
  `;

  try {
    // Correct usage of generateContent with model name and prompt string
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });

    // Access the text property directly from the response object
    return response.text?.trim() || "Olá, gostaria de dar um retorno sobre nosso último contato.";
  } catch (error) {
    console.error("Erro ao gerar mensagem Gemini:", error);
    return `Olá ${client.name}, estou passando para dar um retorno sobre o serviço de ${client.service}. Como podemos prosseguir?`;
  }
};
