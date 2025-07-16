import { useState, useRef, useCallback, useEffect } from "react";
import { useClickOutside } from "../hooks/useClickOutside";

interface EditableTextProps {
  text: string;
  onSave: (value: string) => void;
  className?: string; // applied to display span
}

/**
 * Click-to-edit text component.
 * Calls onSave with trimmed text when confirmed.
 */
export default function EditableText({
  text,
  onSave,
  className = "",
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  // Ref for the wrapper span (for click-outside detection)
  const wrapperRef = useRef<HTMLSpanElement>(null);
  // Ref for the input (for focus)
  const inputRef = useRef<HTMLInputElement>(null);

  // Save handler: trims and saves if changed
  const save = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== text) onSave(trimmed);
    setEditing(false);
  }, [value, text, onSave]);

  // Cancel editing, reset value
  const cancel = useCallback(() => {
    setValue(text);
    setEditing(false);
  }, [text]);

  // Use custom hook for click-outside detection on the wrapper
  useClickOutside(wrapperRef, () => {
    if (editing) save();
  });

  // Keep local value in sync if parent updates text prop
  useEffect(() => setValue(text), [text]);

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
      ref={wrapperRef}
      className="flex items-center space-x-1 w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") cancel();
        }}
        autoFocus
        className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 text-sm bg-white dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      />
      {/* Save button */}
      <button
        type="button"
        onClick={save}
        className="ml-1 px-2 py-0.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
        aria-label="Save"
        tabIndex={0}
      >
        ✓
      </button>
      {/* Cancel button */}
      <button
        type="button"
        onClick={cancel}
        className="ml-1 px-2 py-0.5 text-xs rounded bg-gray-300 text-gray-700 hover:bg-gray-40 mr-2"
        aria-label="Cancel"
        tabIndex={0}
      >
        ×
      </button>
    </span>
  );
}
