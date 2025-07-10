"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export const DropdownSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  label,
}: DropdownSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full px-4 py-2 text-left border border-gray-100 rounded-lg
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          hover:border-gray-200
          transition-all duration-200
          bg-white shadow-sm
          outline-none
          flex items-center justify-between
          ${disabled
            ? "bg-gray-50 text-gray-500 cursor-not-allowed"
            : "text-gray-900 cursor-pointer"
          }
          ${isOpen ? "border-indigo-500 ring-2 ring-indigo-500" : ""}
        `}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {displayText}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg overflow-auto h-[80px]">
          {options.map((option) => (
            <button
              key={option.value + option.label}
              type="button"
              onClick={() =>
                !option.disabled && handleOptionClick(option.value)
              }
              disabled={option.disabled}
              className={`
                w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200
                flex items-center justify-between
                ${option.disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-900 cursor-pointer"
                }
                ${value === option.value ? "bg-indigo-50 text-indigo-700" : ""}
                first:rounded-t-lg last:rounded-b-lg
              `}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <CheckIcon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
