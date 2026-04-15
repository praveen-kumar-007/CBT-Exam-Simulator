import React from 'react';
import LegacyApp from '../App';
import { adminFeaturePages } from './admin/pageRegistry';
import AdminLoginPage from './pages/AdminLoginPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import StudentDisqualifiedPage from './pages/StudentDisqualifiedPage';
import StudentExamCardPage from './pages/StudentExamCardPage';
import StudentInstructionPage from './pages/StudentInstructionPage';
import StudentLoginPage from './pages/StudentLoginPage';
import StudentResultPage from './pages/StudentResultPage';
import StudentReviewPage from './pages/StudentReviewPage';
import SuperAdminLoginPage from './pages/SuperAdminLoginPage';

const getAdminFeatureComponent = (pathname: string): React.ComponentType | null => {
    const page = adminFeaturePages.find((item) => item.route.toLowerCase() === pathname.toLowerCase());
    return page?.component ?? null;
};

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

    const pathname = window.location.pathname;

    if (pathname.toLowerCase() === '/admin/login') {
        return (
            <AppLayout title="Admin Login Page">
                <AdminLoginPage />
            </AppLayout>
        );
    }

    if (pathname.toLowerCase() === '/admin/super-admin/login') {
        return (
            <AppLayout title="Super Admin Login Page">
                <SuperAdminLoginPage />
            </AppLayout>
        );
    }

    const AdminFeatureComponent = getAdminFeatureComponent(pathname);
    if (AdminFeatureComponent) {
        return (
            <AppLayout title="Admin Feature Page">
                <AdminFeatureComponent />
            </AppLayout>
        );
    }

    if (pathname.toLowerCase() === '/student/login') {
        return <StudentLoginPage />;
    }

    if (pathname.toLowerCase() === '/student/instructions') {
        return <StudentInstructionPage />;
    }

    if (pathname.toLowerCase() === '/student/dashboard') {
        return <StudentDashboardPage />;
    }

    if (pathname.toLowerCase() === '/student/exam-card') {
        return <StudentExamCardPage />;
    }

    if (pathname.toLowerCase() === '/student/review') {
        return <StudentReviewPage />;
    }

    if (pathname.toLowerCase() === '/student/result') {
        return <StudentResultPage />;
    }

    if (pathname.toLowerCase() === '/student/disqualified') {
        return <StudentDisqualifiedPage />;
    }

    // Fallback to preserve old working flow on any unmatched route.
    return <LegacyApp />;
};

export default App;
