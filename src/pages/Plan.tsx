import { useEffect, useRef, useState } from "react";
import planImg from "../assets/plan-image.webp";
import { useAppStore } from "../store";
import type { Task, ChecklistItem } from "../models/tasks";
import { ChecklistStatus } from "../models/tasks";
import { nanoid } from "nanoid";
import TaskPin from "../components/TaskPin";
import TaskSidebar from "../components/TaskSidebar";
import * as taskRepo from "../services";

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

    const loadTasks = async () => {
      try {
        const loaded = await taskRepo.getTasks(db, user);
        setTasks(loaded);
        console.log("[Plan] loaded", loaded.length, "tasks", loaded);
      } catch (error) {
        console.error("[Plan] Failed to load tasks:", error);
      }
    };

    loadTasks();
  }, [db, user]);

  // helpers
  const addTask = async (xPct: number, yPct: number) => {
    if (!db || !user) return;

    try {
      const newTask = await taskRepo.createTask(db, {
        userId: user,
        title: "New task",
        xPct,
        yPct,
        checklist: DEFAULT_CHECKLIST,
      });
      setTasks((prev) => [...prev, newTask]);
    } catch (error) {
      console.error("[addTask] Failed to create task:", error);
    }
  };

  const updateTaskPos = async (taskId: string, xPct: number, yPct: number) => {
    if (!db) return;

    try {
      await taskRepo.updateTaskPosition(db, taskId, xPct, yPct);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, xPct, yPct } : t))
      );
    } catch (error) {
      console.error("[updateTaskPos] Failed to update task position:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!db) return;

    try {
      await taskRepo.deleteTask(db, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (selected === taskId) setSelected(null);
    } catch (error) {
      console.error("[deleteTask] Failed to delete task:", error);
    }
  };

  // Add new checklist item to a task
  const addChecklistItem = async (taskId: string, text: string) => {
    if (!db) return;

    try {
      const newItem = await taskRepo.addChecklistItem(db, taskId, text);

      // Update local state so UI feels snappy
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === taskId
            ? { ...task, checklist: [...task.checklist, newItem] }
            : task
        )
      );
    } catch (error) {
      console.error("[addChecklistItem] Failed to add checklist item:", error);
    }
  };

  // Update status of an existing checklist item
  const updateChecklistStatus = async (
    taskId: string,
    itemId: string,
    status: ChecklistStatus
  ) => {
    if (!db) return;

    try {
      await taskRepo.updateChecklistStatus(db, taskId, itemId, status);

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
    } catch (error) {
      console.error("[updateChecklistStatus] Failed to update status:", error);
    }
  };

  // Update task title
  const updateTaskTitle = async (taskId: string, newTitle: string) => {
    if (!db) return;

    try {
      await taskRepo.updateTaskTitle(db, taskId, newTitle);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, title: newTitle } : t))
      );
    } catch (error) {
      console.error("[updateTaskTitle] Failed to update title:", error);
    }
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
        onTitleChange={updateTaskTitle}
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
            onTitleChange={(newTitle) => updateTaskTitle(task.id, newTitle)}
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
