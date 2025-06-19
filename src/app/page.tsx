import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-white">
      <div className="absolute inset-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="curve-pattern"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 50 Q25 25, 50 50 T100 50"
                stroke="#E5E7EB"
                strokeWidth="0.5"
                fill="none"
                strokeOpacity="0.2"
              />
              <path
                d="M0 30 Q25 5, 50 30 T100 30"
                stroke="#E5E7EB"
                strokeWidth="0.5"
                fill="none"
                strokeOpacity="0.15"
              />
              <path
                d="M0 70 Q25 45, 50 70 T100 70"
                stroke="#E5E7EB"
                strokeWidth="0.5"
                fill="none"
                strokeOpacity="0.15"
              />

              <path
                d="M0 20 C20 0, 80 0, 100 20"
                stroke="#E5E7EB"
                strokeWidth="0.3"
                fill="none"
                strokeOpacity="0.1"
              />
              <path
                d="M0 80 C20 100, 80 100, 100 80"
                stroke="#E5E7EB"
                strokeWidth="0.3"
                fill="none"
                strokeOpacity="0.1"
              />

              <path
                d="M0 40 C30 20, 70 20, 100 40"
                stroke="#E5E7EB"
                strokeWidth="0.4"
                fill="none"
                strokeOpacity="0.12"
              />
              <path
                d="M0 60 C30 80, 70 80, 100 60"
                stroke="#E5E7EB"
                strokeWidth="0.4"
                fill="none"
                strokeOpacity="0.12"
              />

              <path
                d="M0 0 Q50 50, 100 0"
                stroke="#E5E7EB"
                strokeWidth="0.3"
                fill="none"
                strokeOpacity="0.08"
              />
              <path
                d="M0 100 Q50 50, 100 100"
                stroke="#E5E7EB"
                strokeWidth="0.3"
                fill="none"
                strokeOpacity="0.08"
              />

              <path
                d="M20 0 C30 10, 40 10, 50 0"
                stroke="#E5E7EB"
                strokeWidth="0.2"
                fill="none"
                strokeOpacity="0.05"
              />
              <path
                d="M50 0 C60 10, 70 10, 80 0"
                stroke="#E5E7EB"
                strokeWidth="0.2"
                fill="none"
                strokeOpacity="0.05"
              />
              <path
                d="M20 100 C30 90, 40 90, 50 100"
                stroke="#E5E7EB"
                strokeWidth="0.2"
                fill="none"
                strokeOpacity="0.05"
              />
              <path
                d="M50 100 C60 90, 70 90, 80 100"
                stroke="#E5E7EB"
                strokeWidth="0.2"
                fill="none"
                strokeOpacity="0.05"
              />

              <path
                d="M0 15 C15 5, 35 5, 50 15"
                stroke="#E5E7EB"
                strokeWidth="0.2"
                fill="none"
                strokeOpacity="0.06"
              />
              <path
                d="M50 15 C65 5, 85 5, 100 15"
                stroke="#E5E7EB"
                strokeWidth="0.2"
                fill="none"
                strokeOpacity="0.06"
              />
              <path
                d="M0 85 C15 95, 35 95, 50 85"
                stroke="#E5E7EB"
                strokeWidth="0.2"
                fill="none"
                strokeOpacity="0.06"
              />
              <path
                d="M50 85 C65 95, 85 95, 100 85"
                stroke="#E5E7EB"
                strokeWidth="0.2"
                fill="none"
                strokeOpacity="0.06"
              />

              <path
                d="M10 0 C10 20, 10 40, 10 60"
                stroke="#E5E7EB"
                strokeWidth="0.2"
                fill="none"
                strokeOpacity="0.04"
              />
              <path
                d="M30 0 C30 20, 30 40, 30 60"
                stroke="#E5E7EB"
                strokeWidth="0.2"
                fill="none"
                strokeOpacity="0.04"
              />
              <path
                d="M70 0 C70 20, 70 40, 70 60"
                stroke="#E5E7EB"
                strokeWidth="0.2"
                fill="none"
                strokeOpacity="0.04"
              />
              <path
                d="M90 0 C90 20, 90 40, 90 60"
                stroke="#E5E7EB"
                strokeWidth="0.2"
                fill="none"
                strokeOpacity="0.04"
              />

              <path
                d="M0 25 Q10 20, 20 25 T40 25 T60 25 T80 25 T100 25"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.03"
              />
              <path
                d="M0 75 Q10 70, 20 75 T40 75 T60 75 T80 75 T100 75"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.03"
              />

              <path
                d="M25 25 Q25 15, 35 15 T45 25 T35 35 T25 25"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.02"
              />
              <path
                d="M75 25 Q75 15, 85 15 T95 25 T85 35 T75 25"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.02"
              />
              <path
                d="M25 75 Q25 65, 35 65 T45 75 T35 85 T25 75"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.02"
              />
              <path
                d="M75 75 Q75 65, 85 65 T95 75 T85 85 T75 75"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.02"
              />

              <path
                d="M50 50 Q60 40, 70 50 T90 50 T110 50"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.025"
              />
              <path
                d="M50 50 Q40 60, 50 70 T50 90 T50 110"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.025"
              />

              <path
                d="M50 50 Q60 40, 70 50 T90 50 T110 50 T130 50"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.02"
              />
              <path
                d="M50 50 Q40 60, 50 70 T50 90 T50 110 T50 130"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.02"
              />

              <path
                d="M0 35 Q10 30, 20 35 T40 35 T60 35 T80 35 T100 35"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.025"
              />
              <path
                d="M0 65 Q10 60, 20 65 T40 65 T60 65 T80 65 T100 65"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.025"
              />

              <path
                d="M0 0 Q25 25, 50 0 T100 0"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.02"
              />
              <path
                d="M0 100 Q25 75, 50 100 T100 100"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.02"
              />

              <path
                d="M15 15 Q15 5, 25 5 T35 15 T25 25 T15 15"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.015"
              />
              <path
                d="M85 15 Q85 5, 95 5 T105 15 T95 25 T85 15"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.015"
              />
              <path
                d="M15 85 Q15 75, 25 75 T35 85 T25 95 T15 85"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.015"
              />
              <path
                d="M85 85 Q85 75, 95 75 T105 85 T95 95 T85 85"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.015"
              />

              <path
                d="M20 0 C20 15, 20 30, 20 45"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.015"
              />
              <path
                d="M40 0 C40 15, 40 30, 40 45"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.015"
              />
              <path
                d="M60 0 C60 15, 60 30, 60 45"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.015"
              />
              <path
                d="M80 0 C80 15, 80 30, 80 45"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.015"
              />

              <path
                d="M0 45 C15 45, 30 45, 45 45"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.015"
              />
              <path
                d="M55 45 C70 45, 85 45, 100 45"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.015"
              />
              <path
                d="M0 55 C15 55, 30 55, 45 55"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.015"
              />
              <path
                d="M55 55 C70 55, 85 55, 100 55"
                stroke="#E5E7EB"
                strokeWidth="0.15"
                fill="none"
                strokeOpacity="0.015"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#curve-pattern)" />
        </svg>
      </div>

      <div className="relative min-h-screen flex flex-col">
        <div className="text-center pt-16">
          <h1 className="text-6xl font-bold text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [text-shadow:_-2px_-2px_0_#fff,_2px_-2px_0_#fff,_-2px_2px_0_#fff,_2px_2px_0_#fff]">
            3C Web Phone
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
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
    </main>
  );
}
