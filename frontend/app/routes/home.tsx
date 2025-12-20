// frontend/routes/home.tsx
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#2A2A2A] m-0 p-0 justify-center items-center">
      <div className="text-center p-10 rounded-lg bg-[#E5E5E5] shadow-md">
        <h1 className="text-2xl font-bold text-[#333]">Welcome to ChatBot</h1>
        <p className="text-base text-[#666] mb-6">
          Start by logging in or creating an account.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 text-sm font-bold text-white bg-[#2A0B5C] rounded hover:bg-[#3E0F7D] transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 text-sm font-bold text-[#2A0B5C] bg-[#F0EFEF] border border-[#999] rounded hover:bg-[#e0e0e0] transition-colors"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}