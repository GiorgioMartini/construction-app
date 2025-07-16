import { useState, useEffect, useCallback } from "react";
import * as taskRepo from "../services";
import { useAppStore } from "../store";
import type { Task, ChecklistItem } from "../models/tasks";
import { ChecklistStatus } from "../models/tasks";
import { nanoid } from "nanoid";

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: nanoid(),
    text: "Measure area",
    status: ChecklistStatus.NotStarted,
  },
];

export function useTasks() {
  const user = useAppStore((s) => s.user);
  const db = useAppStore((s) => s.db);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // Load tasks on mount or when db/user changes
  useEffect(() => {
    if (!db || !user) return;
    setLoading(true);
    taskRepo
      .getTasks(db, user)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [db, user]);

  // Add a new task at a position
  const addTask = useCallback(
    async (xPct: number, yPct: number) => {
      if (!db || !user) return;
      const newTask = await taskRepo.createTask(db, {
        userId: user,
        title: "New task",
        xPct,
        yPct,
        checklist: DEFAULT_CHECKLIST,
      });
      setTasks((prev) => [...prev, newTask]);
    },
    [db, user]
  );

  // Update task position
  const updateTaskPos = useCallback(
    async (taskId: string, xPct: number, yPct: number) => {
      if (!db) return;
      await taskRepo.updateTaskPosition(db, taskId, xPct, yPct);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, xPct, yPct } : t))
      );
    },
    [db]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!db) return;
      await taskRepo.deleteTask(db, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (selected === taskId) setSelected(null);
    },
    [db, selected]
  );

  // Add checklist item
  const addChecklistItem = useCallback(
    async (taskId: string, text: string) => {
      if (!db) return;
      const newItem = await taskRepo.addChecklistItem(db, taskId, text);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, checklist: [...task.checklist, newItem] }
            : task
        )
      );
    },
    [db]
  );

  // Update checklist item status
  const updateChecklistStatus = useCallback(
    async (taskId: string, itemId: string, status: ChecklistStatus) => {
      if (!db) return;
      await taskRepo.updateChecklistStatus(db, taskId, itemId, status);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                checklist: task.checklist.map((item) =>
                  item.id === itemId ? { ...item, status } : item
                ),
              }
            : task
        )
      );
    },
    [db]
  );

  // Update task title
  const updateTaskTitle = useCallback(
    async (taskId: string, newTitle: string) => {
      if (!db) return;
      await taskRepo.updateTaskTitle(db, taskId, newTitle);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, title: newTitle } : t))
      );
    },
    [db]
  );

  return {
    tasks,
    loading,
    selected,
    setSelected,
    addTask,
    updateTaskPos,
    deleteTask,
    addChecklistItem,
    updateChecklistStatus,
    updateTaskTitle,
  };
}
