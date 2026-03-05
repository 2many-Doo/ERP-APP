import React from "react";
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  tasksCount: number;
  onNewTask: () => void;
}

const TaskHeader: React.FC<Props> = ({ tasksCount, onNewTask }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div className="flex items-center gap-3">
      <ClipboardList className="h-8 w-8 text-slate-600" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Ажлын даалгавар</h1>
        <p className="text-sm text-slate-500">Нийт {tasksCount} бүртгэл</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Button type="button" className="flex items-center gap-2" onClick={onNewTask}>
        <Plus className="h-4 w-4" />
        Шинэ даалгавар
      </Button>
    </div>
  </div>
);

export default TaskHeader;
