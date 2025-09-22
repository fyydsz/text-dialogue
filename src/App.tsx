import { useEffect, useRef, useState } from 'react';
import './App.css'
import { useIsMobile } from './components/hooks/no-mobile';
import Textbox from './components/pages/Textbox';
import MusicNotifier from './components/hooks/music-notifier';
import { cn } from './lib/utils';
import Typewriter from './components/hooks/typing-effect';
import { SPEAKER_PROFILES } from "./components/dialogue/speaker.config";
import { Button } from './components/ui/button';

function App() {
  const isMobile = useIsMobile();
  const [showText, setshowText] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;

    const handleAudioReady = () => {
      setIsLoading(false); 
    };

    if (audio) {
      if (audio.readyState >= 4) { 
        handleAudioReady();
      } else {
        audio.addEventListener('canplaythrough', handleAudioReady);
      }
    }

    return () => {
      if (audio) {
        audio.removeEventListener('canplaythrough', handleAudioReady);
      }
    };
  }, []);

  useEffect(() => {
    if (showText) {
      audioRef.current?.play().catch(error => {
        console.error("Audio play was prevented:", error);
      });
    }
  }, [showText]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // Atur ke 70%
    }
  }, []);

  return (
    <div className={cn(
      "App",
      "h-screen flex justify-center items-center",
      "bg-black",
    )}>
      {isLoading ? (
        <Typewriter
          text={"Loading..."}
          speed={40}
          basePauseMs={1000 / 30}
        />
      ) : (
        <main className='w-full h-full flex justify-center items-center overflow-hidden'>
          {isMobile ? (
            <div className="justify-center items-center p-5 flex flex-col space-y-4">
              {showText ? (
                <div className="text-center">
                  <Typewriter
                    text={"Maaf,^4 web ini tidak dapat diakses^1 melalui perangkat mobile^3 hehehehe.^5 Buka lewat PC/Laptop yaaa."}
                    speed={60}
                    basePauseMs={1000 / 30}
                    soundSrc={SPEAKER_PROFILES.sans.soundSrc}
                  />
                </div>
              ) : (
                <div className="text-center font-['DeterminationMonoRegular']">
                  <p className="text-white text-lg mb-2 ">
                    Oh ada tombol! mungkin kamu bisa menekannya?
                  </p>
                  <Button
                    onClick={() => setshowText(true)}
                    className="px-6 py-2 text-white text-sm hover:bg-blue-700 transition-colors"
                  >
                    Tekan!
                  </Button>
                </div>
              )}
            </div>
          ) : showText ? (
            <Textbox />
          ) : (
            <div className="text-center font-['DeterminationMonoRegular']">
              <p className="text-white text-[2rem] mb-3 ">
                Oh ada tombol! mungkin kamu bisa menekannya?
              </p>
              <Button
                onClick={() => setshowText(true)}
                className="px-6 py-2 text-white text-lg bg-neutral-800 hover:bg-gray-100 hover:text-black transition-colors scale-[1.2]"
              >
                Tekan!
              </Button>
            </div>
          )}
        </main>
      )}
      {!isMobile && <audio ref={audioRef} src="/music/ruderbuster.mp3" loop />}
      {!isMobile && <MusicNotifier isPlaying={showText} trackName="Toby Fox - Ruder Buster" />}
      {/* If its mobile play a song */}
      {isMobile && <audio ref={audioRef} src="/music/dogsong.mp3" loop />}
    </div>

  );
}

export default App;