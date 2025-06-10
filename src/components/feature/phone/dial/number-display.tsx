import { NextPage } from "next";

interface NumberDisplayProps {
  value: string;
}

const NumberDisplay = ({ value }: NumberDisplayProps) => {
  return (
    <div className="relative p-6 w-full flex items-center justify-center min-h-[120px] bg-black/20 rounded-xl border border-slate-600/30 backdrop-blur-sm">
      <div className="flex items-center justify-center w-full">
        {/* Phone number display */}
        <span className="text-6xl font-light tracking-[0.2em] text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text drop-shadow-sm">
          {value || ""}
        </span>

        {/* Animated cursor */}
        <div className="ml-3 flex items-center">
          <span className="h-12 w-1 bg-gradient-to-b from-emerald-400 to-cyan-400 animate-pulse rounded-full shadow-lg shadow-emerald-400/50" />
        </div>
      </div>

      {/* Placeholder text when no number */}
      {!value && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-light text-slate-400 tracking-wide">
            Enter phone number
          </span>
        </div>
      )}

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 via-cyan-400/5 to-blue-400/5 rounded-xl pointer-events-none" />
    </div>
  );
};

export default NumberDisplay;
