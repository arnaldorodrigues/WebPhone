'use client'

export const SplashLoader = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="relative z-10 flex flex-col items-center space-y-6">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-xl font-medium tracking-wide">{message}</p>
      </div>
    </div>
  );
};