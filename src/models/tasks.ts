// task.ts
export const ChecklistStatus = {
  NotStarted: "not-started",
  InProgress: "in-progress",
  Blocked: "blocked",
  FinalCheck: "final-check",
  Done: "done",
} as const;

export type ChecklistStatus =
  (typeof ChecklistStatus)[keyof typeof ChecklistStatus];
export interface ChecklistItem {
  id: string;
  text: string;
  status: ChecklistStatus;
}
export interface Task {
  id: string;
  userId: string; // partition key
  title: string;
  xPct: number; // 0-100, relative to plan width
  yPct: number; // 0-100, relative to plan height
  checklist: ChecklistItem[];
  updatedAt: number;
}
