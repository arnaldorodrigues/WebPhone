"use client";

import { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

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
}: Props) => {
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    "appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 hover:border-gray-300";

  // Add padding-right for password fields to accommodate the eye button
  const finalClassName = `${baseClassName} ${
    isPasswordType ? "pr-10" : ""
  } ${className}`;

  // During SSR and initial client render, use a controlled input with empty value
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

  if (isPasswordType) {
    return (
      <div className="relative">
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
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>
    );
  }

  return (
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
    />
  );
};

export default Input;
