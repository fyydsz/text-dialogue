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
interface TextSegment {
  text: string;
  color: string;
  isNewLine?: boolean;
}

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
}) => {
  /** State untuk menyimpan segmen teks yang sudah diproses */
  const [segments, setSegments] = useState<TextSegment[]>([]);

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

    /** Fungsi untuk mengetik karakter satu per satu */
    function type() {
      if (index >= text.length) {
        if (text.length > 0) {
          onComplete?.();
        }
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
          { text: '', color: currentColor, isNewLine: true }
        ]);
        index += 1;
        type();
      } else { // Karakter biasa

        if (textSound && char !== ' ') { // Mainkan suara
          const sound = textSound.cloneNode(true) as HTMLAudioElement;
          sound.volume = 1;
          sound.play().catch(e => console.error("Audio play failed:", e));
        }

        setSegments((prevSegments) => { // Fungsi untuk menambahkan karakter ke segmen
          const lastSegment = prevSegments[prevSegments.length - 1];

          if (lastSegment && lastSegment.color === currentColor && !lastSegment.isNewLine) {

            const updatedLastSegment = {
              ...lastSegment,
              text: lastSegment.text + char
            };
            return [...prevSegments.slice(0, -1), updatedLastSegment];

          } else {
            return [...prevSegments, { text: char, color: currentColor }];
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

  }, [text, speed, basePauseMs, soundSrc, defaultColor, colorMap, textSound, onComplete]);

  /** Render segmen teks dengan gaya yang sesuai */
  return (
    <span style={{ fontFamily: fontFamily }}>
      {segments.map((segment, i) => (
        segment.isNewLine ? (
          <br key={i} />
        ) : (
          <span key={i} style={{ color: segment.color }}>
            {segment.text}
          </span>
        )))}
    </span>
  );
};

export default Typewriter;