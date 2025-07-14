import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Plan from "./pages/Plan";
import Home from "./pages/Home";
import { useAppStore } from "./store";

export default function App() {
  const { user, isInitialized, initializeFromStorage } = useAppStore();

  // Initialize user session from localStorage on app startup
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  const hasUser = Boolean(user);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/plan"
          element={hasUser ? <Plan /> : <Navigate to="/login" replace />}
        />
        <Route path="/" element={<Home />} />
        <Route
          path="*"
          element={<Navigate to={hasUser ? "/plan" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
