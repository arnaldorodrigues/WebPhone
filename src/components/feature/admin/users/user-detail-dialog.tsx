"use client";

import { Dialog } from "@/components/ui/dialogs/Dialog";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { User } from "@/types/user";

interface UserDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEdit?: () => void;
  onDelete?: (userId: string) => void;
}

const UserDetailDialog = ({
  isOpen,
  onClose,
  user,
  onEdit,
  onDelete,
}: UserDetailDialogProps) => {
  if (!user) return null;

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm("Are you sure you want to delete this user?")) {
      onDelete(user.id);
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
          <div className="h-16 w-16 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                {user.name}
              </h2>
            </div>
            <p className="text-gray-600 mb-1">{user.email}</p>
            <p className="text-sm text-gray-500">
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-indigo-500" />
              Personal Information
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-gray-900">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <EnvelopeIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CogIcon className="w-5 h-5 mr-2 text-indigo-500" />
              Configuration
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <PhoneIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    SIP Username
                  </p>
                  <p className="text-gray-900 font-mono">
                    {user.settings?.sipUsername || "Not configured"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CogIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    SIP Password
                  </p>
                  <p className="text-gray-900 font-mono">
                    {user.settings?.sipPassword ? "••••••••" : "Not configured"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    SMS Service
                  </p>
                  <p className="text-gray-900 font-mono">
                    {user.did
                      ? typeof user.did === "object" &&
                        user.did !== null &&
                        "type" in user.did
                        ? `${(user.did as any).config.phoneNumber} - ${
                            (user.did as any).type === "signalwire"
                              ? "signalwire"
                              : "vi"
                          }`
                        : typeof user.did === "string"
                        ? `${user.did} - Unknown`
                        : "Not configured"
                      : "Not configured"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CogIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Domain</p>
                  <p className="text-gray-900 font-mono">
                    {user.settings?.domain || "Not configured"}
                  </p>
                </div>
              </div>

              {user.settings?.updatedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Last Updated
                    </p>
                    <p className="text-gray-900">
                      {new Date(user.settings.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Close
          </button>

          {onEdit && (
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-500 border border-transparent rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit User
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete User
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default UserDetailDialog;
