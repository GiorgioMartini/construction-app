import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import * as Popover from "@radix-ui/react-popover";
import planImg from "../assets/plan-image.webp";
import { useAppStore } from "../store";
import type { Task, ChecklistItem } from "../models/tasks";
import type { RxDocument } from "rxdb";
import { ChecklistStatus } from "../models/tasks";
import { nanoid } from "nanoid";
import { Trash2 } from "lucide-react";

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: nanoid(), text: "Measure area", status: ChecklistStatus.FinalCheck },
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
      console.log("[Plan] loaded", loaded.length, "tasks", loaded);
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

  // Add new checklist item to a task
  const addChecklistItem = async (taskId: string, text: string) => {
    const newItem: ChecklistItem = {
      id: nanoid(),
      text,
      status: ChecklistStatus.NotStarted,
    };

    // Persist to DB first (best-effort)
    if (db) {
      try {
        const doc = await db.tasks!.findOne(taskId).exec();
        if (doc) {
          await doc.incrementalModify((d: Task) => ({
            ...d,
            checklist: [...d.checklist, newItem],
            updatedAt: Date.now(),
          }));
        }
      } catch (err) {
        console.error("[addChecklistItem] DB update error", err);
      }
    }

    // Update local state so UI feels snappy
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? { ...task, checklist: [...task.checklist, newItem] }
          : task
      )
    );
  };

  // Update status of an existing checklist item
  const updateChecklistStatus = async (
    taskId: string,
    itemId: string,
    status: ChecklistStatus
  ) => {
    if (db) {
      try {
        const taskDoc = await db.tasks!.findOne(taskId).exec();
        if (taskDoc)
          await taskDoc.incrementalModify((currentTask: Task) => ({
            ...currentTask,
            checklist: currentTask.checklist.map((checklistItem) =>
              checklistItem.id === itemId
                ? { ...checklistItem, status }
                : checklistItem
            ),
            updatedAt: Date.now(),
          }));
      } catch (err) {
        console.error("[updateChecklistStatus]", err);
      }
    }

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              checklist: task.checklist.map((checklistItem) =>
                checklistItem.id === itemId
                  ? { ...checklistItem, status }
                  : checklistItem
              ),
            }
          : task
      )
    );
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
        {tasks.map((task) => (
          <TaskPin
            key={`${task.id}-${task.xPct.toFixed(2)}-${task.yPct.toFixed(2)}`}
            task={task}
            selected={selected === task.id}
            onSelect={() =>
              setSelected((prev) => (prev === task.id ? null : task.id))
            }
            onDragStart={() => {
              isDraggingRef.current = true;
            }}
            onDragEnd={(x, y) => {
              // update position
              updateTaskPos(task.id, x, y);
              // allow the click that Draggable emits on stop to be ignored, then re-enable
              setTimeout(() => (isDraggingRef.current = false), 0);
            }}
            onDelete={() => {
              deleteTask(task.id);
            }}
            onAddItem={(text) => addChecklistItem(task.id, text)}
            onStatusChange={(itemId, status) =>
              updateChecklistStatus(task.id, itemId, status as ChecklistStatus)
            }
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
  onAddItem: (text: string) => void;
  onStatusChange: (itemId: string, status: ChecklistStatus) => void;
}

function TaskPin({
  task,
  selected,
  onSelect,
  onDragEnd,
  onDelete,
  onDragStart,
  onAddItem,
  onStatusChange,
}: PinProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  // Track if any movement occurred during this drag interaction
  const dragged = useRef(false);
  // const [isbeingHovered, setIsbeingHovered] = useState(false);

  const [newItemText, setNewItemText] = useState("");

  const handleAddItem = () => {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    onAddItem(trimmed);
    setNewItemText("");
  };

  const handleStop = () => {
    if (!pinRef.current) return;
    const nodeRect = pinRef.current.getBoundingClientRect();
    const parentRect = (
      pinRef.current.parentElement as HTMLElement
    ).getBoundingClientRect();

    // nodeRect.left/top already represent the pin's saved centre because the actual dot is translated inside.
    // Therefore we must NOT add half the width/height here, otherwise we shift ~10px on each click.
    const centerX = nodeRect.left - parentRect.left;
    const centerY = nodeRect.top - parentRect.top;
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
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-xl w-72 z-50"
            >
              <div className="flex items-center mb-2">
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                  Task
                </span>
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
              {task.checklist.map((item) => (
                <div className="flex justify-between items-center mb-2">
                  <div
                    key={item.id}
                    className="text-sm text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {item.text}
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) =>
                      onStatusChange(item.id, e.target.value as ChecklistStatus)
                    }
                  >
                    {Object.values(ChecklistStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
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
        </div>
      </div>
    </Draggable>
  );
}
