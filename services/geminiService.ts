
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessingResult, FileData } from "../types";

const API_KEY = process.env.API_KEY || "";

export const processLegalDocuments = async (
  lawName: string,
  lawFiles: FileData[],
  doctrineFiles: FileData[],
  jurisprudenceFiles: FileData[]
): Promise<ProcessingResult> => {
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
    VOCÊ É UM ANALISTA JURÍDICO DE ALTA PERFORMANCE (NÍVEL DELEGADO).
    TEMA DO ESTUDO: "${lawName}"
    
    INSTRUÇÕES DE FILTRAGEM TEMÁTICA:
    1. ESTRUTURA: Siga a ordem dos artigos da LEI SECA enviada.
    2. FILTRO DE JURISPRUDÊNCIA: Ao analisar os arquivos de Jurisprudência, selecione APENAS teses que afetem o tema "${lawName}". Se o arquivo contiver julgados sobre outros ramos do direito ou leis diversas, DESCARTE-OS.
    3. FILTRO DE DOUTRINA: Extraia apenas lições doutrinárias relacionadas a "${lawName}".
    4. INTEGRAÇÃO TRÍADE:
       - Para cada artigo da lei, apresente o texto legal.
       - Adicione a doutrina focada no tema.
       - Adicione as teses jurisprudenciais (STF/STJ) específicas.
    
    FORMATO: JSON puro. Não inclua comentários fora do JSON.
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
        thinkingConfig: { thinkingBudget: 4000 },
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

    const text = response.text;
    if (!text) throw new Error("A IA não retornou dados. Tente reduzir o número de páginas dos PDFs.");
    
    return JSON.parse(text) as ProcessingResult;
  } catch (error: any) {
    console.error("Erro na análise Tríade:", error);
    throw new Error(error.message || "Erro na comunicação com o servidor de IA.");
  }
};
