import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TOCFLLevel, VocabularyItem, ChatResponse, Topic } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are a friendly, patient Taiwanese Mandarin Conversation Partner (Female, ~25-30 years old).
Your goal is to help Vietnamese users practice speaking reflexes from A1 to C2.

CRITICAL INSTRUCTIONS FOR TONE AND STYLE:
1. **Natural & Authentic**: Speak like a real person chatting with a friend. Avoid "textbook" phrasing, but do not be overly slangy.
2. **Particles (語助詞)**: Use Taiwanese particles (喔, 啦, 耶, 捏, 齁, 吧) *only when necessary* to express emotion, soften the tone, or show intimacy.
   - **DO NOT** force a particle at the end of every sentence. Use them sparingly and naturally.
3. **Concise & Direct**: Keep responses short, clear, and useful. Avoid long, complex monologues unless the C1/C2 level requires it.
4. **Vocabulary**: Strictly use Taiwan-specific terms (e.g., 公車, 計程車, 捷運, 禮拜, 或是).
5. **Traditional Chinese**: Always use 繁體中文.

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
        description: "Correction of user's grammar (in Vietnamese/Pinyin). If correct, simply say 'Hao bang!'." 
      },
      script: { 
        type: Type.STRING, 
        description: "The AI's response in Traditional Chinese. Conversational, natural flow." 
      },
      pinyin: { 
        type: Type.STRING, 
        description: "Full Pinyin for the AI's response." 
      },
      translation: { 
        type: Type.STRING, 
        description: "Full Vietnamese translation of the AI's response." 
      },
      segments: {
        type: Type.ARRAY,
        description: "Break down the 'script' into individual words/phrases for interactive learning.",
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The specific Chinese word or phrase" },
            pinyin: { type: Type.STRING, description: "Pinyin for this specific segment" },
            meaning: { type: Type.STRING, description: "Vietnamese meaning for this specific segment" }
          },
          required: ["text", "pinyin", "meaning"]
        }
      },
      suggestion: { 
        type: Type.STRING, 
        description: "A short suggested response for the user to say next (optional)." 
      },
    },
    required: ["feedback", "script", "pinyin", "translation", "segments"],
  };

  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}
      Current Context: Level ${level}, Topic: "${topic}".
      
      Protocol:
      1. Analyze user input.
      2. **Feedback**: If there is a grammar/vocabulary error, gently correct it in 'feedback'. If it is natural, praise briefly.
      3. **Script**: Respond naturally to the context. 
      4. **Segmentation**: You MUST break down your 'script' into the 'segments' array. Every character in the script must be covered by a segment.
         Example: Script="今天天氣很好" -> segments=[{text:"今天", pinyin:"jīntiān", meaning:"hôm nay"}, {text:"天氣", pinyin:"tiānqì", meaning:"thời tiết"}, {text:"很好", pinyin:"hěn hǎo", meaning:"rất tốt"}]
      5. Provide 'pinyin' and 'translation' for the full sentence.
      6. **Engagement**: Always ask a follow-up question or give a prompt to keep the conversation moving.
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
      script: "哎呀，網絡好像有點卡住耶，再試一次好嗎？",
      pinyin: "Āiyā, wǎngluò hǎoxiàng yǒu diǎn kǎ zhù ye, zài shì yīcì hǎo ma?",
      translation: "Ui da, mạng có vẻ hơi lag nè, thử lại lần nữa được không?",
      segments: [
        { text: "哎呀", pinyin: "Āiyā", meaning: "Ui da" },
        { text: "，", pinyin: "", meaning: "" },
        { text: "網絡", pinyin: "wǎngluò", meaning: "mạng" },
        { text: "好像", pinyin: "hǎoxiàng", meaning: "có vẻ" },
        { text: "有點", pinyin: "yǒu diǎn", meaning: "hơi" },
        { text: "卡住", pinyin: "kǎ zhù", meaning: "bị kẹt/lag" },
        { text: "耶", pinyin: "ye", meaning: "nè" },
        { text: "，", pinyin: "", meaning: "" },
        { text: "再", pinyin: "zài", meaning: "lại" },
        { text: "試", pinyin: "shì", meaning: "thử" },
        { text: "一次", pinyin: "yīcì", meaning: "một lần" },
        { text: "好嗎", pinyin: "hǎo ma", meaning: "được không" },
        { text: "？", pinyin: "", meaning: "" }
      ]
    };
  }
};