import { NextPage } from "next";

interface Candidate {
  number: string;
  name?: string;
}

interface CandidateListProps {
  candidates?: Candidate[];
  onSelect?: (candidate: Candidate) => void;
}

const CandidateList = ({ candidates = [], onSelect }: CandidateListProps) => {
  if (candidates.length === 0) return null;

  return (
    <div className="w-full max-h-48 overflow-y-auto">
      <div className="space-y-2">
        {candidates.map((candidate, index) => (
          <button
            key={index}
            onClick={() => onSelect?.(candidate)}
            className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left transition-all duration-200 ease-in-out flex items-center gap-3 transform hover:scale-[1.02]"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden shadow-md">
              <span className="text-white/70 text-lg">
                {(candidate.name?.[0] || candidate.number[0]).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-row items-center gap-3">
              {candidate.name && (
                <div className="text-white/90 font-medium">
                  {candidate.name}
                </div>
              )}
              <div className="text-white/70 text-sm">{candidate.number}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CandidateList;