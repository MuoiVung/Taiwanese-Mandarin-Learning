import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TOCFLLevel, VocabularyItem, ChatResponse, Topic } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are a friendly and patient Taiwanese Mandarin Conversation Partner.
Your goal is to help Vietnamese users practice speaking reflexes from A1 to C2 (TOCFL standards).
You MUST use Traditional Chinese (繁體中文).
You MUST use Taiwan-specific vocabulary and phrasing (e.g., 公車 gongche instead of 公交车, 計程車 jichengche instead of 出租车, 捷運 MRT).
The user is Vietnamese.
`;

const modelId = "gemini-2.5-flash";

export const generateTopics = async (level: TOCFLLevel): Promise<Topic[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["id", "title", "description"],
    },
  };

  const prompt = `
    Generate 3 conversation topics suitable for a student at TOCFL Level ${level} in a Taiwanese context.
    Examples for A1: Buying bubble tea, Night market, Asking MRT directions.
    Examples for C1: Economy, Climate Change, Corporate Culture.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as Topic[];
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Error generating topics:", error);
    return [
      { id: 1, title: "買珍珠奶茶", description: "Ordering Bubble Tea" },
      { id: 2, title: "夜市", description: "Visiting a Night Market" },
      { id: 3, title: "問路", description: "Asking for directions" },
    ];
  }
};

export const generateVocabulary = async (level: TOCFLLevel, topic: string): Promise<VocabularyItem[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        chinese: { type: Type.STRING, description: "Traditional Chinese characters" },
        pinyin: { type: Type.STRING, description: "Full pinyin with tones" },
        vietnamese: { type: Type.STRING, description: "Vietnamese meaning" },
      },
      required: ["chinese", "pinyin", "vietnamese"],
    },
  };

  const prompt = `
    The user chose the topic: "${topic}" at Level ${level}.
    List 5-7 most important vocabulary words or sentence patterns for this conversation.
    Use Traditional Chinese.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as VocabularyItem[];
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Error generating vocab:", error);
    return [];
  }
};

export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  userMessage: string,
  level: TOCFLLevel,
  topic: string
): Promise<ChatResponse> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      feedback: { 
        type: Type.STRING, 
        description: "Correction of user's grammar (in Vietnamese/Pinyin) or 'Hao bang!' if correct." 
      },
      script: { 
        type: Type.STRING, 
        description: "The AI's response in Traditional Chinese." 
      },
      pinyin: { 
        type: Type.STRING, 
        description: "Pinyin for the AI's response." 
      },
      translation: { 
        type: Type.STRING, 
        description: "Vietnamese translation of the AI's response." 
      },
      suggestion: { 
        type: Type.STRING, 
        description: "A short suggested response for the user to say next (optional, mostly for A1-A2)." 
      },
    },
    required: ["feedback", "script", "pinyin", "translation"],
  };

  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}
      Current Context: Level ${level}, Topic: "${topic}".
      
      Protocol:
      1. Analyze user input.
      2. If grammar is wrong/unnatural, correct it in 'feedback'. If good, say 'Hao bang!'.
      3. Respond naturally to continue the roleplay in 'script' (Traditional Chinese).
      4. Provide 'pinyin' and 'translation' (Vietnamese).
      5. Always ask open-ended questions to keep the conversation going.
      `,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
    history: history,
  });

  try {
    const result = await chat.sendMessage({ message: userMessage });
    if (result.text) {
      return JSON.parse(result.text) as ChatResponse;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Chat error:", error);
    return {
      feedback: "Lỗi kết nối",
      script: "對不起，我現在有點問題。",
      pinyin: "Duìbùqǐ, wǒ xiànzài yǒu diǎn wèntí.",
      translation: "Xin lỗi, tôi đang gặp chút vấn đề.",
    };
  }
};