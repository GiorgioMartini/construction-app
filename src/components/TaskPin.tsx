import { useRef } from "react";
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
}

/**
 * Draggable red pin anchored on the construction plan.
 * Encapsulates checklist CRUD & status updates inside a Radix popover.
 */
export default function TaskPin({
  task,
  selected,
  onSelect,
  onDragEnd,
  onDelete,
  onDragStart,
  onAddItem,
  onStatusChange,
}: TaskPinProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const wasDragged = useRef(false);

  /* ----------------------------- Drag helpers ---------------------------- */
  const handleStop = () => {
    if (!pinRef.current) return;

    const nodeRect = pinRef.current.getBoundingClientRect();
    const parentRect = (
      pinRef.current.parentElement as HTMLElement
    ).getBoundingClientRect();

    // pinRef is positioned at the pin's centre already.
    const xPct = ((nodeRect.left - parentRect.left) / parentRect.width) * 100;
    const yPct = ((nodeRect.top - parentRect.top) / parentRect.height) * 100;

    onDragEnd(xPct, yPct);
    // Clear inline transform from react-draggable
    pinRef.current.style.transform = "";

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
          position: "absolute",
          left: `${task.xPct}%`,
          top: `${task.yPct}%`,
          zIndex: 20,
        }}
        className="cursor-pointer select-none z-50"
      >
        <div style={{ transform: "translate(-50%, -50%)" }}>
          <div
            id="pin"
            className={`w-5 h-5 rounded-full border-2 shadow-lg ${
              selected
                ? "bg-red-700 border-blue-500 ring-2 ring-blue-500"
                : "bg-red-600 border-white"
            }`}
          />

          {/* Popover with checklist functionality */}
          <TaskPopover
            task={task}
            selected={selected}
            onSelect={onSelect}
            onDelete={onDelete}
            onAddItem={onAddItem}
            onStatusChange={onStatusChange}
          />
        </div>
      </div>
    </Draggable>
  );
}
