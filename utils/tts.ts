
export const getBestVoice = (voices: SpeechSynthesisVoice[]) => {
  // 1. Broad filter for any Chinese/Mandarin voice (zh, cmn, zho)
  const zhVoices = voices.filter(v => {
      const lang = v.lang.toLowerCase().replace('_', '-');
      return lang.includes('zh') || lang.includes('cmn') || lang.includes('zho');
  });
  
  // 2. Desktop High Quality (Edge/Online)
  const msNatural = zhVoices.find(v => v.name.includes('HsiaoChen') || v.name.includes('YunJhe'));
  if (msNatural) return msNatural;

  // 3. macOS / iOS High Quality
  const apple = zhVoices.find(v => v.name.includes('Mei-Jia') || v.name.includes('Sin-Ji'));
  if (apple) return apple;

  // 4. Android/Chrome General Strategy (Prioritize TW region)
  // Android often uses 'cmn-TW' or 'zh_TW' or 'zho-TW'
  const twVoices = zhVoices.filter(v => {
      const lang = v.lang.toLowerCase().replace('_', '-');
      return lang.includes('tw') || v.name.includes('Taiwan') || v.name.includes('台灣');
  });

  if (twVoices.length > 0) {
      // Try to find a "Google" or "Network" voice first (better quality)
      const highQualityTw = twVoices.find(v => 
          v.name.includes('Google') || v.name.includes('Network') || v.name.includes('Online')
      );
      return highQualityTw || twVoices[0];
  }

  // 5. Fallback to Mainland Chinese if no TW available (Better than English)
  return zhVoices.find(v => v.lang.toLowerCase().includes('cn')) || zhVoices[0];
};

export const playTTS = (
  text: string, 
  onStart?: () => void, 
  onEnd?: () => void,
  onError?: (e: any) => void
) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const bestVoice = getBestVoice(voices);

  if (bestVoice) {
    utterance.voice = bestVoice;
    utterance.lang = bestVoice.lang; 
    
    // Smart Rate Adjustment
    const isNatural = bestVoice.name.includes('Natural') || bestVoice.name.includes('Online');
    utterance.rate = isNatural ? 0.9 : 1.0; 
  } else {
    // LAST RESORT: Force system to use Taiwan Mandarin
    utterance.lang = 'zh-TW'; 
    utterance.rate = 1.0;
  }
  
  utterance.pitch = 1.0;

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  window.speechSynthesis.speak(utterance);
};

export const stopTTS = () => {
  window.speechSynthesis.cancel();
};
