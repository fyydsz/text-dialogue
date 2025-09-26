// src/components/hooks/VolumeBar.tsx
import React from 'react';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VolumeBarProps {
  volume: number;
  onVolumeChange: (newVolume: number) => void;
  className?: string;
}

const VolumeBar: React.FC<VolumeBarProps> = ({ volume, onVolumeChange, className }) => {
  const getVolumeIcon = () => {
    if (volume === 0) {
      return <VolumeX size={24} />;
    }
    if (volume < 0.5) {
      return <Volume1 size={24} />;
    }
    return <Volume2 size={24} />;
  };

  return (
    // ▼▼▼ PERUBAHAN UTAMA DI SINI ▼▼▼
    <div className={cn(
      // Ganti right-4 -> right-0, dan p-2 -> pt-2 pb-2 pl-2
      "group fixed bottom-4 right-0 flex flex-col items-center gap-2 pt-2 pb-2 pl-2 bg-black bg-opacity-50 rounded-lg",
      className
    )}
    >
      {/* Kontainer Slider Volume */}
      <div className={cn(
        // 2. Atur tinggi sesuai permintaan & sembunyikan secara default
        "h-17",
        "opacity-0 invisible",
        // 3. Munculkan saat parent (`group`) di-hover
        "group-hover:opacity-100 group-hover:visible",
        // 4. Tambahkan animasi transisi yang mulus
        "transition-all duration-300 ease-in-out"
      )}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-24 h-2 origin-center -rotate-90 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
        />
      </div>

      {/* Ikon Volume (selalu terlihat) */}
      <div className="text-white">
        {getVolumeIcon()}
      </div>
    </div>
    // ▲▲▲ AKHIR PERUBAHAN ▲▲▲
  );
};

export default VolumeBar;