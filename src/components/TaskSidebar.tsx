import { ChecklistStatus } from "../models/tasks";
import type { Task } from "../models/tasks";
import { Trash2, ChevronsLeft, ChevronsRight } from "lucide-react";

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
        className="absolute -right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 shadow"
      >
        {open ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
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
            className="border border-gray-200 dark:border-gray-700 rounded-md p-3"
          >
            {/* Task header */}
            <div className="flex items-center mb-2">
              <h3 className="font-semibold text-sm flex-1 text-gray-800 dark:text-gray-100 truncate">
                {task.title}
              </h3>
              <button
                onClick={() => onDeleteTask(task.id)}
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
                  className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-transparent"
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
