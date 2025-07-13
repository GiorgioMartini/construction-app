import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Plan from "./pages/Plan";
import Home from "./pages/Home";

export default function App() {
  // const hasUser = Boolean(localStorage.getItem("username"));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/" element={<Home />} />
        {/* <Route
          path="*"
          element={<Navigate to={hasUser ? "/plan" : "/login"} replace />}
        /> */}
      </Routes>
    </BrowserRouter>
  );
}
