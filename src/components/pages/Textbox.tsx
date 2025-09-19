import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Typewriter from "../hooks/typing-effect";
import { SPEAKER_PROFILES, DEFAULT_SPEAKER } from "../dialogue/speaker.config";
import ChoiceBox from "../dialogue/Choicebox";

interface SpeakerProfile {
  name: string;
  soundSrc: string;
  avatars?: { [key: string]: string };
}

type DialogueNodeObject = {
  speaker: string;
  avatar: string;
  text: string;
  type?: undefined;
} | {
  type: 'choice';
  options: { text: string; goto: string; }[];
  speaker?: undefined; // Tambahkan ini agar TypeScript tidak bingung
  avatar?: undefined;
  text?: undefined;
} | {
  type: 'end';
  speaker?: undefined;
  avatar?: undefined;
  text?: undefined;
};

// (BARU) Definisikan bentuk dari keseluruhan pohon dialog
type DialogueTree = {
  [key: string]: DialogueNodeObject[]; // Ini adalah kuncinya: [key: string]
};

interface ChoiceOption {
  text: string;
  goto: string;
}

const DIALOGUES_TREE: DialogueTree = {
  "start":
    [
      {
        speaker: "ralsei",
        avatar: "ralseiserious",
        text: "* Halo,^3 ini teks pertamamu!^5 Kamu bisa menekan tombol \\CK\"z\"^1 \\CPuntuk melanjutkan!"
      },
      {
        speaker: "ralsei",
        avatar: "ralseismile2",
        text: "* Kamu berhasil menekan tombol \\CK\"z\"\\CP.^5 \\CPIni adalah teks kedua.^3 \\CKSelamat!"
      },
      {
        speaker: "ralsei",
        avatar: "ralseishy",
        text: "* Dan ini adalah teks terakhir.^5 \\CK...Mungkin?"
      },
      {
        speaker: "ralsei",
        avatar: "ralseiserious",
        text: "* Tunggu sebentar..^4 Ada satu hal."
      },
      {
        speaker: "ralsei",
        avatar: "ralseijoy",
        text: "* Kamu bisa menggunakan tombol \\CK⮜ dan ⮞ \\CPuntuk memilih opsi yang tersedia."
      },
      {
        type: "choice",
        options: [
          { text: "Aku mengerti", goto: "tutorial_1" },
          { text: "Tidak mengerti", goto: "tutorial_2" },
        ]
      }
    ],
  "tutorial_1":
    [
      {
        speaker: "ralsei",
        avatar: "ralseiserious",
        text: "* Hebat!^5 Terus apa lagi ya...^6 oh!"
      },
      {
        speaker: "ralsei",
        avatar: "ralseijoy",
        text: "* Ga ada,^3 hehehehehehehe."
      },
      { type: "end" }
    ],
  "tutorial_2":
    [
      {
        speaker: "ralsei",
        avatar: "ralseiangry",
        text: "* Loh.^5 Masih kurang ngerti apa coba?"
      },
      { type: "end" }
    ]
}

// Ganti seluruh isi fungsi Textbox-mu dengan ini
function Textbox() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [currentText, setCurrentText] = useState("");
  const [speakerProfile, setSpeakerProfile] = useState<SpeakerProfile>(DEFAULT_SPEAKER);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  // (DIUBAH) State untuk mengelola pohon dialog, bukan lagi index linear
  const [currentBranch, setCurrentBranch] = useState('start');
  const [currentIndex, setCurrentIndex] = useState(0);

  // (BARU) State untuk mode pilihan
  const [isChoosing, setIsChoosing] = useState(false);
  const [choiceOptions, setChoiceOptions] = useState<ChoiceOption[]>([]);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);

  const [inputLocked, setInputLocked] = useState(false);
  const zKeyIsDown = useRef(false);

  // (DIUBAH) Efek utama yang membaca dari DIALOGUES_TREE
  useEffect(() => {
    const dialogueNode = DIALOGUES_TREE[currentBranch]?.[currentIndex];

    if (!dialogueNode) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    setIsChoosing(false);

    if (dialogueNode.type === 'choice') {
      setCurrentText("");
      setIsTyping(false);
      setChoiceOptions(dialogueNode.options);
      setSelectedChoiceIndex(0);
      setIsChoosing(true);
    } else if (dialogueNode.type === 'end') {
      setIsVisible(false);
    } else {
      // --- PERUBAHAN UTAMA ADA DI BLOK INI ---

      // 1. Lakukan semua setup visual secara INSTAN
      setIsTyping(true);
      setCurrentText(""); // Pastikan area teks kosong dulu
      setInputLocked(true)

      // Segera tampilkan speaker dan avatar
      const profile = SPEAKER_PROFILES[dialogueNode.speaker] || DEFAULT_SPEAKER;
      setSpeakerProfile(profile);
      const avatarPath = profile.avatars?.[dialogueNode.avatar] || profile.avatars?.default;
      setAvatarSrc(avatarPath || null);

      // 2. Buat fungsi khusus untuk memulai ketikan
      const startTypingAction = () => {
        setCurrentText(dialogueNode.text);
      };

      // 3. Terapkan delay HANYA pada aksi mengetik, dan hanya untuk dialog pertama
      if (currentBranch === 'start' && currentIndex === 0) {
        // Jika ini adalah dialog pertama, tunggu 1 detik sebelum mengetik
        const timer = setTimeout(startTypingAction, 1000);
        return () => clearTimeout(timer);
      } else {
        // Untuk semua dialog lainnya, langsung mulai mengetik
        startTypingAction();
      }
    }
  }, [currentBranch, currentIndex]);

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
    // Jika tombol 'z' SEDANG DITAHAN saat ketikan selesai, KUNCI inputnya.
    // Jika tidak, biarkan input tetap terbuka.
    if (zKeyIsDown.current) {
      setInputLocked(true);
    }
  }, []);
  // (DIUBAH) handleKeyDown sekarang punya dua mode: dialog dan memilih
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isChoosing) {
      // Logika saat dalam mode memilih
      if (event.key === 'ArrowRight') {
        setSelectedChoiceIndex(prev => (prev + 1) % choiceOptions.length);
      } else if (event.key === 'ArrowLeft') {
        setSelectedChoiceIndex(prev => (prev - 1 + choiceOptions.length) % choiceOptions.length);
      } else if (event.key.toLowerCase() === 'z') {
        const selectedOption = choiceOptions[selectedChoiceIndex];
        if (selectedOption) {
          // Lompat ke cabang baru sesuai pilihan
          setCurrentBranch(selectedOption.goto);
          setCurrentIndex(0); // Mulai dari awal cabang baru
        }
      }
    } else {
      // Logika saat dalam mode dialog biasa
      if (event.key.toLowerCase() === 'z') {
        zKeyIsDown.current = true
        if (isTyping || inputLocked) return; // Abaikan jika sedang mengetik
        // Lanjut ke dialog berikutnya di cabang yang sama
        setCurrentIndex(prev => prev + 1);
      }
    }
  }, [isTyping, isChoosing, choiceOptions, selectedChoiceIndex, inputLocked]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.key.toLowerCase() === 'z') {
      zKeyIsDown.current = false;

      setInputLocked(false);

    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Ambil dialog saat ini untuk dirender
  const currentDialogue = DIALOGUES_TREE[currentBranch]?.[currentIndex];

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={cn("transition-all duration-2000 ease-out", isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
        {currentDialogue && (
          <div className="relative w-[750px] h-48">
            {/* ... (JSX untuk nama speaker bisa ditambahkan kembali di sini jika mau) */}
            <div className="bg-black border-4 border-white w-full h-full flex items-center text-[35px]">

              {/* Kolom 1: Avatar (HANYA MUNCUL JIKA TIDAK SEDANG MEMILIH) */}
              {!isChoosing && (
                <div className="px-3 flex-shrink-0">
                  {avatarSrc && (
                    <img
                      src={avatarSrc}
                      alt={`${speakerProfile.name} avatar`}
                      className="w-35 object-contain mr-3 ml-3"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                </div>
              )}

              {/* Kolom 2: Teks ATAU Pilihan */}
              <div className={cn(
                "h-full",
                // Jika tidak memilih, beri padding. Jika memilih, ambil lebar penuh untuk menengahkan.
                !isChoosing ? "flex-grow pt-4 pr-4 pb-4" : "w-full",
                "whitespace-pre-wrap break-words leading-tight",
                currentText.startsWith('* ') && "hanging-indent"
              )}>

                {/* Tampilkan Typewriter HANYA JIKA TIDAK sedang memilih */}
                {!isChoosing && (
                  <Typewriter
                    text={currentText}
                    speed={50}
                    basePauseMs={1000 / 30}
                    soundSrc={speakerProfile.soundSrc}
                    onComplete={handleTypingComplete}
                  />
                )}

                {/* Tampilkan Pilihan HANYA JIKA SEDANG memilih */}
                {isChoosing && <ChoiceBox options={choiceOptions} selectedIndex={selectedChoiceIndex} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Textbox;