// src/components/dialogue/ChoiceBox.tsx

interface ChoiceOption {
  text: string;
  goto: string;
}

interface ChoiceBoxProps {
  options: ChoiceOption[];
  selectedIndex: number;
}

const ChoiceBox: React.FC<ChoiceBoxProps> = ({ options, selectedIndex }) => {
  return (
    // Kontainer utama yang memenuhi area dan menengahkan pilihan
    <div className="w-full h-full flex justify-center items-center text-white text-[2rem] font-['DeterminationMonoRegular']">
      <div className="flex items-center gap-x-25">
        {options.map((option, index) => (
          <div key={option.goto} className="flex items-center gap-x-3">
            {/* Tampilkan icon hati jika ini adalah pilihan yang aktif */}
            {selectedIndex === index ? (
              <img
                src="/img/soul/spr_heart_0.png"
                className="w-5 h-5"
                style={{ imageRendering: 'crisp-edges' }}
              />
            ) : (
              <div className="w-5 h-5" />
            )}

            <span className={selectedIndex !== index ? 'opacity-60' : 'opacity-100'}>
              {option.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChoiceBox;