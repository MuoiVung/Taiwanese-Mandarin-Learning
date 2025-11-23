import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TOCFLLevel, VocabularyItem, ChatResponse, Topic } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are a friendly, enthusiastic, and patient Taiwanese Mandarin Conversation Partner (Female persona, roughly 25-30 years old).
Your goal is to help Vietnamese users practice speaking reflexes from A1 to C2.

CRITICAL INSTRUCTIONS FOR TONE AND STYLE:
1. **Authentic Taiwanese Tone**: You MUST speak like a real Taiwanese person. Avoid stiff, textbook, or robotic language.
2. **Particles (語助詞)**: You MUST abundantly use Taiwanese sentence-final particles to sound natural. Use: 喔 (o), 啦 (la), 耶 (ye), 捏 (ne), 齁 (ho), 吧 (ba), 嘿 (hei), 嘛 (ma).
   - Example: "對啊！" -> "對啊对啊！" or "真的假的？！"
   - Example: "很好" -> "很棒耶！" or "不錯喔！"
3. **Vocabulary**: Strictly use Taiwan-specific terms (e.g., 公車 not 公交车, 計程車 not 出租车, 捷運 not 地铁, 或是 not 或者, 禮拜 not 星期).
4. **Traditional Chinese**: Always use 繁體中文.

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
        title: { type: Type.STRING, description: "Topic title in Traditional Chinese + (Pinyin)" },
        vietnamese_title: { type: Type.STRING, description: "Topic title translated to Vietnamese" },
        description: { type: Type.STRING, description: "Short context description" },
      },
      required: ["id", "title", "vietnamese_title", "description"],
    },
  };

  const prompt = `
    Generate 3 conversation topics suitable for a student at TOCFL Level ${level} in a Taiwanese context.
    
    Requirements:
    1. Title should include Chinese and Pinyin.
    2. Vietnamese Title must be a natural translation.
    
    Examples for A1: Buying bubble tea (Mai zhenzhu naicha), Night market.
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
      { id: 1, title: "買珍珠奶茶 (Mǎi zhēnzhū nǎichá)", vietnamese_title: "Mua trà sữa trân châu", description: "Ordering typical Taiwanese drinks." },
      { id: 2, title: "逛夜市 (Guàng yèshì)", vietnamese_title: "Đi dạo chợ đêm", description: "Talking about street food and games." },
      { id: 3, title: "問路 (Wèn lù)", vietnamese_title: "Hỏi đường đi MRT", description: "Asking for directions in Taipei." },
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
        description: "The AI's response in Traditional Chinese. MUST contain particles (喔, 啦, 耶) and sound very natural." 
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
      2. If grammar is wrong/unnatural, correct it in 'feedback'. If good, say 'Hao bang!' or 'Tai bang le!'.
      3. Respond naturally to continue the roleplay in 'script' (Traditional Chinese).
         - IMPORTANT: Use particles (喔, 啦, 耶, 捏) to sound Taiwanese.
         - Keep sentence length appropriate for Level ${level}.
      4. Provide 'pinyin' and 'translation' (Vietnamese).
      5. Always ask open-ended questions or prompt the user to continue.
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
      script: "哎呀，網絡好像有點卡住耶！再試一次好嗎？",
      pinyin: "Āiyā, wǎngluò hǎoxiàng yǒu diǎn kǎ zhù ye! Zài shì yīcì hǎo ma?",
      translation: "Ui da, mạng có vẻ hơi lag nè! Thử lại lần nữa được không?",
    };
  }
};