export function speak(text, lang = 'en-IN') {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported.');
    }
  }