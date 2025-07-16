import { useRef, useState } from "react";
import planImg from "../assets/plan-image.webp";
import TaskPin from "../components/TaskPin";
import TaskSidebar from "../components/TaskSidebar";
import { useTasks } from "../hooks/useTasks";

export default function Plan() {
  const {
    tasks,
    selected,
    setSelected,
    addTask,
    updateTaskPos,
    deleteTask,
    addChecklistItem,
    updateChecklistStatus,
    updateTaskTitle,
  } = useTasks();

  const [panelOpen, setPanelOpen] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isDraggingRef = useRef(false);

  const handleImgClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) return;
    if (!imgRef.current) return;
    if (e.shiftKey) return;
    const rect = imgRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    addTask(xPct, yPct);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Task sidebar */}
      <TaskSidebar
        open={panelOpen}
        onToggle={() => setPanelOpen((prev) => !prev)}
        tasks={tasks}
        onDeleteTask={deleteTask}
        onStatusChange={updateChecklistStatus}
        onTitleChange={updateTaskTitle}
        selectedTaskId={selected}
        onTaskSelect={(id) => setSelected((prev) => (prev === id ? null : id))}
      />
      <div className="relative inline-block">
        <img
          ref={imgRef}
          src={planImg}
          alt="Construction plan"
          className="select-none cursor-crosshair max-w-full opacity-50 relative z-0"
        />
        {tasks.map((task) => (
          <TaskPin
            key={`${task.id}-${task.xPct.toFixed(2)}-${task.yPct.toFixed(2)}`}
            task={task}
            selected={selected === task.id}
            onSelect={() =>
              setSelected((prev) => (prev === task.id ? null : task.id))
            }
            onDragStart={() => {
              isDraggingRef.current = true;
            }}
            onDragEnd={(x, y) => {
              updateTaskPos(task.id, x, y);
              setTimeout(() => (isDraggingRef.current = false), 0);
            }}
            onDelete={() => {
              deleteTask(task.id);
            }}
            onAddItem={(text) => addChecklistItem(task.id, text)}
            onStatusChange={(itemId, status) =>
              updateChecklistStatus(task.id, itemId, status)
            }
            onTitleChange={(newTitle) => updateTaskTitle(task.id, newTitle)}
          />
        ))}

        {/* Overlay */}
        <div
          className="absolute inset-0 cursor-crosshair z-10"
          onClick={handleImgClick}
        />
      </div>
    </div>
  );
}
