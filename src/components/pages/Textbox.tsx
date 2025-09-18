import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Typewriter from "../hooks/typing-effect";
import { SPEAKER_PROFILES, DEFAULT_SPEAKER } from "../dialogue/speaker.config";

const DIALOGUES = [
  { speaker: "ralsei", avatar: "ralseiserious", text: "* Halo,^3 ini teks pertamamu!^5 Kamu bisa menekan tombol \\CK\"z\"^1 \\CPuntuk melanjutkan!" },
  { speaker: "ralsei", avatar: "ralseismile2", text: "* Kamu berhasil menekan tombol \\CK\"z\"\\CP.^5 \\CPIni adalah teks kedua.^3 \\CKSelamat!" },
  { speaker: "ralsei", avatar: "ralseishy", text: "* Dan ini adalah teks terakhir.^5 \\CK...Mungkin?" },
  { speaker: "ralsei", avatar: "ralseiserious", text: "* Tunggu bentar..^3 aku \\CMmikir \\CPdulu...^7 Gajadi." },
  { speaker: "ralsei", avatar: "ralseijoy", text: "* Hehehehehe." }
];


interface SpeakerProfile {
  name: string;
  soundSrc: string;
  avatars?: { [key: string]: string };
}

function Textbox() {
  const [isVisible, setIsVisible] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // (BARU) State untuk teks yang akan ditampilkan
  const [currentText, setCurrentText] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState<SpeakerProfile>(DEFAULT_SPEAKER);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  // (DIUBAH) Efek ini sekarang mengontrol seluruh sequence
  useEffect(() => {
    const currentDialogue = DIALOGUES[dialogueIndex];
    if (!currentDialogue) return;
    setIsVisible(true);
    setCurrentText("");
    setIsTyping(true);

    const profile = SPEAKER_PROFILES[currentDialogue.speaker] || DEFAULT_SPEAKER;
    setCurrentSpeaker(profile);

    const avatarPath = profile.avatars?.[currentDialogue.avatar] || profile.avatars?.default;
    setAvatarSrc(avatarPath || null);

    const startTyping = () => {
      setCurrentText(currentDialogue.text);
    };

    // Delay hanya untuk dialog pertama
    if (dialogueIndex === 0) {
      const timer = setTimeout(startTyping, 1000);
      return () => clearTimeout(timer);
    } else {
      startTyping();
    }

  }, [dialogueIndex]);

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'z' || event.key === 'Z') {
      if (isTyping) {
        return;
      }

      if (dialogueIndex < DIALOGUES.length - 1) {
        setDialogueIndex(prevIndex => prevIndex + 1);
        // (setIsTyping(true) dipindah ke useEffect utama)
      } else {
        setIsVisible(false);
      }
    }
  }, [isTyping, dialogueIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);


  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className={cn(
          "transition-all duration-2000 ease-out",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        )}
      >
        {dialogueIndex < DIALOGUES.length && (
          <div className="relative w-[750px] h-48">

            {/* (DIUBAH) Container utama sekarang menggunakan Flexbox */}
            <div className="bg-black border-4 border-white w-full h-full flex items-center text-[35px]">

              {/* Kolom 1: Avatar */}
              <div className="px-3 flex-shrink-0">
                {avatarSrc && (
                  <img
                    src={avatarSrc}
                    alt={`${currentSpeaker.name} avatar`}
                    // Ukuran avatar tetap sama, tapi tidak lagi absolute
                    className="w-35 object-contain mr-3 ml-3"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
              </div>

              {/* Kolom 2: Teks (Typewriter) */}
              {/* flex-grow membuat div ini mengisi sisa ruang yang tersedia */}
              <div className={cn(
                "flex-grow h-full pt-4 pr-4 pb-4 whitespace-pre-wrap break-words leading-tight",
                // (DIUBAH) Tambahkan logika kondisional ini
                currentText.startsWith('* ') && "hanging-indent"
              )}>
                <Typewriter
                  text={currentText}
                  speed={50}
                  basePauseMs={1000 / 30}
                  soundSrc={currentSpeaker.soundSrc}
                  onComplete={handleTypingComplete}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Textbox;