'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const RegisterPage = () => {
  const router = useRouter();
  const { register: setAuthUser } = useAuth();
  
  // Intro state
  const [showIntro, setShowIntro] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [liveFeed, setLiveFeed] = useState<string[]>([]);
  const [sysTime, setSysTime] = useState('00:00:00');

  const messages = [
    "NEW_OPERATOR_REQUEST",
    "BIOMETRIC_SCAN_INIT",
    "CLEARANCE_LEVEL_CHECK",
    "NEURAL_PATTERN_VERIFY",
    "ENCRYPTION_ACTIVE",
    "IDENT_MATRIX_BUILD",
    "QUANTUM_KEY_GEN",
    "AUTH_SEQUENCE_READY",
    "SECURE_CHANNEL_OPEN",
    "REGISTRATION_STANDBY"
  ];
  
  // Update theme colors to match login (Cyan)
  const themeColor = '#06b6d4'; 
  const themeColorRgba = '6,182,212';

  useEffect(() => {
    const feedInterval = setInterval(() => {
      setLiveFeed(prev => {
        const newMsg = `> ${messages[Math.floor(Math.random() * messages.length)]}`;
        const updated = [newMsg, ...prev];
        return updated.slice(0, 8);
      });
    }, 1200);

    const timeInterval = setInterval(() => {
      const now = new Date();
      setSysTime(now.toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);

    const handleMouseMove = (e: MouseEvent) => {
      const panel = document.querySelector('.auth-panel') as HTMLElement;
      if (panel) {
        const x = (window.innerWidth / 2 - e.pageX) / 80;
        const y = (window.innerHeight / 2 - e.pageY) / 80;
        panel.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(feedInterval);
      clearInterval(timeInterval);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('CIPHER_MISMATCH: Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('CIPHER_TOO_WEAK: Minimum 8 characters required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update auth context with new user data
        if (data.user) {
          setAuthUser(data.user);
        }

        const btn = document.querySelector('.cmd-btn') as HTMLButtonElement;
        if (btn) {
          btn.textContent = 'OPERATOR_REGISTERED';
          btn.style.background = '#00ffaa';
          btn.style.color = '#000';
          btn.style.boxShadow = '0 0 30px #00ffaa';
        }

        const panel = document.querySelector('.auth-panel') as HTMLElement;
        if (panel) {
          panel.style.borderColor = '#00ffaa';
        }

        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setError(data.error || 'Registration failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('SYSTEM_ERROR: Connection to command center failed');
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050505]">
      {/* Video Background */}
      <video 
        className="fixed inset-0 w-full h-full object-cover opacity-70"
        autoPlay 
        muted 
        loop 
        playsInline
        style={{ filter: 'contrast(1.1) brightness(0.8)' }}
      >
        <source src="/media/15562120-hd_1920_1080_24fps.mp4" type="video/mp4" />
      </video>

      <div 
        className="fixed inset-0 pointer-events-none opacity-60"
        style={{
          background: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
                      linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))`,
          backgroundSize: '100% 3px, 3px 100%',
          zIndex: 1
        }}
      />

      {/* Main Container */}
      <div className="relative w-full h-full flex items-center justify-center z-10 py-8 overflow-y-auto">
        
        {showIntro ? (
          <div className="flex flex-col items-center justify-center z-20">
             <h1 
              className="font-black text-6xl md:text-8xl mb-8 tracking-tighter text-[#06b6d4] opacity-0 animate-[fadeUp_1.2s_ease-out_forwards]"
              style={{ 
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 0 20px rgba(6, 182, 212, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.9)'
              }}
            >
              COSMOSTRACE
            </h1>
            
            <button
              onClick={() => setShowIntro(false)}
              className="px-8 py-3 bg-[rgba(6,182,212,0.1)] border border-[#06b6d4] text-[#06b6d4] font-mono text-lg tracking-[0.2em] uppercase hover:bg-[#06b6d4] hover:text-black transition-all duration-300 opacity-0 animate-[fadeUp_1.2s_ease-out_0.5s_forwards]"
              style={{
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)'
              }}
            >
              Initialize Registration
            </button>
          </div>
        ) : (
        <main className="auth-panel relative w-full max-w-[520px] bg-[rgba(5,5,8,0.35)] border border-[rgba(255,184,0,0.3)] border-t-2 border-b-2 border-t-[#ffb800] border-b-[#ffb800] p-12 my-8 shadow-[0_0_40px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(0,0,0,0.2)] animate-[bootUp_0.8s_cubic-bezier(0.2,0.8,0.2,1)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(255,157,0,0.2),inset_0_0_30px_rgba(255,157,0,0.1)] hover:border-[rgba(255,157,0,0.8)]">
          {/* ... existing main content ... */}
          
          <div className="absolute -top-0.5 -left-0.5 w-[10px] h-[10px] border-2 border-[#06b6d4] border-r-0 border-b-0 transition-all duration-300 hover:w-5 hover:h-5" />
          <div className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] border-2 border-[#06b6d4] border-l-0 border-t-0 transition-all duration-300 hover:w-5 hover:h-5" />


          <header className="mb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="border border-[#06b6d4] px-2 py-0.5 text-[10px] font-mono animate-[flicker_3s_infinite]">
                NEW_OPERATOR
              </span>
              <span className="text-[10px] tracking-[0.3em] opacity-60">CLEARANCE_REQUEST</span>
            </div>
            <h1 
              className="font-black text-5xl mb-1 tracking-tighter text-[#06b6d4]"
              style={{ 
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 0 8px rgba(6, 182, 212, 0.8), 1px 1px 2px rgba(0, 0, 0, 0.9)'
              }}
            >
              COSMOSTRACE
            </h1>
            <div className="h-px bg-cyan-500/30 w-1/2 mx-auto my-3" />
            <p className="text-xs opacity-70 uppercase tracking-[0.2em]">Operator Registration Protocol</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] uppercase opacity-70 tracking-widest block pl-1">FIRST_NAME</label>
                <input 
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="cmd-input w-full bg-black/70 border border-[rgba(6,182,212,0.3)] text-white p-3 font-mono text-sm tracking-wide font-medium outline-none transition-all duration-300 focus:border-[#06b6d4] focus:shadow-[0_0_20px_rgba(6,182,212,0.5)] focus:bg-[rgba(6,182,212,0.05)]"
                  placeholder="JOHN"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase opacity-70 tracking-widest block pl-1">LAST_NAME</label>
                <input 
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="cmd-input w-full bg-black/70 border border-[rgba(6,182,212,0.3)] text-white p-3 font-mono text-sm tracking-wide font-medium outline-none transition-all duration-300 focus:border-[#06b6d4] focus:shadow-[0_0_20px_rgba(6,182,212,0.5)] focus:bg-[rgba(6,182,212,0.05)]"
                  placeholder="DOE"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase opacity-70 tracking-widest block pl-1">OPERATOR_CODE</label>
              <input 
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="cmd-input w-full bg-black/70 border border-[rgba(6,182,212,0.3)] text-white p-3 font-mono text-sm tracking-wide font-medium outline-none transition-all duration-300 focus:border-[#06b6d4] focus:shadow-[0_0_20px_rgba(6,182,212,0.5)] focus:bg-[rgba(6,182,212,0.05)]"
                placeholder="UNIQUE_CALLSIGN"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase opacity-70 tracking-widest block pl-1">COMM_CHANNEL</label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="cmd-input w-full bg-black/70 border border-[rgba(6,182,212,0.3)] text-white p-3 font-mono text-sm tracking-wide font-medium outline-none transition-all duration-300 focus:border-[#06b6d4] focus:shadow-[0_0_20px_rgba(6,182,212,0.5)] focus:bg-[rgba(6,182,212,0.05)]"
                placeholder="operator@cosmic.watch"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase opacity-70 tracking-widest block pl-1">SECURITY_CIPHER</label>
              <input 
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="cmd-input w-full bg-black/70 border border-[rgba(6,182,212,0.3)] text-white p-3 font-mono text-sm tracking-wide font-medium outline-none transition-all duration-300 focus:border-[#06b6d4] focus:shadow-[0_0_20px_rgba(6,182,212,0.5)] focus:bg-[rgba(6,182,212,0.05)]"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase opacity-70 tracking-widest block pl-1">CONFIRM_CIPHER</label>
              <input 
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="cmd-input w-full bg-black/70 border border-[rgba(6,182,212,0.3)] text-white p-3 font-mono text-sm tracking-wide font-medium outline-none transition-all duration-300 focus:border-[#06b6d4] focus:shadow-[0_0_20px_rgba(6,182,212,0.5)] focus:bg-[rgba(6,182,212,0.05)]"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-500 text-xs font-mono border border-red-500/30 bg-red-500/10 p-2 animate-pulse">
                ⚠ {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="cmd-btn w-full bg-[#06b6d4] text-black p-4 font-black uppercase tracking-wide text-[13px] transition-all duration-300 hover:brightness-125 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:translate-y-[-1px] cursor-pointer border-none mt-4 disabled:opacity-50 disabled:cursor-wait"
              style={{
                clipPath: 'polygon(0 0, 95% 0, 100% 25%, 100% 100%, 5% 100%, 0 75%)'
              }}
            >
              {isLoading ? (
                <>PROCESSING_CLEARANCE<span className="animate-pulse">...</span></>
              ) : (
                'REQUEST_CLEARANCE'
              )}
            </button>
          </form>

          <footer className="mt-6 pt-4 border-t border-cyan-500/10 text-center">
            <p className="text-[9px] opacity-60 uppercase tracking-widest mb-3">
              Already authorized?{' '}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors underline">
                INITIATE_LOGIN
              </Link>
            </p>
            <p className="text-[8px] opacity-40 uppercase tracking-widest">
              All new operators subject to clearance verification.
            </p>
          </footer>
        </main>
        )}

        {/* HUD Elements */}
        <div className="absolute top-10 right-10 w-[140px] h-[140px] border border-[rgba(6,182,212,0.3)] rounded-full bg-black/30 backdrop-blur-sm pointer-events-none z-15">
          <div 
            className="absolute w-1/2 h-1/2 top-0 left-1/2 origin-bottom-left rounded-tr-full animate-[sweep_4s_linear_infinite]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3))'
            }}
          />
          <div className="absolute w-1 h-1 bg-green-500 rounded-full blur-[1px] animate-[flicker_3s_infinite] top-[30%] left-[40%] shadow-[0_0_5px_#00ff00]" />
          <div className="absolute w-1 h-1 bg-cyan-500 rounded-full blur-[1px] bottom-[40%] right-[30%]" />
        </div>

        <div className="absolute bottom-8 right-8 pointer-events-none">
          <div className="text-[10px] opacity-50 uppercase tracking-widest mb-2 text-right">REGISTRATION_STREAM</div>
          <div className="w-[300px] h-[150px] overflow-hidden flex flex-col-reverse font-mono text-[10px] opacity-70 text-right">
            {liveFeed.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-8 pointer-events-none">
          <div className="text-[10px] opacity-60 tracking-widest border-l-2 border-cyan-500 pl-3 font-mono">
            <div className="mb-1">SYS_TIME: <span>{sysTime}</span></div>
            <div>LAT: 44.092 // LON: -12.441</div>
            <div>CLEARANCE: PENDING</div>
          </div>
        </div>

        <div className="absolute top-8 left-8 pointer-events-none">
          <div className="border border-cyan-500/30 p-2 bg-black/40 backdrop-blur-sm">
            <div className="text-[9px] opacity-60 uppercase tracking-widest">REGISTRATION_STATUS</div>
            <div className="text-xs text-green-500 font-bold tracking-wider">ACCEPTING // SECURE</div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes bootUp {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
          52% { opacity: 0.9; }
          54% { opacity: 0.4; }
        }

        .auth-panel:hover::before,
        .auth-panel:hover::after {
          width: 20px !important;
          height: 20px !important;
        }
      `}</style>
    </div>
  );
}

export default RegisterPage;
