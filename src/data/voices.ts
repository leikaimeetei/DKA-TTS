import { VoicePersona, IndianLanguage } from '../types';

export const INDIAN_LANGUAGES_INFO: Record<
  IndianLanguage,
  {
    name: string;
    nativeName: string;
    script: string;
    regionDescription: string;
    greeting: string;
    sampleText: string;
  }
> = {
  'indian-english': {
    name: 'Indian English',
    nativeName: 'Indian English',
    script: 'Latin',
    regionDescription: 'Authentic Indian English intonation, natural syllable timing, retroflex consonants and clear diction',
    greeting: 'Namaste & Welcome',
    sampleText: 'Welcome to DKA -TTS, the speech studio crafted for authentic Indian vocal cadences, expressions, and natural rhythms.',
  },
  'hindi': {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    regionDescription: 'Rich Northern & Central Indian intonation with clear Devanagari phonetics and natural Hindustani cadence',
    greeting: 'नमस्ते',
    sampleText: 'DKA -TTS में आपका स्वागत है। यहाँ आप अपनी भाषा में शुद्ध भारतीय लहजे के साथ सहज और प्रभावशाली आवाज़ तैयार कर सकते हैं।',
  },
};

export const INDIAN_VOICES: VoicePersona[] = [
  {
    id: 'jhanvi',
    name: 'Jhanvi',
    nativeName: 'जान्हवी',
    gender: 'Female',
    geminiVoice: 'Kore',
    languages: ['indian-english', 'hindi'],
    accentFlavor: 'Pan-Indian Standard & Warm Conversational',
    tone: 'Warm, approachable, articulate, natural educator',
    idealFor: ['Podcasts', 'Audiobooks', 'E-Learning', 'Customer Support'],
    avatarColor: 'from-amber-500 to-orange-600',
    description: 'A friendly and balanced Indian voice with crystal-clear articulation, perfect for explaining complex ideas or welcoming listeners.',
    previewSample: 'Hello and welcome. I can help you narrate stories, corporate updates, and friendly conversations in authentic Indian accents.',
  },
  {
    id: 'abhay',
    name: 'Abhay',
    nativeName: 'अभय',
    gender: 'Male',
    geminiVoice: 'Puck',
    languages: ['indian-english', 'hindi'],
    accentFlavor: 'Tech & Urban Indian Professional',
    tone: 'Confident, clear, energetic, modern entrepreneur',
    idealFor: ['Tech Keynotes', 'Commercials', 'Product Walkthroughs', 'Social Media'],
    avatarColor: 'from-blue-600 to-indigo-700',
    description: 'Dynamic urban Indian tone with crisp pronunciation and forward momentum, suited for startups, tutorials, and business briefings.',
    previewSample: 'Great to meet you! Let us create compelling voiceovers for your next product launch with authentic rhythm.',
  },
  {
    id: 'balak-ram',
    name: 'Balak Ram',
    nativeName: 'बालक राम',
    gender: 'Male',
    geminiVoice: 'Charon',
    languages: ['indian-english', 'hindi'],
    accentFlavor: 'Deep Editorial & Senior Broadcaster',
    tone: 'Authoritative, resonant, deep, documentary narrator',
    idealFor: ['Documentaries', 'News Broadcasts', 'Historical Audiobooks', 'Corporate Announcements'],
    avatarColor: 'from-slate-700 to-zinc-900',
    description: 'Commanding and deep baritone reminiscent of classic All India Radio and Doordarshan broadcasters, lending gravitas to every word.',
    previewSample: 'Good evening. Across the subcontinent today, innovation continues to redefine the boundaries of human potential.',
  },
  {
    id: 'chanderwali',
    name: 'Chanderwali',
    nativeName: 'चंदरवाली',
    gender: 'Female',
    geminiVoice: 'Kore',
    languages: ['indian-english', 'hindi'],
    accentFlavor: 'Gentle Indian Storyteller & Melodic Desi Cadence',
    tone: 'Soothing, empathetic, musical Indian narrative cadence',
    idealFor: ['Meditation & Wellness', 'Folk Tales & Fiction', 'Travel Narratives', 'Children Stories'],
    avatarColor: 'from-rose-500 to-pink-600',
    description: 'Soft-spoken, melodic Indian voice with authentic Desi pronunciation and cultural warmth, ideal for stories and guided reflections.',
    previewSample: 'Take a deep breath. As twilight settles over the riverbanks, the temple bells echo softly in the distance.',
  },
  {
    id: 'kunwar',
    name: 'Kunwar',
    nativeName: 'कुंवर',
    gender: 'Male',
    geminiVoice: 'Puck',
    languages: ['indian-english', 'hindi'],
    accentFlavor: 'Youthful/Conversational',
    tone: 'Casual, upbeat, relatable, friendly neighbor',
    idealFor: ['Social Media Ads', 'Casual Podcasts', 'Gaming', 'Youth Campaigns'],
    avatarColor: 'from-cyan-600 to-blue-600',
    description: 'Casual, upbeat, relatable, friendly neighbor. Perfect for everyday conversations, social content, and friendly advice.',
    previewSample: 'Hey everyone! If you want your audio to sound like a real conversation over chai, you have found the right voice.',
  },
  {
    id: 'awah',
    name: 'Awah',
    nativeName: 'आवाह',
    gender: 'Female',
    geminiVoice: 'Kore',
    languages: ['indian-english', 'hindi'],
    accentFlavor: 'Articulate National News & Corporate Anchor',
    tone: 'Polished, authoritative, crisp and engaging',
    idealFor: ['News Bulletins', 'Executive Briefings', 'Corporate Training', 'Advertisements'],
    avatarColor: 'from-emerald-600 to-teal-800',
    description: 'Crisp and highly polished diction with clear cadence, commanding attention for professional broadcasts and business presentations.',
    previewSample: 'Good morning. Here are the top developments shaping technology and industry across India today.',
  },
];
