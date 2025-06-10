import { NextPage } from "next";

interface NumberDisplayProps {
  value: string;
}

const NumberDisplay = ({ value }: NumberDisplayProps) => {
  return (
    <div className="relative p-2 w-full flex items-center justify-center min-h-[120px] ">
      <div className="flex items-center justify-start w-full overflow-hidden">
        {/* Phone number display */}
        <span
          className={`font-light tracking-wide text-transparent bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text drop-shadow-sm ${
            value.length > 10
              ? "text-4xl tracking-normal"
              : value.length > 7
              ? "text-5xl tracking-wide"
              : "text-6xl tracking-[0.2em]"
          }`}
        >
          {value || ""}
        </span>

        {/* Animated cursor */}
        <div className="ml-3 flex items-center flex-shrink-0">
          <span className="h-12 w-1 bg-gradient-to-b from-white to-blue-200 animate-pulse rounded-full shadow-lg shadow-white/30" />
        </div>
      </div>

      {/* Placeholder text when no number */}
      {/* {!value && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-light text-white/70 tracking-wide">
            Enter phone number
          </span>
        </div>
      )} */}

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-blue-200/10 to-white/5 rounded-xl pointer-events-none" />
    </div>
  );
};

export default NumberDisplay;
