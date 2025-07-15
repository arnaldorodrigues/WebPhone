import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import React from "react"

type Props = {
  users: any[];
  handleEdit: (user: any) => void;
  handleDelete: (user: any) => void;
}

export const UsersTable: React.FC<Props> = ({
  users,
  handleEdit,
  handleDelete
}) => {
  return (
    <table className="min-w-full divide-y divide-gray-100">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            User
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Extension Number
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Created
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {users.length > 0 &&
          users.map((user) => (
            <tr
              key={user._id}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center shadow-sm">
                      <span className="text-sm font-medium text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {user.setting?.sipUsername}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => { }}
                    className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 transition-colors duration-200"
                    title="View User"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {handleEdit(user)}}
                    className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 transition-colors duration-200"
                    title="Edit User"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {handleDelete(user)}}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                    title="Delete User"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  )
}