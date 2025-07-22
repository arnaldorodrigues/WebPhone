import { Dialog } from "@/components/ui/dialogs"
import { Input } from "@/components/ui/inputs";
import { TabView } from "@/components/ui/views";
import { IUpdateSettingRequest } from "@/core/settings/model";
import { updateSetting } from "@/core/settings/request";
import { IUserData } from "@/core/users/model";
import { AppDispatch } from "@/store";
import { TValidationErrors } from "@/types/common";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type Props = {
  userData: IUserData | undefined;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: boolean) => void;
}

interface ISettingFormData {
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
  readOnly = false,
  error,
  type = "text",
  value,
  onChange,
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  readOnly?: boolean;
  error?: string;
  type?: string;
  value?: string;
  onChange: (e: any) => void;
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
          value={value ?? ""}
          onChange={(e) => onChange(e)}
          readOnly={readOnly}
          className={`${readOnly ? "bg-gray-100 cursor-not-allowed" : ""} ${hasError
            ? "border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500"
            : ""
            }`}
        />
        {hasError && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

const SettingDialog: React.FC<Props> = ({
  userData,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [formData, setFormData] = useState<ISettingFormData>({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    sipUsername: "",
    sipPassword: "",
    domain: "",
  });
  const [validationErrors, setValidationErrors] = useState<TValidationErrors>({});

  const handleFormDataChange = (field: keyof ISettingFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleCancel = () => {
    onUpdate(false);
    onClose();
  }

  const handleSave = async () => {
    if (!userData || !formData || !userData.settingId)
      return;

    if (!validateForm())
      return;
    
    setIsSaving(true);
    
    const payload: IUpdateSettingRequest = {
      userId: userData.id,
      settingId: userData.settingId,
      name: formData.name,
      email: formData.email,
      domain: formData.domain,
      password: formData.password,
      newPassword: formData.newPassword,
      sipUsername: formData.sipUsername,
      sipPassword: formData.sipPassword      
    };

    await dispatch(updateSetting(payload));

    setIsSaving(false);

    onUpdate(true);
    onClose();
  }

  const validateForm = (): boolean => {
    if (!formData) return false;

    const errors: TValidationErrors = {};

    const requiredFields: (keyof ISettingFormData)[] = [
      "name",
      "sipUsername",
      "sipPassword",
      "email",
    ];

    requiredFields.forEach((field) => {
      const value = formData[field];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        errors[field] = "This field is required";
      }
    });

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

  useEffect(() => {
    if (!userData) return;

    setFormData({
      name: userData.name,
      email: userData.email,
      sipUsername: userData.sipUsername,
      sipPassword: userData.sipPassword,
      password: "",
      newPassword: "",
      confirmPassword: "",
      domain: userData.domain
    })
  }, [userData])

  useEffect(() => {
    if (!formData || !userData) return;

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
      sipUsername: userData.sipUsername,
      sipPassword: userData.sipPassword,
    };

    setIsDirty(JSON.stringify(currentData) !== JSON.stringify(savedData));
  }, [formData, userData])

  const AccountTab = {
    id: "0",
    label: "Account",
    icon: (
      <div className="w-5 h-5 rounded-sm bg-red-900 text-white flex items-center justify-center">
        <UserCircleIcon className="w-4 h-4" />
      </div>
    ),
    content: (
      <div className="w-full space-y-2">
        <InputRow
          name="name"
          label="Full Name:"
          placeholder="eg: Keyla James"
          required={true}
          value={formData?.name}
          onChange={(e) => handleFormDataChange("name", e.target.value)}
          error={validationErrors.name}
        />
        <InputRow
          name="email"
          label="Email:"
          placeholder="eg: keyla@telemojo.net"
          value={formData?.email}
          required={true}
          onChange={(e) => handleFormDataChange("email", e.target.value)}
          error={validationErrors.email}
        />
        <InputRow
          name="sipUsername"
          label="SIP Username:"
          placeholder="eg: webrtc"
          value={formData?.sipUsername}
          required={true}
          onChange={(e) => handleFormDataChange("sipUsername", e.target.value)}
          error={validationErrors.sipUsername}
        />
        <InputRow
          name="sipPassword"
          label="SIP Password:"
          placeholder="eg: 1234"
          value={formData?.sipPassword}
          onChange={(e) => handleFormDataChange("sipPassword", e.target.value)}
          error={validationErrors.sipPassword}
          type="password"
        />
        <InputRow
          name="password"
          label="Current Password:"
          placeholder="Enter your current password"
          value={formData?.password}
          required={formData?.newPassword !== ""}
          onChange={(e) => handleFormDataChange("password", e.target.value)}
          error={validationErrors.password}
          type="password"
        />
        <InputRow
          name="newPassword"
          label="New Password:"
          placeholder="Enter your new password"
          value={formData?.newPassword}
          required={formData?.newPassword !== ""}
          onChange={(e) => handleFormDataChange("newPassword", e.target.value)}
          error={validationErrors.newPassword}
          type="password"
        />
        <InputRow
          name="confirmPassword"
          label="Confirm New Password:"
          placeholder="Confirm your new password"
          value={formData?.confirmPassword}
          required={formData?.newPassword !== ""}
          onChange={(e) => handleFormDataChange("confirmPassword", e.target.value)}
          error={validationErrors.confirmPassword}
          type="password"
        />
        <InputRow
          name="domain"
          label="Domain:"
          placeholder="eg: telemojo.net"
          value={formData?.domain}
          onChange={() => { }}
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
          <TabView tabs={[AccountTab]} />
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
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isDirty && !isSaving
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
  )
}

export default SettingDialog;