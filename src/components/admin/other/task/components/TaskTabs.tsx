import React from "react";

interface Props {
  activeTab: "tasks" | "tags";
  onChange: (tab: "tasks" | "tags") => void;
}

const TaskTabs: React.FC<Props> = ({ activeTab, onChange }) => (
  <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
    <button
      onClick={() => onChange("tasks")}
      className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "tasks" ? "text-black border-b-2 border-gray-600" : "text-slate-600 hover:text-slate-900"
        }`}
    >
      Даалгавар
    </button>
    <button
      onClick={() => onChange("tags")}
      className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "tags" ? "text-black border-b-2 border-gray-600" : "text-slate-600 hover:text-slate-900"
        }`}
    >
      Тааг
    </button>
  </div>
);

export default TaskTabs;
