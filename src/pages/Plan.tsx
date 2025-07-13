import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import * as Popover from "@radix-ui/react-popover";
import planImg from "../assets/plan-image.webp";
import { useAppStore } from "../store";
import type { Task, ChecklistItem } from "../models/tasks";
import type { RxDocument } from "rxdb";
import { ChecklistStatus } from "../models/tasks";
import { nanoid } from "nanoid";

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: nanoid(), text: "Measure area", status: ChecklistStatus.NotStarted },
  {
    id: nanoid(),
    text: "Gather materials",
    status: ChecklistStatus.NotStarted,
  },
];

export default function Plan() {
  const user = useAppStore((s) => s.user);
  const db = useAppStore((s) => s.db);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // load tasks for current user
  useEffect(() => {
    if (!db || !user) return;
    (async () => {
      const col = db.tasks!;
      const docs = await col.find({ selector: { userId: user } }).exec();
      setTasks(
        docs.map((d: RxDocument<Task>) => d.toJSON() as unknown as Task)
      );
    })();
  }, [db, user]);

  // helpers
  const addTask = async (xPct: number, yPct: number) => {
    const newTask: Task = {
      id: nanoid(),
      userId: user ?? "anon",
      title: "New task",
      xPct,
      yPct,
      checklist: DEFAULT_CHECKLIST,
      updatedAt: Date.now(),
    };
    if (db && user) {
      try {
        await db.tasks!.insert(newTask);
      } catch (err) {
        console.error(err);
      }
    }
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTaskPos = async (taskId: string, xPct: number, yPct: number) => {
    if (!db) return;
    const doc = await db.tasks!.findOne(taskId).exec();
    if (doc) await doc.incrementalModify({ xPct, yPct, updatedAt: Date.now() });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, xPct, yPct } : t))
    );
  };

  const deleteTask = async (taskId: string) => {
    if (!db) return;
    const doc = await db.tasks!.findOne(taskId).exec();
    if (doc) await doc.remove();
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selected === taskId) setSelected(null);
  };

  const handleImgClick = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    // Ignore when holding shift (reserved for menu trigger)
    if (e.shiftKey) return;
    const rect = imgRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    addTask(xPct, yPct);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="relative inline-block" onClickCapture={handleImgClick}>
        <img
          ref={imgRef}
          src={planImg}
          alt="Construction plan"
          className="select-none cursor-crosshair max-w-full opacity-50"
          style={{ position: "relative", zIndex: 0 }}
        />
        {tasks.map((t) => (
          <TaskPin
            key={t.id}
            task={t}
            selected={selected === t.id}
            onSelect={() => setSelected(t.id)}
            onDragEnd={(x, y) => updateTaskPos(t.id, x, y)}
            onDelete={() => deleteTask(t.id)}
          />
        ))}

        {/* overlay to catch clicks (below pins) */}
        <div
          className="absolute inset-0 cursor-crosshair z-10"
          onClick={handleImgClick}
        />
      </div>
    </div>
  );
}

interface PinProps {
  task: Task;
  selected: boolean;
  onSelect: () => void;
  onDragEnd: (xPct: number, yPct: number) => void;
  onDelete: () => void;
}

function TaskPin({ task, selected, onSelect, onDragEnd, onDelete }: PinProps) {
  const pinRef = useRef<HTMLDivElement>(null);

  const handleStop = () => {
    if (!pinRef.current) return;
    const nodeRect = pinRef.current.getBoundingClientRect();
    const parentRect = (
      pinRef.current.parentElement as HTMLElement
    ).getBoundingClientRect();
    const xPct = ((nodeRect.left - parentRect.left) / parentRect.width) * 100;
    const yPct = ((nodeRect.top - parentRect.top) / parentRect.height) * 100;
    onDragEnd(xPct, yPct);
  };

  return (
    <Draggable nodeRef={pinRef} onStop={handleStop}>
      <div
        ref={pinRef}
        style={{
          position: "absolute",
          left: `${task.xPct}%`,
          top: `${task.yPct}%`,
          transform: "translate(-50%, -50%)",
          zIndex: 20,
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onDelete();
        }}
        onClick={(e) => {
          if (e.shiftKey) onSelect();
          e.stopPropagation();
        }}
        className="cursor-pointer select-none z-50"
      >
        {/* visible red pin */}
        <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-white shadow-lg pointer-events-none" />
        YOLO
        {/* popover attached to invisible anchor */}
        <Popover.Root open={selected} onOpenChange={() => onSelect()}>
          <Popover.Anchor asChild>
            <span className="sr-only">anchor</span>
          </Popover.Anchor>
          <Popover.Content
            sideOffset={8}
            className="rounded border bg-white p-4 shadow-lg w-40"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">Task</span>
              <button
                onClick={() => onSelect()}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <button
              onClick={onDelete}
              className="text-red-600 hover:underline text-sm"
            >
              Delete
            </button>
          </Popover.Content>
        </Popover.Root>
      </div>
    </Draggable>
  );
}
