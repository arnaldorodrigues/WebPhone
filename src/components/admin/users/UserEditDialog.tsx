import { Dialog } from "@/components/ui/dialogs"
import { DropdownSelect, Input } from "@/components/ui/inputs";
import { CogIcon, UserIcon } from "@heroicons/react/24/outline";

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
  const isCreateMode = !user;
  const dialogTitle = isCreateMode ? "Create User" : "Edit User";

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
                  value={user?.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
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
                value={user?.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
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
                value={user?.password}
                onChange={(e) =>
                  handleInputChange("password", e.target.value)
                }
              />
              {!isCreateMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to keep the current password. Minimum 6
                  characters if changed.
                </p>
              )}
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
                  value={user?.settings?.sipUsername}
                  onChange={(e) =>
                    handleInputChange("settings.sipUsername", e.target.value)
                  }
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
                  value={user?.settings.sipPassword}
                  onChange={(e) =>
                    handleInputChange("settings.sipPassword", e.target.value)
                  }
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMS Service
                </label>
                <DropdownSelect
                  placeholder="Select SMS Service"
                  value={formData.did}
                  onChange={(value) => {
                    handleInputChange("did", value);
                  }}
                  className={`font-mono ${errors.domain ? "border-red-300" : ""
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
                  className={`font-mono ${errors.domain ? "border-red-300" : ""
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
              </div> */}
            </div>
          </div>
        </div>

      </div>
    </Dialog>
  )
}