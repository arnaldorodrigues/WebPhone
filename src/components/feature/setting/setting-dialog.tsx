"use client";

import { useState, useEffect } from "react";
import { getParsedToken, getToken } from "@/utils/auth";
import { Dialog } from "@/components/ui/dialogs/dialog";
import { TabView } from "@/components/ui/views/tab-view";
import Input from "@/components/ui/inputs/input";
import { Settings, settingsAction } from "@/lib/action";

import { UserCircleIcon } from "@heroicons/react/24/solid";
import { CheckButton } from "@/components/ui/buttons/check-button";
import { RadioButtonGroup } from "@/components/ui/buttons/radio-button-group";
import { useSettings } from "@/hooks/use-settings";

type ChatEngine = "SIP" | "XMPP";

const InputRow = ({
  name,
  label,
  placeholder,
  required = true,
  formData,
  setFormData,
  readOnly = false,
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  formData: Settings;
  setFormData: (s: string) => void;
  readOnly?: boolean;
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <Input
          id={name}
          name={name}
          type="text"
          required={required}
          placeholder={placeholder}
          value={String(formData[name as keyof Settings] || "")}
          onChange={(e) => setFormData(e.target.value)}
          readOnly={readOnly}
          className={readOnly ? "bg-gray-100 cursor-not-allowed" : ""}
        />
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
  const [isSTV, setIsSTV] = useState(false);
  const [chatEngine, setChatEngine] = useState<ChatEngine>("SIP");
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);
  // Load settings and auth token
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setError(null);
        const token = getParsedToken();
        if (!token?.extensionNumber) {
          throw new Error("No extension number found in token");
        }

        // Set extension number in form data
        // setFormData((prev) => ({
        //   ...prev,
        //   extensionNumber: token.extensionNumber,
        //   sipUsername: token.extensionNumber,
        // }));

        // Load settings from database
        const savedSettings = settings;
        if (savedSettings) {
          setFormData({
            ...savedSettings,
            sipUsername: token?.extensionNumber,
          });
          setIsSTV(savedSettings.isSTV);
          setChatEngine(savedSettings.chatEngine as ChatEngine);
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
      isSTV,
      chatEngine,
    };
    const savedSettings = settings;
    setIsDirty(
      JSON.stringify(currentSettings) !== JSON.stringify(savedSettings)
    );
  }, [formData, isSTV, chatEngine]);

  const handleSave = async () => {
    try {
      setError(null);
      const token = getParsedToken();
      if (!token?.extensionNumber) {
        throw new Error("No extension number found in token");
      }

      await updateSettings({
        ...formData,
        isSTV,
        chatEngine,
        extensionNumber: token.extensionNumber,
        sipUsername: token.extensionNumber,
      });

      setIsDirty(false);
      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save settings"
      );
    }
  };

  const handleCancel = async () => {
    try {
      setError(null);
      const savedSettings = settings;
      setFormData(savedSettings);
      setIsSTV(savedSettings.isSTV);
      setChatEngine(savedSettings.chatEngine as ChatEngine);
      setIsDirty(false);
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
        <InputRow
          name="wsServer"
          label="Secure WebSocket Server (TLS):"
          placeholder="eg: ws://devone.telemojo.net"
          formData={formData}
          setFormData={(value) => handleFormDataChange("wsServer", value)}
        />
        <InputRow
          name="wsPort"
          label="WebSocket Port:"
          placeholder="eg: 4443"
          formData={formData}
          setFormData={(value) => handleFormDataChange("wsPort", value)}
        />
        <InputRow
          name="wsPath"
          label="WebSocket Path:"
          placeholder="/"
          formData={formData}
          setFormData={(value) => handleFormDataChange("wsPath", value)}
        />
        <InputRow
          name="fullName"
          label="Full Name:"
          placeholder="eg: Keyla James"
          formData={formData}
          setFormData={(value) => handleFormDataChange("fullName", value)}
        />
        <InputRow
          name="domain"
          label="Domain:"
          placeholder="eg: devone.telemojo.net"
          formData={formData}
          setFormData={(value) => handleFormDataChange("domain", value)}
        />
        <InputRow
          name="sipUsername"
          label="SIP Username:"
          placeholder="eg: webrtc"
          formData={formData}
          setFormData={(value) => handleFormDataChange("sipUsername", value)}
          readOnly={true}
        />
        <InputRow
          name="sipPassword"
          label="SIP Password:"
          placeholder="eg: 1234"
          formData={formData}
          setFormData={(value) => handleFormDataChange("sipPassword", value)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subscribe to VoiceMail (MWI):
          </label>
          <div className="ml-2">
            <CheckButton
              checked={isSTV}
              label={"Yes"}
              onChange={(c) => {
                setIsSTV(c);
                handleFormDataChange("vmNumber", "");
              }}
            />
          </div>
          {isSTV && (
            <div className="mt-3 pl-10">
              <InputRow
                name="vmNumber"
                label="VoiceMail Management Number:"
                placeholder="eg: 100 or John"
                formData={formData}
                setFormData={(value) => handleFormDataChange("vmNumber", value)}
              />
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Chat Engine:
          </label>
          <div className="ml-2">
            <RadioButtonGroup<ChatEngine>
              name="chatEngine"
              options={[
                {
                  value: "SIP",
                  label: "SIP",
                },
                {
                  value: "XMPP",
                  label: "XMPP",
                },
              ]}
              value={chatEngine}
              onChange={(v) => {
                setChatEngine(v);
                handleFormDataChange("sxServer", "");
                handleFormDataChange("xwPort", "");
                handleFormDataChange("xwPath", "");
                handleFormDataChange("xDomain", "");
                handleFormDataChange("extensionNumber", "");
              }}
            />
          </div>
        </div>
        {chatEngine === "XMPP" && (
          <div className="pl-10 space-y-2">
            <InputRow
              name="sxServer"
              label="Secure XMPP Server (TLS):"
              placeholder="eg: xmpp.devone.telemojo.net"
              formData={formData}
              setFormData={(value) => handleFormDataChange("sxServer", value)}
            />
            <InputRow
              name="xwPort"
              label="XMPP WebSocket Port:"
              placeholder="eg: 5222"
              formData={formData}
              setFormData={(value) => handleFormDataChange("xwPort", value)}
            />
            <InputRow
              name="xwPath"
              label="XMPP WebSocket Path:"
              placeholder="/xmpp-websocket"
              formData={formData}
              setFormData={(value) => handleFormDataChange("xwPath", value)}
            />
            <InputRow
              name="xDomain"
              label="XMPP Domain:"
              placeholder="eg: xmpp.devone.telemojo.net"
              formData={formData}
              setFormData={(value) => handleFormDataChange("xDomain", value)}
            />
            <InputRow
              name="extensionNumber"
              label="Extension Number:"
              placeholder="eg: 100"
              formData={formData}
              setFormData={(value) =>
                handleFormDataChange("extensionNumber", value)
              }
              readOnly={true}
            />
          </div>
        )}
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
            disabled={!isDirty}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isDirty
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default SettingDialog;
