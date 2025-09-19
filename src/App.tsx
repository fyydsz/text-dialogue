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

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (showText) {
      audioRef.current?.play().catch(error => {
        console.error("Audio play was prevented:", error);
      });
    }
  }, [showText]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8; // Atur ke 70%
    }
  }, []);

  return (
    <div className={cn(
      "App",
      "h-screen flex justify-center items-center",
      "bg-black",
    )}>
      <main className='w-full h-full flex justify-center items-center overflow-hidden'>
        {/* 3. Gunakan kondisi di dalam JSX untuk menentukan apa yang akan dirender. */}
        {isMobile ? (
          <div className="justify-center items-center p-5 flex flex-col space-y-4">
            {showText ? (
              <div className="text-center">
                <Typewriter
                  text={"Maaf, web ini tidak dapat diakses melalui perangkat mobile hehehe,^5 Buka lewat PC/Laptop yaaa."}
                  speed={70}
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
            <p className="text-white text-[2rem] mb-2 ">
              Oh ada tombol! mungkin kamu bisa menekannya?
            </p>
            <Button
              onClick={() => setshowText(true)}
              className="px-6 py-2 text-white text-lg hover:bg-blue-700 transition-colors scale-[1.2]"
            >
              Tekan!
            </Button>
          </div>
        )}
      </main>
      {!isMobile && <audio ref={audioRef} src="/music/fieldofhopesanddreams.mp3" loop />}
      {!isMobile && <MusicNotifier isPlaying={showText} trackName="Toby Fox - Field of Hopes and Dreams" />}
    </div>
  );
}

export default App;