import React from 'react';
import { BookOpen, X, Sparkles } from 'lucide-react';

interface AccentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccentGuideModal: React.FC<AccentGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Indian English & Hindi Pronunciation Guide
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Authentic vocal characteristics, intonation, and rhythm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-700 text-sm leading-relaxed">
          {/* Indian English Section */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-600"></span>
              Indian English (General Indian English / GIE)
            </h4>
            <p className="text-xs text-stone-600">
              Indian English has distinctive phonetic and rhythmic qualities that make it globally recognized:
            </p>
            <ul className="text-xs space-y-1.5 list-disc pl-5 text-stone-600">
              <li>
                <strong className="text-stone-800">Syllable-Timed Cadence:</strong> Unlike stress-timed British or American English, Indian English gives more uniform duration to each syllable, creating its signature steady, musical rhythm.
              </li>
              <li>
                <strong className="text-stone-800">Retroflex Consonants (/ʈ/ and /ɖ/):</strong> The letters &ldquo;t&rdquo; and &ldquo;d&rdquo; are pronounced with the tip of the tongue curled slightly back against the hard palate, giving authentic warmth and clarity.
              </li>
              <li>
                <strong className="text-stone-800">Non-Aspirated Stops:</strong> Sounds like &ldquo;p&rdquo;, &ldquo;t&rdquo;, &ldquo;k&rdquo; are articulated without heavy bursts of air, resulting in a crisp, clean sound.
              </li>
              <li>
                <strong className="text-stone-800">Indian Terminology & Numerals:</strong> Seamlessly handles terms like Lakhs, Crores, GST, Aadhaar, Namaste, and everyday Indian idioms.
              </li>
            </ul>
          </div>

          {/* Hindi */}
          <div className="space-y-2 border-t border-stone-100 pt-4">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              Hindi (हिन्दी) — Northern & Central Cadence
            </h4>
            <p className="text-xs text-stone-600">
              Rooted in standard Khadi Boli and Hindustani, emphasizing clear vowel distinctions (ह्रस्व / दीर्घ स्वर), aspirates (ख, घ, थ, ध), and nuanced nasal sounds (अनुस्वार). Whether written in Devanagari or Romanized script, it renders with warm, conversational Delhi/UP intonation.
            </p>
            <ul className="text-xs space-y-1.5 list-disc pl-5 text-stone-600">
              <li>
                <strong className="text-stone-800">Devanagari Precision:</strong> Exact matra timings and crisp dental/retroflex distinction.
              </li>
              <li>
                <strong className="text-stone-800">Romanized / Hinglish Support:</strong> You can type in phonetic English (e.g., &ldquo;Aapka swagat hai&rdquo;) and convert or narrate it directly.
              </li>
            </ul>
          </div>

          {/* Best Practices for Synthesis */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-xl space-y-2">
            <h5 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              Pro Tips for Natural Indian Speech Studio Quality:
            </h5>
            <ul className="text-xs space-y-1 text-amber-900">
              <li>
                • Use commas (,) to create natural breathing pauses between thoughts.
              </li>
              <li>
                • Use ellipses (...) when you desire a thoughtful, deliberate 0.5-second dramatic pause.
              </li>
              <li>
                • If typing English text that contains Indian names or towns (e.g. Bengaluru, Varanasi), phonetic Romanization yields natural pronunciation.
              </li>
              <li>
                • Try the &ldquo;Dual Conversation&rdquo; studio mode to generate podcast dialogues with two distinct Indian speakers in a single audio file!
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Got it, Back to Studio
          </button>
        </div>
      </div>
    </div>
  );
};
