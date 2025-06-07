"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseClassName =
    "appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 hover:border-gray-300";
  const finalClassName = `${baseClassName} ${className}`;

  // During SSR and initial client render, use a controlled input with empty value
  if (!mounted) {
    return (
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        className={finalClassName}
        placeholder={placeholder}
        value=""
        readOnly
      />
    );
  }

  return (
    <input
      id={id}
      name={name}
      type={type}
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
