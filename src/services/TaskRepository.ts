import type { RxDatabase, RxDocument } from "rxdb";
import type { Task, ChecklistItem, ChecklistStatus } from "../models/tasks";
import { nanoid } from "nanoid";

/**
 * Task repository that handles all task-related database operations.
 * Provides a clean abstraction over RxDB for task management.
 */

/**
 * Get all tasks for a specific user
 */
export async function getTasks(
  db: RxDatabase,
  userId: string
): Promise<Task[]> {
  try {
    const docs = await db
      .tasks!.find({
        selector: { userId },
      })
      .exec();

    return docs.map((d: RxDocument<Task>) => d.toJSON() as unknown as Task);
  } catch (error) {
    console.error("[getTasks] Error loading tasks:", error);
    throw new Error("Failed to load tasks");
  }
}

/**
 * Create a new task
 */
export async function createTask(
  db: RxDatabase,
  taskData: Omit<Task, "id" | "updatedAt">
): Promise<Task> {
  try {
    const newTask: Task = {
      ...taskData,
      id: nanoid(),
      updatedAt: Date.now(),
    };

    await db.tasks!.insert(newTask);
    return newTask;
  } catch (error) {
    console.error("[createTask] Error creating task:", error);
    throw new Error("Failed to create task");
  }
}

/**
 * Update task position on the plan
 */
export async function updateTaskPosition(
  db: RxDatabase,
  taskId: string,
  xPct: number,
  yPct: number
): Promise<void> {
  try {
    const doc = await db.tasks!.findOne(taskId).exec();
    if (!doc) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    await doc.incrementalModify((task: Task) => ({
      ...task,
      xPct,
      yPct,
      updatedAt: Date.now(),
    }));
  } catch (error) {
    console.error("[updateTaskPosition] Error updating position:", error);
    throw new Error("Failed to update task position");
  }
}

/**
 * Update task title
 */
export async function updateTaskTitle(
  db: RxDatabase,
  taskId: string,
  newTitle: string
): Promise<void> {
  try {
    const doc = await db.tasks!.findOne(taskId).exec();
    if (!doc) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    await doc.incrementalModify((task: Task) => ({
      ...task,
      title: newTitle,
      updatedAt: Date.now(),
    }));
  } catch (error) {
    console.error("[updateTaskTitle] Error updating title:", error);
    throw new Error("Failed to update task title");
  }
}

/**
 * Delete a task
 */
export async function deleteTask(
  db: RxDatabase,
  taskId: string
): Promise<void> {
  try {
    const doc = await db.tasks!.findOne(taskId).exec();
    if (!doc) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    await doc.remove();
  } catch (error) {
    console.error("[deleteTask] Error deleting task:", error);
    throw new Error("Failed to delete task");
  }
}

/**
 * Add a new checklist item to a task
 */
export async function addChecklistItem(
  db: RxDatabase,
  taskId: string,
  text: string
): Promise<ChecklistItem> {
  try {
    const doc = await db.tasks!.findOne(taskId).exec();
    if (!doc) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const newItem: ChecklistItem = {
      id: nanoid(),
      text,
      status: "not-started" as ChecklistStatus,
    };

    await doc.incrementalModify((task: Task) => ({
      ...task,
      checklist: [...task.checklist, newItem],
      updatedAt: Date.now(),
    }));

    return newItem;
  } catch (error) {
    console.error("[addChecklistItem] Error adding item:", error);
    throw new Error("Failed to add checklist item");
  }
}

/**
 * Update the status of a checklist item
 */
export async function updateChecklistStatus(
  db: RxDatabase,
  taskId: string,
  itemId: string,
  status: ChecklistStatus
): Promise<void> {
  try {
    const doc = await db.tasks!.findOne(taskId).exec();
    if (!doc) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    await doc.incrementalModify((task: Task) => ({
      ...task,
      checklist: task.checklist.map((item) =>
        item.id === itemId ? { ...item, status } : item
      ),
      updatedAt: Date.now(),
    }));
  } catch (error) {
    console.error("[updateChecklistStatus] Error updating status:", error);
    throw new Error("Failed to update checklist item status");
  }
}
