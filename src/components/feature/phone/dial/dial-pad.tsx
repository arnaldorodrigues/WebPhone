import { BackspaceIcon, PhoneIcon } from "@heroicons/react/24/outline";

interface DialPadProps {
  onPressButton: (c: string) => void;
  onCall?: () => void;
}

const DialPad = ({ onPressButton, onCall }: DialPadProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onPressButton(e.currentTarget.name);
  };

  const handleCall = () => {
    if (onCall) onCall();
  };

  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-5 gap-3 p-4">
      {[...Array.from({ length: 9 }, (_, i) => i + 1), "'", 0, "#"].map(
        (num) => (
          <button
            key={num}
            name={`${num}`}
            onClick={handleClick}
            className="row-span-1 col-span-1 bg-white rounded-xl shadow-sm hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-2xl font-medium cursor-pointer transition-all duration-150 ease-in-out"
          >
            {num}
          </button>
        )
      )}
      <div className="row-span-1 col-span-1"></div>
      <div className="row-span-1 col-span-1 flex items-center justify-center">
        <button
          onClick={handleCall}
          className="w-16 h-16 rounded-full shadow-lg shadow-indigo-500/30 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out"
        >
          <PhoneIcon className="w-8 h-8 text-white" />
        </button>
      </div>
      <button
        name="backspace"
        onClick={handleClick}
        className="row-span-1 col-span-1 rounded-xl bg-white hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out"
      >
        <BackspaceIcon className="w-8 h-8 text-gray-600" />
      </button>
    </div>
  );
};

export default DialPad;
