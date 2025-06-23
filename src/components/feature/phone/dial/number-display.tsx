import { NextPage } from "next";

interface NumberDisplayProps {
  value: string;
}

const NumberDisplay = ({ value }: NumberDisplayProps) => {
  return (
    <div className="p-4 text-white w-full text-5xl font-light flex items-center overflow-x-auto">
      <span className="h-10 text-4xl tracking-wider text-white/90 sm:h-12 sm:text-5xl">
        {value}
      </span>
      <span className="h-8 w-0.5 animate-pulse rounded-full bg-white/30 ml-2 sm:h-10" />
    </div>
  );
};

export default NumberDisplay;
