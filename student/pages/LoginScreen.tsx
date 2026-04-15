import React, { useState } from 'react';
import { ClockIcon, UserCircleIcon } from '../../components/icons';
import { BRAND_LOGO_URL, BRAND_NAME } from '../constants/branding';

type LoginScreenProps = {
    onLogin: (studentName: string, rollNumber: string, organizationCode: string) => void;
    onDemoStart: () => void;
    isGateOpening: boolean;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onDemoStart, isGateOpening }) => {
    const [studentName, setStudentName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [organizationCode, setOrganizationCode] = useState('');
    const [focused, setFocused] = useState<string | null>(null);

    const isReady = studentName.trim().length >= 1 && rollNumber.trim().length >= 1 && organizationCode.trim().length >= 3;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isReady) return;
        onLogin(studentName.trim(), rollNumber.trim(), organizationCode.trim().toLowerCase());
    };

    return (
        <div className="login-page">
            <div className="login-topbar-wrap">
                <div className="login-topbar">
                    <div className="login-topbar-brand">
                        <img src={BRAND_LOGO_URL} alt={`${BRAND_NAME} logo`} className="h-11 w-auto" />
                        <div>
                            <div className="text-sm font-semibold text-slate-900 sm:text-base">Made by brand {BRAND_NAME}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blob bg-blob-2" style={{ bottom: '-10%', right: '-8%' }} />
            <div className="bg-blob bg-blob-3" style={{ top: '40%', right: '20%' }} />
            <div className="dot-pattern" />

            {[
                { top: '12%', left: '15%', delay: '0s', duration: '4s', color: '#818cf8', size: '14px' },
                { top: '25%', right: '12%', delay: '1.5s', duration: '3.5s', color: '#a78bfa', size: '12px' },
                { bottom: '20%', left: '20%', delay: '2.5s', duration: '5s', color: '#60a5fa', size: '16px' },
                { top: '60%', right: '25%', delay: '0.8s', duration: '4.5s', color: '#f472b6', size: '10px' },
                { top: '8%', left: '50%', delay: '3s', duration: '3s', color: '#34d399', size: '11px' },
            ].map((s, i) => (
                <div
                    key={i}
                    className="sparkle"
                    style={{
                        ...s,
                        fontSize: s.size,
                        color: s.color,
                        '--sparkle-delay': s.delay,
                        '--sparkle-duration': s.duration,
                    } as React.CSSProperties & Record<'--sparkle-delay' | '--sparkle-duration', string>}
                />
            ))}

            <div className="login-panel">
                <div className="login-visual" style={{ animation: 'slide-right 1s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                    <div className="login-visual-inner">
                        <div
                            className="absolute rounded-full"
                            style={{
                                width: '300px',
                                height: '300px',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08), transparent 70%)',
                                animation: 'pulse-soft 4s ease-in-out infinite',
                            }}
                        />

                        <div className="illustration-3d absolute inset-0 flex items-center justify-center">
                            <img
                                src="/student-3d.png"
                                alt="Student studying at desk"
                                className="login-student-image object-contain"
                                style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.12))' }}
                            />
                        </div>

                        <div className="orbit-element" style={{ top: '50%', left: '50%', '--orbit-radius': '180px', '--orbit-duration': '25s' } as React.CSSProperties}>
                            <span className="text-2xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{String.fromCodePoint(0x1F4DA)}</span>
                        </div>
                        <div className="orbit-element" style={{ top: '50%', left: '50%', '--orbit-radius': '170px', '--orbit-duration': '20s', animationDelay: '-5s' } as React.CSSProperties}>
                            <span className="text-xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{String.fromCodePoint(0x1F4BB)}</span>
                        </div>
                        <div className="orbit-element" style={{ top: '50%', left: '50%', '--orbit-radius': '160px', '--orbit-duration': '30s', animationDelay: '-10s' } as React.CSSProperties}>
                            <span className="text-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{String.fromCodePoint(0x1F393)}</span>
                        </div>
                        <div className="orbit-element" style={{ top: '50%', left: '50%', '--orbit-radius': '190px', '--orbit-duration': '22s', animationDelay: '-15s' } as React.CSSProperties}>
                            <span className="text-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{String.fromCodePoint(0x270F, 0xFE0F)}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-center gap-2" style={{ animation: 'slide-up 0.8s ease 0.6s both' }}>
                        <span className="feature-pill">
                            <svg className="h-3.5 w-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            AI-Proctored
                        </span>
                        <span className="feature-pill">
                            <svg className="h-3.5 w-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                            Encrypted
                        </span>
                        <span className="feature-pill">
                            <svg className="h-3.5 w-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            Live Monitoring
                        </span>
                    </div>
                </div>

                <div className="login-form-panel" style={{ animation: 'slide-left 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both' }}>
                    <div className="glass-card login-form-card p-8 sm:p-10">
                        <div className="mb-8 text-center" style={{ animation: 'fade-in 0.8s ease 0.5s both' }}>
                            <div
                                className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)' }}
                            >
                                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif", color: '#1e293b' }}>
                                Welcome Back
                            </h1>
                            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
                                Sign in to start your examination
                            </p>
                        </div>

                        <form className="login-form" onSubmit={handleLogin}>
                            <div className="login-field" style={{ animation: 'slide-up 0.6s ease 0.6s both' }}>
                                <label htmlFor="studentName" className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: focused === 'studentName' ? '#4f46e5' : '#64748b', transition: 'color 0.3s' }}>
                                    Name
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <svg className={`h-5 w-5 transition-colors duration-300 ${focused === 'studentName' ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="studentName"
                                        type="text"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        onFocus={() => setFocused('studentName')}
                                        onBlur={() => setFocused(null)}
                                        placeholder="Enter your name"
                                        className="glass-input login-input"
                                        required
                                        autoComplete="off"
                                    />
                                    {studentName && (
                                        <div style={{ animation: 'check-pop 0.4s ease forwards' }}>
                                            <svg className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="login-field" style={{ animation: 'slide-up 0.6s ease 0.75s both' }}>
                                <label htmlFor="rollNumber" className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: focused === 'rollNumber' ? '#4f46e5' : '#64748b', transition: 'color 0.3s' }}>
                                    Roll Number
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <svg className={`h-5 w-5 transition-colors duration-300 ${focused === 'rollNumber' ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3M5 11h14M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="rollNumber"
                                        type="text"
                                        value={rollNumber}
                                        onChange={(e) => setRollNumber(e.target.value)}
                                        onFocus={() => setFocused('rollNumber')}
                                        onBlur={() => setFocused(null)}
                                        placeholder="Enter your roll number"
                                        className="glass-input login-input"
                                        required
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="login-field" style={{ animation: 'slide-up 0.6s ease 0.82s both' }}>
                                <label htmlFor="organizationCode" className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: focused === 'organizationCode' ? '#4f46e5' : '#64748b', transition: 'color 0.3s' }}>
                                    Organization Code
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <svg className={`h-5 w-5 transition-colors duration-300 ${focused === 'organizationCode' ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 1.657-1.12 3-2.5 3S7 12.657 7 11s1.12-3 2.5-3 2.5 1.343 2.5 3zm4.5 0c0 1.657-1.12 3-2.5 3S11.5 12.657 11.5 11s1.12-3 2.5-3 2.5 1.343 2.5 3zM3 19h18" />
                                        </svg>
                                    </div>
                                    <input
                                        id="organizationCode"
                                        type="text"
                                        value={organizationCode}
                                        onChange={(e) => setOrganizationCode(e.target.value)}
                                        onFocus={() => setFocused('organizationCode')}
                                        onBlur={() => setFocused(null)}
                                        placeholder="Enter your organization code"
                                        className="glass-input login-input"
                                        required
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="login-action" style={{ animation: 'slide-up 0.6s ease 0.9s both' }}>
                                <button type="submit" disabled={!isReady || isGateOpening} className="glass-btn btn-primary">
                                    <span className="flex items-center justify-center gap-2">
                                        {isGateOpening ? (
                                            <>
                                                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Entering Exam...
                                            </>
                                        ) : (
                                            <>
                                                <UserCircleIcon className="h-5 w-5 text-white" />
                                                Start Exam
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={onDemoStart}
                                disabled={isGateOpening}
                                className="btn-secondary inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Try Demo Exam
                            </button>
                        </div>

                        <div className="my-6 flex items-center gap-3" style={{ animation: 'fade-in 1s ease 1s both' }}>
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-xs text-slate-400">Secured by CBT Engine</span>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>

                        <div className="flex items-center justify-center gap-6 text-xs text-slate-400" style={{ animation: 'fade-in 1s ease 1.1s both' }}>
                            <div className="flex items-center gap-1.5">
                                <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                256-bit SSL
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                GDPR
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg className="h-4 w-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                Proctored
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isGateOpening && (
                <>
                    <div className="gate-panel gate-left gate-opening" />
                    <div className="gate-panel gate-right gate-opening" />
                </>
            )}
        </div>
    );
};

export default LoginScreen;
