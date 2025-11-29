
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TOCFLLevel, VocabularyItem, ChatResponse, Topic } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are a friendly, patient Taiwanese Mandarin Conversation Partner (Female, ~25-30 years old).
Your goal is to help Vietnamese users practice speaking reflexes.

CRITICAL INSTRUCTIONS FOR TONE AND STYLE (AI PERSONA):

1. **Natural & Authentic (Casual/Semi-Formal)**:
   - Speak like a normal Taiwanese friend. Polite but not stiff/textbook.
   - Use daily life vocabulary (e.g., use "禮拜" instead of "星期", "我也覺得" instead of "本人認為", "計程車" instead of "出租車").
   - **Traditional Chinese (繁體中文)** ONLY.

2. **STRICT LIMIT on Modal Particles (語助詞) - "CLEAN SPEAKING"**:
   - **PROBLEM**: You are currently overusing particles (喔, 啦, 耶, 捏, 齁). It sounds annoying and fake.
   - **NEW RULE**: In 90% of your sentences, **DO NOT** use a particle at the end. Just end with a period.
   - **Strict Usage Guidelines**:
     * **FORBIDDEN**: Do not use "喔", "耶", "捏", "啦" in simple statements. (e.g., Say "這是我的書。" NOT "這是我的書喔。")
     * **ALLOWED**:
       - "吧" (ba): Only for uncertainty or soft suggestions (e.g., "我們走吧").
       - "嗎/呢" (ma/ne): For questions (e.g., "你呢？").
       - "啊" (a): Only for exclamation or realization, use sparingly.
   - **Tone**: Calm, helpful, direct. Not "cutesy" or overly enthusiastic.

3. **Conversation Logic**:
   - **Concise First**: Get to the point. Answer the question or react directly first.
   - **Don't Lecture**: Avoid long paragraphs unless the user asks for a deep explanation (C1/C2).
   - **Flow**: Keep it conversational, not like a robot reading a script.

4. **FEEDBACK PROTOCOL (CRITICAL)**:
   - You act as a strict but helpful tutor.
   - **Analyze EVERY user message** for grammar, vocabulary, unnatural phrasing, or Mainland vs. Taiwan usage differences.
   - **If the user makes a mistake or sounds unnatural**: You MUST provide a specific correction in the 'feedback' field. Explain briefly why.
     (e.g., "You said 'Wo bu zhi dao', naturally in Taiwan we say 'Wo bu xiao de'. Correct: ...")
   - **If the user is correct**: Simply confirm with "Hao bang!", "Chuẩn rồi!", or "Nói rất tự nhiên!".

The user is Vietnamese.
`;

const modelId = "gemini-2.5-flash";

// Topic Banks Definition - Expanded for variety
const TOPIC_BANKS: Record<string, { category: string; topics: string[] }[]> = {
  'A1_A2': [
    {
      category: 'Survival (Sinh tồn)',
      topics: [
        'Ordering bubble tea (sugar/ice settings)', 
        'Ordering Hotpot (meat selection, broth)', 
        'Buying train tickets at HSR station', 
        'Shopping at 7-Eleven (picking up packages, paying bills)',
        'Asking for directions to the nearest MRT',
        'Renting a YouBike',
        'Seeing a doctor (stomach ache, cold)',
        'Bargaining at a clothing shop'
      ]
    },
    {
      category: 'Daily Life (Đời sống)',
      topics: [
        'Self-introduction to a new neighbor', 
        'Talking about family members', 
        'Daily routine (school/work)', 
        'Describing the weather (Typhoon days)', 
        'Talking about hobbies (hiking, eating)',
        'Making a reservation at a restaurant'
      ]
    },
    {
      category: 'Culture (Văn hóa)',
      topics: [
        'Night Market food tour', 
        'Garbage collection truck culture (Why music?)', 
        'Receipt Lottery (Fapiao) excitement', 
        'Mid-Autumn Festival BBQ culture',
        'Lunar New Year traditions',
        'Queuing culture in MRT'
      ]
    }
  ],
  'B1_B2': [
    {
      category: 'Emotions (Cảm xúc)',
      topics: [
        'Complaining about a boss/colleague', 
        'Sharing good news (promotion)', 
        'Relationship advice (breakup, dating)', 
        'Life stress and burnout',
        'Expressing disappointment',
        'Encouraging a friend'
      ]
    },
    {
      category: 'Travel & Experience (Trải nghiệm)',
      topics: [
        'Planning a round-island trip (Huan Dao)', 
        'Hiking Yangmingshan or Elephant Mountain', 
        'Trip to Kenting/Hualien', 
        'Camping trends in Taiwan',
        'Visiting Jiufen Old Street',
        'Hot spring experience in Beitou'
      ]
    },
    {
      category: 'Society (Xã hội)',
      topics: [
        'High housing prices in Taipei', 
        'Office culture (Overtime)', 
        'Social media trends (IG/Threads)', 
        'Online shopping addiction',
        'Convenience store culture importance',
        'Scooter traffic in rush hour'
      ]
    }
  ],
  'C1_C2': [
    {
      category: 'Deep/Specialized (Chuyên sâu)',
      topics: [
        'Semiconductor industry impact (TSMC)', 
        'Economic challenges for youth', 
        'Cross-strait relations impact on daily life', 
        'Taiwan healthcare system pros/cons',
        'Green energy and nuclear power debate',
        'AI technology future'
      ]
    },
    {
      category: 'Abstract (Trừu tượng)',
      topics: [
        'Work-life balance philosophy', 
        'Gender equality progress', 
        'Future of education', 
        'Minimalist lifestyle',
        'Impact of globalization on local culture',
        'Definition of success'
      ]
    }
  ]
};

const getTopicPromptForLevel = (level: TOCFLLevel): string => {
  let bankKey = 'A1_A2';
  if (level === 'B1' || level === 'B2') bankKey = 'B1_B2';
  if (level === 'C1' || level === 'C2') bankKey = 'C1_C2';
  
  // If Native, random selection or just fallback to advanced
  if (level === 'Native') bankKey = 'C1_C2';
  
  const categories = TOPIC_BANKS[bankKey];
  
  // Flatten topics for the prompt to give AI context
  const contextString = categories.map(cat => `
    Category: ${cat.category}
    Examples: ${cat.topics.join(', ')}
  `).join('\n');

  return `
    Generate 3 distinct conversation topics for TOCFL Level ${level === 'Native' ? 'Native/Advanced' : level} in a Taiwanese context.
    
    You MUST select topics from different categories provided below to ensure variety. 
    DO NOT output 3 topics from the same category.
    
    Source Material:
    ${contextString}
    
    Requirements:
    1. Title should include Chinese and Pinyin.
    2. Vietnamese Title must be a natural translation.
    3. Context/Description must be specific and interesting.
  `;
};

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

  const prompt = getTopicPromptForLevel(level);

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
        example: { type: Type.STRING, description: "A complete example sentence using this word in Taiwanese context" },
        example_pinyin: { type: Type.STRING, description: "Pinyin for the example sentence" },
        example_meaning: { type: Type.STRING, description: "Vietnamese meaning of the example sentence" },
      },
      required: ["chinese", "pinyin", "vietnamese", "example", "example_pinyin", "example_meaning"],
    },
  };

  const isNative = level === 'Native';
  const levelPrompt = isNative 
    ? "**NATIVE MODE**: Use authentic Taiwanese vocabulary, slang (流行語), and natural idioms. Do not simplify the language. The user wants to learn how people actually speak in Taiwan."
    : `Target Level: **${level}**. Adjust vocabulary difficulty accordingly.`;

  const prompt = `
    The user chose the topic: "${topic}".
    ${levelPrompt}
    List **10 to 15** most important vocabulary words or sentence patterns for this conversation.
    
    Requirements:
    1. Use Traditional Chinese (Taiwanese usage).
    2. Provide a practical example sentence for EACH word.
    3. The example must be natural and related to the topic.
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
        description: "STRICT Feedback in Vietnamese. If user has error: 'Bạn nói [X], câu đúng là [Y]'. If correct: 'Hao bang!'." 
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
      suggestion_pinyin: {
        type: Type.STRING,
        description: "Pinyin for the suggested response."
      },
      suggestion_meaning: {
        type: Type.STRING,
        description: "Vietnamese meaning of the suggested response."
      }
    },
    required: ["feedback", "script", "pinyin", "translation", "segments"],
  };

  const isNative = level === 'Native';
  const instructionAddition = isNative
    ? `
      *** NATIVE/NATURAL MODE ACTIVATED ***
      - The user has NOT set a specific level. 
      - Speak like a **native Taiwanese local**.
      - Use **Slang (流行語)**, natural speed, and idioms where appropriate.
      - DO NOT simplify your sentence structure.
      - Focus on being authentic and "down-to-earth" (接地氣).
      - Still follow the rule of NOT overusing particles (喔/啦), but use them exactly where a native speaker would.
      `
    : `Current Context: Level ${level}. Keep vocabulary appropriate for this level.`;

  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}
      Topic: "${topic}".
      ${instructionAddition}
      
      Protocol:
      1. **STRICT ANALYSIS**: Analyze user input for grammar errors, wrong word choice, or unnatural phrasing.
      2. **Feedback Generation**:
         - **IF ERROR**: You MUST correct it. Format: "Bạn nói [incorrect], người Đài thường nói [correct]. Vì [reason]."
         - **IF CORRECT**: Praise briefly (e.g., "Câu này nói rất chuẩn!", "Hao bang!").
      3. **Script**: Respond naturally to continue the conversation. **DO NOT OVERUSE PARTICLES like 喔/耶/啦**.
      4. **Segmentation**: Break down 'script' into 'segments'.
      5. Provide 'pinyin' and 'translation' for the full sentence.
      6. **Suggestion**: Provide a relevant response the user can say next, including pinyin and meaning.
      7. **Engagement**: Always ask a follow-up question or give a prompt to keep the conversation moving.
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
