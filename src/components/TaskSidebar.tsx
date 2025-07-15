import { ChecklistStatus } from "../models/tasks";
import type { Task } from "../models/tasks";
import { Trash2, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getStatusBgClass } from "./statusColors";

export interface TaskSidebarProps {
  tasks: Task[];
  open: boolean;
  onToggle: () => void;
  onDeleteTask: (taskId: string) => void | Promise<void>;
  onStatusChange: (
    taskId: string,
    itemId: string,
    status: ChecklistStatus
  ) => void | Promise<void>;
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
}

/**
 * Slide-in panel showing all tasks and their checklist items.
 * Allows deleting a task and updating each checklist item's status.
 */
export default function TaskSidebar({
  tasks,
  open,
  onToggle,
  onDeleteTask,
  onStatusChange,
  selectedTaskId,
  onTaskSelect,
}: TaskSidebarProps) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-80 max-w-full bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 z-40 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="cursor-pointer absolute -right-14 top-4 w-16 h-16 rounded-full flex items-center justify-center bg-yellow-500 shadow"
      >
        {open ? <ChevronsLeft size={40} /> : <ChevronsRight size={40} />}
      </button>

      {/* Content */}
      <div className="p-4 h-full overflow-y-auto space-y-4">
        {tasks.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tasks yet.
          </p>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskSelect(task.id)}
            className={`border rounded-md p-3 cursor-pointer transition-colors select-none ${
              selectedTaskId === task.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {/* Task header */}
            <div className="flex items-center mb-2">
              <h3 className="font-semibold text-sm flex-1 text-gray-800 dark:text-gray-100 truncate">
                {task.title}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                aria-label="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Checklist */}
            {task.checklist.map((item) => (
              <div key={item.id} className="flex items-center mb-1">
                <span className="text-xs flex-1 text-gray-700 dark:text-gray-300 truncate">
                  {item.text}
                </span>
                <select
                  onClick={(e) => e.stopPropagation()}
                  className={`text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-transparent outline-none transition-colors duration-150 ${getStatusBgClass(item.status)}`}
                  value={item.status}
                  onChange={(e) =>
                    onStatusChange(
                      task.id,
                      item.id,
                      e.target.value as ChecklistStatus
                    )
                  }
                >
                  {Object.values(ChecklistStatus).map((s) => (
                    <option key={s} value={s} className="text-xs">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
