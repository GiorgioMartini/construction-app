export const taskSchema = {
  title: "task schema",
  version: 0,
  description: "describes a task",
  type: "object",
  primaryKey: "id",
  properties: {
    id: { type: "string", maxLength: 100 },
    userId: { type: "string", maxLength: 100 },
    title: { type: "string" },
    xPct: { type: "number", minimum: 0, maximum: 100 },
    yPct: { type: "number", minimum: 0, maximum: 100 },
    checklist: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          status: {
            type: "string",
            enum: [
              "not-started",
              "in-progress",
              "blocked",
              "final-check",
              "done",
            ],
          },
        },
        required: ["id", "text", "status"],
      },
    },
    updatedAt: { type: "number" },
  },
  required: ["id", "userId", "title", "xPct", "yPct", "checklist", "updatedAt"],
};
