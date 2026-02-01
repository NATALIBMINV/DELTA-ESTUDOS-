
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessingResult, FileData } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Função auxiliar para garantir que a resposta seja um JSON válido,
 * removendo possíveis marcações de markdown do modelo.
 */
const cleanJsonResponse = (text: string): string => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const processLegalDocuments = async (
  lawName: string,
  lawFiles: FileData[],
  doctrineFiles: FileData[],
  jurisprudenceFiles: FileData[]
): Promise<ProcessingResult> => {
  if (!API_KEY) throw new Error("API Key não configurada no ambiente.");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const lawParts = lawFiles.map(file => ({
    inlineData: { data: file.base64, mimeType: file.type }
  }));

  const doctrineParts = doctrineFiles.map(file => ({
    inlineData: { data: file.base64, mimeType: file.type }
  }));

  const jurisprudenceParts = jurisprudenceFiles.map(file => ({
    inlineData: { data: file.base64, mimeType: file.type }
  }));

  const prompt = `
    VOCÊ É UM ANALISTA JURÍDICO DE ALTA PERFORMANCE (ESPECIALISTA EM CARREIRAS DELTA).
    O TEMA CENTRAL DESTE ESTUDO É: "${lawName}"
    
    SUA MISSÃO É INTEGRAR AS TRÊS FONTES (LEI, DOUTRINA E JURISPRUDÊNCIA) SEGUINDO ESTAS REGRAS RÍGIDAS:
    
    1. FILTRAGEM TEMÁTICA (CRITICAL): Os arquivos de Doutrina e Jurisprudência podem conter múltiplos temas. Você deve ANALISAR cada parágrafo e selecionar APENAS o que for pertinente ao tema "${lawName}". Descarte conteúdos sobre outros crimes ou matérias processuais alheias.
    
    2. MAPEAMENTO POR ARTIGO: Use o texto da LEI SECA como base. Para cada artigo:
       - Transcreva o texto original.
       - Adicione Doutrina Delta (focada em questões que caem para Delegado).
       - Adicione Jurisprudência (STF/STJ) que tenha RELAÇÃO DIRETA com o artigo ou o tema "${lawName}".
    
    3. QUALIDADE: Se um artigo não tiver jurisprudência específica no material enviado, deixe o campo de jurisprudência como uma lista vazia. Não invente dados.
    
    RETORNE APENAS O JSON, SEM TEXTO EXPLICATIVO.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { text: prompt },
          ...lawParts,
          ...doctrineParts,
          ...jurisprudenceParts
        ]
      },
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 12000 }, // Aumentado para análise temática mais profunda
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lawName: { type: Type.STRING },
            articles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.STRING },
                  statuteText: { type: Type.STRING },
                  doctrine: { type: Type.STRING },
                  jurisprudence: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        court: { type: Type.STRING },
                        centralThesis: { type: Type.STRING },
                        objectiveSummary: { type: Type.STRING }
                      },
                      required: ["court", "centralThesis", "objectiveSummary"]
                    }
                  }
                },
                required: ["number", "statuteText"]
              }
            }
          },
          required: ["lawName", "articles"]
        }
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error("A IA retornou uma resposta vazia.");
    
    const cleanedText = cleanJsonResponse(rawText);
    return JSON.parse(cleanedText) as ProcessingResult;
  } catch (error: any) {
    console.error("Erro Tríade Gemini:", error);
    
    // Tratamento de erros comuns
    if (error instanceof SyntaxError) {
      throw new Error("Erro ao processar a estrutura de dados da IA. Tente novamente ou use arquivos menores.");
    }
    
    if (error?.message?.includes("500") || error?.message?.includes("Rpc")) {
      throw new Error("O volume de páginas é muito grande para uma análise temática profunda. Tente enviar apenas os capítulos pertinentes.");
    }

    throw new Error(error.message || "Falha na conexão com o cérebro jurídico.");
  }
};
