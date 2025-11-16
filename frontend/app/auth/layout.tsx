import { Outlet, Link } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 border rounded-lg p-6 shadow-sm bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Auth</h1>
          <nav className="text-sm space-x-3">
            <Link to="/login" className="underline hover:text-amber-500">Login</Link>
            <Link to="/register" className="underline hover:text-amber-500">Register</Link>
          </nav>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
