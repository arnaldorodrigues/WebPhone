import React from "react";
import {
  HomeIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { getParsedToken } from "@/utils/auth";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current?: boolean;
}

const NavItem = (item: NavItem) => {
  const Icon = item.icon;
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  const isCurrent = item.href === pathname;

  return (
    <button
      key={item.name}
      onClick={() => handleNavClick(item.href)}
      className={`
        w-full group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
        ${
          isCurrent
            ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        }
      `}
    >
      <Icon
        className={`
          mr-3 h-5 w-5 flex-shrink-0
          ${
            isCurrent
              ? "text-indigo-500"
              : "text-gray-400 group-hover:text-indigo-500"
          }
        `}
      />
      {item.name}
    </button>
  );
};

const AdminSidebar = () => {
  const { logout } = useAuth();
  const user = getParsedToken();
  const router = useRouter();
  const navigation: NavItem[] = [
    { name: "Dashboard", href: "/admin", icon: HomeIcon, current: true },
    { name: "Users", href: "/admin/users", icon: UsersIcon },
    // { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
    // { name: "Reports", href: "/admin/reports", icon: DocumentTextIcon },
    // { name: "Notifications", href: "/admin/notifications", icon: BellIcon },
    // { name: "Security", href: "/admin/security", icon: ShieldCheckIcon },
    // { name: "Settings", href: "/admin/settings", icon: CogIcon },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={`w-full h-[calc(100vh-4rem)] pb-5 sm:block sm:w-80 bg-white border-r border-gray-100 shadow-sm`}
    >
      <div className="h-full flex flex-col">
        {/* Admin Title */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavItem key={item.name} {...item} />
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
