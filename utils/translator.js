const fetch = require('node-fetch');

// Translation function with multiple service fallbacks
const translateText = async (text, targetLang = 'en') => {
  // If target language is English or same as source, return original text
  if (targetLang === 'en' || !text || text.trim() === '') {
    return text;
  }

  try {
    // Try LibreTranslate first (free service)
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      body: JSON.stringify({
        q: text.trim(),
        source: 'auto',
        target: targetLang,
        format: 'text'
      }),
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'InfoMed-QRSystem/1.0'
      },
      timeout: 10000 // 10 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      if (data.translatedText && data.translatedText.trim() !== '') {
        return data.translatedText;
      }
    }
  } catch (error) {
    console.warn('LibreTranslate failed:', error.message);
  }

  try {
    // Fallback to MyMemory (alternative free service)
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'InfoMed-QRSystem/1.0'
      },
      timeout: 10000
    });

    if (response.ok) {
      const data = await response.json();
      if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
    }
  } catch (error) {
    console.warn('MyMemory translation failed:', error.message);
  }

  console.warn(`Translation failed for text: "${text.substring(0, 50)}..." to ${targetLang}`);
  return text; // Return original text if all services fail
};

// Translate multiple texts with improved error handling
const translateTexts = async (texts, targetLang = 'en') => {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  if (targetLang === 'en') {
    return texts; // No need to translate to English
  }

  try {
    // Translate each text individually to avoid one failure affecting all
    const translations = [];
    for (let i = 0; i < texts.length; i++) {
      try {
        const translation = await translateText(texts[i], targetLang);
        translations.push(translation);
        // Add small delay to avoid rate limiting
        if (i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.warn(`Translation failed for text ${i + 1}:`, error.message);
        translations.push(texts[i]); // Use original text on failure
      }
    }
    return translations;
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts; // Return original texts if translation fails
  }
};

// Supported languages
const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'cs', name: 'Czech' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'tl', name: 'Filipino' },
  { code: 'sw', name: 'Swahili' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' }
];

module.exports = {
  translateText,
  translateTexts,
  supportedLanguages
};
