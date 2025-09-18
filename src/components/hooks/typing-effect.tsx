import React, { useState, useEffect, useMemo } from 'react';

// Delay teks
const DEFAULT_COLOR_MAP = { 'P': '#FFFFFF', 'K': '#FFCC00', 'M': '#FF0000' };
const DEFAULT_DELAY_MAP = {
  '1': 5, '2': 10, '3': 15, '4': 20, '5': 30, '6': 40, '7': 60, '8': 90, '9': 150,
};

// Interface untuk segmen teks dengan warna
interface TextSegment {
  text: string;
  color: string;
  isNewLine?: boolean;
}

// Interface props untuk komponen Typewriter
interface TypewriterProps {
  text: string;
  speed?: number;
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
  // Default ke putih
  defaultColor = '#FFFFFF',
  fontFamily = 'DeterminationMonoRegular',
  // Default map: P=putih, K=kuning, M=merah
  colorMap = DEFAULT_COLOR_MAP,
  onComplete,
}) => {
  // State untuk menyimpan segmen teks yang sudah diproses
  const [segments, setSegments] = useState<TextSegment[]>([]);

  // Objek audio menggunakan useMemo agar tidak dibuat ulang terus-menerus
  const textSound = useMemo(() => {
    if (soundSrc) {
      const audio = new Audio(soundSrc)
      return audio;
    }
    return null;
  }, [soundSrc]);

  useEffect(() => {
    // Reset segmen setiap teks berubah
    setSegments([]);

    let index = 0;
    let currentColor = defaultColor;
    let timerId: number;

    function type() {
      if (index >= text.length) {
        onComplete?.();
        return;
      }

      const char = text[index];
      const nextChar = text[index + 1];
      const colorKey = text[index + 2];

      // 1. Cek Delay (Pause)
      if (char === '^' && nextChar && nextChar in DEFAULT_DELAY_MAP) {
        const pauseUnits = DEFAULT_DELAY_MAP[nextChar as keyof typeof DEFAULT_DELAY_MAP];
        const duration = pauseUnits * basePauseMs;
        index += 2;
        timerId = window.setTimeout(type, duration);

        // 2. Cek Perubahan Warna
      } else if (char === '\\' && nextChar === 'C' && colorKey && colorKey in DEFAULT_COLOR_MAP) {
        currentColor = DEFAULT_COLOR_MAP[colorKey as keyof typeof DEFAULT_COLOR_MAP];
        index += 3;

        type();

        // 3. Cek Newline
      } else if (char === '\n') {
        // Tambahkan segmen newline khusus
        setSegments((prevSegments) => [
          ...prevSegments,
          { text: '', color: currentColor, isNewLine: true }
        ]);
        index += 1; // Loncat 1 karakter '\n'
        type(); // Lanjut (tanpa suara, tanpa jeda ketik)

        // 4. Karakter Biasa
      } else {

        if (textSound && char !== ' ') {
          const sound = textSound.cloneNode(true) as HTMLAudioElement;
          sound.volume = 1;
          sound.play().catch(e => console.error("Audio play failed:", e));
        }

        // Logika untuk menambahkan karakter ke segmen
        setSegments((prevSegments) => {
          const lastSegment = prevSegments[prevSegments.length - 1];

          if (lastSegment && lastSegment.color === currentColor && !lastSegment.isNewLine) {

            const updatedLastSegment = {
              ...lastSegment,
              text: lastSegment.text + char
            };
            return [...prevSegments.slice(0, -1), updatedLastSegment];

          } else {
            // Buat segmen baru
            return [...prevSegments, { text: char, color: currentColor }];
          }
        });

        index += 1;
        timerId = window.setTimeout(type, speed);
      }
    }

    // Animasi ketik dimulai
    timerId = window.setTimeout(type, speed);

    // Cleanup
    return () => {
      window.clearTimeout(timerId);
    };

  }, [text, speed, basePauseMs, soundSrc, defaultColor, colorMap, textSound, onComplete ]);

  // Render: Map array segmen menjadi beberapa <span>
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