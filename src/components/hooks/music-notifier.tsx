// src/components/MusicNotifier.tsx

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface MusicNotifierProps {
  isPlaying: boolean;
  trackName: string;
}

function MusicNotifier({ isPlaying, trackName }: MusicNotifierProps) {
  // State untuk mengontrol apakah komponen ada di DOM
  const [isMounted, setIsMounted] = useState(false);
  // State untuk mengontrol kelas animasi (terlihat/tidak)
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      // Pasang komponen ke DOM
      setIsMounted(true);
      
      // Timer untuk memulai animasi masuk
      const enterTimer = setTimeout(() => {
        setIsVisible(true);
      }, 50); // Jeda 50ms

      // Timer untuk memulai animasi keluar setelah 9 detik
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
      }, 9050);

      // Timer untuk melepas komponen dari DOM setelah animasi keluar selesai
      const unmountTimer = setTimeout(() => {
        setIsMounted(false);
      }, 9550); 

      // Cleanup untuk membersihkan semua timer jika komponen unmount tiba-tiba
      return () => {
        clearTimeout(enterTimer);
        clearTimeout(exitTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [isPlaying]); 

  // Jika tidak terpasang, jangan render apa-apa
  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-8 left-8 z-50",
        "flex items-center space-x-3",
        "bg-black/70 backdrop-blur-sm",
        "text-white text-sm font-semibold",
        "py-6 px-15 rounded-lg shadow-lg",
        "transition-all duration-500 ease-out",
        "scale-125",
        // Kelas animasi sekarang dikontrol oleh `isVisible`
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <span>🎵</span>
      <span>Now Playing:<br /><strong>{trackName}</strong></span>
    </div>
  );
}

export default MusicNotifier;