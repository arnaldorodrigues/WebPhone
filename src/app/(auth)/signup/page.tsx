"use client";

import { useState } from "react";
import Link from "next/link";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import Input from "@/components/ui/inputs/input";
import { useAuth } from "@/hooks/useAuth";

export default function SignUp() {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    extensionNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    extensionNumber: "",
    password: "",
    confirmPassword: "",
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    return criteria;
  };

  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      extensionNumber: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.extensionNumber) {
      errors.extensionNumber = "Extension number is required";
    } else if (!/^\d+$/.test(formData.extensionNumber)) {
      errors.extensionNumber = "Extension number must contain only numbers";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else {
      const passwordCriteria = validatePassword(formData.password);
      if (!passwordCriteria.length) {
        errors.password = "Password must be at least 8 characters long";
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.values(errors).every((error) => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signup(
        formData.extensionNumber,
        formData.password,
        formData.name.trim(),
        formData.email
      );
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear validation error when user starts typing
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors({
        ...validationErrors,
        [field]: "",
      });
    }
  };

  const passwordCriteria = validatePassword(formData.password);
  const showPasswordStrength = formData.password.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">3CNS</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-sm text-gray-600">Join us today and get started</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required={true}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={
                  validationErrors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required={true}
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={
                  validationErrors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="extensionNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Extension Number
              </label>
              <Input
                id="extensionNumber"
                name="extensionNumber"
                type="text"
                required={true}
                placeholder="Enter your extension number"
                value={formData.extensionNumber}
                onChange={(e) =>
                  handleInputChange("extensionNumber", e.target.value)
                }
                className={
                  validationErrors.extensionNumber
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {validationErrors.extensionNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.extensionNumber}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required={true}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={
                    validationErrors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500 pr-10"
                      : "pr-10"
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.password}
                </p>
              )}

              {showPasswordStrength && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-medium text-gray-700">
                    Password strength:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      className={`flex items-center ${
                        passwordCriteria.length
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {passwordCriteria.length ? (
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircleIcon className="h-3 w-3 mr-1" />
                      )}
                      8+ characters
                    </div>
                    <div
                      className={`flex items-center ${
                        passwordCriteria.uppercase
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {passwordCriteria.uppercase ? (
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircleIcon className="h-3 w-3 mr-1" />
                      )}
                      Uppercase
                    </div>
                    <div
                      className={`flex items-center ${
                        passwordCriteria.lowercase
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {passwordCriteria.lowercase ? (
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircleIcon className="h-3 w-3 mr-1" />
                      )}
                      Lowercase
                    </div>
                    <div
                      className={`flex items-center ${
                        passwordCriteria.number
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {passwordCriteria.number ? (
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircleIcon className="h-3 w-3 mr-1" />
                      )}
                      Number
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required={true}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={
                    validationErrors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500 pr-10"
                      : "pr-10"
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                isLoading
                  ? "opacity-75 cursor-not-allowed"
                  : "transform hover:scale-105"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/signin"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              Already have an account?{" "}
              <span className="underline">Sign in</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
