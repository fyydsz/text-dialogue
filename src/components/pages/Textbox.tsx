import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Typewriter from "../hooks/typing-effect";
import { SPEAKER_PROFILES, DEFAULT_SPEAKER } from "../dialogue/speaker.config";
import ChoiceBox from "../dialogue/Choicebox";
import { useTextWrapper } from "../dialogue/function/useTextWrapper";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

/** Map untuk ikon */
const ICON_MAP: { [key: string]: (color: string) => React.ReactNode } = {
  'ArrowBigLeft': (color) => <ArrowBigLeft className="inline-block align-middle" style={{ color: color }} size={30} />,
  'ArrowBigRight': (color) => <ArrowBigRight className="inline-block align-middle" style={{ color: color }} size={30} />,
};

/** Interface untuk profil speaker */
interface SpeakerProfile {
  name: string;
  soundSrc: string;
  avatars?: { [key: string]: string };
}

/** Tipe untuk node dialog */
type DialogueNodeObject = {
  speaker: string;
  avatar: string;
  text: string;
  type?: undefined;
} | {
  type: 'choice';
  options: { text: string; goto: string; }[];
  speaker?: undefined;
  avatar?: undefined;
  text?: undefined;
} | {
  type: 'end';
  speaker?: undefined;
  avatar?: undefined;
  text?: undefined;
};

/** Tipe untuk pohon dialog */
type DialogueTree = {
  [key: string]: DialogueNodeObject[];
};

/** Interface untuk opsi pilihan */
interface ChoiceOption {
  text: string;
  goto: string;
}

/** Pohon dialog */
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
        text: "* Dan ini adalah teks terakhir,^5 \\CK...Mungkin?"
      },
      {
        speaker: "ralsei",
        avatar: "ralseiserious",
        text: "* Tunggu sebentar...^4\nAda satu hal."
      },
      {
        speaker: "ralsei",
        avatar: "ralseijoy",
        text: `* Kamu bisa menggunakan tombol \\CK<ICON:ArrowBigLeft> dan <ICON:ArrowBigRight> \\N\\CPUntuk memilih opsi.`
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
        avatar: "ralseijoy",
        text: "* Hebat!^5 Sepertinya kamu cepat beradaptasi!"
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
      {
        type: "choice",
        options: [
          { text: "Aku mengerti", goto: "tutorial_1" },
          { text: "Tidak mengerti", goto: "tutorial_2-1" },
        ]
      }
    ],
  "tutorial_2-1":
    [
      {
        speaker: "ralsei",
        avatar: "ralseiangry",
        text: "* Kamu emang sengaja ya^2 bikin aku marah!?^5 \\CK..."
      },
      {
        type: "choice",
        options: [
          { text: "Aku mengerti", goto: "tutorial_1" },
        ]
      }
    ],
}



/**
 * Textbox component untuk menampilkan dialog dan pilihan.
 * @returns JSX.Element
 */
function Textbox() {
  const [isVisible, setIsVisible] = useState(false); // Kontrol visibilitas kotak teks
  const [isTyping, setIsTyping] = useState(true); // Kontrol status mengetik
  const [currentText, setCurrentText] = useState(""); // Teks saat ini yang ditampilkan
  const [speakerProfile, setSpeakerProfile] = useState<SpeakerProfile>(DEFAULT_SPEAKER); // Profil pembicara 
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null); // Sumber avatar
  const [currentBranch, setCurrentBranch] = useState('start'); // Node dialog
  const [currentIndex, setCurrentIndex] = useState(0); // Indeks node dialog
  const [isChoosing, setIsChoosing] = useState(false); // Apakah sedang dalam mode memilih
  const [choiceOptions, setChoiceOptions] = useState<ChoiceOption[]>([]); // Opsi pilihan
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0); // Indeks pilihan yang dipilih
  const [inputLocked, setInputLocked] = useState(false); // Kontrol penguncian input
  const [textContainerWidth, setTextContainerWidth] = useState(0); // Lebar kontainer teks untuk wrapping
  const textContainerRef = useRef<HTMLDivElement>(null); // Ref untuk elemen kontainer teks
  const zKeyIsDown = useRef(false); // Ref untuk melacak status tombol 'z'

  const FONT_FAMILY = "DeterminationMonoRegular";
  const DIALOGUE_FONT_SIZE = 35;

  /** Effect untuk mengukur lebar kontainer teks */
  useEffect(() => {
    function measureContainer() {
      if (textContainerRef.current) {
        const element = textContainerRef.current;
        const style = window.getComputedStyle(element);
        const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const newWidth = element.offsetWidth - paddingX;
        setTextContainerWidth(newWidth);
      }
    }
    if (isVisible) {
      measureContainer();
    }
  }, [isVisible]);

  /** Dialog saat ini */
  const currentDialogue = DIALOGUES_TREE[currentBranch]?.[currentIndex];

  /** Text wrapping dengan custom hook */
  const wrappedText = useTextWrapper(
    currentDialogue && currentDialogue.type !== 'choice' && currentDialogue.type !== 'end' ? currentDialogue.text : "",
    textContainerWidth,
    `${DIALOGUE_FONT_SIZE}px ${FONT_FAMILY}`
  );
  /** Effect untuk mengatur dialog */
  useEffect(() => {
    const dialogueNode = DIALOGUES_TREE[currentBranch]?.[currentIndex];

    if (!dialogueNode) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    setIsChoosing(false);

    if (dialogueNode.type === 'choice') { // Mode pilihan
      setCurrentText("");
      setIsTyping(false);
      setChoiceOptions(dialogueNode.options);
      setSelectedChoiceIndex(0);
      setIsChoosing(true);
    } else if (dialogueNode.type === 'end') { // Mode akhir dialog
      setIsVisible(false);
    } else { // Mode dialog biasa
      setIsTyping(true);
      setCurrentText("");


      // 1. Set profil speaker dan avatar
      const profile = SPEAKER_PROFILES[dialogueNode.speaker] || DEFAULT_SPEAKER;
      setSpeakerProfile(profile);
      const avatarPath = profile.avatars?.[dialogueNode.avatar] || profile.avatars?.default;
      setAvatarSrc(avatarPath || null);

      // 2. Fungsi untuk memulai aksi mengetik
      const startTypingAction = () => {
        if (wrappedText) {
          setCurrentText(wrappedText);
        }
      };

      // 3. Set delay typing untuk dialog pertama
      if (currentBranch === 'start' && currentIndex === 0) {
        const timer = setTimeout(startTypingAction, 1000);
        return () => clearTimeout(timer);
      } else {
        startTypingAction();
      }
    }
  }, [currentBranch, currentIndex, wrappedText]);

  /** Callback saat mengetik selesai */
  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
    if (zKeyIsDown.current) {
      setInputLocked(true);
    }
  }, []);

  /** Event handler untuk penekanan tombol */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isChoosing) {
      if (event.key === 'ArrowRight') { // Navigasi pilihan 
        setSelectedChoiceIndex(prev => (prev + 1) % choiceOptions.length);
      } else if (event.key === 'ArrowLeft') { // Navigasi pilihan
        setSelectedChoiceIndex(prev => (prev - 1 + choiceOptions.length) % choiceOptions.length);
      } else if (event.key.toLowerCase() === 'z') { // Konfirmasi pilihan
        const selectedOption = choiceOptions[selectedChoiceIndex];
        if (selectedOption) {
          setCurrentBranch(selectedOption.goto);
          setCurrentIndex(0); // Mulai dari awal node baru
        }
      }
    } else { // Logika saat dalam mode dialog biasa
      if (event.key.toLowerCase() === 'z') {
        zKeyIsDown.current = true
        if (isTyping || inputLocked) return; // Abaikan jika sedang mengetik
        setCurrentIndex(prev => prev + 1);
      }
    }
  }, [isTyping, isChoosing, choiceOptions, selectedChoiceIndex, inputLocked]);

  /** Event handler untuk pelepasan tombol */
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.key.toLowerCase() === 'z') {
      zKeyIsDown.current = false;
      setInputLocked(false);
    }
  }, []);

  /** Pasang event listener untuk keydown dan keyup */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Dialog saat ini


  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={cn("transition-all duration-2000 ease-out", isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
        {currentDialogue && (
          <div className="relative w-[750px] h-48">
            <div className="bg-black border-4 border-white w-full h-full flex items-center">

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
              <div
                ref={textContainerRef}
                className={cn(
                  "h-full",
                  !isChoosing ? "flex-grow pt-4 pr-4 pb-4" : "w-full",
                  "whitespace-pre-wrap break-words leading-tight",
                  currentText.startsWith('* ') && "hanging-indent"
                )}
                style={{ fontFamily: FONT_FAMILY, fontSize: DIALOGUE_FONT_SIZE }}
              >

                {/* Tampilkan Typewriter HANYA JIKA TIDAK sedang memilih */}
                {!isChoosing && (
                  <Typewriter
                    text={currentText}
                    speed={50}
                    basePauseMs={1000 / 30}
                    soundSrc={speakerProfile.soundSrc}
                    onComplete={handleTypingComplete}
                    iconMap={ICON_MAP}
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