// frontend/app/auth/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import DarkModeToggle from '../components/DarkModeToggle';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting login with:', { email, password });

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      console.log('Full response:', data);

      if (data.success) {
        const token = data.data.token;
        localStorage.setItem('token', token);
        console.log(' Token saved:', token);
        navigate('/chat');
      } else {
        console.error(' Login failed:', data.error?.message || 'Unknown error');
        alert(data.error?.message || 'Login failed');
      }
    } catch (err) {
      console.error(' Network error:', err);
      alert('Network error – is backend running?');
    }
  };

  return (
  <div className="flex min-h-screen bg-[#E5E5E5]  justify-center items-center p-4">
    
    
    {/* Centered form card */}
    <div className="w-full max-w-xs p-6 rounded-lg bg-[#D9D9D9] shadow-md">
      <h2 className="text-lg font-bold text-[#333] mb-4 text-center">Login</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-[#333] mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 text-sm border border-[#999] rounded bg-white outline-none text-[#2A0B5C]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#333] mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 text-sm border border-[#999] rounded bg-white outline-none text-[#2A0B5C]"
          />
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full mt-4 p-3 text-sm font-bold text-white bg-[#2A0B5C] rounded hover:bg-[#3E0F7D] transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  </div>
);
}