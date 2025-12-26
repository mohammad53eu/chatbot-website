// frontend/routes/home.tsx
import { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default memo(function Home() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleLogin = useCallback(() => navigate('/login'), [navigate]);
  const handleRegister = useCallback(() => navigate('/register'), [navigate]);

  const particles = useMemo(() => [
    { top: '20%', left: '20%', from: 'purple-400', to: 'indigo-500', delay: '0s' },
    { top: '40%', right: '20%', from: 'emerald-400', to: 'teal-500', delay: '2s' },
    { bottom: '20%', left: '25%', from: 'pink-400', to: 'rose-500', delay: '4s' }
  ], []);

  return (
    <div className={`min-h-screen flex items-center justify-center p-8 relative overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme} 
        className="fixed top-6 right-6 p-3 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 z-50"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Animated Glass Particles - Optimized */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
            style={{
              top: particle.top,
              right: particle.right,
              bottom: particle.bottom,
              background: `linear-gradient(to right, ${particle.from}/30, transparent, ${particle.to}/30)`,
              animationDelay: particle.delay
            }}
          />
        ))}
      </div>

      {/* Hero Card - Full Glassmorphism */}
      <div className="relative w-full max-w-2xl mx-auto group">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl p-12 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
          {/* Animated Border Glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-transparent to-indigo-600/20 dark:from-purple-400/30 dark:to-indigo-500/30 -m-1 pointer-events-none group-hover:scale-105 transition-transform duration-500" />
          
          <div className="relative z-10 text-center">
            {/* Hero Icon - Animated */}
            <div className="w-28 h-28 bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-8 hover:scale-110 transition-all duration-300 group-hover:rotate-12">
              <svg className="w-16 h-16 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 dark:from-slate-100 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6 leading-tight">
              AI ChatBot
            </h1>

            <p className="text-xl text-gray-600 dark:text-slate-300 mb-12 max-w-md mx-auto leading-relaxed opacity-90">
              Multiple Models And Providers
              <span className="font-semibold text-purple-600 dark:text-purple-400 block mt-2 text-2xl">Welcome</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <button
                onClick={handleLogin}
                className="flex-1 min-w-[140px] p-5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-lg font-semibold rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group/card"
              >
                <svg className="w-6 h-6 group-hover/card:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </button>

              <button
                onClick={handleRegister}
                className="flex-1 min-w-[140px] p-5 backdrop-blur-xl bg-white/80 dark:bg-slate-200/80 hover:bg-white dark:hover:bg-slate-100 border-2 border-white/50 dark:border-slate-600 hover:border-purple-200 dark:hover:border-purple-400 text-gray-900 dark:text-slate-900 text-lg font-semibold rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
