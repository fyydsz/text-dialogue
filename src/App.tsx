// Import komponen dan hooks yang dibutuhkan
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
  // Hook untuk mendeteksi apakah perangkat mobile
  const isMobile = useIsMobile();
  
  // State untuk mengontrol tampilan teks
  const [showText, setshowText] = useState(false);
  
  // State untuk loading screen
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk kontrol volume musik (default 50%)
  const [volume, setVolume] = useState(0.5);
  
  // State untuk track musik yang sedang diputar
  const [currentTrack, setCurrentTrack] = useState("");
  
  // State untuk index track saat ini dalam queue
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  
  // State untuk antrian musik yang akan diputar
  const [musicQueue, setMusicQueue] = useState<string[]>([]);
  
  // State untuk menampilkan notifikasi track baru
  const [showNewTrackNotif, setShowNewTrackNotif] = useState(false);
  
  // State untuk mengetahui apakah musik sedang di-pause
  const [isMusicPaused, setIsMusicPaused] = useState(false);

  // Referensi untuk elemen audio HTML
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fungsi untuk menjeda musik (untuk efek komedi)
  const pauseMusic = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsMusicPaused(true);
      console.log("Musik dijeda untuk efek komedi");
    }
  };

  // Fungsi untuk melanjutkan musik yang dijeda
  const resumeMusic = () => {
    if (audioRef.current && audioRef.current.paused && isMusicPaused) {
      audioRef.current.play().catch(console.error);
      setIsMusicPaused(false);
      console.log("Musik dilanjutkan");
    }
  };

  // Daftar file musik yang tersedia untuk diputar secara acak
  const musicTracks = [
    "field_of_hopes_and_dreams.mp3",
    "rude_buster.mp3",
    "ruder_buster.mp3",
    "the_third_sanctuary.mp3",
  ];

  // Fungsi untuk mengacak urutan array menggunakan algoritma Fisher-Yates
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fungsi untuk membuat antrian musik yang sudah diacak
  const createMusicQueue = () => {
    return shuffleArray(musicTracks);
  };

  // Fungsi untuk mendapatkan track selanjutnya dalam antrian
  const getNextTrack = (): { track: string; index: number } | null => {
    if (musicQueue.length === 0) return null;
    const nextIndex = (currentTrackIndex + 1) % musicQueue.length;
    return { track: musicQueue[nextIndex], index: nextIndex };
  };

  // Fungsi untuk mendapatkan nama tampilan track yang lebih user-friendly
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
    // Inisialisasi antrian musik dan set track pertama saat komponen dimount
    if (!isMobile) {
      const queue = createMusicQueue();
      setMusicQueue(queue);
      setCurrentTrack(queue[0]);
      setCurrentTrackIndex(0);
    } else {
      // Untuk mobile, set track default
      setCurrentTrack("dogsong.mp3");
    }
  }, [isMobile]);

  useEffect(() => {
    // Fungsi untuk preload semua aset (audio, font, gambar) sebelum aplikasi dimulai
    const preloadAssets = async () => {
      const audio = audioRef.current;
      const font = "35px DeterminationMonoRegular"; 
      
      // Mengambil semua URL gambar dari profil pembicara
      const imageUrls = Object.values(SPEAKER_PROFILES).flatMap(
        profile => profile.avatars ? Object.values(profile.avatars) : []
      );
      
      // Menghilangkan duplikasi URL gambar
      const uniqueImageUrls = [...new Set(imageUrls)];

      // Promise untuk memuat audio
      const audioPromise = new Promise<void>((resolve, reject) => {
        if (!audio) return resolve();
        if (audio.readyState >= 4) return resolve();
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', (e) => reject(new Error(`Gagal memuat audio: ${e}`)), { once: true });
      });

      // Promise untuk memuat font
      const fontPromise = document.fonts.load(font);

      // Promise untuk memuat semua gambar
      const imagePromises = uniqueImageUrls.map(src => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Gagal memuat gambar: ${src}`));
        });
      });

      // Menunggu semua aset selesai dimuat
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



  // Effect untuk mengupdate volume audio ketika state volume berubah
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Effect untuk mengatur volume ketika track berubah atau audio siap diputar
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack) {
      const setVolumeWhenReady = () => {
        audio.volume = volume;
      };

      // Set volume langsung jika audio sudah dimuat
      if (audio.readyState >= 1) {
        audio.volume = volume;
      } else {
        // Tunggu sampai audio siap untuk diputar
        audio.addEventListener('loadedmetadata', setVolumeWhenReady, { once: true });
      }

      return () => {
        audio.removeEventListener('loadedmetadata', setVolumeWhenReady);
      };
    }
  }, [currentTrack, volume]);

  // Effect untuk menangani event ketika track selesai diputar dan memutar lagu berikutnya
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !isMobile && musicQueue.length > 0) {
      const handleTrackEnded = () => {
        console.log("Track selesai, mendapatkan track berikutnya...");
        const nextTrack = getNextTrack();
        console.log("Track berikutnya:", nextTrack);
        if (nextTrack) {
          console.log("Mengatur track berikutnya:", nextTrack.track);
          setCurrentTrack(nextTrack.track);
          setCurrentTrackIndex(nextTrack.index);
          setShowNewTrackNotif(true);
          
          // Sembunyikan notifikasi setelah 5 detik
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

  // Effect untuk otomatis memutar musik ketika track berubah (kecuali saat pertama kali loading)
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack && showText) {
      const playAudio = async () => {
        try {
          console.log("Memutar track:", currentTrack);
          await audio.play();
        } catch (error) {
          console.error("Gagal memutar track berikutnya:", error);
        }
      };

      // Delay kecil untuk memastikan src audio sudah terupdate
      const playTimer = setTimeout(() => {
        playAudio();
      }, 100);

      return () => {
        clearTimeout(playTimer);
      };
    }
  }, [currentTrack, showText]);

  // Effect untuk mengatur Media Session API untuk kontrol musik dari browser/sistem operasi
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack && !isMobile) {
      // Mengatur metadata untuk ditampilkan di kontrol media browser
      navigator.mediaSession.metadata = new MediaMetadata({
        title: getTrackDisplayName(currentTrack),
        artist: "Toby Fox",
        album: "Undertale/Deltarune OST",
      });

      // Menggunakan throttling untuk mencegah skip musik yang terlalu cepat mengganggu dialog
      let nextTrackCooldown = false;
      let prevTrackCooldown = false;

      // Handler untuk tombol next track
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
        
        // Cooldown untuk mencegah skip yang terlalu cepat
        setTimeout(() => {
          nextTrackCooldown = false;
        }, 1000);
      });

      // Handler untuk tombol previous track
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
        
        // Cooldown untuk mencegah skip yang terlalu cepat
        setTimeout(() => {
          prevTrackCooldown = false;
        }, 1000);
      });
    }
  }, [currentTrack, currentTrackIndex, musicQueue, isMobile]);

  // Fungsi untuk menangani perubahan volume dari komponen VolumeBar
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  // Render komponen utama
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
          key={currentTrack} 
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