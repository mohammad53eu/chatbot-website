// frontend/app/auth/Login.tsx
import { useState, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.js';

const InputField = memo(({ 
  label, 
  icon, 
  type, 
  value, 
  onChange, 
  disabled, 
  placeholder,
  focusColor = 'purple-400'
}: any) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
        className="w-full p-4 pl-12 pr-12 text-lg bg-white/70 dark:bg-slate-900/70 hover:bg-white/90 dark:hover:bg-slate-800/90 backdrop-blur-sm border-2 border-white/50 dark:border-slate-700/50 rounded-2xl shadow-lg outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 peer"
        placeholder={placeholder}
      />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-500 peer-focus:text-purple-600 transition-colors flex items-center justify-center">
        {icon}
      </div>
    </div>
  </div>
));

export default memo(function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleInputChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const icons = useMemo(() => ({
    email: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.27 5.05c.4.28.94.28 1.34 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    password: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  }), []);

  const particles = useMemo(() => [
    { top: '20%', left: '20%', from: 'purple-300', to: 'purple-500', delay: '0s' },
    { top: '40%', right: '20%', from: 'indigo-300', to: 'indigo-500', delay: '1000ms' },
    { bottom: '20%', left: '25%', from: 'pink-300', to: 'pink-500', delay: '2000ms' }
  ], []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { email, password } = formData;
    
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        navigate('/chat');
      } else {
        alert(data.error?.message || 'Login failed');
      }
    } catch (err) {
      alert('Network error – is backend running?');
    } finally {
      setIsLoading(false);
    }
  }, [formData, navigate]);

  const isFormValid = formData.email && formData.password;

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 overflow-hidden relative ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
          <button 
            onClick={toggleTheme} 
            className="fixed top-6 right-6 p-3 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 z-50"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
      
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
            style={{
              top: particle.top,
              left: particle.left,
              right: particle.right,
              bottom: particle.bottom,
              background: `linear-gradient(to right, ${particle.from}/${isDark ? '30' : '50'}, transparent, ${particle.to}/${isDark ? '30' : '50'})`,
              animationDelay: particle.delay
            }}
          />
        ))}
      </div>

     
      <div className="relative w-full max-w-md mx-auto">
        
        <div className="absolute -top-6 left-6 w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl -z-10">
          <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20 hover:shadow-3xl transition-all duration-500 relative overflow-hidden group">
          
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-transparent to-indigo-600/20 dark:from-purple-400/30 dark:to-indigo-500/30 -m-1 pointer-events-none group-hover:scale-105 transition-transform duration-500" />
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-slate-100 dark:to-slate-200 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-slate-300 text-lg">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Email Address"
                icon={icons.email}
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                disabled={isLoading}
                placeholder="Enter your email"
              />
              <InputField
                label="Password"
                icon={icons.password}
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                disabled={isLoading}
                placeholder="Enter your password"
              />

              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full p-5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-lg font-semibold rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg flex items-center justify-center gap-2 group/btn"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-6 h-6 group-hover/btn:opacity-75" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/30 dark:border-slate-700/50 text-center">
              <p className="text-sm text-gray-600 dark:text-slate-300">
                Don't have an account?{' '}
                <button 
                  onClick={() => navigate('/register')} 
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-500 font-semibold hover:underline transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
