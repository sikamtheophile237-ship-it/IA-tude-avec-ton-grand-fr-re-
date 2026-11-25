import {useCallback, useEffect, useRef, useState} from 'react';
import {Language, VoicePersona} from '../types';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function useSpeech(lang: Language, persona: VoicePersona, muted: boolean) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechNote, setSpeechNote] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, force = false) => {
      if ((muted && !force) || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-US' : 'fr-FR';
      utterance.pitch = persona === 'femme' ? 1.18 : 0.92;
      utterance.rate = 0.98;

      const voices = window.speechSynthesis.getVoices();
      const targetPrefix = lang === 'en' ? 'en' : 'fr';
      const matchingVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(targetPrefix)
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [lang, muted, persona]
  );

  const startListening = useCallback(
    (onTranscript: (text: string) => void) => {
      if (typeof window === 'undefined') return;
      const win = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      };
      const RecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!RecognitionCtor) {
        setSpeechNote(
          lang === 'en'
            ? 'Voice microphone is not supported in this browser; type your question below.'
            : 'Le micro vocal n’est pas disponible sur ce navigateur ; écris ta question ci-dessous.'
        );
        return;
      }

      try {
        const recognition = new RecognitionCtor();
        recognition.lang = lang === 'en' ? 'en-US' : 'fr-FR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        setIsListening(true);
        setSpeechNote(
          lang === 'en'
            ? 'Listening... speak clearly now.'
            : lang === 'ff'
              ? 'Miɗo heɗoo... haal jooni.'
              : 'Écoute active... parle clairement maintenant.'
        );

        recognition.onresult = (event) => {
          const transcript = event.results[0]?.[0]?.transcript || '';
          setIsListening(false);
          if (transcript) {
            setSpeechNote(`« ${transcript} »`);
            onTranscript(transcript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          setSpeechNote(
            lang === 'en'
              ? 'Microphone access denied or unavailable.'
              : 'Micro indisponible ou permission refusée.'
          );
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch {
        setIsListening(false);
        setSpeechNote('Impossible de démarrer le micro sur cet appareil.');
      }
    },
    [lang]
  );

  useEffect(() => {
    return () => {
      stopSpeaking();
      recognitionRef.current?.stop();
    };
  }, [stopSpeaking]);

  return {
    isSpeaking,
    isListening,
    speechNote,
    speak,
    stopSpeaking,
    startListening,
  };
}
