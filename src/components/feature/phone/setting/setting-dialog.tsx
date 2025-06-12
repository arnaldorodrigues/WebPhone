"use client";

import { useState, useEffect } from "react";
import { getParsedToken, getToken } from "@/utils/auth";
import { Dialog } from "@/components/ui/dialogs/dialog";
import { TabView } from "@/components/ui/views/tab-view";
import Input from "@/components/ui/inputs/input";
import { Settings, settingsAction } from "@/lib/action";

import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useSettings } from "@/hooks/use-settings";
import { useSIPProvider } from "@/hooks/sip-provider/sip-provider-context";
import { SipConfig } from "@/types/sip-type";
import DropdownSelect from "@/components/ui/inputs/dropdown-select";
import { fetchWithAuth } from "@/utils/api";
import { ServerConfig } from "@/types/admin-server";

type ChatEngine = "SIP" | "XMPP";

// Validation errors type
type ValidationErrors = {
  [key in keyof Settings]?: string;
};

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
  formData: Settings;
  setFormData: (s: string) => void;
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
          value={String(formData[name as keyof Settings] || "")}
          onChange={(e) => setFormData(e.target.value)}
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
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState<Settings>(settings);
  const [serverList, setServerList] = useState<ServerConfig[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const { connectAndRegister } = useSIPProvider();

  useEffect(() => {
    // Get server list from database
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
    getServerList();
  }, []);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  // Load settings and auth token
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setError(null);
        const token = getParsedToken();
        if (!token?.email) {
          throw new Error("No email found in token");
        }

        // Load settings from database
        const savedSettings = settings;
        if (savedSettings) {
          setFormData({
            ...savedSettings,
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load settings"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  // Track changes to detect if form is dirty
  useEffect(() => {
    const currentSettings = {
      ...formData,
    };
    const savedSettings = settings;
    setIsDirty(
      JSON.stringify(currentSettings) !== JSON.stringify(savedSettings)
    );
  }, [formData]);

  // Validation function
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Define required fields based on current state
    const requiredFields: (keyof Settings)[] = [
      "wsServer",
      "wsPort",
      "domain",
      "sipUsername",
      "sipPassword",
    ];

    // Check each required field
    requiredFields.forEach((field) => {
      const value = formData[field];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        errors[field] = "This field is required";
      }
    });

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

      const updatedSettings = {
        ...formData,
      };

      await updateSettings(updatedSettings);

      // Re-establish connection with new settings
      try {
        connectAndRegister(formData as unknown as SipConfig);
      } catch (error) {
        console.error("Error connecting and registering:", error);
      }

      setIsDirty(false);
      setSaveSuccess(true);
      setValidationErrors({});

      // Close dialog after successful save
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save settings"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      setError(null);
      const savedSettings = settings;
      setFormData(savedSettings);
      setIsDirty(false);
      setValidationErrors({});
      onClose();
    } catch (error) {
      console.error("Error loading settings:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load settings"
      );
    }
  };

  const handleFormDataChange = (field: keyof Settings, value: string) => {
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
        <div>
          <label
            htmlFor="domain"
            className="block text-sm font-medium text-gray-700"
          >
            Domain
            {<span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="mt-1">
            <DropdownSelect
              placeholder="Select Domain"
              value={String(formData.domain || "")}
              onChange={(value) => {
                handleFormDataChange("domain", value);
                handleFormDataChange(
                  "wsServer",
                  serverList.find((server) => server.domain === value)
                    ?.wsServer || ""
                );
                handleFormDataChange(
                  "wsPort",
                  serverList.find((server) => server.domain === value)
                    ?.wsPort || ""
                );
                handleFormDataChange(
                  "wsPath",
                  serverList.find((server) => server.domain === value)
                    ?.wsPath || ""
                );
              }}
              className={`${
                validationErrors.domain
                  ? "border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              options={serverList.map((server) => ({
                value: server.domain,
                label: server.domain,
              }))}
            />
            {validationErrors.domain && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.domain}
              </p>
            )}
          </div>
        </div>
        <InputRow
          name="wsServer"
          label="Secure WebSocket Server (TLS):"
          placeholder="eg: ws://devone.telemojo.net"
          formData={formData}
          required={true}
          setFormData={(value) => handleFormDataChange("wsServer", value)}
          error={validationErrors.wsServer}
        />
        <InputRow
          name="wsPort"
          label="WebSocket Port:"
          placeholder="eg: 4443"
          formData={formData}
          required={true}
          setFormData={(value) => handleFormDataChange("wsPort", value)}
          error={validationErrors.wsPort}
        />
        <InputRow
          name="wsPath"
          label="WebSocket Path:"
          placeholder="/"
          formData={formData}
          required={false}
          setFormData={(value) => handleFormDataChange("wsPath", value)}
          error={validationErrors.wsPath}
        />
        <InputRow
          name="name"
          label="Full Name:"
          placeholder="eg: Keyla James"
          formData={formData}
          required={false}
          setFormData={(value) => handleFormDataChange("name", value)}
          error={validationErrors.name}
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
          required={true}
          setFormData={(value) => handleFormDataChange("sipPassword", value)}
          error={validationErrors.sipPassword}
          type="password"
        />
      </div>
    ),
  };

  if (isLoading) {
    return (
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title="Settings"
        maxWidth="xl"
        closeOnOutsideClick={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </Dialog>
    );
  }

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
        <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
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
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </div>
            ) : saveSuccess ? (
              "Saved ✓"
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
