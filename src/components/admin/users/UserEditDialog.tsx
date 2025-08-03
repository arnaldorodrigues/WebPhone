'use client'

import { Dialog } from "@/components/ui/dialogs"
import { DropdownSelect, Input } from "@/components/ui/inputs";
import { getSipServers } from "@/core/sip-servers/request";
import { getSmsGateways } from "@/core/sms-gateways/request";
import { ICreateUserRequest, IUpdateUserRequest } from "@/core/users/model";
import { createUser, updateUser } from "@/core/users/request";
import { AppDispatch, RootState } from "@/store";
import { TDropdownOption, UserRole } from "@/types/common";
import { CheckIcon, CogIcon, UserIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
}

export const UserEditDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const { sipservers } = useSelector((state: RootState) => state.sipservers);
  const { smsgateways } = useSelector((state: RootState) => state.smsgateways);

  const isCreateMode = !user;
  const dialogTitle = isCreateMode ? "Create User" : "Edit User";

  const [sipServerOptions, setSipServerOptions] = useState<TDropdownOption[]>([]);
  const [smsGatewayOptions, setSmsGatewayOptions] = useState<TDropdownOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [sipUsername, setSipUsername] = useState<string>();
  const [sipPassword, setSipPassword] = useState<string>();
  const [selectedSipServer, setSelectedSipServer] = useState<TDropdownOption>();
  const [selectedSmsGateway, setSelectedSmsGateway] = useState<TDropdownOption>();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name?.trim()) newErrors.name = "Full name is required.";
    if (!email?.trim()) newErrors.email = "Email is required.";

    if (!isCreateMode && password && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (user) {
        await handleUpdate();
      } else {
        await handleCreate();
      }
      
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error('Error submitting user:', error);
      setIsSubmitting(false);
    }
  }

  const handleUpdate = async () => {
    if (!name || !email) return;

    const payload: IUpdateUserRequest = {
      id: user?._id || '',
      name: name,
      email: email,
      password: password,
      role: UserRole.USER,
      sipUsername: sipUsername,
      sipPassword: sipPassword,
      sipServer: selectedSipServer?.value,
      smsGateway: selectedSmsGateway?.value
    }

    // Wait for the dispatch to complete
    await dispatch(updateUser(payload)).unwrap();
  }

  const handleCreate = async () => {
    if (!name || !email) return;

    const payload: ICreateUserRequest = {
      name: name,
      email: email,
      password: password,
      role: UserRole.USER,
      sipUsername: sipUsername,
      sipPassword: sipPassword,
      sipServer: selectedSipServer?.value,
      smsGateway: selectedSmsGateway?.value
    }

    // Wait for the dispatch to complete
    await dispatch(createUser(payload)).unwrap();
  }

  useEffect(() => {
    setErrors({});
    setIsSubmitting(false);

    setName(user?.name);
    setEmail(user?.email);
    setPassword(user?.password);
    setSipUsername(user?.setting?.sipUsername);
    setSipPassword(user?.setting?.sipPassword);


    const sipServerOption = sipServerOptions.find(s => s.value === user?.sipServer);
    setSelectedSipServer(sipServerOption);

    const smsGatewayOption = smsGatewayOptions.find(s => s.value === user?.smsGateway);
    setSelectedSmsGateway(smsGatewayOption);

  }, [isOpen])

  useEffect(() => {
    dispatch(getSipServers());
    dispatch(getSmsGateways());
  }, [dispatch])

  useEffect(() => {
    const sipSrvOptions = sipservers.map((server) => {
      return {
        value: server._id,
        label: server.domain,
      };
    });
    setSipServerOptions(sipSrvOptions);

    const sipServerOption = sipSrvOptions.find(s => s.value === user?.sipServer);
    setSelectedSipServer(sipServerOption);
  }, [sipservers])

  useEffect(() => {
    const smsoptions = smsgateways.map((gateway) => {
      return {
        value: gateway._id,
        label: `${gateway.type}-${gateway.didNumber}`,
      }
    })
    setSmsGatewayOptions(smsoptions);

    const smsGatewayOption = smsoptions.find(s => s.value === user?.sipServer);
    setSelectedSmsGateway(smsGatewayOption);
  }, [smsgateways])

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={dialogTitle}
      maxWidth="2xl"
      closeOnOutsideClick={false}
    >
      <div className="space-y-6 p-4">
        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
          <div className="h-16 w-16 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-xl font-bold text-white">
              {user?.name.charAt(0).toUpperCase() || "U"}
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {!isCreateMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to keep the current password. Minimum 6
                  characters if changed.
                </p>
              )}
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
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
                  value={sipUsername}
                  onChange={(e) => setSipUsername(e.target.value)}
                  className={`font-mono`}
                />
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
                  value={sipPassword}
                  onChange={(e) => setSipPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMS Service
                </label>
                <DropdownSelect
                  placeholder="Select SMS Service"
                  value={selectedSmsGateway}
                  onChange={(value) => { setSelectedSmsGateway(value) }}
                  className="font-mono"
                  options={smsGatewayOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain
                </label>
                <DropdownSelect
                  placeholder="Select domain"
                  value={selectedSipServer}
                  onChange={(value) => { setSelectedSipServer(value) }}
                  className="font-mono"
                  options={sipServerOptions}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
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
                {isCreateMode ? "Create User" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </div>
    </Dialog>
  )
}