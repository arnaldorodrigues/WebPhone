import NumberDisplay from "./number-display";
import CandidateList from "./candidate-list";

interface DialDisplayProps {
  value: string;
  candidates?: Array<{ number: string; name?: string }>;
}

const DialDisplay = ({ value, candidates = [] }: DialDisplayProps) => {
  return (
    <div className="w-full h-full p-3 flex flex-col gap-6 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-t-2xl shadow-2xl border-b border-indigo-500/30">
      <NumberDisplay value={value} />
      <CandidateList candidates={candidates} />
    </div>
  );
};

export default DialDisplay;
