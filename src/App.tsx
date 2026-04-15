import React from 'react';
import LegacyApp from '../App';
import AdminLoginPage from './pages/AdminLoginPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import StudentDisqualifiedPage from './pages/StudentDisqualifiedPage';
import StudentExamCardPage from './pages/StudentExamCardPage';
import StudentInstructionPage from './pages/StudentInstructionPage';
import StudentLoginPage from './pages/StudentLoginPage';
import StudentResultPage from './pages/StudentResultPage';
import StudentReviewPage from './pages/StudentReviewPage';
import SuperAdminLoginPage from './pages/SuperAdminLoginPage';

const AppLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <main className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
                    <p className="mt-1 text-sm text-slate-500">CBT exam simulator dashboard</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-slate-500 shadow-sm">
                    Tailwind UI
                </span>
            </div>
        </header>
        <section className="mx-auto w-full max-w-6xl p-4">{children}</section>
    </main>
);

const App: React.FC = () => {
    if (typeof window === 'undefined') {
        return <LegacyApp />;
    }

    const pathname = window.location.pathname.toLowerCase();

    if (pathname.startsWith('/admin')) {
        return <LegacyApp />;
    }

    if (pathname === '/student/login') {
        return <StudentLoginPage />;
    }

    if (pathname === '/student/instructions') {
        return <StudentInstructionPage />;
    }

    if (pathname === '/student/dashboard') {
        return <StudentDashboardPage />;
    }

    if (pathname === '/student/exam-card') {
        return <StudentExamCardPage />;
    }

    if (pathname === '/student/review') {
        return <StudentReviewPage />;
    }

    if (pathname === '/student/result') {
        return <StudentResultPage />;
    }

    if (pathname === '/student/disqualified') {
        return <StudentDisqualifiedPage />;
    }

    // Fallback to preserve old working flow on any unmatched route.
    return <LegacyApp />;
};

export default App;
