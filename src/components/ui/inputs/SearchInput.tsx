"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  disabled = false,
}: SearchInputProps) => {
  return (
    <div className={`relative ${className}`}>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-200 transition-all duration-200 bg-white shadow-sm placeholder-gray-400 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed outline-none"
      />
    </div>
  );
};
