import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Trash2 } from "lucide-react";
import type { Task } from "../models/tasks";
import { ChecklistStatus } from "../models/tasks";
import { getStatusBgClass } from "./statusColors";
import EditableText from "./EditableText";

export interface TaskPopoverProps {
  task: Task;
  selected: boolean;
  onSelect: () => void; // toggles popover open state
  onDelete: () => void;
  onAddItem: (text: string) => void;
  onStatusChange: (itemId: string, status: ChecklistStatus) => void;
  onTitleChange: (newTitle: string) => void;
}

export default function TaskPopover({
  task,
  selected,
  onSelect,
  onDelete,
  onAddItem,
  onStatusChange,
  onTitleChange,
}: TaskPopoverProps) {
  const [newItemText, setNewItemText] = useState("");

  const handleAddItem = () => {
    const trimmedText = newItemText.trim();
    if (!trimmedText) return;
    onAddItem(trimmedText);
    setNewItemText("");
  };

  return (
    <Popover.Root open={selected} onOpenChange={onSelect}>
      <Popover.Anchor asChild>
        <span className="sr-only">anchor</span>
      </Popover.Anchor>
      <Popover.Content
        sideOffset={8}
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-xl w-72 z-50"
      >
        {/* Header */}
        <div className="flex items-center mb-2">
          <EditableText
            text={task.title}
            onSave={onTitleChange}
            className="font-semibold text-sm text-gray-800 dark:text-gray-100"
          />
          <button
            onClick={onDelete}
            aria-label="Delete Task"
            className="ml-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onSelect}
            className="ml-auto text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {/* Checklist items */}
        {task.checklist.map((item) => (
          <div key={item.id} className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              {item.text}
            </div>
            <select
              value={item.status}
              onChange={(e) =>
                onStatusChange(item.id, e.target.value as ChecklistStatus)
              }
              className={`w-28 p-1 rounded-md border border-gray-300 dark:border-gray-600 text-xs outline-none transition-colors duration-150 ${getStatusBgClass(item.status)}`}
            >
              {Object.values(ChecklistStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Add new checklist item */}
        <div className="flex justify-between items-center mb-2">
          <input
            type="text"
            placeholder="Add a new item"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem();
              }
            }}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
          />
          <button
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={handleAddItem}
          >
            Add
          </button>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
