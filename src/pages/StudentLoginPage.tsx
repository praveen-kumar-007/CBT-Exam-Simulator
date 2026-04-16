import React, { useState } from 'react';
import NotificationBanner from '../components/NotificationBanner';

const StudentLoginPage: React.FC = () => {
    const [studentName, setStudentName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [organizationCode, setOrganizationCode] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [bannerStatus, setBannerStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const nameValue = studentName.trim();
    const rollValue = rollNumber.trim();
    const orgValue = organizationCode.trim().toUpperCase();

    const nameError = submitted && nameValue.length < 2 ? 'Enter your full name.' : '';
    const rollError = submitted && rollValue.length < 2 ? 'Enter a valid roll number.' : '';
    const orgError = submitted && orgValue.length < 3 ? 'Organization code must be at least 3 characters.' : '';

    const isReady = !nameError && !rollError && !orgError && nameValue.length >= 2 && rollValue.length >= 2 && orgValue.length >= 3;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);

        if (!nameValue || !rollValue || !orgValue || nameValue.length < 2 || rollValue.length < 2 || orgValue.length < 3) {
            setBannerStatus({
                message: 'Please fix the highlighted fields before continuing.',
                type: 'error',
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setBannerStatus({ message: 'Login validated. Redirecting to dashboard...', type: 'success' });

        if (typeof window !== 'undefined') {
            window.location.pathname = '/student/dashboard';
        }
    };

    return (
        <div className="login-page student-login-shell">
            <div className="bg-blob bg-blob-1" />
            <div className="bg-blob bg-blob-2" />
            <div className="bg-blob bg-blob-3" />
            <div className="dot-pattern" />

            <NotificationBanner
                message={bannerStatus?.message ?? null}
                type={bannerStatus?.type ?? 'info'}
                sectionLabel="Student Login"
                onDismiss={() => setBannerStatus(null)}
            />

            <header className="student-login-topbar">
                <div className="student-login-topbar-inner glass-card">
                    <img src="/original_logo.png" alt="Indocreonix logo" className="student-brand-logo" />
                    <div>
                        <h1>Indocreonix CBT Assessment</h1>
                        <p>Secure exam gateway for students</p>
                    </div>
                </div>
            </header>

            <section className="student-login-content">
                <aside className="student-login-illustration glass-card float-element-slow">
                    <img src="/student-3d.png" alt="Student illustration" className="illustration-3d" />
                    <div className="student-feature-row">
                        <span className="feature-pill">AI-Proctored</span>
                        <span className="feature-pill">Encrypted</span>
                        <span className="feature-pill">Live Monitoring</span>
                    </div>
                </aside>

                <div className="glass-card student-login-card animate-pulse-once">
                    <div className="student-src-login-card-icon" aria-hidden>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M20 22V5a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 5.5v14" />
                        </svg>
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Sign in to begin your secure exam session</p>

                    <form className="student-login-form" onSubmit={handleSubmit} noValidate>
                        <label htmlFor="studentName">Name</label>
                        <div className="student-input-wrap">
                            <span className="student-input-icon" aria-hidden>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21a8 8 0 1 0-16 0" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <input
                                id="studentName"
                                type="text"
                                placeholder="Enter your name"
                                autoComplete="name"
                                aria-invalid={Boolean(nameError)}
                                className={`glass-input ${nameError ? 'student-src-input-error' : ''}`}
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                            />
                        </div>
                        {nameError ? <div className="student-src-field-error">{nameError}</div> : null}

                        <label htmlFor="rollNumber">Roll Number</label>
                        <div className="student-input-wrap">
                            <span className="student-input-icon" aria-hidden>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16v16H4z" />
                                    <path d="M8 8h8M8 12h8M8 16h5" />
                                </svg>
                            </span>
                            <input
                                id="rollNumber"
                                type="text"
                                placeholder="Enter your roll number"
                                autoComplete="off"
                                aria-invalid={Boolean(rollError)}
                                className={`glass-input ${rollError ? 'student-src-input-error' : ''}`}
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value)}
                            />
                        </div>
                        {rollError ? <div className="student-src-field-error">{rollError}</div> : null}

                        <label htmlFor="organizationCode">Organization Code</label>
                        <div className="student-input-wrap">
                            <span className="student-input-icon" aria-hidden>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="14" rx="2" />
                                    <path d="M8 20h8" />
                                </svg>
                            </span>
                            <input
                                id="organizationCode"
                                type="text"
                                placeholder="Enter your organization code"
                                autoComplete="off"
                                inputMode="text"
                                aria-invalid={Boolean(orgError)}
                                className={`glass-input ${orgError ? 'student-src-input-error' : ''}`}
                                value={organizationCode}
                                onChange={(e) => setOrganizationCode(e.target.value.toUpperCase())}
                            />
                        </div>
                        {orgError ? <div className="student-src-field-error">{orgError}</div> : null}

                        {!submitted ? (
                            <div className="student-src-help-text">Use your assigned details to continue.</div>
                        ) : null}

                        <button type="submit" disabled={!isReady} className="glass-btn">
                            Continue to Dashboard
                        </button>

                        <div className="student-src-security">Secured by CBT Engine</div>
                        <div className="student-src-compliance">
                            <span>256-bit SSL</span>
                            <span>GDPR</span>
                            <span>Proctored</span>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default StudentLoginPage;
