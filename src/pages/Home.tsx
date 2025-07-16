import React from "react";
import { useNavigate } from "react-router-dom";

// Home page component for the Construction App
// This page welcomes the user and provides a button to get started
const Home: React.FC = () => {
  const navigate = useNavigate();

  // Handler for the Get Started button
  const handleGetStarted = () => {
    // Navigate to the login page
    navigate("/login");
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-center px-4">
      {/* Main heading */}
      <div className="w-screen">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
          Welcome to Construction App
        </h1>
        {/* Subtitle */}
        <p className="text-xl md:text-2xl mb-10 text-zinc-500 dark:text-zinc-300">
          A simple tool to help you plan and manage your construction projects
        </p>
        {/* Get Started button - always enabled, fully opaque, blue, with border for visibility */}
        <button
          onClick={handleGetStarted}
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-medium px-10 py-4 rounded-lg border-2 border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition opacity-100 cursor-pointer"
          style={{ pointerEvents: "auto" }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;
