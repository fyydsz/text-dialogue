import { useEffect, useRef, useState } from 'react';
import './App.css'
import { useIsMobile } from './components/hooks/no-mobile';
import Textbox from './components/pages/Textbox';
import MusicNotifier from './components/hooks/music-notifier';
import { cn } from './lib/utils';
import Typewriter from './components/hooks/typing-effect';
import { SPEAKER_PROFILES } from "./components/dialogue/speaker.config";
import { Button } from './components/ui/button';
import VolumeBar from './components/hooks/volume-bar';
import { MusicProvider } from './components/context/MusicContext';

function App() {
  const isMobile = useIsMobile();
  const [showText, setshowText] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [currentTrack, setCurrentTrack] = useState("");
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [musicQueue, setMusicQueue] = useState<string[]>([]);
  const [showNewTrackNotif, setShowNewTrackNotif] = useState(false);
  const [isMusicPaused, setIsMusicPaused] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Functions to control music playback
  const pauseMusic = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsMusicPaused(true);
      console.log("Music paused for comedic effect");
    }
  };

  const resumeMusic = () => {
    if (audioRef.current && audioRef.current.paused && isMusicPaused) {
      audioRef.current.play().catch(console.error);
      setIsMusicPaused(false);
      console.log("Music resumed");
    }
  };

  // Music files available for random selection
  const musicTracks = [
    "field_of_hopes_and_dreams.mp3",
    "rude_buster.mp3",
    "ruder_buster.mp3",
    "the_third_sanctuary.mp3",
  ];

  // Function to shuffle array
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Function to create shuffled music queue
  const createMusicQueue = () => {
    return shuffleArray(musicTracks);
  };

  // Function to get next track in queue
  const getNextTrack = (): { track: string; index: number } | null => {
    if (musicQueue.length === 0) return null;
    const nextIndex = (currentTrackIndex + 1) % musicQueue.length;
    return { track: musicQueue[nextIndex], index: nextIndex };
  };

  // Function to get track display name
  const getTrackDisplayName = (filename: string) => {
    const trackNames: { [key: string]: string } = {
      "dogsong.mp3": "Toby Fox - Dogsong",
      "field_of_hopes_and_dreams.mp3": "Toby Fox - Field of Hopes and Dreams",
      "rude_buster.mp3": "Toby Fox - Rude Buster",
      "ruder_buster.mp3": "Toby Fox - Ruder Buster",
      "the_third_sanctuary.mp3": "Toby Fox - The Third Sanctuary",
    };
    return trackNames[filename] || filename;
  };

  useEffect(() => {
    // Initialize music queue and set first track on component mount
    if (!isMobile) {
      const queue = createMusicQueue();
      setMusicQueue(queue);
      setCurrentTrack(queue[0]);
      setCurrentTrackIndex(0);
    } else {
      setCurrentTrack("dogsong.mp3");
    }
  }, [isMobile]);

  useEffect(() => {
    const preloadAssets = async () => {
      const audio = audioRef.current;
      const font = "35px DeterminationMonoRegular"; 
      
      const imageUrls = Object.values(SPEAKER_PROFILES).flatMap(
        profile => profile.avatars ? Object.values(profile.avatars) : []
      );
      
      const uniqueImageUrls = [...new Set(imageUrls)];

      const audioPromise = new Promise<void>((resolve, reject) => {
        if (!audio) return resolve();
        if (audio.readyState >= 4) return resolve();
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', (e) => reject(new Error(`Gagal memuat audio: ${e}`)), { once: true });
      });

      const fontPromise = document.fonts.load(font);

      const imagePromises = uniqueImageUrls.map(src => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Gagal memuat gambar: ${src}`));
        });
      });

      return Promise.all([audioPromise, fontPromise, ...imagePromises]);
    };

    preloadAssets()
      .then(() => {
        console.log("Semua aset berhasil dimuat!");
        setIsLoading(false); // Sembunyikan layar loading
      })
      .catch(error => {
        console.error("Terjadi kesalahan saat preloading aset:", error);
        setIsLoading(false); // Tetap lanjutkan aplikasi walau ada error
      });

  }, []);



  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Set volume when currentTrack changes or audio is ready
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack) {
      const setVolumeWhenReady = () => {
        audio.volume = volume;
      };

      // Set volume immediately if audio is already loaded
      if (audio.readyState >= 1) {
        audio.volume = volume;
      } else {
        // Wait for audio to be ready
        audio.addEventListener('loadedmetadata', setVolumeWhenReady, { once: true });
      }

      return () => {
        audio.removeEventListener('loadedmetadata', setVolumeWhenReady);
      };
    }
  }, [currentTrack, volume]);

  // Handle track ended event to play next song
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !isMobile && musicQueue.length > 0) {
      const handleTrackEnded = () => {
        console.log("Track ended, getting next track...");
        const nextTrack = getNextTrack();
        console.log("Next track:", nextTrack);
        if (nextTrack) {
          console.log("Setting next track:", nextTrack.track);
          setCurrentTrack(nextTrack.track);
          setCurrentTrackIndex(nextTrack.index);
          setShowNewTrackNotif(true);
          
          // Hide notification after 5 seconds
          setTimeout(() => {
            setShowNewTrackNotif(false);
          }, 5000);
        }
      };

      audio.addEventListener('ended', handleTrackEnded);

      return () => {
        audio.removeEventListener('ended', handleTrackEnded);
      };
    }
  }, [musicQueue, currentTrackIndex, isMobile]);

  // Auto play when track changes (except for initial load)
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack && showText) {
      const playAudio = async () => {
        try {
          console.log("Playing track:", currentTrack);
          await audio.play();
        } catch (error) {
          console.error("Failed to play next track:", error);
        }
      };

      // Small delay to ensure audio src is updated
      const playTimer = setTimeout(() => {
        playAudio();
      }, 100);

      return () => {
        clearTimeout(playTimer);
      };
    }
  }, [currentTrack, showText]);

  // Set up Media Session API for browser media controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack && !isMobile) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: getTrackDisplayName(currentTrack),
        artist: "Toby Fox",
        album: "Undertale/Deltarune OST",
      });

      // Use throttling to prevent rapid music skipping from interfering with dialogue
      let nextTrackCooldown = false;
      let prevTrackCooldown = false;

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (nextTrackCooldown) return;
        nextTrackCooldown = true;
        
        const nextTrack = getNextTrack();
        if (nextTrack) {
          setCurrentTrack(nextTrack.track);
          setCurrentTrackIndex(nextTrack.index);
          setShowNewTrackNotif(true);
          setTimeout(() => setShowNewTrackNotif(false), 5000);
        }
        
        // Cooldown to prevent rapid skipping
        setTimeout(() => {
          nextTrackCooldown = false;
        }, 1000);
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (prevTrackCooldown) return;
        prevTrackCooldown = true;
        
        const prevIndex = currentTrackIndex === 0 
          ? musicQueue.length - 1 
          : currentTrackIndex - 1;
        
        if (musicQueue[prevIndex]) {
          setCurrentTrack(musicQueue[prevIndex]);
          setCurrentTrackIndex(prevIndex);
          setShowNewTrackNotif(true);
          setTimeout(() => setShowNewTrackNotif(false), 5000);
        }
        
        // Cooldown to prevent rapid skipping
        setTimeout(() => {
          prevTrackCooldown = false;
        }, 1000);
      });
    }
  }, [currentTrack, currentTrackIndex, musicQueue, isMobile]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

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
            <MusicProvider 
              pauseMusic={pauseMusic} 
              resumeMusic={resumeMusic} 
              isPaused={isMusicPaused}
            >
              <Textbox />
            </MusicProvider>
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
      {currentTrack && <audio ref={audioRef} src={`/sound/music/${currentTrack}`} />}
      {!isMobile && (
        <MusicNotifier 
          key={currentTrack} // Force remount on track change
          isPlaying={showText} 
          trackName={showNewTrackNotif ? `🔄 ${getTrackDisplayName(currentTrack)}` : getTrackDisplayName(currentTrack)} 
        />
      )}
      {!isMobile && !isLoading && (
        <VolumeBar volume={volume} onVolumeChange={handleVolumeChange} />
      )}
    </div>

  );
}

export default App;