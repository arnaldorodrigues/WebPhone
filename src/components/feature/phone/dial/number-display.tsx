import { NextPage } from "next";

interface NumberDisplayProps {
  value: string;
}

const NumberDisplay = ({ value }: NumberDisplayProps) => {
  return (
    <div className="p-4 text-white w-full text-5xl font-light flex items-center overflow-x-auto">
      <span className="h-12 tracking-wider text-white/90">{value}</span>
      <span className="h-8 w-0.5 bg-white/30 animate-pulse ml-2 rounded-full" />
    </div>
  );
};

export default NumberDisplay;
