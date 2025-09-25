import React, { useState, useEffect, useMemo } from 'react';

/** Map untuk warna teks */
const DEFAULT_COLOR_MAP = { 'P': '#FFFFFF', 'K': '#FFCC00', 'M': '#FF0000' };
/** Map untuk jeda teks */
const DEFAULT_DELAY_MAP = {
  '1': 5,
  '2': 10,
  '3': 15,
  '4': 20,
  '5': 30,
  '6': 40,
  '7': 60,
  '8': 90,
  '9': 150,
};

/** Interface untuk segmen teks dengan warna & baris baru */
type TextSegment = {
  type: 'text';
  text: string;
  color: string;
  isNewLine?: boolean;
};

type ComponentSegment = {
  type: 'component';
  key: string; // Kunci unik untuk rendering
  component: React.ReactNode;
};

type Segment = TextSegment | ComponentSegment;


// Interface props untuk komponen Typewriter
interface TypewriterProps {
  text: string;
  /** Kecepatan ketik (dalam ms per karakter) */
  speed?: number;
  /** Jeda dasar antara karakter (dalam ms) */
  basePauseMs?: number;
  /** Path ke file suara */
  soundSrc?: string;
  /** Font family untuk teks */
  fontFamily?: string;
  /** Warna teks default */
  defaultColor?: string;
  /** Map untuk formatter warna, e.g., \C1, \C2 */
  colorMap?: { [key: string]: string },
  /** OnComplete callback */
  onComplete?: () => void,
  /** Map untuk ikon, e.g., <ICON:ArrowBigRight> */
  iconMap?: { [key: string]: React.ReactNode | ((color: string) => React.ReactNode) };
}

const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  basePauseMs = 10,
  soundSrc,
  /** Warna teks default */
  defaultColor = '#FFFFFF',
  /** Font family untuk teks */
  fontFamily = 'DeterminationMonoRegular',
  /** Map untuk jeda teks */
  colorMap = DEFAULT_COLOR_MAP,
  onComplete,
  iconMap = {},
}) => {
  /** State untuk menyimpan segmen teks yang sudah diproses */
  const [segments, setSegments] = useState<Segment[]>([]);

  /** Objek audio untuk efek suara */
  const textSound = useMemo(() => {
    if (soundSrc) {
      const audio = new Audio(soundSrc)
      return audio;
    }
    return null;
  }, [soundSrc]);

  /** Efek untuk memproses teks */
  useEffect(() => {
    setSegments([]);

    let index = 0;
    let currentColor = defaultColor;
    let timerId: number;
    // Check icon regex
    const iconRegex = /<ICON:(\w+)>/;

    /** Fungsi untuk mengetik karakter satu per satu */
    function type() {
      if (index >= text.length) {
        if (text.length > 0) {
          onComplete?.();
        }
        return;
      }

      const remainingText = text.substring(index);
      const match = remainingText.match(iconRegex);

      if (match && match.index === 0) {
        const iconName = match[1];
        const iconGenerator = iconMap[iconName];
        if (iconGenerator) {
          const iconComponent = typeof iconGenerator === 'function'
            ? (iconGenerator as (color: string) => React.ReactNode)(currentColor)
            : iconGenerator;
          setSegments((prevSegments) => [
            ...prevSegments,
            { type: 'component', key: `icon-${index}`, component: iconComponent }
          ]);
        }
        index += match[0].length;
        type();
        return;
      }

      const char = text[index];
      const nextChar = text[index + 1];
      const colorKey = text[index + 2];

      if (char === '^' && nextChar && nextChar in DEFAULT_DELAY_MAP) {  // Cek delay (Pause)
        const pauseUnits = DEFAULT_DELAY_MAP[nextChar as keyof typeof DEFAULT_DELAY_MAP];
        const duration = pauseUnits * basePauseMs;
        index += 2;
        timerId = window.setTimeout(type, duration);
      } else if (char === '\\' && nextChar === 'C' && colorKey && colorKey in DEFAULT_COLOR_MAP) { // Cek perubahan warna
        currentColor = DEFAULT_COLOR_MAP[colorKey as keyof typeof DEFAULT_COLOR_MAP];
        index += 3;
        type();
      } else if (char === '\n') { // Cek Newline atau baris baru
        setSegments((prevSegments) => [
          ...prevSegments,
          { type: 'text', text: '', color: currentColor, isNewLine: true }
        ]);
        index += 1;
        type();
      } else if (char === '\\' && nextChar === 'N') { // Cek baris baru DENGAN BINTANG
        setSegments((prevSegments) => [
          ...prevSegments,
          // Buat segmen baris baru biasa
          { type: 'text', text: '', color: currentColor, isNewLine: true },
          // Lalu, langsung tambahkan segmen baru berisi bintang
          { type: 'text', text: '* ', color: defaultColor } // Bintang selalu warna default (putih)
        ]);
        index += 2; // Lompati dua karakter: '\' dan 'N'
        type(); // Lanjutkan tanpa delay
        // ▲▲▲ AKHIR BLOK BARU ▲▲▲

      } else { // Karakter biasa

        if (textSound && char !== ' ') { // Mainkan suara
          const sound = textSound.cloneNode(true) as HTMLAudioElement;
          sound.volume = 1;
          sound.play().catch(e => console.error("Audio play failed:", e));
        }

        setSegments((prevSegments) => { // Fungsi untuk menambahkan karakter ke segmen
          const lastSegment = prevSegments[prevSegments.length - 1];

          if (lastSegment && lastSegment.type === 'text' && lastSegment.color === currentColor && !lastSegment.isNewLine && lastSegment.text !== '* ') {

            const updatedLastSegment = {
              ...lastSegment,
              text: lastSegment.text + char
            };
            return [...prevSegments.slice(0, -1), updatedLastSegment];

          } else {
            return [...prevSegments, { type: 'text', text: char, color: currentColor }];
          }
        });

        index += 1;
        timerId = window.setTimeout(type, speed);
      }
    }

    /** Mulai animasi ketik */
    timerId = window.setTimeout(type, speed);

    /** Cleanup: Hentikan timer saat komponen unmount */
    return () => {
      window.clearTimeout(timerId);
    };

  }, [text, speed, basePauseMs, soundSrc, defaultColor, iconMap, colorMap, textSound, onComplete]);

  /** Render segmen teks dengan gaya yang sesuai */
  return (
    <span style={{ fontFamily: fontFamily }}>
      {segments.map((segment, i) => {
        // Saran 1: Gunakan if/else agar lebih mudah dibaca daripada nested ternary
        if (segment.type === 'component') {
          // Saran 2: Gunakan React.Fragment agar tidak menambah <span> yang tidak perlu
          return <React.Fragment key={segment.key}>{segment.component}</React.Fragment>;
        }

        // Ini adalah segmen teks
        if (segment.isNewLine) {
          // Saran 3: Buat key lebih unik dengan prefix
          return <br key={`br-${i}`} />;
        } else {
          return (
            <span key={`text-${i}`} style={{ color: segment.color }}>
              {segment.text}
            </span>
          );
        }
      })}
    </span>
  );
};

export default Typewriter;