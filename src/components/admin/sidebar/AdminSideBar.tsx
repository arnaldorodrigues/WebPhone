import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChatBubbleLeftIcon,
  HomeIcon,
  ServerIcon,
  UserCircleIcon,
  UsersIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current?: boolean
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

  const handleClick = (href: string) => {
    router.push(href);
    onClick?.();
  };

  const isCurrent = item.href === pathname;

  return (
    <div
      onClick={() => handleClick(item.href)}
      className={`
        w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 select-none
        ${isCurrent
          ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500 shadow-sm"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
        }
      `}
    >
      <Icon
        className={`
          mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
          ${isCurrent
            ? "text-indigo-500"
            : "text-gray-400 group-hover:text-indigo-500"
          }
        `}
      />
      <span className="truncate">{item.name}</span>
    </div>
  )
}

export const AdminSideBar = () => {

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { name: "Users", href: "/admin/users", icon: UsersIcon },
    { name: "Servers", href: "/admin/servers", icon: ServerIcon },
    { name: "SMS Gateways", href: "/admin/sms-gateways", icon: ChatBubbleLeftIcon },
  ]

  const { user, logout } = useAuth();

  const [isToggle, setIsToggle] = useState(false);

  const handleToggle = (toggle: boolean) => {
    setIsToggle(toggle);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsToggle(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isToggle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isToggle]);

  return (
    <>
      <button
        onClick={() => handleToggle(!isToggle)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
        aria-label="Toggle navigation menu"
      >
        {isToggle ? (
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {isToggle && (
        <div
          className="md:hidden fixed inset-0 bg-transparent z-40 transition-opacity duration-300"
          onClick={() => setIsToggle(false)}
        />
      )}

      <div
        className={`
          fixed md:static inset-y-0 left-0 z-40 w-80 max-w-xs
          md:w-80 md:max-w-none
          bg-white border-r border-gray-200 shadow-xl md:shadow-sm
          transform transition-transform duration-300 ease-in-out
          ${isToggle
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
          }
          flex flex-col h-screen md:h-[calc(100vh-4rem)]
        `}
      >
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            <button
              onClick={() => setIsToggle(false)}
              className="md:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {navItems.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              onClick={() => setIsToggle(false)}
            />
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex items-center mb-4 p-2 rounded-lg bg-white shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <UserCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.userName || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              setIsToggle(false);
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