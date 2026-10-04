import React, { useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { useLanguage } from '../../context/LanguageContext';

export default function VoiceInput({ onTranscript, placeholder = 'Tap mic to speak notes...' }) {
  const { isListening, transcript, error, isSupported, startListening, stopListening } = useVoiceRecognition();
  const { language } = useLanguage();

  useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  if (!isSupported) {
    return null; // Gracefully degrade if browser doesn't support Web Speech API
  }

  const langLabel = language === 'hi' ? 'हिन्दी में बोलें' : language === 'mr' ? 'मराठीत बोला' : 'Speak in English';

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        title={isListening ? 'Stop listening' : `Voice input (${langLabel})`}
        className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all touch-press ${
          isListening
            ? 'bg-rose-500 text-white border-rose-600 mic-recording'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4" />
            <span>Listening ({langLabel})...</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-emerald-600" />
            <span>Voice Note</span>
          </>
        )}
      </button>

      {isListening && (
        <span className="text-xs text-rose-600 font-medium italic animate-pulse">
          {transcript || 'Listening to your voice...'}
        </span>
      )}

      {error && (
        <span className="text-xs text-rose-500 font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
