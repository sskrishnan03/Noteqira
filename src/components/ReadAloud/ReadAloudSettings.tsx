import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReadAloudSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  voice: string | null;
  volume: number;
  availableVoices: { name: string; lang: string }[];
  onApply: (settings: { voice: string | null; volume: number }) => void;
}

export default function ReadAloudSettings({
  isOpen,
  onClose,
  voice,
  volume,
  availableVoices,
  onApply,
}: ReadAloudSettingsProps) {
  const [draftVoice, setDraftVoice] = useState(voice || '');
  const [draftVolume, setDraftVolume] = useState(volume);

  useEffect(() => {
    if (isOpen) {
      const savedVoiceIsAvailable = availableVoices.some((availableVoice) => availableVoice.name === voice);
      setDraftVoice(savedVoiceIsAvailable && voice ? voice : availableVoices[0]?.name || '');
      setDraftVolume(volume);
    }
  }, [isOpen, voice, volume, availableVoices]);

  const updateVolume = (value: number) => {
    setDraftVolume(Math.min(1, Math.max(0, value)));
  };

  const handleDone = () => {
    onApply({
      voice: draftVoice || null,
      volume: draftVolume,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="w-[min(92vw,420px)] bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4 mb-4 shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Read Aloud Settings</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#B0B0B0]">Voice Selection</span>
              <select
                value={draftVoice}
                onChange={(e) => setDraftVoice(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0B0B0B] border border-[#2A2A2A] rounded-xl text-white text-sm focus:outline-none focus:border-white/30 transition-all"
                disabled={availableVoices.length === 0}
              >
                {availableVoices.length === 0 && (
                  <option value="">No voices available</option>
                )}
                {availableVoices.map((v) => (
                  <option key={`${v.name}-${v.lang}`} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-[#B0B0B0]">Volume</span>
                <span className="text-xs tabular-nums text-[#8A8A8A]">
                  {Math.round(draftVolume * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateVolume(draftVolume - 0.1)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B0B0B] border border-[#2A2A2A] text-[#C8C8C8] hover:text-white hover:bg-white/5 transition-all"
                  title="Decrease volume"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={draftVolume}
                  onChange={(e) => updateVolume(Number(e.target.value))}
                  className="h-2 w-full accent-white"
                  aria-label="Volume"
                />
                <button
                  type="button"
                  onClick={() => updateVolume(draftVolume + 0.1)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B0B0B] border border-[#2A2A2A] text-[#C8C8C8] hover:text-white hover:bg-white/5 transition-all"
                  title="Increase volume"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDone}
              className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-[#EDEDED] transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
