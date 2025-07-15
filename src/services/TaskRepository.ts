import type { RxDatabase, RxDocument } from "rxdb";
import type { Task, ChecklistItem, ChecklistStatus } from "../models/tasks";
import { nanoid } from "nanoid";

/**
 * Repository class that handles all task-related database operations.
 * Provides a clean abstraction over RxDB for task management.
 */
export class TaskRepository {
  private db: RxDatabase;

  constructor(db: RxDatabase) {
    this.db = db;
  }

  /**
   * Get all tasks for a specific user
   */
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const docs = await this.db
        .tasks!.find({
          selector: { userId },
        })
        .exec();

      return docs.map((d: RxDocument<Task>) => d.toJSON() as unknown as Task);
    } catch (error) {
      console.error("[TaskRepository.getTasks] Error loading tasks:", error);
      throw new Error("Failed to load tasks");
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: Omit<Task, "id" | "updatedAt">): Promise<Task> {
    try {
      const newTask: Task = {
        ...taskData,
        id: nanoid(),
        updatedAt: Date.now(),
      };

      await this.db.tasks!.insert(newTask);
      return newTask;
    } catch (error) {
      console.error("[TaskRepository.createTask] Error creating task:", error);
      throw new Error("Failed to create task");
    }
  }

  /**
   * Update task position on the plan
   */
  async updateTaskPosition(
    taskId: string,
    xPct: number,
    yPct: number
  ): Promise<void> {
    try {
      const doc = await this.db.tasks!.findOne(taskId).exec();
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
      console.error(
        "[TaskRepository.updateTaskPosition] Error updating position:",
        error
      );
      throw new Error("Failed to update task position");
    }
  }

  /**
   * Update task title
   */
  async updateTaskTitle(taskId: string, newTitle: string): Promise<void> {
    try {
      const doc = await this.db.tasks!.findOne(taskId).exec();
      if (!doc) {
        throw new Error(`Task with id ${taskId} not found`);
      }

      await doc.incrementalModify((task: Task) => ({
        ...task,
        title: newTitle,
        updatedAt: Date.now(),
      }));
    } catch (error) {
      console.error(
        "[TaskRepository.updateTaskTitle] Error updating title:",
        error
      );
      throw new Error("Failed to update task title");
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      const doc = await this.db.tasks!.findOne(taskId).exec();
      if (!doc) {
        throw new Error(`Task with id ${taskId} not found`);
      }

      await doc.remove();
    } catch (error) {
      console.error("[TaskRepository.deleteTask] Error deleting task:", error);
      throw new Error("Failed to delete task");
    }
  }

  /**
   * Add a new checklist item to a task
   */
  async addChecklistItem(taskId: string, text: string): Promise<ChecklistItem> {
    try {
      const doc = await this.db.tasks!.findOne(taskId).exec();
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
      console.error(
        "[TaskRepository.addChecklistItem] Error adding item:",
        error
      );
      throw new Error("Failed to add checklist item");
    }
  }

  /**
   * Update the status of a checklist item
   */
  async updateChecklistStatus(
    taskId: string,
    itemId: string,
    status: ChecklistStatus
  ): Promise<void> {
    try {
      const doc = await this.db.tasks!.findOne(taskId).exec();
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
      console.error(
        "[TaskRepository.updateChecklistStatus] Error updating status:",
        error
      );
      throw new Error("Failed to update checklist item status");
    }
  }
}
