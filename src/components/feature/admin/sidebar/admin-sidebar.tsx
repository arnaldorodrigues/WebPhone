import React, { useState, useEffect } from "react";
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
  Bars3Icon,
  XMarkIcon,
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

interface AdminSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const NavItem = ({
  item,
  onClick,
}: {
  item: NavItem;
  onClick?: () => void;
}) => {
  const Icon = item.icon;
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (href: string) => {
    router.push(href);
    onClick?.(); // Close mobile menu after navigation
  };

  const isCurrent = item.href === pathname;

  return (
    <button
      key={item.name}
      onClick={() => handleNavClick(item.href)}
      className={`
        w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
        ${
          isCurrent
            ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500 shadow-sm"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
        }
      `}
    >
      <Icon
        className={`
          mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
          ${
            isCurrent
              ? "text-indigo-500"
              : "text-gray-400 group-hover:text-indigo-500"
          }
        `}
      />
      <span className="truncate">{item.name}</span>
    </button>
  );
};

const AdminSidebar = ({ isOpen, onToggle }: AdminSidebarProps) => {
  const { logout } = useAuth();
  const user = getParsedToken();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    onToggle?.();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
        aria-label="Toggle navigation menu"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-transparent z-40 transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-40 w-80 max-w-xs
          md:w-80 md:max-w-none
          bg-white border-r border-gray-200 shadow-xl md:shadow-sm
          transform transition-transform duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
          flex flex-col h-screen md:h-[calc(100vh-4rem)]
        `}
      >
        {/* Admin Title */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            {/* Close button for mobile */}
            <button
              onClick={closeMobileMenu}
              className="md:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} onClick={closeMobileMenu} />
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex items-center mb-4 p-2 rounded-lg bg-white shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <UserCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 border border-red-200 hover:border-red-300"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4 flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
