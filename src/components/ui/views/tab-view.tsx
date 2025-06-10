"use client";

import { ReactNode, useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
}

interface TabViewProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function TabView({
  tabs,
  defaultTab,
  onChange,
  className = "",
}: TabViewProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className={`w-full bg-white rounded-xl shadow-sm ${className}`}>
      {/* Tab Headers */}
      <div className="flex space-x-1 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 text-sm font-medium
              transition-all duration-200 ease-in-out
              ${
                activeTab === tab.id
                  ? "text-indigo-600 bg-white border-b-2 border-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 overflow-y-auto border-0">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
