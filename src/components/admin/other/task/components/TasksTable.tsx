import React from "react";
import { Pencil } from "lucide-react";
import { TaskItem } from "./taskTypes";
import { formatDate } from "./taskUtils";

interface Props {
  tasks: TaskItem[];
  loading: boolean;
  onRowClick: (id: number) => void;
  onEdit?: (task: TaskItem) => void;
}

const TasksTable: React.FC<Props> = ({ tasks, loading, onRowClick, onEdit }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wide">
      <div className="col-span-1 px-4 py-3">ID</div>
      <div className="col-span-3 px-4 py-3">Гарчиг</div>
      <div className="col-span-4 px-4 py-3">Тайлбар</div>
      <div className="col-span-2 px-4 py-3">Төлөв</div>
      <div className="col-span-1 px-4 py-3">Огноо</div>
      {onEdit && <div className="col-span-1 px-4 py-3 text-center">Засах</div>}
    </div>
    {loading ? (
      <div className="p-6 text-center text-slate-600">Уншиж байна...</div>
    ) : tasks.length === 0 ? (
      <div className="p-6 text-center text-slate-600">Даалгавар олдсонгүй</div>
    ) : (
      <div className="divide-y divide-slate-200">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-12 px-4 py-3 text-sm text-slate-800 hover:bg-slate-50"
          >
            <div
              className="col-span-1 font-semibold text-slate-900 cursor-pointer"
              onClick={() => onRowClick(task.id)}
            >
              #{task.id}
            </div>
            <div className="col-span-3 line-clamp-1 cursor-pointer" onClick={() => onRowClick(task.id)}>
              {task.title}
            </div>
            <div className="col-span-4 text-slate-600 line-clamp-2 cursor-pointer" onClick={() => onRowClick(task.id)}>
              {task.description || "—"}
            </div>
            <div className="col-span-2">
              {(task.status_label || task.status) ? (
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {task.status_label || task.status}
                </span>
              ) : (
                "—"
              )}
            </div>
            <div className="col-span-1 text-xs text-slate-500 flex items-center gap-2 justify-end">
              <span>{formatDate(task.created_at)}</span>
            </div>
            {onEdit && (
              <div className="col-span-1 flex items-center justify-center">
                <button
                  className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-600 flex items-center justify-center"
                  onClick={() => onEdit(task)}
                  aria-label="edit task"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default TasksTable;
