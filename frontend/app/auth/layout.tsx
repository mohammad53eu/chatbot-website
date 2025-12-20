// frontend/app/auth/layout.tsx
// frontend/app/auth/layout.tsx
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#E5E5E5] flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
}
/*import { Outlet, Link, useLocation } from "react-router-dom";

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#E5E5E5] p-2">
      <div className="flex justify-end pt-2">
        {location.pathname === '/login' ? (
          <Link
            to="/register"
            className="px-3 py-1 text-sm font-bold text-[#2A0B5C] bg-[#F0EFEF] border border-[#999] rounded hover:bg-[#e0e0e0]"
          >
            Register
          </Link>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1 text-sm font-bold text-[#2A0B5C] bg-[#F0EFEF] border border-[#999] rounded hover:bg-[#e0e0e0]"
          >
            Login
          </Link>
        )}
      </div>

      <div className="flex justify-center mt-12">
        <div className="w-full max-w-sm rounded-lg bg-[#D9D9D9] shadow-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}*/