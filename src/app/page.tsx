import { LayoutBackground } from "@/components/ui/svg";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-full w-full absolute flex flex-col">
      <div className="text-center py-16 my-16">
        <h1 className="text-6xl font-bold text-indigo-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [text-shadow:_-2px_-2px_0_#fff,_2px_-2px_0_#fff,_-2px_2px_0_#fff,_2px_2px_0_#fff]">
          3C Web Phone
        </h1>
      </div>
      <div className="flex items-center justify-center h-full">
        <div className="space-x-4">
          <Link
            href="/signin"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
