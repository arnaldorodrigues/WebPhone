import NumberDisplay from "./number-display";
import CandidateList from "./candidate-list";

interface DialDisplayProps {
  value: string;
  candidates?: Array<{ number: string; name?: string }>;
}

const DialDisplay = ({ value, candidates = [] }: DialDisplayProps) => {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-4 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-t-2xl">
      <NumberDisplay value={value} />
      <CandidateList candidates={candidates} />
    </div>
  );
};

export default DialDisplay;
