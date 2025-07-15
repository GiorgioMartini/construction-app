import { useEffect, useRef, useState } from "react";
import planImg from "../assets/plan-image.webp";
import { useAppStore } from "../store";
import type { Task, ChecklistItem } from "../models/tasks";
import type { RxDocument } from "rxdb";
import { ChecklistStatus } from "../models/tasks";
import { nanoid } from "nanoid";
import TaskPin from "../components/TaskPin";
import TaskSidebar from "../components/TaskSidebar";

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: nanoid(), text: "Measure area", status: ChecklistStatus.FinalCheck },
];

export default function Plan() {
  const user = useAppStore((s) => s.user);
  const db = useAppStore((s) => s.db);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // If dragging, we can ignore click events that would create a new one
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
      {/* Task sidebar */}
      <TaskSidebar
        open={panelOpen}
        onToggle={() => setPanelOpen((prev) => !prev)}
        tasks={tasks}
        onDeleteTask={deleteTask}
        onStatusChange={updateChecklistStatus}
        selectedTaskId={selected}
        onTaskSelect={(id) => setSelected((prev) => (prev === id ? null : id))}
      />
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
