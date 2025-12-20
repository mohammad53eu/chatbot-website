// frontend/app/auth/Register.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting register with:', { email, username, password });

    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });
      const data = await res.json();
      console.log('Full response:', data);

      if (data.success) {
        const token = data.data.token;
        localStorage.setItem('token', token);
        console.log('Token saved:', token);
        navigate('/');
      } else {
        console.error('Register failed:', data.error?.message || 'Unknown error');
        alert(data.error?.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Network error – is backend running?');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#E5E5E5] justify-center items-center p-4">

      {/* Centered form card */}
      <div className="w-full max-w-xs p-6 rounded-lg bg-[#D9D9D9] shadow-md">
        <h2 className="text-lg font-bold text-[#333] mb-4 text-center">Register</h2>

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
            <label className="block text-sm font-bold text-[#333] mb-1">UserName</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            Register
          </button>
        </div>
      </div>
    </div>
  );
}