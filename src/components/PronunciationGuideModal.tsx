import React, { useState } from 'react';
import {
  Sparkles,
  BookA,
  FlaskConical,
  Volume2,
  Clock,
  ArrowRight,
  Check,
  Search,
  X,
  Plus,
} from 'lucide-react';

interface PronunciationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPhoneticReplacement: (originalTerm: string, phoneticTerm: string) => void;
  onInsertText: (textToInsert: string) => void;
}

interface TermEntry {
  category: 'scientific' | 'acronym' | 'indian-term' | 'medical';
  original: string;
  phonetic: string;
  context: string;
  hint: string;
}

const PRELOADED_TERMS: TermEntry[] = [
  // Scientific & Botanical
  {
    category: 'scientific',
    original: 'Azadirachta indica',
    phonetic: 'Ah-zah-dee-RAKH-tah IN-dee-kah',
    context: 'Neem tree botanical name',
    hint: 'Syllabic hyphenation ensures proper Latin retroflex and vowel length',
  },
  {
    category: 'scientific',
    original: 'Curcuma longa',
    phonetic: 'KOOR-koo-mah LONG-gah',
    context: 'Turmeric / Haldi botanical name',
    hint: 'Soft nasalised g and clear vowel quantity',
  },
  {
    category: 'scientific',
    original: 'Ocimum sanctum',
    phonetic: 'OH-see-moom SAHNK-toom',
    context: 'Holy Basil / Tulsi botanical name',
    hint: 'Prevents mispronunciation as English sight-word',
  },
  {
    category: 'scientific',
    original: 'Withania somnifera',
    phonetic: 'With-AH-nee-ah som-NEE-feh-rah',
    context: 'Ashwagandha botanical taxon',
    hint: 'Stresses the second syllable in each word',
  },
  {
    category: 'scientific',
    original: 'Rauvolfia serpentina',
    phonetic: 'Row-VOL-fee-ah ser-pen-TEE-nah',
    context: 'Sarpagandha medicinal plant',
    hint: 'Classic botanical Latin pronunciation',
  },
  {
    category: 'scientific',
    original: 'Emblica officinalis',
    phonetic: 'EM-bli-kah oh-fiss-i-NAH-lis',
    context: 'Indian gooseberry / Amla',
    hint: 'Accurate Latin stress markers',
  },
  {
    category: 'scientific',
    original: 'Homo sapiens',
    phonetic: 'HOH-moh SAY-pee-enz',
    context: 'Human binomial nomenclature',
    hint: 'Natural long vowel on Homo',
  },
  {
    category: 'scientific',
    original: 'Escherichia coli',
    phonetic: 'Esh-er-IK-ee-ah KOH-lye',
    context: 'E. coli bacterium',
    hint: 'Prevents hard or muffled pronunciation of -chia',
  },
  {
    category: 'scientific',
    original: 'Deoxyribonucleic acid',
    phonetic: 'dee-OK-see-rye-boh-noo-klay-ik AS-id',
    context: 'DNA full biological chemical term',
    hint: 'Clear separation of prefixes',
  },
  {
    category: 'scientific',
    original: 'Photosynthesis',
    phonetic: 'foh-toh-SIN-thuh-sis',
    context: 'Biological plant process',
    hint: 'Natural Indian conversational cadence',
  },

  // Acronyms & Organizations
  {
    category: 'acronym',
    original: 'ISRO',
    phonetic: 'Iss-roh',
    context: 'Indian Space Research Organisation',
    hint: 'Pronounced as a single unified word, not letter-by-letter',
  },
  {
    category: 'acronym',
    original: 'AIIMS',
    phonetic: 'Ayms',
    context: 'All India Institute of Medical Sciences',
    hint: 'Rhymes with "aims", vocalised as one syllable',
  },
  {
    category: 'acronym',
    original: 'DRDO',
    phonetic: 'D.R.D.O.',
    context: 'Defence Research and Development Organisation',
    hint: 'Dotted acronym forces TTS to pronounce each letter separately',
  },
  {
    category: 'acronym',
    original: 'UPI',
    phonetic: 'U.P.I.',
    context: 'Unified Payments Interface',
    hint: 'Periods enforce distinct letter enunciation (You-Pee-Eye)',
  },
  {
    category: 'acronym',
    original: 'DNA',
    phonetic: 'D.N.A.',
    context: 'Genetic code',
    hint: 'Prevents engine from trying to pronounce as a word',
  },
  {
    category: 'acronym',
    original: 'mRNA',
    phonetic: 'em-R-N-A',
    context: 'Messenger RNA',
    hint: 'Small letter separated from capitalized acronym',
  },
  {
    category: 'acronym',
    original: 'NASA',
    phonetic: 'Naa-sah',
    context: 'Space agency',
    hint: 'Syllabic form with balanced vowels',
  },
  {
    category: 'acronym',
    original: 'IIT',
    phonetic: 'I.I.T.',
    context: 'Indian Institutes of Technology',
    hint: 'Letter-by-letter clarity',
  },
  {
    category: 'acronym',
    original: 'ICMR',
    phonetic: 'I.C.M.R.',
    context: 'Indian Council of Medical Research',
    hint: 'Distinct letter pacing',
  },

  // Indian Traditional & Technical terms
  {
    category: 'indian-term',
    original: 'Pranayama',
    phonetic: 'Prah-nah-YAA-mah',
    context: 'Yogic breath control technique',
    hint: 'Long "aa" prevents flat Western vowel sound',
  },
  {
    category: 'indian-term',
    original: 'Ayurveda',
    phonetic: 'Ah-yoor-VAY-dah',
    context: 'Ancient Indian medical system',
    hint: 'Authentic Indian cadence and vowel emphasis',
  },
  {
    category: 'indian-term',
    original: 'Chikitsa',
    phonetic: 'Chee-KIT-sah',
    context: 'Therapeutic treatment in Hindi / Sanskrit',
    hint: 'Dental "t" sound and crisp vowel timing',
  },
  {
    category: 'indian-term',
    original: 'Dharmashastra',
    phonetic: 'Dhar-mah-SHAA-strah',
    context: 'Classical Indian legal and philosophical treatise',
    hint: 'Retroflex "sh" and balanced long vowels',
  },
];

export const PronunciationGuideModal: React.FC<PronunciationGuideModalProps> = ({
  isOpen,
  onClose,
  onApplyPhoneticReplacement,
  onInsertText,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'scientific' | 'acronym' | 'indian-term'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customFind, setCustomFind] = useState('');
  const [customReplace, setCustomReplace] = useState('');
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTerms = PRELOADED_TERMS.filter((term) => {
    const matchesCat = selectedCategory === 'all' || term.category === selectedCategory;
    const matchesSearch =
      term.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.phonetic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.context.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleApply = (original: string, phonetic: string) => {
    onApplyPhoneticReplacement(original, phonetic);
    setAppliedFeedback(`Replaced "${original}" with "${phonetic}" in your script.`);
    setTimeout(() => setAppliedFeedback(null), 3000);
  };

  const handleCustomReplace = () => {
    if (!customFind.trim() || !customReplace.trim()) return;
    onApplyPhoneticReplacement(customFind.trim(), customReplace.trim());
    setAppliedFeedback(`Replaced "${customFind.trim()}" with "${customReplace.trim()}" in script.`);
    setCustomFind('');
    setCustomReplace('');
    setTimeout(() => setAppliedFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Pronunciation & Scientific Terms Studio
              </h3>
              <p className="text-xs text-stone-500">
                Fix gaps, botanical Latin, scientific taxa, medical jargon & acronyms for 100% precision
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-stone-200/70 flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback alert */}
        {appliedFeedback && (
          <div className="px-6 py-2 bg-emerald-50 text-emerald-800 border-b border-emerald-100 text-xs flex items-center gap-2 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{appliedFeedback}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Rules / How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                1. Gaps & Breath Pacing
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Use commas (<code>,</code>) for natural breath pauses (0.2s), ellipses (<code>...</code>) for reflective silence (0.5s), and <code>&lt;breath&gt;</code> for organic vocal breathing.
              </p>
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl space-y-1">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-blue-700" />
                2. Scientific & Botanical
              </span>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Break Latin taxa into hyphenated syllables with stressed parts in CAPITALS (e.g. <em>Ah-zah-dee-RAKH-tah</em>). The voice engine reads this with natural phonetic flow.
              </p>
            </div>

            <div className="p-3 bg-purple-50/60 border border-purple-200/70 rounded-xl space-y-1">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <BookA className="w-3.5 h-3.5 text-purple-700" />
                3. Acronyms & Spelled Letters
              </span>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                For single-word acronyms like <em>ISRO</em>, spell as <em>Iss-roh</em>. For letter-by-letter like <em>DRDO</em>, add dots: <em>D.R.D.O.</em> to stop accidental word blend.
              </p>
            </div>
          </div>

          {/* Custom Find & Replace Section */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Quick Custom Pronunciation Replacer</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Difficult Term in Script:
                </label>
                <input
                  type="text"
                  value={customFind}
                  onChange={(e) => setCustomFind(e.target.value)}
                  placeholder="e.g. Mycobacterium, Rauvolfia, AIIMS"
                  className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Phonetic Reselling for TTS:
                </label>
                <input
                  type="text"
                  value={customReplace}
                  onChange={(e) => setCustomReplace(e.target.value)}
                  placeholder="e.g. Mye-koh-bak-TEER-ee-um, Ayms"
                  className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!customFind.trim() || !customReplace.trim()}
                onClick={handleCustomReplace}
                className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Replace in Script</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Preloaded Dictionary & Cheatsheet */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Pre-Calibrated Terms Dictionary ({filteredTerms.length})
              </h4>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-0.5 rounded-md transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-white font-bold text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('scientific')}
                  className={`px-2.5 py-0.5 rounded-md transition-colors ${
                    selectedCategory === 'scientific'
                      ? 'bg-white font-bold text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Scientific & Botanical
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('acronym')}
                  className={`px-2.5 py-0.5 rounded-md transition-colors ${
                    selectedCategory === 'acronym'
                      ? 'bg-white font-bold text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Acronyms
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('indian-term')}
                  className={`px-2.5 py-0.5 rounded-md transition-colors ${
                    selectedCategory === 'indian-term'
                      ? 'bg-white font-bold text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Indian Cultural
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scientific name, acronym, or context..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
              />
            </div>

            {/* Terms List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredTerms.map((term, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-stone-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/20 transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-xs group-hover:text-amber-800">
                        {term.original}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                        {term.category}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-700 mt-1">
                      → {term.phonetic}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 italic">{term.context}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{term.hint}</p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => handleApply(term.original, term.phonetic)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md transition-colors cursor-pointer"
                      title="Replace this term with phonetic version in script"
                    >
                      Replace in Script
                    </button>
                    <button
                      type="button"
                      onClick={() => onInsertText(` ${term.phonetic} `)}
                      className="px-2 py-1 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors cursor-pointer"
                      title="Insert phonetic term at cursor / end"
                    >
                      Insert Phonetic
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Tip: Indian voices pronounce phonetic respellings with natural South Asian cadence.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
