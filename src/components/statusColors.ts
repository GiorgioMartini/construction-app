import { ChecklistStatus } from "../models/tasks";

/**
 * Returns a Tailwind background color class for a given checklist status.
 * Use on <select> to color by status.
 */
export function getStatusBgClass(status: ChecklistStatus): string {
  switch (status) {
    case ChecklistStatus.Blocked:
      return "bg-red-100 dark:bg-red-800";
    case ChecklistStatus.Done:
      return "bg-green-100 dark:bg-green-800";
    case ChecklistStatus.InProgress:
      return "bg-yellow-100 dark:bg-yellow-800";
    case ChecklistStatus.NotStarted:
      return "bg-gray-100 dark:bg-gray-700";
    case ChecklistStatus.FinalCheck:
      return "bg-blue-100 dark:bg-blue-800";
    default:
      return "bg-white dark:bg-gray-800";
  }
}
