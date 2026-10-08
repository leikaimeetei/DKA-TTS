export type IndianLanguage = 'indian-english' | 'hindi';

export interface VoicePersona {
  id: string;
  name: string;
  nativeName?: string;
  gender: 'Female' | 'Male';
  geminiVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  languages: IndianLanguage[];
  accentFlavor: string; // e.g. "Pan-Indian Standard", "Kolkata Cultural", "South Indian Melodic"
  tone: string; // e.g. "Warm, Professional, Articulate"
  idealFor: string[];
  avatarColor: string;
  description: string;
  previewSample: string;
}

export interface GeneratedSpeech {
  id: string;
  text: string;
  language: IndianLanguage;
  voiceName: string;
  personaName: string;
  model: string;
  audioBase64: string;
  mimeType: string;
  timestamp: number;
  durationSeconds?: number;
  isDialogue?: boolean;
  isClientFallback?: boolean;
}

export interface DialogueSpeakerConfig {
  id: string;
  name: string;
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  gender: 'Female' | 'Male';
  text: string;
  style: string;
}

export interface SpeechModifiers {
  speakingRate: number; // 0.70 to 1.35 (default: 0.95)
  pitch: number; // -2 to +2 (default: 0)
  emotion: string; // e.g. 'Warm & Conversational', 'News Broadcast', etc.
  accentFlavor: string; // e.g. 'Pan-Indian Metro Neutral', 'North Indian / Hindi Lilting', etc.
  energy: 'gentle' | 'balanced' | 'emphatic';
  customPrompt: string;
}

export interface SampleScript {
  id: string;
  title: string;
  category: 'Corporate & Tech' | 'News & Media' | 'Story & Culture' | 'Customer Support' | 'Education & Wellness';
  language: IndianLanguage;
  text: string;
  suggestedPersonaId: string;
}
