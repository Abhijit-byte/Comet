'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { checkAuth, register: setAuthUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [liveFeed, setLiveFeed] = useState<string[]>([]);
  const [sysTime, setSysTime] = useState('00:00:00');
  
  // New state for splash screen
  const [showIntro, setShowIntro] = useState(true);

  const messages = [
    "PKT_RECV: SECTOR_09_AUTH",
    "SCAN_INIT: NEO_REF_4491",
    "SIGNAL_STRENGTH: 98.4%",
    "COORD_SYNC: 44.02 // -12.99",
    "ENCRYPTION: ACTIVE",
    "NODE_HEARTBEAT: OK",
    "ORBITAL_V_MAX: 22,000 km/s",
    "DEEP_SCAN_READY",
    "UPLINK_STABLE_S09",
    "TRAJECTORY_CALC: NOMINAL",
    "BUFFER_FLUSH: COMPLETED"
  ];

  useEffect(() => {
    // Live feed simulation
    const feedInterval = setInterval(() => {
      setLiveFeed(prev => {
        const newMsg = `> ${messages[Math.floor(Math.random() * messages.length)]}`;
        const updated = [newMsg, ...prev];
        return updated.slice(0, 8);
      });
    }, 1200);

    // System time
    const timeInterval = setInterval(() => {
      const now = new Date();
      setSysTime(now.toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);

    // Mouse parallax
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
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await response.json();

      if (response.ok) {
        // Success animation
        const btn = document.querySelector('.cmd-btn') as HTMLButtonElement;
        if (btn) {
          btn.textContent = 'ACCESS_GRANTED';
          btn.style.background = 'rgb(6, 182, 212)';
          btn.style.color = '#000';
          btn.style.boxShadow = '0 0 30px rgb(6, 182, 212)';
        }

        const panel = document.querySelector('.auth-panel') as HTMLElement;
        if (panel) {
          panel.style.borderColor = 'rgb(6, 182, 212)';
        }

        // Update auth context immediately with data from response
        // This avoids race conditions with checkAuth() / cookie propagation
        if (data.user) {
          setAuthUser(data.user);
        } else {
          // Fallback if user data not in response
          await checkAuth();
        }

        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setError(data.error || 'Authentication failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Connection failed. Check network status.');
      setIsLoading(false);
    }
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

      {/* Scanline Overlay */}
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
      <div className="relative w-full h-full flex items-center justify-center z-10">
        
        {/* Intro Splash Screen */}
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
              Get Started
            </button>
          </div>
        ) : (
          /* Central Auth Panel */
          <main className="auth-panel relative w-full max-w-[480px] bg-[rgba(5,5,8,0.35)] border border-[rgba(6,182,212,0.3)] border-t-2 border-b-2 border-t-[#06b6d4] border-b-[#06b6d4] p-12 shadow-[0_0_40px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(0,0,0,0.2)] animate-[bootUp_0.8s_cubic-bezier(0.2,0.8,0.2,1)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(6,182,212,0.2),inset_0_0_30px_rgba(6,182,212,0.1)] hover:border-[rgba(6,182,212,0.8)]">
            
            {/* Corner Decorations */}
            <div className="absolute -top-0.5 -left-0.5 w-[10px] h-[10px] border-2 border-[#06b6d4] border-r-0 border-b-0 transition-all duration-300 hover:w-5 hover:h-5" />
            <div className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] border-2 border-[#06b6d4] border-l-0 border-t-0 transition-all duration-300 hover:w-5 hover:h-5" />

            <header className="mb-8 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <span className="border border-[#06b6d4] px-2 py-0.5 text-[10px] font-mono animate-[flicker_3s_infinite]">
                  SYSTEM_LOCKED
                </span>
                <span className="text-[10px] tracking-[0.3em] opacity-60">SECURE_CHANNEL_v09</span>
              </div>
              <h1 
                className="font-black text-5xl mb-1 tracking-tighter text-[#06b6d4]"
                style={{ 
                  fontFamily: 'Orbitron, sans-serif',
                  textShadow: '0 0 8px rgba(255, 184, 0, 0.8), 1px 1px 2px rgba(0, 0, 0, 0.9)'
                }}
              >
                COSMOSTRACE
              </h1>
              <div className="h-px bg-cyan-500/30 w-1/2 mx-auto my-3" />
              <p className="text-xs opacity-70 uppercase tracking-[0.2em]">Restricted Access Only</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] uppercase opacity-70 tracking-widest block pl-1">OPERATOR_ID</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cmd-input w-full bg-black/70 border border-[rgba(6,182,212,0.3)] text-white p-4 font-mono text-sm tracking-wide font-medium outline-none transition-all duration-300 focus:border-[#06b6d4] focus:shadow-[0_0_20px_rgba(6,182,212,0.5)] focus:bg-[rgba(6,182,212,0.05)]"
                  placeholder="IDENT_CODE"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase opacity-70 tracking-widest block pl-1">SECURITY_CIPHER</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cmd-input w-full bg-black/70 border border-[rgba(6,182,212,0.3)] text-white p-4 font-mono text-sm tracking-wide font-medium outline-none transition-all duration-300 focus:border-[#06b6d4] focus:shadow-[0_0_20px_rgba(6,182,212,0.5)] focus:bg-[rgba(6,182,212,0.05)]"
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

              <div className="flex justify-between items-center text-[9px] uppercase opacity-50 pt-2">
                <label className="flex items-center cursor-pointer hover:opacity-100 transition-opacity">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 accent-cyan-500"
                    disabled={isLoading}
                  /> 
                  KEEP_ALIVE
                </label>
                <a href="#" className="hover:text-cyan-400 hover:opacity-100 transition-colors">RESET_CIPHER</a>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="cmd-btn w-full bg-[#06b6d4] text-black p-4 font-black uppercase tracking-wide text-[13px] transition-all duration-300 hover:brightness-125 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:translate-y-[-1px] cursor-pointer border-none mt-4 disabled:opacity-50 disabled:cursor-wait"
                style={{
                  clipPath: 'polygon(0 0, 95% 0, 100% 25%, 100% 100%, 5% 100%, 0 75%)'
                }}
              >
                {isLoading ? (
                  <>VERIFYING_BIOMETRICS<span className="animate-pulse">...</span></>
                ) : (
                  'INITIATE_HANDSHAKE'
                )}
              </button>
            </form>

            <footer className="mt-8 pt-4 border-t border-cyan-500/10 text-center">
              <p className="text-[9px] opacity-60 uppercase tracking-widest mb-3">
                Need clearance?{' '}
                <Link href="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors underline">
                  REQUEST_AUTHORIZATION
                </Link>
              </p>
              <p className="text-[8px] opacity-40 uppercase tracking-widest">
                Unauthorized access is a federal offense under U.N. Space Treaty Article 7.
              </p>
            </footer>
          </main>
        )}

        {/* HUD Elements */}
        
        {/* Top Right Radar */}
        <div className="absolute top-10 right-10 w-[140px] h-[140px] border border-[rgba(6,182,212,0.3)] rounded-full bg-black/30 backdrop-blur-sm pointer-events-none z-15">
          <div 
            className="absolute w-1/2 h-1/2 top-0 left-1/2 origin-bottom-left rounded-tr-full animate-[sweep_4s_linear_infinite]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3))'
            }}
          />
          <div className="absolute w-1 h-1 bg-cyan-500 rounded-full blur-[1px] animate-[flicker_3s_infinite] top-[30%] left-[40%] shadow-[0_0_5px_#06b6d4]" />
          <div className="absolute w-1 h-1 bg-red-500 rounded-full blur-[1px] bottom-[40%] right-[30%]" />
        </div>

        {/* Bottom Right Telemetry */}
        <div className="absolute bottom-8 right-8 pointer-events-none">
          <div className="text-[10px] opacity-50 uppercase tracking-widest mb-2 text-right">LIVE_TELEMETRY_STREAM</div>
          <div className="w-[300px] h-[150px] overflow-hidden flex flex-col-reverse font-mono text-[10px] opacity-70 text-right">
            {liveFeed.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        </div>

        {/* Bottom Left Coords */}
        <div className="absolute bottom-8 left-8 pointer-events-none">
          <div className="text-[10px] opacity-60 tracking-widest border-l-2 border-cyan-500 pl-3 font-mono">
            <div className="mb-1">SYS_TIME: <span>{sysTime}</span></div>
            <div>LAT: 44.092 // LON: -12.441</div>
            <div>ALT: 408.2KM // V: 7.8KM/S</div>
          </div>
        </div>

        {/* Top Left Status */}
        <div className="absolute top-8 left-8 pointer-events-none">
          <div className="border border-cyan-500/30 p-2 bg-black/40 backdrop-blur-sm">
            <div className="text-[9px] opacity-60 uppercase tracking-widest">NETWORK_STATUS</div>
            <div className="text-xs text-green-500 font-bold tracking-wider">ONLINE // ENCRYPTED</div>
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
