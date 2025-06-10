"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface RadioButtonProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  disabled?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const variantClasses = {
  primary: {
    checked: "border-indigo-600 bg-indigo-600",
    unchecked: "border-gray-300 hover:border-indigo-500",
    disabled: "border-gray-200 bg-gray-100",
  },
  secondary: {
    checked: "border-gray-600 bg-gray-600",
    unchecked: "border-gray-300 hover:border-gray-500",
    disabled: "border-gray-200 bg-gray-100",
  },
  success: {
    checked: "border-green-600 bg-green-600",
    unchecked: "border-gray-300 hover:border-green-500",
    disabled: "border-gray-200 bg-gray-100",
  },
  warning: {
    checked: "border-yellow-500 bg-yellow-500",
    unchecked: "border-gray-300 hover:border-yellow-500",
    disabled: "border-gray-200 bg-gray-100",
  },
  error: {
    checked: "border-red-600 bg-red-600",
    unchecked: "border-gray-300 hover:border-red-500",
    disabled: "border-gray-200 bg-gray-100",
  },
};

const focusRingClasses = {
  primary: "focus:ring-indigo-500",
  secondary: "focus:ring-gray-500",
  success: "focus:ring-green-500",
  warning: "focus:ring-yellow-500",
  error: "focus:ring-red-500",
};

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  (
    {
      label,
      description,
      size = "md",
      variant = "primary",
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const getVariantClasses = () => {
      if (disabled) return variantClasses[variant].disabled;
      return props.checked
        ? variantClasses[variant].checked
        : variantClasses[variant].unchecked;
    };

    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="radio"
            className={`
              appearance-none
              rounded-full
              border-2
              transition-all
              duration-200
              ${sizeClasses[size]}
              ${getVariantClasses()}
              ${focusRingClasses[variant]}
              focus:ring-2
              focus:ring-offset-2
              ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
            `}
            disabled={disabled}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                className={`
                  text-sm font-medium
                  ${disabled ? "text-gray-400" : "text-gray-700"}
                `}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                className={`
                  text-sm
                  ${disabled ? "text-gray-400" : "text-gray-500"}
                `}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

RadioButton.displayName = "RadioButton";
