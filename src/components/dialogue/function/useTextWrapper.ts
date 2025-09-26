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
      // Hapus kode pause, kode warna, DAN placeholder ikon
      return str.replace(/\^\d/g, '').replace(/\\C[A-Z]/g, '').replace(/<ICON:\w+>/g, '').replace(/\\N/g, '');
    };

    // 1. Ganti \\N dengan placeholder unik untuk melindunginya dari splitting
    const placeholder = '___NEWLINE_MARKER___';
    const textWithPlaceholders = text.replace(/\\N/g, placeholder);

    // 2. Pecah teks berdasarkan \n manual TERLEBIH DAHULU
    const manualLines = textWithPlaceholders.split('\n');

    // 3. Terapkan word-wrap otomatis ke setiap baris manual secara terpisah
    const processedParagraphs = manualLines.map(paragraph => {
      // Lewati paragraf kosong untuk menghindari baris baru yang tidak diinginkan
      if (paragraph === '') {
        return '';
      }

      // Pecah berdasarkan \\N placeholder juga untuk menghindari wrapping di tengahnya
      const segments = paragraph.split(placeholder);
      
      const wrappedSegments = segments.map(segment => {
        if (segment === '') return '';
        
        const words = segment.split(' ');
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

        return autoWrappedLines.join('\n');
      });

      // Gabungkan kembali dengan \\N
      return wrappedSegments.join('\\N');
    });

    // 4. Gabungkan kembali semua paragraf yang telah diproses
    return processedParagraphs.join('\n');

  }, [text, maxWidth, font]);

  return wrappedText;
};