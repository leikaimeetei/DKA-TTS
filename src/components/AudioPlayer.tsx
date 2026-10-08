import React, { useEffect, useRef, useState } from 'react';
import { GeneratedSpeech } from '../types';
import { INDIAN_LANGUAGES_INFO } from '../data/voices';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Copy,
  Check,
  FastForward,
  Rewind,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { base64ToBlobUrl, downloadMp3File, speakInBrowser } from '../services/ttsService';

interface AudioPlayerProps {
  currentSpeech: GeneratedSpeech | null;
  onClear?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentSpeech,
  onClear,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Setup blob URL when currentSpeech changes
  useEffect(() => {
    if (!currentSpeech?.audioBase64) {
      setAudioUrl(null);
      setIsPlaying(false);
      return;
    }

    const url = base64ToBlobUrl(currentSpeech.audioBase64, currentSpeech.mimeType);
    setAudioUrl(url);
    setCurrentTime(0);

    // Auto-play voice immediately so user hears it without delay
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log('Autoplay waiting for user gesture:', err);
          });
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
    };
  }, [currentSpeech]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (currentSpeech?.isClientFallback) {
      if (isPlaying) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
      } else {
        speakInBrowser(currentSpeech.text, currentSpeech.language);
        setIsPlaying(true);
      }
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.muted = false;
      audioRef.current.volume = volume || 1.0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error('Playback error:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      audioRef.current.playbackRate = playbackRate;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(audioRef.current.currentTime + seconds, duration)
    );
  };

  const handleCopyScript = () => {
    if (!currentSpeech?.text) return;
    navigator.clipboard.writeText(currentSpeech.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!currentSpeech?.audioBase64) return;
    setIsDownloading(true);
    try {
      const cleanPersona = (currentSpeech.personaName || 'voice').toLowerCase().replace(/\s+/g, '_');
      const cleanLang = (currentSpeech.language || 'indian').replace(/-/g, '_');
      await downloadMp3File(
        currentSpeech.audioBase64,
        `dka_tts_${cleanLang}_${cleanPersona}_${Date.now()}.mp3`
      );
    } catch (err) {
      console.error('Failed to download MP3:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Canvas Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const numBars = 48;
      const barWidth = width / numBars - 2;
      const centerY = height / 2;

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + 2);

        let barHeight = 4;
        if (isPlaying) {
          // Dynamic pulsing wave based on time and index
          const frequency = 0.18;
          const amplitude = (height / 2.3) * (0.3 + 0.7 * Math.sin(phase * 3 + i * 0.4));
          const wave = Math.abs(Math.sin(phase * 2 + i * frequency));
          barHeight = Math.max(6, wave * amplitude);
        } else {
          // Resting waveform silhouette
          const restingWave = Math.sin((i / numBars) * Math.PI);
          barHeight = 4 + restingWave * 16;
        }

        const isCurrentProgress = (i / numBars) <= (duration > 0 ? currentTime / duration : 0);

        // Gradient styling
        const grad = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        if (isCurrentProgress && isPlaying) {
          grad.addColorStop(0, '#ea580c'); // Orange 600
          grad.addColorStop(1, '#b45309'); // Amber 700
        } else if (isCurrentProgress) {
          grad.addColorStop(0, '#f97316');
          grad.addColorStop(1, '#d97706');
        } else {
          grad.addColorStop(0, '#cbd5e1'); // Slate 300
          grad.addColorStop(1, '#94a3b8'); // Slate 400
        }

        ctx.fillStyle = grad;
        // Rounded bar
        const topY = centerY - barHeight / 2;
        ctx.beginPath();
        ctx.roundRect(x, topY, barWidth, barHeight, 3);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.05;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentSpeech || !audioUrl) {
    return (
      <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-8 text-center text-stone-500 space-y-2">
        <Sparkles className="w-6 h-6 mx-auto text-stone-400" />
        <h3 className="font-semibold text-stone-700 text-sm">Speech Studio Deck Idle</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Type a script or choose a preloaded sample above, then click &ldquo;Generate Speech&rdquo; to synthesize authentic Indian speech audio.
        </p>
      </div>
    );
  }

  const langInfo = INDIAN_LANGUAGES_INFO[currentSpeech.language];

  return (
    <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 shadow-xl border border-stone-800 space-y-4">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white">{currentSpeech.personaName}</span>
            <span className="text-xs text-amber-400 font-serif font-medium">
              {langInfo.nativeName} ({langInfo.name})
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5 line-clamp-1 italic font-light">
            &ldquo;{currentSpeech.text}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyScript}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-xs flex items-center gap-1"
            title="Copy script"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            disabled={isDownloading}
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            title="Download speech audio as MP3 file"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Encoding MP3...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download MP3</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visualizer Waveform Canvas */}
      <div className="w-full bg-stone-950/80 rounded-xl p-3 border border-stone-800/80 flex flex-col justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={64}
          className="w-full h-16 rounded-md"
        />
      </div>

      {/* Scrubber & Timeline */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-[11px] text-stone-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Transport Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSkip(-5)}
            className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            title="Rewind 5 seconds"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-orange-600/30"
            title={isPlaying ? 'Pause' : 'Play audio'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => handleSkip(5)}
            className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            title="Forward 5 seconds"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
              }
            }}
            className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors ml-1"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-stone-800/80 p-1 rounded-lg text-xs">
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleSpeedChange(rate)}
              className={`px-2 py-1 rounded transition-colors font-mono ${
                playbackRate === rate
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume & Details */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-stone-400">
            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                setIsMuted(false);
                if (audioRef.current) {
                  audioRef.current.volume = val;
                  audioRef.current.muted = false;
                }
              }}
              className="w-16 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Engine & Accent Spec Footer */}
      <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between text-[11px] text-stone-400">
        <div className="flex items-center gap-2">
          <span>Engine: {currentSpeech.model}</span>
          <span aria-hidden="true">·</span>
          <span>Format: MP3 Audio (128 kbps)</span>
        </div>
        <div>
          <span>Accent: South Asian Indian Vocal Cadence</span>
        </div>
      </div>
    </div>
  );
};
