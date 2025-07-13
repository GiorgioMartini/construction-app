// src/models/userSchema.ts
export const userSchema = {
  title: "user schema",
  version: 0,
  description: "describes a user",
  type: "object",
  primaryKey: "id",
  properties: {
    id: { type: "string", maxLength: 100 },
    createdAt: { type: "number" },
  },
  required: ["id", "createdAt"],
};
