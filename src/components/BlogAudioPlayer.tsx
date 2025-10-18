'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';

interface BlogAudioPlayerProps {
  content: string;
  title: string;
}

export default function BlogAudioPlayer({ content, title }: BlogAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [progress, setProgress] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textToSpeak = useRef<string>('');

  useEffect(() => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();

      // Sort voices to prioritize natural-sounding ones
      const sortedVoices = availableVoices.sort((a, b) => {
        // Prioritize neural/premium voices (they usually have these keywords)
        const aIsNeural = /neural|premium|natural|enhanced|google|microsoft/i.test(a.name);
        const bIsNeural = /neural|premium|natural|enhanced|google|microsoft/i.test(b.name);

        if (aIsNeural && !bIsNeural) return -1;
        if (!aIsNeural && bIsNeural) return 1;

        // Then prioritize local voices (usually better quality)
        if (a.localService && !b.localService) return -1;
        if (!a.localService && b.localService) return 1;

        return 0;
      });

      setVoices(sortedVoices);

      // Set default voice (prefer neural English voices)
      if (sortedVoices.length > 0 && !voice) {
        const bestVoice = sortedVoices.find(v =>
          v.lang.startsWith('en') && /neural|premium|natural|enhanced|google|microsoft/i.test(v.name)
        ) || sortedVoices.find(v => v.lang.startsWith('en')) || sortedVoices[0];

        setVoice(bestVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Clean up text content (remove HTML tags)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    textToSpeak.current = `${title}. ${tempDiv.textContent || tempDiv.innerText || ''}`;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [content, title, voice]);

  const handlePlayPause = () => {
    if (!isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      // Start new speech
      const utterance = new SpeechSynthesisUtterance(textToSpeak.current);
      utteranceRef.current = utterance;

      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = isMuted ? 0 : 1;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(0);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onboundary = (event) => {
        // Update progress based on character position
        const progressPercent = (event.charIndex / textToSpeak.current.length) * 100;
        setProgress(progressPercent);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 1 : 0;
    }
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying || isPaused) {
      // Restart with new settings
      const currentProgress = progress;
      handleStop();
      // Note: In a more advanced implementation, you could resume from the current position
    }
  };

  const handleVoiceChange = (voiceURI: string) => {
    const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
    if (selectedVoice) {
      setVoice(selectedVoice);
      if (isPlaying || isPaused) {
        // Restart with new voice
        handleStop();
      }
    }
  };

  if (!isSupported) {
    return null; // Don't show the player if not supported
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 mb-6 border border-blue-200 dark:border-slate-600">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="text-blue-600 dark:text-blue-400" size={20} />
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Listen to this article
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isPlaying ? 'Now playing...' : isPaused ? 'Paused' : 'Click play to start'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-colors"
          aria-label="Settings"
        >
          <Settings className="text-gray-600 dark:text-gray-400" size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5">
          <div
            className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePlayPause}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <>
              <Pause size={16} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={16} />
              <span>{isPaused ? 'Resume' : 'Play'}</span>
            </>
          )}
        </button>

        {(isPlaying || isPaused) && (
          <button
            onClick={handleStop}
            className="px-3 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
          >
            Stop
          </button>
        )}

        <button
          onClick={handleMuteToggle}
          className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="text-gray-600 dark:text-gray-400" size={18} />
          ) : (
            <Volume2 className="text-gray-600 dark:text-gray-400" size={18} />
          )}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-slate-600 space-y-3">
          {/* Speed Control */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Speed: {rate}x
            </label>
            <div className="flex items-center gap-1.5">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleRateChange(speed)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    rate === speed
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-500'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selection */}
          {voices.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Voice
              </label>
              <select
                value={voice?.voiceURI || ''}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                {voices
                  .filter(v => v.lang.startsWith('en')) // Show English voices first
                  .map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
