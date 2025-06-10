import NumberDisplay from "./number-display";
import CandidateList from "./candidate-list";

interface DialDisplayProps {
  value: string;
  candidates?: Array<{ number: string; name?: string }>;
}

const DialDisplay = ({ value, candidates = [] }: DialDisplayProps) => {
  return (
    <div className="w-full h-full p-8 flex flex-col gap-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-2xl shadow-2xl border-b border-slate-700/50">
      <NumberDisplay value={value} />
      <CandidateList candidates={candidates} />
    </div>
  );
};

export default DialDisplay;
