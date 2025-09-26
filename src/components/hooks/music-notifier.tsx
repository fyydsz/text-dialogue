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
  // State untuk menyimpan track name yang sedang ditampilkan
  const [displayedTrackName, setDisplayedTrackName] = useState(trackName);

  // Initialize displayed track name on mount
  useEffect(() => {
    setDisplayedTrackName(trackName);
  }, []); // Only run on mount since we use key prop for remount

  // Handle mounting when isPlaying becomes true
  useEffect(() => {
    if (isPlaying) {
      if (!isMounted) {
        setIsMounted(true);
      }
    } else if (!isPlaying && isMounted) {
      setIsVisible(false);
      const unmountTimer = setTimeout(() => {
        setIsMounted(false);
      }, 500);
      
      return () => {
        clearTimeout(unmountTimer);
      };
    }
  }, [isPlaying]);

  // Handle showing animation when mounted
  useEffect(() => {
    if (isMounted && !isVisible && isPlaying) {
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      
      return () => {
        clearTimeout(showTimer);
      };
    }
  }, [isMounted, isPlaying]);

  // Separate effect for auto-hide
  useEffect(() => {
    if (isMounted && isVisible) {
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
      }, 9000);

      const unmountTimer = setTimeout(() => {
        setIsMounted(false);
      }, 9500);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [isMounted, isVisible]); 

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
        <span>Now Playing:<br /><strong>{displayedTrackName}</strong></span>
      </div>
  );
}

export default MusicNotifier;