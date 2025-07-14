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

  // Track if we are currently dragging a pin so we can ignore click events that would create a new one
  const isDraggingRef = useRef(false);

  // load tasks for current user
  useEffect(() => {
    if (!db || !user) return;
    (async () => {
      const col = db.tasks!;
      const docs = await col.find({ selector: { userId: user } }).exec();
      const loaded = docs.map(
        (d: RxDocument<Task>) => d.toJSON() as unknown as Task
      );
      setTasks(loaded);
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
        console.error("[addTask] DB insert error", err);
      }
    }
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTaskPos = async (taskId: string, xPct: number, yPct: number) => {
    if (!db) {
      return;
    }
    const doc = await db.tasks!.findOne(taskId).exec();
    if (!doc) {
      return;
    }
    await doc.incrementalModify((d: Task) => ({
      ...d,
      xPct,
      yPct,
      updatedAt: Date.now(),
    }));
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, xPct, yPct } : t
      );
      return updated;
    });
  };

  const deleteTask = async (taskId: string) => {
    console.log("[deleteTask] taskId", taskId);
    if (!db) return;
    const doc = await db.tasks!.findOne(taskId).exec();
    if (doc) await doc.remove();
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selected === taskId) setSelected(null);
  };

  const handleImgClick = (e: React.MouseEvent) => {
    // If a drag just occurred, ignore this click so we don't create a new pin
    if (isDraggingRef.current) return;

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
      <div className="relative inline-block">
        <img
          ref={imgRef}
          src={planImg}
          alt="Construction plan"
          className="select-none cursor-crosshair max-w-full opacity-50"
          style={{ position: "relative", zIndex: 0 }}
        />
        {tasks.map((t) => (
          <TaskPin
            key={`${t.id}-${t.xPct.toFixed(2)}-${t.yPct.toFixed(2)}`}
            task={t}
            selected={selected === t.id}
            onSelect={() =>
              setSelected((prev) => (prev === t.id ? null : t.id))
            }
            onDragStart={() => {
              isDraggingRef.current = true;
            }}
            onDragEnd={(x, y) => {
              // update position
              updateTaskPos(t.id, x, y);
              // allow the click that Draggable emits on stop to be ignored, then re-enable
              setTimeout(() => (isDraggingRef.current = false), 0);
            }}
            onDelete={() => {
              deleteTask(t.id);
            }}
          />
        ))}

        {/* Overlay */}
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
  onDragStart: () => void;
  onDragEnd: (xPct: number, yPct: number) => void;
  onDelete: () => void;
}

function TaskPin({
  task,
  selected,
  onSelect,
  onDragEnd,
  onDelete,
  onDragStart,
}: PinProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  // Track if any movement occurred during this drag interaction
  const dragged = useRef(false);
  // const [isbeingHovered, setIsbeingHovered] = useState(false);

  const handleStop = () => {
    if (!pinRef.current) return;
    const nodeRect = pinRef.current.getBoundingClientRect();
    const parentRect = (
      pinRef.current.parentElement as HTMLElement
    ).getBoundingClientRect();

    // centre of the 20×20 dot
    const centerX = nodeRect.left - parentRect.left + nodeRect.width / 2;
    const centerY = nodeRect.top - parentRect.top + nodeRect.height / 2;
    const xPct = (centerX / parentRect.width) * 100;
    const yPct = (centerY / parentRect.height) * 100;

    onDragEnd(xPct, yPct);

    // drop the inline transform added by react-draggable
    pinRef.current.style.transform = "";

    if (!dragged.current) onSelect();
  };

  return (
    <Draggable
      nodeRef={pinRef}
      handle="#pin"
      onStart={() => {
        dragged.current = false;
        onDragStart();
      }}
      onDrag={() => {
        dragged.current = true;
      }}
      onStop={handleStop}
    >
      {/* OUTER wrapper: positioned at saved centre */}
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
        {/* INNER wrapper: centres the dot */}
        <div style={{ transform: "translate(-50%, -50%)" }}>
          <div
            id="pin"
            className="w-5 h-5 bg-red-600 rounded-full border-2 border-white shadow-lg"
          />
          <Popover.Root open={selected} onOpenChange={onSelect}>
            <Popover.Anchor asChild>
              <span className="sr-only">anchor</span>
            </Popover.Anchor>
            <Popover.Content
              sideOffset={8}
              className="rounded border bg-white p-4 shadow-lg w-40 z-50"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm">Task</span>
                <button
                  onClick={onSelect}
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
      </div>
    </Draggable>
  );
}
