import { useMemo } from 'react';

/**
 * Hook kustom untuk memecah teks menjadi beberapa baris berdasarkan lebar maksimum,
 * sambil tetap menghormati karakter newline manual (\n).
 */
export const useTextWrapper = (text: string, maxWidth: number, font: string): string => {
  const wrappedText = useMemo(() => {
    if (!text || !font || maxWidth <= 0) {
      return text;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      return text;
    }
    context.font = font;

    const cleanTextForMeasuring = (str: string) => {
      return str.replace(/\^\d/g, '').replace(/\\C[A-Z]/g, '');
    };

    // 1. Pecah teks berdasarkan \n manual TERLEBIH DAHULU
    const manualLines = text.split('\n');

    // 2. Terapkan word-wrap otomatis ke setiap baris manual secara terpisah
    const processedParagraphs = manualLines.map(paragraph => {
      // Lewati paragraf kosong untuk menghindari baris baru yang tidak diinginkan
      if (paragraph === '') {
          return '';
      }

      const words = paragraph.split(' ');
      const autoWrappedLines: string[] = [];
      let currentLine = '';

      words.forEach(word => {
        const separator = currentLine === '' ? '' : ' ';
        const testLine = currentLine + separator + word;
        const testLineWidth = context.measureText(cleanTextForMeasuring(testLine)).width;

        // Cek `currentLine !== ''` untuk mencegah baris kosong jika kata pertama sudah terlalu panjang
        if (testLineWidth > maxWidth && currentLine !== '') {
          autoWrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      autoWrappedLines.push(currentLine);

      // Gabungkan kembali baris yang sudah di-wrap otomatis
      return autoWrappedLines.join('\n');
    });

    // 3. Gabungkan kembali semua paragraf yang telah diproses
    return processedParagraphs.join('\n');

  }, [text, maxWidth, font]);

  return wrappedText;
};