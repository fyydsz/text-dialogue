import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Typewriter from "../hooks/typing-effect";

const DIALOGUES = [
  "Halo,^3 ini teks pertamamu!^5\n Kamu bisa menekan tombol \\CK\"z\"^1 \\CPuntuk \\CMmelanjutkan!",
  "Kamu berhasil menekan tombol \\CK\"z\"\\CP.^5 \\CPIni adalah teks kedua.^3 \\CKSelamat!",
  "Dan ini adalah teks terakhir.^5\n \\CK...Mungkin?",
  "Tunggu bentar...^3 aku \\CMmikir \\CPdulu...^7 Gajadi.",
  "Hehehehehe."
];


function Textbox() {
  const [isVisible, setIsVisible] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // (BARU) State untuk teks yang akan ditampilkan
  const [currentText, setCurrentText] = useState("");

  // (DIUBAH) Efek ini sekarang mengontrol seluruh sequence
  useEffect(() => {
    setIsVisible(true);
    setCurrentText("");
    setIsTyping(true);

    if (dialogueIndex === 0) {
      const timer = setTimeout(() => {
        setCurrentText(DIALOGUES[dialogueIndex]);
      }, 1000);
      return () => clearTimeout(timer);

    } else {
      setCurrentText(DIALOGUES[dialogueIndex]);
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
          <div className="bg-black border-4 border-white pt-4 pl-6 pr-6 pb-4 w-[576px] h-48 text-white text-3xl">
            <Typewriter
              // (DIUBAH) Gunakan currentText state
              text={currentText}
              speed={60}
              basePauseMs={1000 / 30}
              soundSrc="/music/snd_txtsus.wav"
              onComplete={handleTypingComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Textbox;