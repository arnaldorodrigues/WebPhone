"use client";

import { useState, useEffect } from "react";
import { getParsedToken } from "@/utils/auth";
import { Dialog } from "@/components/ui/dialogs/dialog";
import { TabView } from "@/components/ui/views/tab-view";
import Input from "@/components/ui/inputs/input";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useUserData } from "@/hooks/use-userdata";
import { useSIPProvider } from "@/hooks/sip-provider/sip-provider-context";

// Validation errors type
type ValidationErrors = {
  [key: string]: string;
};

interface SettingDLG {
  name: string;
  email: string;
  sipUsername?: string;
  sipPassword?: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
  domain?: string;
}

const InputRow = ({
  name,
  label,
  placeholder,
  required = true,
  formData,
  setFormData,
  readOnly = false,
  error,
  type = "text",
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  formData: SettingDLG;
  setFormData?: (s: string) => void;
  readOnly?: boolean;
  error?: string;
  type?: string;
}) => {
  const hasError = !!error;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1">
        <Input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          value={String(formData[name as keyof SettingDLG] || "")}
          onChange={(e) => setFormData?.(e.target.value)}
          readOnly={readOnly}
          className={`${readOnly ? "bg-gray-100 cursor-not-allowed" : ""} ${
            hasError
              ? "border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500"
              : ""
          }`}
        />
        {hasError && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

interface SettingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingDialog = ({ isOpen, onClose }: SettingDialogProps) => {
  const {
    userData,
    setUserData,
    isLoading: userDataLoading,
    refreshUserData,
  } = useUserData();
  const [formData, setFormData] = useState<SettingDLG>({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    sipUsername: "",
    sipPassword: "",
    domain: "",
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const { connectAndRegister } = useSIPProvider();

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setError(null);
        const token = getParsedToken();
        if (!token?.email) {
          throw new Error("No email found in token");
        }
        if (userData) {
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            sipUsername: userData.settings?.sipUsername || "",
            sipPassword: userData.settings?.sipPassword || "",
            password: "",
            newPassword: "",
            confirmPassword: "",
            domain: userData.settings?.domain || "",
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load user data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && !isSaving) {
      loadUserData();
    }
  }, [isOpen, userData, isSaving]);

  // Track changes to detect if form is dirty
  useEffect(() => {
    if (!userData) return;
    const currentData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      newPassword: formData.newPassword,
      sipUsername: formData.sipUsername,
      sipPassword: formData.sipPassword,
    };

    const savedData = {
      name: userData.name,
      email: userData.email,
      password: "",
      newPassword: "",
      sipUsername: userData.settings?.sipUsername,
      sipPassword: userData.settings?.sipPassword,
    };

    setIsDirty(JSON.stringify(currentData) !== JSON.stringify(savedData));
  }, [formData, userData]);

  // Validation function
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Define required fields
    const requiredFields: (keyof SettingDLG)[] = [
      "name",
      "sipUsername",
      "sipPassword",
      "email",
    ];

    // Check each required field
    requiredFields.forEach((field) => {
      const value = formData[field];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        errors[field] = "This field is required";
      }
    });

    // Validate password change if new password is provided
    if (formData.newPassword) {
      if (!formData.password) {
        errors.password = "Current password is required to set new password";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
      if (formData.newPassword.length < 6) {
        errors.newPassword = "Password must be at least 6 characters";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSaveSuccess(false);

      // Validate form before saving
      if (!validateForm()) {
        return;
      }

      setIsSaving(true);
      const token = getParsedToken();
      if (!token?.email) {
        throw new Error("No email found in token");
      }

      if (!userData) {
        throw new Error("No user data available");
      }

      // Update user data
      await setUserData({
        ...userData,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        newPassword: formData.newPassword,
        settings: {
          wsServer: userData.settings?.wsServer || "",
          wsPort: userData.settings?.wsPort || "",
          wsPath: userData.settings?.wsPath || "/",
          domain: userData.settings?.domain || "",
          sipUsername: formData.sipUsername || "",
          sipPassword: formData.sipPassword || "",
          updatedAt: new Date().toISOString(),
        },
      });

      setIsDirty(false);
      setSaveSuccess(true);
      setValidationErrors({});

      // Re-establish connection with new settings
      try {
        connectAndRegister({
          server: userData.settings?.domain || "",
          username: formData.sipUsername!,
          password: formData.sipPassword!,
          wsServer: userData.settings?.wsServer || "",
          wsPort: userData.settings?.wsPort || "",
          wsPath: userData.settings?.wsPath || "",
        });
      } catch (error) {
        console.error("Error connecting and registering:", error);
      }

      // Close dialog immediately after successful save
      onClose();
    } catch (error) {
      console.error("Error saving user data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save user data"
      );
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      setError(null);
      if (userData) {
        setFormData({
          name: userData.name,
          email: userData.email,
          sipUsername: userData.settings?.sipUsername,
          sipPassword: userData.settings?.sipPassword,
          password: "",
          newPassword: "",
          confirmPassword: "",
          domain: userData.settings?.domain || "",
        });
      }
      setIsDirty(false);
      setValidationErrors({});
      onClose();
    } catch (error) {
      console.error("Error loading user data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load user data"
      );
    }
  };

  const handleFormDataChange = (field: keyof SettingDLG, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const accountTab = {
    id: "0",
    label: "Account",
    icon: (
      <div className="w-5 h-5 rounded-sm bg-red-900 text-white flex items-center justify-center">
        <UserCircleIcon className="w-4 h-4" />
      </div>
    ),
    content: (
      <div className="w-full space-y-2">
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        {saveSuccess && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
            Settings saved successfully! The dialog will close shortly.
          </div>
        )}
        <InputRow
          name="name"
          label="Full Name:"
          placeholder="eg: Keyla James"
          formData={formData}
          required={true}
          setFormData={(value) => handleFormDataChange("name", value)}
          error={validationErrors.name}
        />
        <InputRow
          name="email"
          label="Email:"
          placeholder="eg: keyla@telemojo.net"
          formData={formData}
          required={true}
          setFormData={(value) => handleFormDataChange("email", value)}
          error={validationErrors.email}
        />
        <InputRow
          name="sipUsername"
          label="SIP Username:"
          placeholder="eg: webrtc"
          formData={formData}
          required={true}
          setFormData={(value) => handleFormDataChange("sipUsername", value)}
          error={validationErrors.sipUsername}
        />
        <InputRow
          name="sipPassword"
          label="SIP Password:"
          placeholder="eg: 1234"
          formData={formData}
          setFormData={(value) => handleFormDataChange("sipPassword", value)}
          error={validationErrors.sipPassword}
          type="password"
        />
        <InputRow
          name="password"
          label="Current Password:"
          placeholder="Enter your current password"
          formData={formData}
          required={formData.newPassword !== ""}
          setFormData={(value) => handleFormDataChange("password", value)}
          error={validationErrors.password}
          type="password"
        />
        <InputRow
          name="newPassword"
          label="New Password:"
          placeholder="Enter your new password"
          formData={formData}
          required={formData.newPassword !== ""}
          setFormData={(value) => handleFormDataChange("newPassword", value)}
          error={validationErrors.newPassword}
          type="password"
        />
        <InputRow
          name="confirmPassword"
          label="Confirm New Password:"
          placeholder="Confirm your new password"
          formData={formData}
          required={formData.newPassword !== ""}
          setFormData={(value) =>
            handleFormDataChange("confirmPassword", value)
          }
          error={validationErrors.confirmPassword}
          type="password"
        />
        <InputRow
          name="domain"
          label="Domain:"
          placeholder="eg: telemojo.net"
          formData={formData}
          readOnly={true}
          required={false}
        />
      </div>
    ),
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      maxWidth="xl"
      closeOnOutsideClick={false}
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <TabView tabs={[accountTab]} />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isDirty && !isSaving
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                <span className="text-sm">Saving...</span>
              </div>
            ) : saveSuccess ? (
              <div className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Saved</span>
              </div>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default SettingDialog;
