import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface EditableTextProps {
  text: string;
  onSave: (value: string) => void;
  className?: string; // applied to display span
}

/**
 * Click-to-edit text component.
 * Shows plain text; on click switches to input + check button.
 * Calls onSave with trimmed text when confirmed.
 */
export default function EditableText({
  text,
  onSave,
  className = "",
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);

  // Keep local value in sync if parent updates text prop
  useEffect(() => setValue(text), [text]);

  const save = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== text) onSave(trimmed);
    setEditing(false);
  };

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className={`cursor-pointer ${className}`}
        title="Click to edit"
      >
        {text}
      </span>
    );
  }

  return (
    <span
      className="flex items-center space-x-1 w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
        }}
        autoFocus
        className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 text-sm bg-white dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={save}
        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
        aria-label="Save"
        onClickCapture={(e) => e.stopPropagation()}
      >
        <Check size={16} />
      </button>
    </span>
  );
}
