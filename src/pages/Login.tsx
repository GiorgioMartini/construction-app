import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { initDB } from "../db";
import { useAppStore } from "../store";

export default function Login() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const username = name.trim();
    if (!username) return;

    try {
      localStorage.setItem("username", username);

      const db = await initDB(`construction_${username}`);

      // ensure the user doc exists (id = username)
      await db.users!.upsert({ id: username, createdAt: Date.now() });

      setUser(username, db);
      // Log the user and db after setting
      console.log("[Login] User set in Zustand:", username);
      console.log("[Login] DB instance set in Zustand:", db);
      navigate("/plan");
    } catch (err) {
      // Log any error during login
      console.error("[Login] Error during login:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center mt-20 gap-4"
    >
      <input
        className="border rounded p-2 w-64"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        disabled={!name.trim()}
      >
        Login
      </button>
    </form>
  );
}
