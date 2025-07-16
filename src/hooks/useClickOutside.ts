import { useEffect } from "react";

/**
 * useClickOutside
 * Calls the handler when a click occurs outside the referenced element.
 * @param ref - React ref to the element (can be null)
 * @param handler - Function to call on outside click
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: (event: MouseEvent) => void
) {
  useEffect(() => {
    function listener(event: MouseEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    }
    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
}
