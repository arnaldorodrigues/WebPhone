"use client";

import { useState, useEffect, useRef } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Props {
  id: string;
  name: string;
  type: string;
  required: boolean;
  className?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  options?: DropdownOption[];
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  error?: string;
}

const Input = ({
  id,
  name,
  type = "text",
  required = false,
  className = "",
  placeholder,
  value,
  onChange,
  readOnly = false,
  options = [],
  onKeyDown,
  error,
}: Props) => {
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(value.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectOption = (opt: DropdownOption) => {
    const syntheticEvent = {
      target: { value: opt.value },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPasswordType = type === "password";
  const inputType = isPasswordType
    ? showPassword
      ? "text"
      : "password"
    : type;

  const baseClassName =
    "appearance-none block w-full px-4 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200";

  const errorClassName = error
    ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 hover:border-red-400"
    : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-300";

  const finalClassName = `${baseClassName} ${errorClassName} ${
    isPasswordType ? "pr-10" : ""
  } ${className}`;

  const renderInput = () => (
    <>
      <input
        id={id}
        name={name}
        type={inputType}
        required={required}
        className={finalClassName}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        onKeyDown={onKeyDown}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </>
  );

  if (!mounted) {
    return (
      <div className={isPasswordType ? "relative" : ""}>
        <input
          id={id}
          name={name}
          type={inputType}
          required={required}
          className={finalClassName}
          placeholder={placeholder}
          value=""
          readOnly
        />
        {isPasswordType && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            tabIndex={-1}
          >
            <EyeIcon className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>
    );
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (type === "dropdown") {
    return (
      <div className={`relative ${className}`} ref={containerRef}>
        <input
          id={id}
          name={name}
          type="text"
          required={required}
          className={`${baseClassName} ${errorClassName} pr-10`}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          readOnly={readOnly}
          onFocus={() => setIsOpen(true)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setIsOpen((prev) => !prev)}
          tabIndex={-1}
        >
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </button>

        {isOpen && !readOnly && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between ${
                    opt.disabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-900 cursor-pointer"
                  }`}
                  onClick={() => !opt.disabled && handleSelectOption(opt)}
                  disabled={opt.disabled}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    <CheckIcon className="w-4 h-4 text-indigo-500" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No options</div>
            )}
          </div>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (isPasswordType) {
    return (
      <div className="relative">
        {renderInput()}
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <EyeIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
    );
  }

  return renderInput();
};

export default Input;
