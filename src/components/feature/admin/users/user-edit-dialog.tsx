"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialogs/Dialog";
import Input from "@/components/ui/inputs/Input";
import DropdownSelect from "@/components/ui/inputs/DropdownSelect";
import { UserIcon, CogIcon, CheckIcon } from "@heroicons/react/24/outline";
import { User } from "@/types/user";
import { fetchWithAuth } from "@/utils/api";
import { ServerConfig } from "@/types/server-type";
import { ISmsGateway } from "@/models/SmsGateway__";

interface UserEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  email: string;
  role: string;
  password: string;
  settings: {
    sipUsername: string;
    sipPassword: string;
    domain: string;
    wsServer: string;
    wsPort: string;
    wsPath: string;
  };
  did: string;
}

const UserEditDialog = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}: UserEditDialogProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "user",
    password: "",
    settings: {
      sipUsername: "",
      sipPassword: "",
      domain: "",
      wsServer: "",
      wsPort: "",
      wsPath: "/",
    },
    did: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverList, setServerList] = useState<ServerConfig[]>([]);
  const [smsServices, setSmsServices] = useState<ISmsGateway[]>([]);

  const isCreateMode = !user;
  const dialogTitle = isCreateMode ? "Create New User" : "Edit User";
  const submitButtonText = isCreateMode ? "Create User" : "Save Changes";

  useEffect(() => {
    const getServerList = async () => {
      try {
        const data = await fetchWithAuth("/api/admin/servers", {
          method: "GET",
        });

        if (data.ok) {
          const result = await data.json();
          setServerList(result?.data);
        }
      } catch (error) {
        console.error("Error loading server list:", error);
      }
    };
    const getSmsServices = async () => {
      try {
        const data = await fetchWithAuth("/api/admin/sms-gateways", {
          method: "GET",
        });
        if (!data.ok) throw new Error("Failed to fetch gateways");

        const result = await data.json();
        setSmsServices(result || []);
      } catch (error) {
        console.error("Error loading server list:", error);
      }
    };

    getServerList();
    getSmsServices();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        password: "",
        settings: {
          sipUsername: user.settings?.sipUsername || "",
          sipPassword: user.settings?.sipPassword || "",
          domain: user.settings?.domain || "",
          wsServer: user.settings?.wsServer || "",
          wsPort: user.settings?.wsPort || "",
          wsPath: user.settings?.wsPath || "/",
        },
        did: user?.did?._id?.toString() || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "user",
        password: "",
        settings: {
          sipUsername: "",
          sipPassword: "",
          domain: "",
          wsServer: "",
          wsPort: "",
          wsPath: "/",
        },
        did: "",
      });
    }
    setErrors({});
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (isCreateMode) {
      if (!formData.password.trim()) {
        newErrors.password = "Password is required for new users";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      }
    } else {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      }
    }

    if (!formData.settings.sipUsername.trim()) {
      newErrors.sipUsername = "SIP Username is required";
    }

    if (!formData.settings.sipPassword.trim()) {
      newErrors.sipPassword = "SIP Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("settings.")) {
      const settingField = field.replace("settings.", "");
      setFormData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userData = {
        id: user?.id,
        ...formData,
        settings: {
          ...formData.settings,
          updatedAt: new Date().toISOString(),
        },
      };

      const response = await fetchWithAuth("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.error?.includes("SIP Username already exists")) {
          setErrors((prev) => ({
            ...prev,
            sipUsername: errorData.error,
          }));
          return;
        } else if (errorData.error?.includes("Email already exists")) {
          setErrors((prev) => ({
            ...prev,
            email: errorData.error,
          }));
          return;
        } else if (errorData.error?.includes("User name already exists")) {
          setErrors((prev) => ({
            ...prev,
            name: errorData.error,
          }));
          return;
        } else {
          console.error("Error saving user:", errorData.error);
          alert(`Error: ${errorData.error || "Failed to save user"}`);
          return;
        }
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleCancel}
      title={dialogTitle}
      maxWidth="2xl"
      closeOnOutsideClick={false}
    >
      <div className="space-y-6">
        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
          <div className="h-16 w-16 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-xl font-bold text-white">
              {formData.name.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isCreateMode ? "Create New User" : "Editing User Profile"}
            </h2>
            <p className="text-sm text-gray-500">
              {isCreateMode
                ? "Enter user information and SIP configuration"
                : "Update user information and SIP configuration"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-indigo-500" />
              Personal Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required={true}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-red-300" : ""}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required={true}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-300" : ""}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {isCreateMode ? "*" : ""}
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required={isCreateMode}
                  placeholder={
                    isCreateMode
                      ? "Enter password"
                      : "Leave empty to keep current password"
                  }
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={errors.password ? "border-red-300" : ""}
                />
                {!isCreateMode && (
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to keep the current password. Minimum 6
                    characters if changed.
                  </p>
                )}
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CogIcon className="w-5 h-5 mr-2 text-indigo-500" />
              SIP Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SIP Username *
                </label>
                <Input
                  id="sipUsername"
                  name="sipUsername"
                  type="text"
                  required={true}
                  placeholder="Enter SIP username"
                  value={formData.settings.sipUsername}
                  onChange={(e) =>
                    handleInputChange("settings.sipUsername", e.target.value)
                  }
                  className={`font-mono ${
                    errors.sipUsername ? "border-red-300" : ""
                  }`}
                />
                {errors.sipUsername && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.sipUsername}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SIP Password *
                </label>
                <Input
                  id="sipPassword"
                  name="sipPassword"
                  type="password"
                  required={true}
                  placeholder="Enter SIP password"
                  value={formData.settings.sipPassword}
                  onChange={(e) =>
                    handleInputChange("settings.sipPassword", e.target.value)
                  }
                  className={errors.sipPassword ? "border-red-300" : ""}
                />
                {errors.sipPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.sipPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMS Service
                </label>
                <DropdownSelect
                  placeholder="Select SMS Service"
                  value={formData.did}
                  onChange={(value) => {
                    handleInputChange("did", value);
                  }}
                  className={`font-mono ${
                    errors.domain ? "border-red-300" : ""
                  }`}
                  options={
                    smsServices
                      ? smsServices.map((smsService) => {
                          return {
                            value: smsService._id || "",
                            label:
                              smsService.config.phoneNumber +
                                " - " +
                                smsService.type || "",
                          };
                        })
                      : []
                  }
                />
                {errors.did && (
                  <p className="mt-1 text-sm text-red-600">{errors.did}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain
                </label>
                <DropdownSelect
                  placeholder="Select domain"
                  value={formData.settings.domain}
                  onChange={(value) => {
                    handleInputChange("settings.domain", value);
                    handleInputChange(
                      "settings.wsServer",
                      serverList.find((server) => server.domain === value)
                        ?.wsServer || ""
                    );
                    handleInputChange(
                      "settings.wsPort",
                      serverList.find((server) => server.domain === value)
                        ?.wsPort || ""
                    );
                    handleInputChange(
                      "settings.wsPath",
                      serverList.find((server) => server.domain === value)
                        ?.wsPath || ""
                    );
                  }}
                  className={`font-mono ${
                    errors.domain ? "border-red-300" : ""
                  }`}
                  options={serverList.map((server) => {
                    return {
                      value: server.domain || "",
                      label: server.domain || "",
                    };
                  })}
                />
                {errors.domain && (
                  <p className="mt-1 text-sm text-red-600">{errors.domain}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-500 border border-transparent rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                {isCreateMode ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4 mr-2" />
                {submitButtonText}
              </>
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default UserEditDialog;
