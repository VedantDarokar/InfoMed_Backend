const { translateText, translateTexts, supportedLanguages } = require('../utils/translator');

// @desc    Translate text
// @route   POST /api/translate
// @access  Public
const translate = async (req, res) => {
  try {
    const { text, targetLang = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for translation'
      });
    }

    const translatedText = await translateText(text, targetLang);

    res.status(200).json({
      success: true,
      data: {
        originalText: text,
        translatedText,
        targetLanguage: targetLang
      }
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during translation'
    });
  }
};

// @desc    Translate multiple texts
// @route   POST /api/translate/batch
// @access  Public
const translateBatch = async (req, res) => {
  try {
    const { texts, targetLang = 'en' } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        message: 'Texts array is required for batch translation'
      });
    }

    const translatedTexts = await translateTexts(texts, targetLang);

    res.status(200).json({
      success: true,
      data: {
        originalTexts: texts,
        translatedTexts,
        targetLanguage: targetLang
      }
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during batch translation'
    });
  }
};

// @desc    Get supported languages
// @route   GET /api/translate/languages
// @access  Public
const getSupportedLanguages = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      languages: supportedLanguages
    }
  });
};

module.exports = {
  translate,
  translateBatch,
  getSupportedLanguages
};
