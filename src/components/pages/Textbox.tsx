// import HTMLFlipBook from "react-pageflip";
// import TypingEffect from "../hooks/typing-effect";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Typewriter from "../hooks/typing-effect";
// import { Button } from "../ui/button";


function Textbox() {
  // State untuk mengontrol visibilitas
  const [isVisible, setIsVisible] = useState(false);


  useEffect(() => {
    // Set `isVisible` menjadi true sesaat setelah komponen di-mount.
    // Ini memberi browser waktu untuk merender state awal (tak terlihat).
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Jeda singkat 100ms

    return () => clearTimeout(timer); // Cleanup timer
  }, []);


  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className={cn(

          // Terapkan transisi untuk properti transform dan opacity
          "transition-all duration-1000 ease-out",
          // Atur state awal dan akhir dari animasi
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        )}
      >

        <div className="bg-black border-4 border-white pt-4 pl-6 pr-6 pb-4 w-[576px] h-48 text-white text-3xl">
          <Typewriter
            text={"Halo dunia!^5 Ini teks \\CKkuning!^4\n \\CPIni \\CMmerah!^4 \\CPIni putih.^5 Heheh."}
            speed={60}
            basePauseMs={1000/30}
            soundSrc="/music/snd_txtsus.wav" // Path ke file suara di folder public
          />

          {/* Disini action z*/}
          {/* Lalu muncul lagi typewriternya */}
        </div>

      </div>

    </div>
  );
}

export default Textbox;