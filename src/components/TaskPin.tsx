import { useRef, useState } from "react";
import Draggable from "react-draggable";
import type { Task } from "../models/tasks";
import { ChecklistStatus } from "../models/tasks";
import TaskPopover from "./TaskPopover";

export interface TaskPinProps {
  task: Task;
  selected: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragEnd: (xPct: number, yPct: number) => void;
  onDelete: () => void;
  onAddItem: (text: string) => void;
  onStatusChange: (itemId: string, status: ChecklistStatus) => void;
  onTitleChange: (newTitle: string) => void;
}

export default function TaskPin({
  task,
  selected,
  onSelect,
  onDragEnd,
  onDelete,
  onDragStart,
  onAddItem,
  onStatusChange,
  onTitleChange,
}: TaskPinProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const wasDragged = useRef(false);
  const [hideAfterDrag, setHideAfterDrag] = useState(false);

  const handleStop = () => {
    if (!pinRef.current) return;

    const nodeRect = pinRef.current.getBoundingClientRect();
    const parentRect = (
      pinRef.current.parentElement as HTMLElement
    ).getBoundingClientRect();

    const xPct = ((nodeRect.left - parentRect.left) / parentRect.width) * 100;
    const yPct = ((nodeRect.top - parentRect.top) / parentRect.height) * 100;

    // Hide the pin briefly to prevent flicker from old position
    setHideAfterDrag(true);

    onDragEnd(xPct, yPct);

    // Clear inline transform from react-draggable
    pinRef.current.style.transform = "";

    // Show the pin again after a brief delay
    setTimeout(() => setHideAfterDrag(false), 10);

    if (!wasDragged.current) onSelect();
  };

  return (
    <Draggable
      nodeRef={pinRef}
      handle="#pin"
      onStart={() => {
        wasDragged.current = false;
        onDragStart();
      }}
      onDrag={() => {
        wasDragged.current = true;
      }}
      onStop={handleStop}
    >
      <div
        ref={pinRef}
        style={{
          left: `${task.xPct}%`,
          top: `${task.yPct}%`,
          opacity: hideAfterDrag ? 0 : 1,
        }}
        className="cursor-pointer select-none z-50 absolute"
      >
        <div style={{ transform: "translate(-50%, -50%)" }}>
          <div
            id="pin"
            className={`w-5 h-5 rounded-full border-2 shadow-lg ${
              selected
                ? "bg-red-700 border-blue-500 ring-4 ring-blue-500"
                : "bg-red-600 border-white"
            }`}
          />

          <TaskPopover
            task={task}
            selected={selected}
            onSelect={onSelect}
            onDelete={onDelete}
            onAddItem={onAddItem}
            onStatusChange={onStatusChange}
            onTitleChange={onTitleChange}
          />
        </div>
      </div>
    </Draggable>
  );
}
