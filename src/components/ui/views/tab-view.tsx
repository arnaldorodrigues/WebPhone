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
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className="flex space-x-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg
              transition-all duration-150 ease-in-out
              ${
                activeTab === tab.id
                  ? "text-indigo-600 bg-white border-b-2 border-indigo-600"
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
      <div className="mt-4 max-h-[768px] overflow-y-auto">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
