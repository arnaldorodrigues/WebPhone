"use client";

import { useState, useEffect } from "react";
import {
  UsersIcon,
  HomeIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  SignalIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { getParsedToken } from "@/utils/auth";
import { fetchWithAuth } from "@/utils/api";

interface Stat {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  extensionNumbers: number;
  usableExtensionNumbers: number;
}

const Page = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetchWithAuth("/api/admin/users");

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data = await response.json();
        const statsData: StatsData = data.data.stats;

        const statsArray: Stat[] = [
          {
            title: "Total Users",
            value: statsData.totalUsers?.toString(),
            icon: UserGroupIcon,
            color: "bg-gradient-to-r from-blue-500 to-blue-600",
          },
          {
            title: "Active Users",
            value: statsData.activeUsers?.toString(),
            icon: CheckCircleIcon,
            color: "bg-gradient-to-r from-green-500 to-green-600",
          },
          {
            title: "Total Extensions",
            value: statsData.extensionNumbers?.toString(),
            icon: DevicePhoneMobileIcon,
            color: "bg-gradient-to-r from-purple-500 to-purple-600",
          },
          {
            title: "Active Extensions",
            value: statsData.usableExtensionNumbers?.toString(),
            icon: SignalIcon,
            color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
          },
        ];

        setStats(statsArray);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // const recentActivities = [
  //   { id: 1, user: "John Doe", action: "Logged in", time: "2 minutes ago" },
  //   {
  //     id: 2,
  //     user: "Jane Smith",
  //     action: "Updated profile",
  //     time: "5 minutes ago",
  //   },
  //   {
  //     id: 3,
  //     user: "Bob Johnson",
  //     action: "Created new post",
  //     time: "10 minutes ago",
  //   },
  //   {
  //     id: 4,
  //     user: "Alice Brown",
  //     action: "Deleted comment",
  //     time: "15 minutes ago",
  //   },
  //   {
  //     id: 5,
  //     user: "Charlie Wilson",
  //     action: "Changed password",
  //     time: "20 minutes ago",
  //   },
  // ];

  return (
    <main className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome back, {getParsedToken()?.name}!
        </h3>
        <p className="text-gray-500">
          Here's what's happening with your admin panel today.
        </p>
      </div>

      {/* Stats Grid */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading
          ? // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 rounded-xl bg-gray-200 shadow-lg">
                      <div className="w-7 h-7 bg-gray-300 rounded"></div>
                    </div>
                    <div>
                      <div className="h-3 bg-gray-200 rounded mb-2 w-24"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          : stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-4 rounded-xl ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 tracking-tight">
                          {stat.value || "2"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h4>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center shadow-sm">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-500">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Quick Actions */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h4>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-indigo-200 transition-all duration-200">
                <UsersIcon className="w-8 h-8 text-indigo-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Add User
                </span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-green-200 transition-all duration-200">
                <EnvelopeIcon className="w-8 h-8 text-green-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Send Email
                </span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-purple-200 transition-all duration-200">
                <ChartBarIcon className="w-8 h-8 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  View Reports
                </span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-all duration-200">
                <Cog6ToothIcon className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Settings
                </span>
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </main>
  );
};

export default Page;
