export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Construction App</h1>
      <p className="text-lg mb-6">
        A simple tool to help you plan and manage your construction projects
      </p>
      <div className="flex gap-4">
        <a
          href="/plan"
          className="bg-blue-600 text-white rounded px-6 py-2 hover:bg-blue-700 transition-colors"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
