import React, { useEffect, useMemo, useState } from 'react';
import NotificationBanner from '../src/components/NotificationBanner';
import Calculator, { CalculatorMode, loadCalculatorSettings, saveCalculatorSettings } from '../src/components/Calculator';

type Mode = 'admin-login' | 'super-admin-login' | 'dashboard';
type DashboardView = 'overview' | 'sections' | 'questions' | 'add-question' | 'students' | 'responses' | 'config' | 'activity' | 'insights' | 'reports' | 'users' | 'settings' | 'tenants' | 'help' | 'profile' | 'demo-exam' | 'calculator';

type AdminIdentity = {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    tenantKey?: string | null;
    phone?: string | null;
    plan?: string;
    imageUrl?: string;
    studentLimit?: number;
};

type ManagedAdminItem = {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    studentLimit: number;
    studentCount: number;
    tenantKey: string;
    createdAt: string;
};

type SectionItem = {
    _id: string;
    name: string;
    description?: string;
    isActive?: boolean;
};

type QuestionItem = {
    _id: string;
    section?: string | { _id: string; name: string };
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    marks: number;
    imageUrl?: string | null;
};

type StudentItem = {
    _id: string;
    name: string;
    email: string;
    studentCredential?: string;
};

type SubmissionAnswer = {
    questionText: string;
    options?: string[];
    selectedOptionIndex: number | null;
    correctOptionIndex: number;
    isCorrect?: boolean;
    marksAwarded: number;
};

type SubmissionInteraction = {
    question?: string;
    firstSelectedOptionIndex: number | null;
    finalSelectedOptionIndex: number | null;
    changeCount: number;
    selectionHistory?: number[];
};

type SecurityEventItem = {
    type: string;
    message: string;
    timestamp: string;
};

type SubmissionExamMeta = {
    terminatedDueToCheating?: boolean;
    terminationRemark?: string;
    cheatingAttempts?: number;
    totalOptionChanges?: number;
    questionInteractions?: SubmissionInteraction[];
    securityEvents?: SecurityEventItem[];
};

type SubmissionItem = {
    _id: string;
    section?: { name: string };
    score: number;
    maxScore: number;
    attemptedQuestions: number;
    totalQuestions: number;
    createdAt: string;
    answers: SubmissionAnswer[];
    remark?: string;
    examMeta?: SubmissionExamMeta;
};

type AuthResponse = {
    data: {
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            tenantKey?: string | null;
            phone?: string | null;
            plan?: string;
        };
    };
};

type Analytics = {
    studentsCount: number;
    sectionsCount: number;
    questionsCount: number;
    submissionsCount: number;
    activeSessionCount: number;
    eliminatedDueToCheating: number;
    averagePercent: number;
    bestScore: number;
    cheatingTerminations: number;
    totalCheatingAttempts: number;
    totalOptionChanges: number;
    avgOptionChanges: number;
};

type RecentSubmissionSection = {
    name: string;
    score: number;
    maxScore: number;
    attemptedQuestions: number;
    totalQuestions: number;
    createdAt: string;
    terminatedDueToCheating?: boolean;
};

type RecentSubmission = {
    _id: string;
    student: { _id?: string; name: string; email?: string; studentCredential?: string };
    totalScore: number;
    totalMaxScore: number;
    totalAttempted: number;
    totalQuestions: number;
    submissionsCount: number;
    percent: number;
    lastSubmittedAt: string;
    terminatedDueToCheating: boolean;
    cheatingAttempts: number;
    totalOptionChanges: number;
    sections: RecentSubmissionSection[];
};

type ExamConfig = {
    durationInMinutes: number;
    examinerName?: string;
    startAt?: string | null;
    forceEndedAt?: string | null;
    autoSubmitAfterTime?: boolean;
    calculatorEnabled?: boolean;
    activeCalculatorType?: CalculatorMode | null;
    updatedAt?: string;
};

type InsightsScoreBucket = {
    bucket: string;
    count: number;
};

type InsightsSectionPerformance = {
    sectionName: string;
    avgPercent: number;
    attempts: number;
};

type InsightsTopStudent = {
    studentName: string;
    studentCredential?: string;
    avgPercent: number;
    attempts: number;
};

type InsightsTimelineItem = {
    day: string;
    submissions: number;
    cheatingAttempts: number;
    optionChanges: number;
    terminations: number;
};

type InsightsPayload = {
    scoreDistribution: InsightsScoreBucket[];
    sectionPerformance: InsightsSectionPerformance[];
    topStudents: InsightsTopStudent[];
    timeline: InsightsTimelineItem[];
};

const DASHBOARD_VIEWS: DashboardView[] = ['overview', 'sections', 'questions', 'add-question', 'students', 'responses', 'config', 'calculator', 'activity', 'insights', 'reports', 'users', 'settings', 'tenants', 'help', 'demo-exam'];
const DEFAULT_DASHBOARD_VIEW: DashboardView = 'overview';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const BRAND_NAME = 'Indocreonix';
const BRAND_LOGO_URL = '/original_logo.png';
const BRAND_MOTTO = 'Smart Assessment Infrastructure';
const BRAND_TAG = 'Build · Scale · Lead';

// Brand color palette
const BRAND = {
    navy: '#0d1b3e',
    navyMid: '#162550',
    blue: '#1a4fc4',
    teal: '#00b4d8',
    tealLight: '#90e0ef',
    amber: '#f59e0b',
    amberLight: '#fcd34d',
    gold: '#d97706',
    white: '#f8faff',
    glass: 'rgba(255,255,255,0.07)',
    glassBorder: 'rgba(255,255,255,0.15)',
};

const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({ name, size = 18, color = 'currentColor' }) => {
    switch (name) {
        case 'overview': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>;
        case 'sections': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></svg>;
        case 'questions': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
        case 'add': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
        case 'students': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
        case 'responses': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
        case 'config': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
        case 'calculator': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" ry="3" /><path d="M8 7h8" /><path d="M8 12h8" /><path d="M8 17h8" /><path d="M12 7v10" /></svg>;
        case 'activity': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
        case 'lightning': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
        case 'insights': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
        case 'reports': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>;
        case 'security': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
        case 'settings': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /></svg>;
        case 'help': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
        case 'calendar': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="3" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
        case 'clock': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /></svg>;
        case 'tenants': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3z" /><path d="M19 21V10h-2v11" /><path d="M15 21V10h-2v11" /><path d="M11 21V10H9v11" /><path d="M7 21V10H5v11" /></svg>;
        case 'check': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
        case 'user': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
        case 'arrow-left': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>;
        case 'arrow-right': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
        case 'download': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
        case 'menu': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
        case 'close': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
        default: return null;
    }
};

type BrandSignatureProps = {
    showMenuButton?: boolean;
    isMenuOpen?: boolean;
    onMenuToggle?: () => void;
};

const BrandSignature: React.FC<BrandSignatureProps> = ({ showMenuButton = false, isMenuOpen = false, onMenuToggle }) => (
    <div
        style={{
            width: '100%',
            borderBottom: `1px solid rgba(0,180,216,0.25)`,
            background: `linear-gradient(90deg, ${BRAND.navy} 0%, ${BRAND.navyMid} 60%, #0f2244 100%)`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
            padding: '9px 16px',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}
    >
        <div
            style={{
                width: '100%',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                flexWrap: 'wrap',
                position: 'relative',
                padding: `0 6px 0 ${showMenuButton ? '56px' : '6px'}`
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                    src={BRAND_LOGO_URL}
                    alt={`${BRAND_NAME} logo`}
                    style={{ height: '40px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(0,180,216,0.5))' }}
                />
                <div>
                    <div style={{ fontSize: '15px', color: '#ffffff', fontWeight: 800, letterSpacing: '0.3px' }}>
                        {BRAND_NAME}
                        <span style={{ marginLeft: '8px', fontSize: '10px', background: `linear-gradient(90deg, ${BRAND.teal}, ${BRAND.amber})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Suite</span>
                    </div>
                    <div style={{ fontSize: '10px', color: BRAND.tealLight, fontWeight: 600, letterSpacing: '0.4px', opacity: 0.85 }}>{BRAND_MOTTO}</div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                    fontSize: '11px',
                    color: BRAND.amberLight,
                    fontWeight: 700,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    borderLeft: `2px solid ${BRAND.amber}`,
                    paddingLeft: '8px'
                }}>{BRAND_TAG}</span>
            </div>
            {showMenuButton && onMenuToggle && (
                <button
                    type="button"
                    onClick={onMenuToggle}
                    aria-label={isMenuOpen ? 'Close admin pages menu' : 'Open admin pages menu'}
                    style={{
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        background: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '12px',
                        width: '44px',
                        height: '40px',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Icon name={isMenuOpen ? 'close' : 'menu'} color="#ffffff" size={22} />
                </button>
            )}
        </div>
    </div>
);

const getModeFromPath = (): Mode => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/admin/super-admin/login')) return 'super-admin-login';
    if (path.startsWith('/admin/dashboard')) return 'dashboard';
    return 'admin-login';
};

const getDashboardViewFromPath = (): DashboardView => {
    const path = window.location.pathname.toLowerCase();
    const match = path.match(/^\/admin\/dashboard(?:\/([^/?#]+))?/);
    const candidate = (match?.[1] || DEFAULT_DASHBOARD_VIEW) as DashboardView;
    return DASHBOARD_VIEWS.includes(candidate) ? candidate : DEFAULT_DASHBOARD_VIEW;
};

const isMissingExamConfigRoute = (message: string) =>
    /route not found:\s*\/api\/admin\/exam-config/i.test(message || '');

const readAdminIdentity = (): AdminIdentity | null => {
    try {
        const raw = localStorage.getItem('adminUser');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed as AdminIdentity;
    } catch {
        return null;
    }
};

export const AdminApp: React.FC = () => {
    const getIsMobile = () => (typeof window !== 'undefined' ? window.innerWidth <= 900 : false);
    const [mode, setMode] = useState<Mode>(getModeFromPath());
    const [activeView, setActiveView] = useState<DashboardView>(getDashboardViewFromPath());
    const [isMobile, setIsMobile] = useState(getIsMobile());
    const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
    const [isSidebarHovering, setIsSidebarHovering] = useState(false);
    const [isSidebarPinned, setIsSidebarPinned] = useState(false);
    const [helpPromptCopied, setHelpPromptCopied] = useState(false);
    const [examPromptDifficulty, setExamPromptDifficulty] = useState('Medium');
    const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
    const [adminIdentity, setAdminIdentity] = useState<AdminIdentity | null>(readAdminIdentity());
    const [desktopSidebarWidth, setDesktopSidebarWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);

    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [isDemoSeedLoading, setIsDemoSeedLoading] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [sections, setSections] = useState<SectionItem[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [sectionName, setSectionName] = useState('');
    const [sectionDescription, setSectionDescription] = useState('');

    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
    const [marks, setMarks] = useState(1);
    const [questionImage, setQuestionImage] = useState<File | null>(null);
    const [importQuestionFile, setImportQuestionFile] = useState<File | null>(null);
    const [isImportingQuestions, setIsImportingQuestions] = useState(false);
    const [questions, setQuestions] = useState<QuestionItem[]>([]);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [editSectionId, setEditSectionId] = useState('');
    const [editQuestionText, setEditQuestionText] = useState('');
    const [editOptions, setEditOptions] = useState(['', '', '', '']);
    const [editCorrectOptionIndex, setEditCorrectOptionIndex] = useState(0);
    const [editMarks, setEditMarks] = useState(1);
    const [editQuestionImage, setEditQuestionImage] = useState<File | null>(null);
    const [editCurrentImageUrl, setEditCurrentImageUrl] = useState<string | null>(null);

    const [students, setStudents] = useState<StudentItem[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
    const [examDuration, setExamDuration] = useState(60);
    const [examinerName, setExaminerName] = useState('CBT Examination Cell');
    const [examStartAt, setExamStartAt] = useState('');
    const [isExamStartPickerOpen, setIsExamStartPickerOpen] = useState(false);
    const [examStartDate, setExamStartDate] = useState('');
    const [examStartTime, setExamStartTime] = useState('');
    const [examAutoSubmitAfterTime, setExamAutoSubmitAfterTime] = useState(true);
    const [examForceEndedAt, setExamForceEndedAt] = useState<string | null>(null);
    const [examConfigUpdatedAt, setExamConfigUpdatedAt] = useState('');
    const [calculatorEnabled, setCalculatorEnabled] = useState(false);
    const [activeCalculatorType, setActiveCalculatorType] = useState<CalculatorMode | null>(null);
    const [calculatorSettings, setCalculatorSettings] = useState(() => loadCalculatorSettings());
    const [questionSearch, setQuestionSearch] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [insights, setInsights] = useState<InsightsPayload | null>(null);
    const [menuSearch, setMenuSearch] = useState('');
    const [managedAdmins, setManagedAdmins] = useState<ManagedAdminItem[]>([]);
    const [selectedTenantAdminId, setSelectedTenantAdminId] = useState(() => {
        if (typeof window === 'undefined') return '';
        return localStorage.getItem('selectedTenantAdminId') || '';
    });
    const [newTenantAdminName, setNewTenantAdminName] = useState('');
    const [newTenantAdminEmail, setNewTenantAdminEmail] = useState('');
    const [newTenantAdminPassword, setNewTenantAdminPassword] = useState('');
    const [newTenantAdminPhone, setNewTenantAdminPhone] = useState('');
    const [newTenantAdminStudentLimit, setNewTenantAdminStudentLimit] = useState('100');
    const [newTenantKey, setNewTenantKey] = useState('');
    const [newSuperAdminName, setNewSuperAdminName] = useState('');
    const [newSuperAdminEmail, setNewSuperAdminEmail] = useState('');
    const [newSuperAdminPassword, setNewSuperAdminPassword] = useState('');
    const [newSuperAdminPhone, setNewSuperAdminPhone] = useState('');

    const updateCalculatorSettings = (settings: Partial<{ enabled: boolean; allowedTypes: CalculatorMode[] }>) => {
        const next = saveCalculatorSettings({ ...calculatorSettings, ...settings });
        setCalculatorSettings(next);
    };

    const setActiveCalculatorTypeAction = async (type: CalculatorMode | null) => {
        const nextType = type;
        const previousType = activeCalculatorType;
        setActiveCalculatorType(nextType);

        try {
            await persistExamConfig(examStartAt || null, calculatorEnabled, nextType);
            setStatus(`Calculator type ${nextType ? `${nextType} enabled` : 'disabled'} successfully.`);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to update active calculator type';
            setActiveCalculatorType(previousType);
            setError(message);
        }
    };

    type ModalDialogType =
        | 'examPrompt'
        | 'updateManagedAdminLimit'
        | 'deleteManagedAdmin'
        | 'deleteQuestion'
        | 'deleteStudent'
        | 'resetAllStudents'
        | 'deleteSection'
        | 'editSection';

    type ModalState = {
        type: ModalDialogType;
        title: string;
        message: string;
        inputLabel?: string;
        inputValue?: string;
        inputPlaceholder?: string;
        targetId?: string;
        targetItem?: SectionItem | QuestionItem | StudentItem;
    };

    const [modalState, setModalState] = useState<ModalState | null>(null);
    const [sectionModalName, setSectionModalName] = useState('');
    const [sectionModalDescription, setSectionModalDescription] = useState('');
    const [sectionModalActive, setSectionModalActive] = useState(true);

    const activeSection = useMemo(
        () => sections.find((section) => section._id === selectedSectionId) || null,
        [sections, selectedSectionId]
    );

    const filteredQuestions = useMemo(() => {
        if (!questionSearch.trim()) return questions;
        const key = questionSearch.toLowerCase();
        return questions.filter((q) => q.questionText.toLowerCase().includes(key));
    }, [questions, questionSearch]);

    const filteredStudents = useMemo(() => {
        if (!studentSearch.trim()) return students;
        const key = studentSearch.toLowerCase();
        return students.filter((s) =>
            s.name.toLowerCase().includes(key) ||
            s.email.toLowerCase().includes(key) ||
            String(s.studentCredential || '').toLowerCase().includes(key)
        );
    }, [students, studentSearch]);

    const navigate = (path: string) => {
        window.history.pushState({}, '', path);
        setMode(getModeFromPath());
        if (path.startsWith('/admin/dashboard')) {
            setActiveView(getDashboardViewFromPath());
        }
    };

    useEffect(() => {
        const handler = () => {
            setMode(getModeFromPath());
            setActiveView(getDashboardViewFromPath());
        };
        window.addEventListener('popstate', handler);
        return () => window.removeEventListener('popstate', handler);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = Math.min(Math.max(200, e.clientX), 600);
            setDesktopSidebarWidth(newWidth);
        };
        const handleMouseUp = () => setIsResizing(false);

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    useEffect(() => {
        if (mode === 'dashboard' && !window.location.pathname.toLowerCase().startsWith('/admin/dashboard/')) {
            window.history.replaceState({}, '', `/admin/dashboard/${activeView}`);
        }
    }, [mode, activeView]);

    useEffect(() => {
        const handleResize = () => setIsMobile(getIsMobile());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isMobile) {
            setIsNavMenuOpen(false);
            return;
        }

        setIsSidebarHovering(false);
        setIsSidebarPinned(false);
    }, [isMobile]);

    useEffect(() => {
        if (mode === 'dashboard' && !token) {
            navigate('/admin/login');
        }
    }, [mode, token]);

    useEffect(() => {
        if (selectedTenantAdminId) {
            localStorage.setItem('selectedTenantAdminId', selectedTenantAdminId);
        } else {
            localStorage.removeItem('selectedTenantAdminId');
        }
    }, [selectedTenantAdminId]);

    useEffect(() => {
        if (status && !status.endsWith('...')) {
            const timer = setTimeout(() => setStatus(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const api = async <T,>(path: string, init: RequestInit = {}, withAuth = true): Promise<T> => {
        const headers: Record<string, string> = {
            ...(init.headers as Record<string, string> | undefined)
        };

        if (withAuth && token) {
            headers.Authorization = `Bearer ${token}`;
        }

        if (
            withAuth &&
            adminIdentity?.role === 'super_admin' &&
            !path.includes('/managed-admins') &&
            !path.includes('/super-admins') &&
            !path.includes('/demo-paper/seed')
        ) {
            if (!selectedTenantAdminId) {
                throw new Error('Select an organization admin context first.');
            }
            headers['x-organization-admin-id'] = selectedTenantAdminId;
        }

        const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
        const body = await res.json();

        if (!res.ok || body.success === false) {
            throw new Error(body.message || 'Request failed');
        }

        return body as T;
    };

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setStatus('');

        try {
            const loginPath = mode === 'super-admin-login'
                ? '/api/auth/super-admin/login'
                : '/api/auth/admin/login';

            const result = await api<AuthResponse>(
                loginPath,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: loginEmail, password: loginPassword })
                },
                false
            );

            localStorage.setItem('adminToken', result.data.token);
            localStorage.setItem('adminUser', JSON.stringify(result.data.user));
            setToken(result.data.token);
            setAdminIdentity(result.data.user);
            setActiveView(DEFAULT_DASHBOARD_VIEW);
            setStatus('Login successful.');
            navigate('/admin/dashboard/overview');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Login failed');
        }
    };

    const handleDemoSeed = async () => {
        if (adminIdentity?.role !== 'super_admin') {
            setError('Only super admins can seed the demo exam.');
            return;
        }

        setIsDemoSeedLoading(true);
        setStatus('');
        setError('');

        try {
            const result = await api<{ success: boolean; message: string; data: unknown }>('/api/admin/demo-paper/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            setStatus(result.message || 'Demo paper seeded successfully.');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to seed demo exam.');
        } finally {
            setIsDemoSeedLoading(false);
        }
    };

    const loadSections = async () => {
        try {
            setError('');
            const data = await api<{ data: SectionItem[] }>('/api/admin/sections');
            const list = data.data || [];
            setSections(list);
            if (!selectedSectionId && list.length) {
                setSelectedSectionId(list[0]._id);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load sections');
        }
    };


    const loadAnalytics = async () => {
        try {
            const result = await api<{ data: Analytics }>('/api/admin/analytics');
            setAnalytics(result.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load analytics');
        }
    };

    const loadRecentSubmissions = async () => {
        try {
            const result = await api<{ data: RecentSubmission[] }>('/api/admin/submissions/recent');
            setRecentSubmissions(result.data || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load recent submissions');
        }
    };

    const loadInsights = async () => {
        try {
            const result = await api<{ data: InsightsPayload }>('/api/admin/insights');
            setInsights(result.data || null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load insights');
        }
    };

    const formatLocalDateTime = (iso?: string | null): string => {
        if (!iso) return '';
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return '';
        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 16);
    };

    const getExamStartParts = (value: string) => {
        if (!value) return { date: '', time: '' };
        const [date, time] = value.split('T');
        return { date: date || '', time: time || '09:00' };
    };

    const openExamStartPicker = () => {
        const parts = getExamStartParts(examStartAt);
        setExamStartDate(parts.date || new Date().toISOString().slice(0, 10));
        setExamStartTime(parts.time || '09:00');
        setIsExamStartPickerOpen(true);
    };

    const applyExamStartPicker = () => {
        if (!examStartDate) {
            setError('Please choose a valid exam start date.');
            return;
        }
        setExamStartAt(`${examStartDate}T${examStartTime || '09:00'}`);
        setIsExamStartPickerOpen(false);
    };

    const clearExamStart = () => {
        setExamStartAt('');
        setExamStartDate('');
        setExamStartTime('09:00');
        setIsExamStartPickerOpen(false);
    };

    const loadExamConfig = async () => {
        try {
            const result = await api<{ data: ExamConfig }>('/api/admin/exam-config');
            setExamDuration(result.data?.durationInMinutes || 60);
            setExaminerName(result.data?.examinerName || 'CBT Examination Cell');
            setCalculatorEnabled(result.data?.calculatorEnabled ?? false);
            setActiveCalculatorType(result.data?.activeCalculatorType || null);
            setCalculatorSettings((prev) => ({
                ...prev,
                enabled: result.data?.calculatorEnabled ?? prev.enabled,
            }));
            const localStart = formatLocalDateTime(result.data?.startAt || null);
            setExamStartAt(localStart);
            setExamStartDate(localStart ? localStart.slice(0, 10) : '');
            setExamStartTime(localStart ? localStart.slice(11, 16) : '09:00');
            setExamAutoSubmitAfterTime(result.data?.autoSubmitAfterTime ?? true);
            setExamForceEndedAt(result.data?.forceEndedAt || null);
            setExamConfigUpdatedAt(result.data?.updatedAt || '');
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to load exam configuration';
            if (isMissingExamConfigRoute(message)) {
                setExamDuration(60);
                setExaminerName('CBT Examination Cell');
                setExamStartAt('');
                setExamAutoSubmitAfterTime(true);
                setExamForceEndedAt(null);
                setExamConfigUpdatedAt('');
                setStatus('Exam config API is unavailable on this backend deployment. Using default 60 minutes.');
                return;
            }
            setError(message);
        }
    };

    const getHelpPromptText = (examName?: string, difficulty?: string) => {
        const prompt = `Role: You are an expert Academic Content Creator and Data Specialist.

Task: Please generate a full-length, high-quality mock examination paper for the [EXAM_NAME].

Syllabus & Pattern Instructions:

Official Pattern: Research and use the most recent official exam pattern for [EXAM_NAME]. This must include the exact number of sections and the precise number of questions per section.

Subject Mapping: Replace the placeholder section names with the actual subjects for this exam (e.g. General Awareness, Mathematics, General Intelligence & Reasoning, etc.).

Difficulty Level: Generate questions at the specified difficulty level: [DIFFICULTY]. Write the paper so the overall exam reflects [DIFFICULTY] difficulty, with question complexity, language, and problem depth matching that level.

Formatting Instructions (Strict):

File Type: You must output the final result as a downloadable .xlsx (Excel) file.

Column Structure: Follow the column headers from the attached sample exactly:

Section: The subject name (enter this only once at the beginning of each new section).

Question: The full text of the question.

Option1, Option2, Option3, Option4: Four distinct answer choices.

Correct Option: The label of the correct answer (Format: "Option1", "Option2", etc.).

Marks: The marks assigned per question based on the exam's marking scheme.

Execution: Please analyze the attached sample file for the style and then generate the complete dataset for the [EXAM_NAME]. Ensure every single question is unique, diverse, and factually accurate.

Use this prompt to generate an exam paper in a structured Excel-ready format.
`;

        const finalExamName = examName ? examName.trim() : '[INSERT EXAM NAME HERE]';
        const finalDifficulty = difficulty ? difficulty : 'Medium';
        return prompt
            .replace(/\[EXAM_NAME\]/g, finalExamName)
            .replace(/\[DIFFICULTY\]/g, finalDifficulty);
    };

    const copyHelpPrompt = async () => {
        try {
            await navigator.clipboard.writeText(getHelpPromptText(undefined, examPromptDifficulty));
            setStatus('Help prompt copied to clipboard.');
            setHelpPromptCopied(true);
            window.setTimeout(() => setHelpPromptCopied(false), 3000);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to copy prompt.');
            setHelpPromptCopied(false);
        }
    };

    const getPromptForExam = () => {
        setExamPromptDifficulty('Medium');
        openModal({
            type: 'examPrompt',
            title: 'Generate Exam Prompt',
            message: 'Enter the exam name you want to generate questions for:',
            inputLabel: 'Exam Name',
            inputValue: '',
            inputPlaceholder: 'e.g. General Aptitude Test'
        });
    };

    type HelpTopic = {
        key: string;
        title: string;
        description: string;
        steps: string[];
        tips?: string[];
    };

    const helpTopics: HelpTopic[] = [
        {
            key: 'overview',
            title: 'Overview (Home)',
            description: 'This landing page provides a real-time snapshot of your exam program, including active students, submission volumes, and critical warnings. It is intended to help you assess readiness and quickly navigate to the feature you need next.',
            steps: [
                'Start on the dashboard to confirm the overall exam health before you make any changes.',
                'Read each summary card carefully: student count, questions available, submissions completed, and any exam alerts.',
                'Use the quick action links to move directly into Sections, Questions, Students, Exam Config, or Reports.',
                'Review any banner notices or warnings that tell you if a configuration item is incomplete or if a student requires attention.',
                'If the exam is already live, monitor active sessions and completion progress from the overview. That helps you catch issues early.',
            ],
            tips: ['Treat the dashboard like a daily status report: use it to decide where to focus first.'],
        },
        {
            key: 'sections',
            title: 'Sections',
            description: 'Sections define the structure of your exam. Each section should reflect a distinct subject, topic, or part of the assessment, and section names must remain consistent across the entire exam workflow.',
            steps: [
                'Open the Sections page and create each section with a clear name and optional description.',
                'Use consistent labels such as Mathematics, English, Logical Reasoning, or Technical Skills so the section appears clearly across reports and configuration screens.',
                'If a section already exists, edit it carefully and then verify the section mapping in the Question Bank and Exam Config pages.',
                'If you need to remove a section, choose deactivate first. That preserves historical exam records and avoids breaking active exam setups.',
                'Review the section order and names again before you start creating questions, because section structure often determines exam flow and scoring logic.',
            ],
            tips: ['Well-defined sections make the exam easier to manage and produce cleaner performance reports later on.'],
        },
        {
            key: 'questions',
            title: 'Question Bank',
            description: 'The Questions page is the central repository for all exam items. Use this area to review existing questions, search by keyword, update content, and ensure every item is linked to the correct section.',
            steps: [
                'Browse the Question Bank to review existing questions and verify the current item count per section.',
                'Use filters and search tools to locate questions by section, keywords, or difficulty.',
                'Edit any question to improve wording, correct answers, marks, or section assignments.',
                'When importing questions in bulk, validate the file before upload and compare the imported section names against the section master list.',
                'After saving edits or imports, re-open the question detail to confirm the changes persisted and are displayed correctly.',
            ],
            tips: ['Maintain consistent formatting across questions so students see a reliable, professional exam experience.'],
        },
        {
            key: 'add-question',
            title: 'Add Question',
            description: 'Use the Add Question page to create new exam questions manually. This is the best place for careful question creation with full control over section assignment, answer choices, and scoring.',
            steps: [
                'Select the appropriate section from the dropdown before entering content.',
                'Write the full question prompt clearly and keep it free of ambiguity.',
                'Enter exactly four answer options and make sure each distractor is plausible but distinct.',
                'Select the correct answer choice and assign the marks value clearly.',
                'Save the question and then verify it appears correctly in the Question Bank within the chosen section.',
                'If the platform allows it, preview the question as a student to check formatting and clarity.',
            ],
            tips: ['Quality matters more than quantity: accurate, unambiguous questions reduce grading problems later.'],
        },
        {
            key: 'students',
            title: 'Students',
            description: 'The Students page is where you add and manage exam candidates and their access credentials. Use this page to ensure every student can log in and take the exam on the scheduled date.',
            steps: [
                'Add individual student records or import students in bulk using the provided template.',
                'Confirm that each student has a valid email, unique identifier, and correct login credentials.',
                'Check the student list for duplicates or incomplete records and fix them before the exam begins.',
                'If a student has trouble logging in, use this page to reset credentials or provide them with the correct access details.',
                'On exam day, verify the student status list so you know who is ready, who has pending access issues, and who has already started.',
            ],
            tips: ['Communicate precise login instructions and exam schedules to students in advance to avoid last-minute confusion.'],
        },
        {
            key: 'responses',
            title: 'Responses',
            description: 'The Responses page allows you to review student submissions in detail, check answer choices, and confirm score calculations. It is essential for verifying exam integrity and resolving grading questions.',
            steps: [
                'After the exam, open Responses to see the complete list of student submissions.',
                'Select an individual submission to review answer-level detail, time taken, and score calculations.',
                'Pay special attention to any submissions marked as terminated or flagged for suspicious activity.',
                'Use the export functionality to download response data for offline review or archival purposes.',
                'Compare the responses with your expected answer set and make notes on any questions that may need revision in future exams.',
            ],
            tips: ['Use this page to identify whether score anomalies are caused by content issues, student behavior, or system events.'],
        },
        {
            key: 'config',
            title: 'Exam Config',
            description: 'Exam Config is where you define the timing, duration, and delivery rules for the exam. Accurate configuration here ensures students receive the expected exam experience and that the system closes submissions properly.',
            steps: [
                'Enter the exam name, start date, start time, and total duration.',
                'Review how each setting affects student access and timer behavior, especially if you have timed sections or auto-submit enabled.',
                'Confirm whether auto-submit should release at the end of time or whether manual closing is needed for your workflow.',
                'Save the exam configuration and double-check that the new values appear correctly on the screen.',
                'If you need to stop the exam early, use the force end option cautiously and record the reason for the early termination.',
            ],
            tips: ['Always verify the exam schedule immediately after saving; a small time or date error can disrupt the entire exam.'],
        },
        {
            key: 'activity',
            title: 'Activity',
            description: 'The Activity page provides an audit trail of system events, configuration changes, and student actions. It is your first place to investigate when something unexpected happens.',
            steps: [
                'Open Activity to see the most recent actions taken by admins and students.',
                'Use filters or search terms to find specific events such as exam launches, student logins, or configuration updates.',
                'Review timestamps carefully to understand the order in which events occurred.',
                'If a student reports an issue, use this log to verify the exact time and type of event that occurred.',
                'Keep activity review habits as part of your standard post-exam checklist.',
            ],
            tips: ['Activity logs are also helpful for compliance and audit reporting, so keep this page in mind for incident follow-up.'],
        },
        {
            key: 'insights',
            title: 'Insights',
            description: 'Insights present data about exam performance, including score categories, section success, and top students. Use it to understand how candidates performed and where the exam may need improvement.',
            steps: [
                'Open Insights after grading is complete to review summary charts and metrics.',
                'Examine score distributions to identify whether questions were too easy or too difficult.',
                'Review section-level performance to see which exam areas students found easiest or hardest.',
                'Look at timeline metrics for submission patterns and any unusual spikes in activity.',
                'Use these findings to update future exam strategy and adjust question difficulty if needed.',
            ],
            tips: ['Insights are the best place to gather evidence before making changes to the question bank or section structure.'],
        },
        {
            key: 'reports',
            title: 'Reports',
            description: 'Reports allow you to export exam summaries, student performance data, and other audit-ready documentation. They are useful for sharing results with stakeholders and preserving records.',
            steps: [
                'Choose the report type that best matches your needs: score summaries, participation data, or item-level analytics.',
                'Set the date range and any filters needed for the report output.',
                'Generate the report and review it on screen before exporting.',
                'Export to CSV or Excel and name the file with the exam date and report type for easy retrieval.',
                'Share the exported report with administrators, teachers, or stakeholders as needed.',
            ],
            tips: ['Use consistent file naming and save reports in a shared location for future comparisons.'],
        },
        {
            key: 'users',
            title: 'Users',
            description: 'The Users page manages administrator and staff access to the portal. Here you can create accounts, assign roles, and revoke access when it is no longer needed.',
            steps: [
                'Add new users with the correct administrative role and contact details.',
                'Assign access levels that match each user’s responsibilities.',
                'Update or remove accounts if a team member leaves or no longer needs access.',
                'Reset passwords or login credentials for users who are locked out.',
                'Review the full user list periodically for any outdated or inactive accounts.',
            ],
            tips: ['Use the least-privilege principle: give users only the permissions they need.'],
        },
        {
            key: 'settings',
            title: 'Settings',
            description: 'Settings control platform-wide defaults, communication details, and user preferences. This page helps you ensure the admin portal behaves consistently with your organization’s policies.',
            steps: [
                'Review global settings and confirm that branding, notifications, and behavior defaults are correct.',
                'Update support information, contact email, and help text if these are exposed to users.',
                'Adjust any security, password, or login settings based on organizational policy.',
                'Save changes and test them immediately to make sure they are working as expected.',
                'Keep a record of settings changes so you can revert if needed later.',
            ],
            tips: ['Use consistent system-level settings across exam cycles to avoid unexpected behavior.'],
        },
        {
            key: 'tenants',
            title: 'Tenants',
            description: 'Tenants separate different organizations, schools, or client accounts in the same platform. Use this page to keep data isolated and manage resources per tenant.',
            steps: [
                'Create a new tenant when you need a separate organization, department, or client instance.',
                'Assign users, student limits, and configuration permissions to the tenant.',
                'Review tenant-level settings and ensure the organization has the correct scope of access.',
                'Use tenant isolation to prevent different groups from affecting each other’s data.',
                'If you need to audit a tenant, use this page to identify the entity and its assigned users.',
            ],
            tips: ['Tenants are useful for multi-client deployments and for keeping exam data separated across departments.'],
        },
        {
            key: 'profile',
            title: 'Profile',
            description: 'The Profile page is your personal admin account control center. Use it to update your information, change passwords, and confirm account security.',
            steps: [
                'Review and update your personal name, email, and contact details.',
                'Change your password regularly to keep the account secure.',
                'Verify the profile email for notifications and audit logging.',
                'Use profile settings for personal account changes only, not global settings.',
                'If you detect any unusual activity, update your credentials and notify support immediately.',
            ],
            tips: ['A current profile helps ensure you receive important notifications and security messages.'],
        },
        {
            key: 'demo-exam',
            title: 'Demo Exam',
            description: 'The Demo Exam page lets you run a full practice exam flow before going live. This is the safest way to verify settings, student experience, and submission behavior.',
            steps: [
                'Use a test student account to start the demo exam and confirm the full student workflow.',
                'Verify that questions render correctly and that the timer behaves as expected.',
                'Complete the demo submission and review the score and answer report for correctness.',
                'Look for any configuration issues, such as section order, timing, or answer mapping problems.',
                'Use the demo results to make final adjustments before launching the real exam.',
            ],
            tips: ['Run the demo exam with a colleague or second test account for a more realistic verification.'],
        },
        {
            key: 'help',
            title: 'Help Center',
            description: 'This page is the centralized reference hub for all admin pages. It helps you find in-depth instructions without navigating away from the help center.',
            steps: [
                'Scroll through the list of topics and click any page name to expand its detailed instructions.',
                'Use the Show All Help / Hide All Help button to reveal or collapse all sections quickly.',
                'Read the step-by-step guidance for the particular workflow you are working on.',
                'Return here whenever you need a refresher or when you want to compare processes across pages.',
                'This page is intended to replace separate help screens by gathering all administrative guidance in one place.',
            ],
            tips: ['Use the help center as your primary admin reference page during exam preparation and review.'],
        },
    ];

    const [expandedHelpTopics, setExpandedHelpTopics] = useState<Set<string>>(new Set(['help']));
    const allHelpExpanded = expandedHelpTopics.size === helpTopics.length;

    const toggleHelpTopic = (key: string) => {
        setExpandedHelpTopics((current) => {
            const next = new Set(current);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const toggleAllHelpTopics = () => {
        setExpandedHelpTopics((current) => {
            if (current.size === helpTopics.length) {
                return new Set();
            }
            return new Set(helpTopics.map((topic) => topic.key));
        });
    };

    const openModal = (state: ModalState) => setModalState(state);
    const closeModal = () => setModalState(null);

    const promptUpdateManagedAdminLimit = (adminId: string) => {
        openModal({
            type: 'updateManagedAdminLimit',
            title: 'Update Student Limit',
            message: 'Enter the new student limit for this organization admin.',
            inputLabel: 'Student Limit',
            inputValue: '',
            inputPlaceholder: 'Enter a whole number',
            targetId: adminId
        });
    };

    const promptDeleteManagedAdmin = (adminId: string) => {
        openModal({
            type: 'deleteManagedAdmin',
            title: 'Delete Organization Admin',
            message: 'This action cannot be undone. Are you sure you want to delete this organization admin?',
            targetId: adminId
        });
    };

    const promptDeleteQuestion = (question: QuestionItem) => {
        openModal({
            type: 'deleteQuestion',
            title: 'Delete Question',
            message: 'Delete this question? This action cannot be undone.',
            targetItem: question
        });
    };

    const promptDeleteStudent = (student: StudentItem) => {
        openModal({
            type: 'deleteStudent',
            title: 'Delete Student',
            message: `Delete student ${student.name}? This will remove all submissions too.`,
            targetItem: student
        });
    };

    const promptDeleteSection = (section: SectionItem) => {
        openModal({
            type: 'deleteSection',
            title: 'Delete Section',
            message: `Delete section ${section.name}? This action cannot be undone.`,
            targetItem: section
        });
    };

    const promptResetAllStudents = () => {
        openModal({
            type: 'resetAllStudents',
            title: 'Reset All Students',
            message: `Delete ALL ${students.length} students and all their submissions? This action cannot be undone.`,
        });
    };

    const openEditSectionDialog = (section: SectionItem) => {
        setSectionModalName(section.name);
        setSectionModalDescription(section.description || '');
        setSectionModalActive(section.isActive ?? true);
        openModal({
            type: 'editSection',
            title: 'Update Section Details',
            message: 'Edit the section information below and save your changes.',
            targetItem: section
        });
    };

    const handleModalConfirm = async () => {
        if (!modalState) return;

        setError('');
        setStatus('');

        try {
            switch (modalState.type) {
                case 'examPrompt': {
                    const examName = modalState.inputValue?.trim() || '';
                    if (!examName) {
                        setError('Exam name is required.');
                        return;
                    }
                    await navigator.clipboard.writeText(getHelpPromptText(examName, examPromptDifficulty));
                    setStatus(`Prompt for "${examName}" (${examPromptDifficulty}) copied to clipboard.`);
                    closeModal();
                    return;
                }
                case 'updateManagedAdminLimit': {
                    const newLimitValue = modalState.inputValue?.trim() || '';
                    const parsedLimit = parseInt(newLimitValue, 10);
                    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
                        setError('Student limit must be a whole number greater than 0.');
                        return;
                    }
                    if (!modalState.targetId) {
                        setError('No organization admin selected.');
                        return;
                    }
                    await updateManagedAdminLimit(modalState.targetId, parsedLimit);
                    closeModal();
                    return;
                }
                case 'deleteManagedAdmin': {
                    if (!modalState.targetId) {
                        setError('No organization admin selected.');
                        return;
                    }
                    await deleteManagedAdmin(modalState.targetId);
                    closeModal();
                    return;
                }
                case 'deleteQuestion': {
                    if (!modalState.targetItem) {
                        setError('No question selected.');
                        return;
                    }
                    await deleteQuestion(modalState.targetItem as QuestionItem);
                    closeModal();
                    return;
                }
                case 'deleteStudent': {
                    if (!modalState.targetItem) {
                        setError('No student selected.');
                        return;
                    }
                    await deleteStudent(modalState.targetItem as StudentItem);
                    closeModal();
                    return;
                }
                case 'deleteSection': {
                    if (!modalState.targetItem) {
                        setError('No section selected.');
                        return;
                    }
                    await deleteSection(modalState.targetItem as SectionItem);
                    closeModal();
                    return;
                }
                case 'resetAllStudents': {
                    await resetAllStudentsData();
                    closeModal();
                    return;
                }
                case 'editSection': {
                    await submitSectionEdit();
                    return;
                }
                default:
                    return;
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Action failed.');
        }
    };

    const loadManagedAdmins = async () => {
        if (adminIdentity?.role !== 'super_admin') {
            return;
        }

        try {
            const result = await api<{ data: ManagedAdminItem[] }>('/api/admin/managed-admins');
            setManagedAdmins(result.data || []);

            if (!selectedTenantAdminId && result.data?.length) {
                const storedTenantAdminId = typeof window !== 'undefined'
                    ? localStorage.getItem('selectedTenantAdminId') || ''
                    : '';

                if (storedTenantAdminId && result.data.some((item) => item._id === storedTenantAdminId)) {
                    setSelectedTenantAdminId(storedTenantAdminId);
                } else {
                    setSelectedTenantAdminId(result.data[0]._id);
                }
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load managed admins');
        }
    };

    const createTenantAdmin = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setStatus('');

        try {
            await api('/api/admin/managed-admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTenantAdminName,
                    email: newTenantAdminEmail,
                    password: newTenantAdminPassword,
                    phone: newTenantAdminPhone,
                    studentLimit: parseInt(newTenantAdminStudentLimit) || 0,
                    tenantKey: newTenantKey || undefined
                })
            });

            setNewTenantAdminName('');
            setNewTenantAdminEmail('');
            setNewTenantAdminPassword('');
            setNewTenantAdminPhone('');
            setNewTenantAdminStudentLimit('100');
            setNewTenantKey('');
            setStatus('Organization admin created successfully.');
            await loadManagedAdmins();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create organization admin');
        }
    };

    const updateManagedAdminLimit = async (adminId: string, parsedLimit: number) => {
        try {
            await api(`/api/admin/managed-admins/${adminId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentLimit: parsedLimit }),
            });
            setStatus('Student limit updated successfully.');
            await loadManagedAdmins();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to update student limit');
        }
    };

    const createExtraSuperAdmin = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setStatus('');

        try {
            await api('/api/admin/super-admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newSuperAdminName,
                    email: newSuperAdminEmail,
                    password: newSuperAdminPassword,
                    phone: newSuperAdminPhone
                })
            });

            setNewSuperAdminName('');
            setNewSuperAdminEmail('');
            setNewSuperAdminPassword('');
            setStatus('Additional super administrator created successfully.');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create super administrator');
        }
    };

    const deleteManagedAdmin = async (adminId: string) => {
        try {
            await api(`/api/admin/managed-admins/${adminId}`, { method: 'DELETE' });
            setStatus('Admin account deleted successfully.');
            await loadManagedAdmins();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to delete admin');
        }
    };

    const saveExamConfig = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setStatus('');

        if (!Number.isInteger(examDuration) || examDuration < 1 || examDuration > 600) {
            setError('Exam duration must be an integer between 1 and 600 minutes.');
            return;
        }

        if (!examinerName.trim() || examinerName.trim().length < 2) {
            setError('Examiner name must be at least 2 characters.');
            return;
        }

        try {
            const formattedStartAt = examStartAt ? new Date(examStartAt).toISOString() : null;
            const result = await api<{ data: ExamConfig }>(
                '/api/admin/exam-config',
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        durationInMinutes: examDuration,
                        examinerName: examinerName.trim(),
                        startAt: formattedStartAt,
                        autoSubmitAfterTime: examAutoSubmitAfterTime,
                        calculatorEnabled,
                        activeCalculatorType,
                    })
                }
            );

            const localStart = formatLocalDateTime(result.data?.startAt || null);
            setExamDuration(result.data?.durationInMinutes || examDuration);
            setExaminerName(result.data?.examinerName || examinerName.trim());
            setExamStartAt(localStart);
            setExamStartDate(localStart ? localStart.slice(0, 10) : '');
            setExamStartTime(localStart ? localStart.slice(11, 16) : '09:00');
            setExamAutoSubmitAfterTime(result.data?.autoSubmitAfterTime ?? true);
            setCalculatorEnabled(result.data?.calculatorEnabled ?? calculatorEnabled);
            setActiveCalculatorType(result.data?.activeCalculatorType || null);
            setExamForceEndedAt(result.data?.forceEndedAt || null);
            setExamConfigUpdatedAt(result.data?.updatedAt || '');
            setStatus('Exam configuration updated successfully.');
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to update exam duration';
            if (isMissingExamConfigRoute(message)) {
                setError('This backend deployment is missing exam configuration APIs. Redeploy the latest backend build.');
                return;
            }
            setError(message);
        }
    };

    const persistExamConfig = async (
        startAtValue: string | null,
        enabled: boolean = calculatorEnabled,
        activeType: CalculatorMode | null = activeCalculatorType,
    ) => {
        const result = await api<{ data: ExamConfig }>(
            '/api/admin/exam-config',
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    durationInMinutes: examDuration,
                    examinerName: examinerName.trim(),
                    startAt: startAtValue ? new Date(startAtValue).toISOString() : null,
                    autoSubmitAfterTime: examAutoSubmitAfterTime,
                    calculatorEnabled: enabled,
                    activeCalculatorType: activeType,
                })
            }
        );

        const localStart = formatLocalDateTime(result.data?.startAt || null);
        setExamDuration(result.data?.durationInMinutes || examDuration);
        setExaminerName(result.data?.examinerName || examinerName.trim());
        setCalculatorEnabled(result.data?.calculatorEnabled ?? enabled);
        setActiveCalculatorType(result.data?.activeCalculatorType || null);
        setCalculatorSettings((prev) => ({
            ...prev,
            enabled: result.data?.calculatorEnabled ?? enabled,
        }));
        setExamStartAt(localStart);
        setExamStartDate(localStart ? localStart.slice(0, 10) : '');
        setExamStartTime(localStart ? localStart.slice(11, 16) : '09:00');
        setExamAutoSubmitAfterTime(result.data?.autoSubmitAfterTime ?? true);
        setExamForceEndedAt(result.data?.forceEndedAt || null);
        setExamConfigUpdatedAt(result.data?.updatedAt || '');
        setStatus('Exam configuration updated successfully.');
    };

    const toggleCalculatorEnabled = async () => {
        setError('');
        setStatus('');
        const nextEnabled = !calculatorEnabled;
        setCalculatorEnabled(nextEnabled);
        setCalculatorSettings((prev) => ({ ...prev, enabled: nextEnabled }));

        try {
            await persistExamConfig(examStartAt || null, nextEnabled);
            setStatus(`Student calculator access ${nextEnabled ? 'enabled' : 'disabled'} successfully.`);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to update calculator access';
            setCalculatorEnabled(!nextEnabled);
            setCalculatorSettings((prev) => ({ ...prev, enabled: !nextEnabled }));
            setError(message);
        }
    };

    const startExamNow = async () => {
        setError('');
        setStatus('');
        const nowLocal = formatLocalDateTime(new Date().toISOString());
        setExamStartAt(nowLocal);
        setExamStartDate(nowLocal.slice(0, 10));
        setExamStartTime(nowLocal.slice(11, 16));
        setIsExamStartPickerOpen(false);

        try {
            await persistExamConfig(nowLocal);
            setStatus('Exam start time set to now and saved successfully.');
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to start exam now';
            if (isMissingExamConfigRoute(message)) {
                setError('This backend deployment is missing exam configuration APIs. Redeploy the latest backend build.');
                return;
            }
            setError(message);
        }
    };

    const endExamNow = async () => {
        setError('');
        setStatus('');

        try {
            const result = await api<{ data: { forceEndedAt?: string | null } }>(
                '/api/admin/exam-config/end',
                {
                    method: 'POST',
                }
            );

            setExamForceEndedAt(result.data?.forceEndedAt || new Date().toISOString());
            setStatus('Exam ended successfully. Active student sessions have been finalized.');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to force end the exam');
        }
    };

    const createSection = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setStatus('');

        try {
            await api('/api/admin/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: sectionName, description: sectionDescription })
            });
            setSectionName('');
            setSectionDescription('');
            setStatus('Section created successfully.');
            await loadSections();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create section');
        }
    };

    const updateSection = async (section: SectionItem) => {
        openEditSectionDialog(section);
    };

    const submitSectionEdit = async () => {
        if (!modalState?.targetItem || modalState.type !== 'editSection') {
            setError('No section selected for update.');
            return;
        }

        const section = modalState.targetItem as SectionItem;
        if (!sectionModalName.trim()) {
            setError('Section name is required.');
            return;
        }

        try {
            await api(`/api/admin/sections/${section._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: sectionModalName.trim(),
                    description: sectionModalDescription.trim(),
                    isActive: sectionModalActive
                })
            });
            setStatus('Section updated successfully.');
            await loadSections();
            setSectionModalName('');
            setSectionModalDescription('');
            setSectionModalActive(true);
            closeModal();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to update section');
        }
    };

    const deleteSection = async (section: SectionItem) => {
        try {
            await api(`/api/admin/sections/${section._id}`, { method: 'DELETE' });
            setStatus('Section deleted successfully.');
            setQuestions([]);
            await loadSections();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to delete section');
        }
    };

    const loadQuestions = async () => {
        if (!selectedSectionId) {
            setError('Select a section first.');
            return;
        }

        try {
            const result = await api<{ data: QuestionItem[] }>(`/api/admin/questions/section/${selectedSectionId}`);
            setQuestions(result.data || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load questions');
        }
    };

    const createQuestion = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setStatus('');

        if (!selectedSectionId) {
            setError('Select a section before creating a question.');
            return;
        }

        if (options.some((opt) => !opt.trim())) {
            setError('All four options are required.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('section', selectedSectionId);
            formData.append('questionText', questionText);
            options.forEach((opt) => formData.append('options', opt));
            formData.append('correctOptionIndex', String(correctOptionIndex));
            formData.append('marks', String(marks));
            if (questionImage) {
                formData.append('questionImage', questionImage);
            }

            await api('/api/admin/questions', {
                method: 'POST',
                body: formData,
            });

            setQuestionText('');
            setOptions(['', '', '', '']);
            setCorrectOptionIndex(0);
            setMarks(1);
            setQuestionImage(null);
            setStatus('Question created successfully.');
            await loadQuestions();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create question');
        }
    };

    const importQuestions = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!importQuestionFile) {
            setError('Please select an Excel file to upload.');
            return;
        }

        setError('');
        setStatus('');
        setIsImportingQuestions(true);

        try {
            const formData = new FormData();
            formData.append('questionFile', importQuestionFile);

            const result = await api<{ message: string }>('/api/admin/questions/import', {
                method: 'POST',
                body: formData,
            });

            setImportQuestionFile(null);
            setStatus(result.message || 'Questions imported from Excel successfully.');
            await loadSections();
            if (selectedSectionId) {
                await loadQuestions();
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to import questions from Excel');
        } finally {
            setIsImportingQuestions(false);
        }
    };

    const startQuestionEdit = (question: QuestionItem) => {
        const sectionId =
            typeof question.section === 'string'
                ? question.section
                : (question.section?._id || selectedSectionId);

        setEditingQuestionId(question._id);
        setEditSectionId(sectionId || selectedSectionId);
        setEditQuestionText(question.questionText || '');
        setEditOptions([...(question.options || ['', '', '', ''])].slice(0, 4));
        setEditCorrectOptionIndex(Number(question.correctOptionIndex) || 0);
        setEditMarks(Number(question.marks) || 1);
        setEditQuestionImage(null);
        setEditCurrentImageUrl(question.imageUrl || null);
        setStatus('');
        setError('');
    };

    const cancelQuestionEdit = () => {
        setEditingQuestionId(null);
        setEditSectionId('');
        setEditQuestionText('');
        setEditOptions(['', '', '', '']);
        setEditCorrectOptionIndex(0);
        setEditMarks(1);
        setEditQuestionImage(null);
        setEditCurrentImageUrl(null);
    };

    const submitQuestionUpdate = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setStatus('');

        if (!editingQuestionId) {
            setError('Select a question to edit first.');
            return;
        }

        if (!editSectionId) {
            setError('Select a section for this question.');
            return;
        }

        if (!editQuestionText.trim()) {
            setError('Question text is required.');
            return;
        }

        if (editOptions.length !== 4 || editOptions.some((opt) => !opt.trim())) {
            setError('All four options are required.');
            return;
        }

        if (!Number.isInteger(editCorrectOptionIndex) || editCorrectOptionIndex < 0 || editCorrectOptionIndex > 3) {
            setError('Correct option index must be between 0 and 3.');
            return;
        }

        if (!Number.isInteger(editMarks) || editMarks < 1) {
            setError('Marks must be at least 1.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('section', editSectionId);
            formData.append('questionText', editQuestionText.trim());
            editOptions.forEach((opt) => formData.append('options', opt.trim()));
            formData.append('correctOptionIndex', String(editCorrectOptionIndex));
            formData.append('marks', String(editMarks));
            if (editQuestionImage) {
                formData.append('questionImage', editQuestionImage);
            }

            await api(`/api/admin/questions/${editingQuestionId}`, {
                method: 'PUT',
                body: formData,
            });

            setStatus('Question updated successfully with all details.');
            setSelectedSectionId(editSectionId);
            cancelQuestionEdit();
            await loadQuestions();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to update question');
        }
    };

    const deleteQuestion = async (question: QuestionItem) => {
        try {
            await api(`/api/admin/questions/${question._id}`, { method: 'DELETE' });
            setStatus('Question deleted successfully.');
            await loadQuestions();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to delete question');
        }
    };

    const loadStudents = async () => {
        try {
            const result = await api<{ data: StudentItem[] }>('/api/admin/students');
            setStudents(result.data || []);
            setSubmissions([]);
            setSelectedStudent(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load students');
        }
    };

    const loadSubmissions = async (student: StudentItem) => {
        try {
            const result = await api<{ data: { submissions: SubmissionItem[] } }>(`/api/admin/students/${student._id}/submissions`);
            setSelectedStudent(student);
            setSubmissions(result.data?.submissions || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load submissions');
        }
    };

    const exportSelectedStudentCsv = async () => {
        if (!selectedStudent) {
            setError('Select a student first.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/admin/students/${selectedStudent._id}/submissions/export`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-organization-admin-id': selectedTenantAdminId,
                },
            });

            if (!response.ok) {
                const errBody = await response.json();
                throw new Error(errBody.message || 'Failed to export CSV');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedStudent.name.replace(/\s+/g, '-').toLowerCase()}-submissions.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            setStatus('CSV exported successfully.');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to export CSV');
        }
    };

    const exportAllDetailedCsv = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/admin/submissions/export/detailed`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-organization-admin-id': selectedTenantAdminId,
                },
            });

            if (!response.ok) {
                const errBody = await response.json();
                throw new Error(errBody.message || 'Failed to export all detailed submissions');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `all-students-detailed-submissions.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            setStatus('All students detailed CSV exported successfully.');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to export all students detailed CSV');
        }
    };

    const deleteStudent = async (student: StudentItem) => {
        setError('');

        try {
            await api(`/api/admin/students/${student._id}`, { method: 'DELETE' });
            setStatus('Student deleted successfully.');

            if (selectedStudent?._id === student._id) {
                setSelectedStudent(null);
                setSubmissions([]);
            }

            await loadStudents();
            await loadAnalytics();
            await loadRecentSubmissions();
            await loadInsights();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to delete student');
        }
    };

    const resetAllStudentsData = async () => {
        if (!students.length) {
            setStatus('No students available to reset.');
            return;
        }

        setError('');
        setStatus('Resetting all student data...');

        try {
            const result = await api<{ data: { deletedStudents: number; deletedSubmissions: number } }>(
                '/api/admin/students/reset-all',
                { method: 'DELETE' }
            );

            setSelectedStudent(null);
            setSubmissions([]);
            await loadStudents();
            await loadAnalytics();
            await loadRecentSubmissions();
            await loadInsights();

            setStatus(
                `Reset completed. Deleted ${result.data?.deletedStudents ?? 0} students and ${result.data?.deletedSubmissions ?? 0} submissions.`
            );
            return;
        } catch {
            // Fallback for older backend deployments without reset-all route.
        }

        let deletedCount = 0;
        const failedStudents: string[] = [];

        for (const student of students) {
            try {
                await api(`/api/admin/students/${student._id}`, { method: 'DELETE' });
                deletedCount += 1;
            } catch {
                failedStudents.push(student.name || student.email || student._id);
            }
        }

        await loadStudents();
        await loadAnalytics();
        await loadRecentSubmissions();
        await loadInsights();

        if (failedStudents.length === 0) {
            setSelectedStudent(null);
            setSubmissions([]);
            setStatus(`Reset completed. Deleted ${deletedCount} students. No student data remains.`);
            return;
        }

        setStatus(`Partial reset: deleted ${deletedCount} students.`);
        setError(`Could not delete ${failedStudents.length} students: ${failedStudents.join(', ')}`);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setToken('');
        setAdminIdentity(null);
        setActiveView(DEFAULT_DASHBOARD_VIEW);
        navigate('/admin/login');
    };

    useEffect(() => {
        if (mode === 'dashboard' && token) {
            const currentAdminIdentity = readAdminIdentity();
            setAdminIdentity(currentAdminIdentity);

            if (currentAdminIdentity?.role === 'super_admin') {
                loadManagedAdmins().catch(() => { });
            }

            const canLoadTenantData = currentAdminIdentity?.role !== 'super_admin' || Boolean(selectedTenantAdminId);

            if (canLoadTenantData) {
                loadSections().catch(() => { });
                loadStudents().catch(() => { });
                loadAnalytics().catch(() => { });
                loadRecentSubmissions().catch(() => { });
                loadInsights().catch(() => { });
                loadExamConfig().catch(() => { });
            }
        }
    }, [mode, token, selectedTenantAdminId]);

    const navItems: Array<{ key: DashboardView; label: string; hint: string; icon: string }> = [
        { key: 'profile', label: 'My Profile', hint: 'View your account and plan details', icon: 'user' },
        { key: 'overview', label: 'Overview', hint: 'Summary and quick actions', icon: 'overview' },
        { key: 'sections', label: 'Sections', hint: 'Create and manage exam sections', icon: 'sections' },
        { key: 'questions', label: 'Question Bank', hint: 'View and edit existing questions', icon: 'questions' },
        { key: 'add-question', label: 'Add Question', hint: 'Create new questions for the exam', icon: 'add' },
        { key: 'students', label: 'Students', hint: 'Account management and resets', icon: 'students' },
        { key: 'responses', label: 'Responses', hint: 'View student submissions and answers', icon: 'responses' },
        { key: 'config', label: 'Exam Config', hint: 'Duration and examiner setup', icon: 'settings' },
        { key: 'calculator', label: 'Calculator', hint: 'Open the admin calculator utility', icon: 'calculator' },
        { key: 'activity', label: 'Activity', hint: 'Recent submission timeline', icon: 'activity' },
        { key: 'insights', label: 'Insights', hint: 'Data charts and trends', icon: 'insights' },
        { key: 'reports', label: 'Reports', hint: 'Export center and audit-ready summaries', icon: 'reports' },
        { key: 'settings', label: 'Platform Settings', hint: 'Govern platform behavior and preferences', icon: 'settings' },
        { key: 'help', label: 'Help Center', hint: 'Usage guide and best practices', icon: 'help' }
    ];

    if (adminIdentity?.role === 'super_admin') {
        navItems.splice(7, 0, { key: 'tenants', label: 'Organization Control', hint: 'Create and switch admin organizations', icon: 'tenants' });
        navItems.push({ key: 'demo-exam', label: 'Demo Exam', hint: 'Manage and seed demo exam', icon: 'lightning' });
        navItems.push({ key: 'users', label: 'User Management', hint: 'Manage admin access and identity data', icon: 'security' });
    }

    const menuSearchKey = menuSearch.trim().toLowerCase();
    const sidebarSections: Array<{ title: string; views: DashboardView[] }> = [
        { title: 'Overview', views: ['profile', 'overview', 'activity', 'insights'] },
        { title: 'Exam Workspace', views: ['sections', 'add-question', 'questions', 'students', 'config'] },
        { title: 'Operations', views: ['reports'] },
        { title: 'Administration', views: adminIdentity?.role === 'super_admin' ? ['demo-exam', 'users', 'settings', 'tenants', 'calculator'] : ['settings', 'calculator'] },
        { title: 'Support', views: ['help'] }
    ];

    const visibleSidebarSections = sidebarSections
        .map((section) => ({
            ...section,
            views: section.views.filter((viewKey) => {
                const item = navItems.find((nav) => nav.key === viewKey);
                if (!item) {
                    return false;
                }

                if (!menuSearchKey) {
                    return true;
                }

                return (
                    item.label.toLowerCase().includes(menuSearchKey) ||
                    item.hint.toLowerCase().includes(menuSearchKey)
                );
            })
        }))
        .filter((section) => section.views.length > 0);

    const dashboardTitle: Record<DashboardView, string> = {
        'demo-exam': 'Demo Exam Management',
        overview: 'Admin Overview',
        sections: 'Section Management',
        questions: 'Question Bank',
        'add-question': 'Create New Question',
        students: 'Student Management',
        responses: 'Student Responses',
        config: 'Exam Configuration',
        calculator: 'Calculator Utility',
        activity: 'Live Activity',
        insights: 'Data Insights',
        reports: 'Reports Center',
        users: 'User Management',
        settings: 'Platform Settings',
        tenants: 'Organization Control Center',
        profile: 'Account Profile',
        help: 'Help Center'
    };

    const dashboardSubtitle: Record<DashboardView, string> = {
        'demo-exam': 'Seed or manage the demo exam for demonstration purposes.',
        overview: 'Monitor performance and jump to common admin tasks quickly.',
        sections: 'Organize section structure before adding questions.',
        questions: 'Search, review, and modify existing exam questions.',
        'add-question': 'Design and securely upload a new exam question.',
        students: 'Manage student accounts, records, and system resets.',
        responses: 'Review individual student submissions, answers, and performance.',
        config: 'Keep timing and examiner identity consistent across all exams.',
        activity: 'Track latest attempts and response trends in real time.',
        insights: 'Visualize student behavior and performance through chart-driven insights.',
        reports: 'Generate exports and leadership summaries from reliable exam data.',
        users: 'Handle admin identities, account ownership, and operational access.',
        settings: 'Apply organization-level standards for platform operations and compliance.',
        calculator: 'Open the calculator utility with all enabled modes.',
        tenants: 'Create organization admins and choose which organization dataset you are operating on.',
        profile: 'Manage your administrator account details and contact information.',
        help: 'Follow the recommended workflow for smooth exam operations.'
    };

    const bannerSectionLabel = useMemo(() => {
        if (mode === 'admin-login') return 'Terminal Login';
        if (mode === 'super-admin-login') return 'Super Admin Portal';
        return `Dashboard • ${dashboardTitle[activeView] || 'Admin'}`;
    }, [mode, activeView]);

    const bannerMessage = error ? error : status ? status : null;
    const bannerType = error ? 'error' : status ? 'success' : 'info';
    const handleBannerDismiss = () => {
        if (error) {
            setError('');
        } else if (status) {
            setStatus('');
        }
    };

    const renderDemoExamPanel = () => (
        <section style={{ maxWidth: 'min(100%, 540px)', margin: '2.5rem auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: '2.5rem 2rem', border: '1px solid #e0e7ef' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.35rem', color: '#1f4f99', marginBottom: '1.2rem' }}>Demo Exam Management</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Super admins can seed the demo exam for demonstration or testing. This will create a sample exam paper and questions for demo purposes.</p>
            <button
                type="button"
                onClick={handleDemoSeed}
                disabled={isDemoSeedLoading}
                style={{
                    background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: 12,
                    padding: '0.85rem 1.6rem',
                    fontSize: '1rem',
                    cursor: isDemoSeedLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                    marginBottom: '1.2rem',
                    transition: 'all 0.2s',
                    minWidth: 180
                }}
            >
                {isDemoSeedLoading ? 'Seeding Demo Exam…' : 'Seed Demo Exam'}
            </button>
        </section>
    );

    const responsiveGridStyle: React.CSSProperties = isMobile
        ? { display: 'flex', flexDirection: 'column', gap: '1rem' }
        : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' };

    const responsiveRowStyle: React.CSSProperties = isMobile
        ? { ...rowStyle, gridTemplateColumns: '1fr' }
        : rowStyle;

    const openView = (view: DashboardView) => {
        window.history.pushState({}, '', `/admin/dashboard/${view}`);
        setActiveView(view);
        setMode('dashboard');
        if (isMobile) {
            setIsNavMenuOpen(false);
            return;
        }

        if (!isSidebarPinned) {
            setIsSidebarHovering(false);
        }
    };

    const scoreBuckets = insights?.scoreDistribution || [];
    const sectionPerformance = insights?.sectionPerformance || [];
    const topStudents = insights?.topStudents || [];
    const timeline = insights?.timeline || [];

    const totalScoreBucketCount = scoreBuckets.reduce((sum, item) => sum + item.count, 0);
    const sectionMaxPercent = sectionPerformance.reduce((max, item) => Math.max(max, item.avgPercent), 0);
    const topStudentMaxPercent = topStudents.reduce((max, item) => Math.max(max, item.avgPercent), 0);
    const timelineMaxValue = timeline.reduce((max, item) => Math.max(max, item.submissions, item.cheatingAttempts, item.optionChanges), 0);

    const pieColors = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const pieSize = isMobile ? 140 : 170;
    const chartStartX = isMobile ? 44 : 56;
    const chartPointGap = isMobile ? 42 : 56;
    const chartMaxHeight = isMobile ? 160 : 180;
    const chartBottomY = 220;
    const timelineChartWidth = Math.max(isMobile ? 360 : 720, chartStartX + (Math.max(timeline.length - 1, 0) * chartPointGap) + 48);
    const scorePieGradient = useMemo(() => {
        if (!totalScoreBucketCount) {
            return 'conic-gradient(#e2e8f0 0deg 360deg)';
        }

        let start = 0;
        const segments = scoreBuckets.map((bucket, index) => {
            const ratio = bucket.count / totalScoreBucketCount;
            const end = start + ratio * 360;
            const segment = `${pieColors[index % pieColors.length]} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
            start = end;
            return segment;
        });

        return `conic-gradient(${segments.join(', ')})`;
    }, [scoreBuckets, totalScoreBucketCount]);

    const totalStudents = analytics?.studentsCount ?? 0;
    const avgOptionChanges = analytics?.avgOptionChanges ?? 0;
    const cheatAttemptsTotal = analytics?.totalCheatingAttempts ?? 0;
    const optionChangeTotal = analytics?.totalOptionChanges ?? 0;
    const avgCheatPerStudent = totalStudents ? cheatAttemptsTotal / totalStudents : 0;
    const avgChangesPerSubmission = analytics?.submissionsCount ? optionChangeTotal / analytics.submissionsCount : 0;
    const integrityHealth = totalStudents ? Math.max(0, Math.min(100, Math.round((1 - cheatAttemptsTotal / Math.max(totalStudents * 3, 1)) * 100))) : 96;
    const integrityTone = integrityHealth >= 80 ? '#16a34a' : integrityHealth >= 60 ? '#f59e0b' : '#dc2626';
    const riskIndex = Math.min(100, Math.round(Math.max(0, avgCheatPerStudent * 8 + avgChangesPerSubmission * 4 + (100 - integrityHealth) * 0.18)));
    const studentReviewIntensity = avgOptionChanges >= 6 ? 'High review activity' : avgOptionChanges >= 3 ? 'Moderate review activity' : 'Low review activity';
    const topRiskDays = timeline.slice().sort((a: InsightsTimelineItem, b: InsightsTimelineItem) => b.cheatingAttempts - a.cheatingAttempts).slice(0, 3);
    const topOptionChangeDays = timeline.slice().sort((a: InsightsTimelineItem, b: InsightsTimelineItem) => b.optionChanges - a.optionChanges).slice(0, 3);
    const scoreTotal = scoreBuckets.reduce((sum, item) => sum + item.count, 0);

    const latestTimelinePoint = timeline.length ? timeline[timeline.length - 1] : { submissions: 0, cheatingAttempts: 0, optionChanges: 0, terminations: 0 };
    const priorTimelinePoint = timeline.length > 1 ? timeline[timeline.length - 2] : latestTimelinePoint;
    const cheatingTrend = latestTimelinePoint.cheatingAttempts > priorTimelinePoint.cheatingAttempts ? 'increasing' : latestTimelinePoint.cheatingAttempts < priorTimelinePoint.cheatingAttempts ? 'decreasing' : 'steady';
    const lowPerformingSections = sectionPerformance.slice().sort((a, b) => a.avgPercent - b.avgPercent).slice(0, 3);
    const lowSectionNames = lowPerformingSections.map((item) => item.sectionName).join(', ') || 'No section data yet';
    const activeSuspicionEvents = recentSubmissions.filter((item) => item.cheatingAttempts > 0);
    const suspiciousStudentCount = activeSuspicionEvents.length;
    const highReviewStudents = recentSubmissions.filter((item) => item.totalOptionChanges > 5);
    const topFlaggedStudents = activeSuspicionEvents
        .slice()
        .sort((a, b) => b.cheatingAttempts - a.cheatingAttempts || b.totalOptionChanges - a.totalOptionChanges)
        .slice(0, 3);

    const renderSidebarContent = (compact = false) => (
        <div style={{ display: 'grid', gap: '0.7rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={BRAND_LOGO_URL} alt={`${BRAND_NAME} logo`} style={{ height: compact ? '34px' : '40px', width: 'auto', objectFit: 'contain' }} />
                <div>
                    <div style={{ fontWeight: 800, color: '#13366c' }}>{BRAND_NAME}</div>
                    <div style={{ ...mutedStyle, fontSize: '0.74rem' }}>Admin Panel</div>
                </div>
            </div>

            {!compact && !isMobile && (
                <div style={{ ...itemStyle, marginBottom: 0, padding: '0.5rem 0.6rem', background: '#f7fbff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.76rem', color: '#365b8e', fontWeight: 700 }}>
                            {isSidebarPinned ? 'Sidebar pinned' : 'Auto-hide sidebar'}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsSidebarPinned((prev) => !prev)}
                            style={{
                                ...secondaryBtnStyle,
                                width: 'auto',
                                marginTop: 0,
                                padding: '0.35rem 0.65rem',
                                borderRadius: '999px',
                                fontSize: '0.72rem'
                            }}
                        >
                            {isSidebarPinned ? 'Unpin' : 'Pin'}
                        </button>
                    </div>
                    <div style={{ marginTop: '0.35rem', fontSize: '0.72rem', color: '#5c759f' }}>
                        Hover the left edge to open when unpinned.
                    </div>
                </div>
            )}

            <input
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search menu"
                style={{ ...inputStyle, margin: 0, background: '#f8fbff' }}
            />

            {!compact && (
                <div style={{ ...itemStyle, marginBottom: 0, padding: '0.65rem 0.75rem', border: '1px solid #d8e5f8', background: '#f8fbff' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#1b4f95', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', borderBottom: '1px solid #e2eefc', paddingBottom: '0.3rem' }}>
                        Workspace Status
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(50px, auto) 1fr', gap: '8px', lineHeight: '1.4' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Role:</span>
                        <span style={{ fontSize: '0.74rem', color: '#13366c', fontWeight: 800 }}>{adminIdentity?.role === 'super_admin' ? 'Super Admin' : 'Org Admin'}</span>

                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>View:</span>
                        <span style={{ fontSize: '0.74rem', color: '#3b82f6', fontWeight: 800 }}>{dashboardTitle[activeView]}</span>

                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Context:</span>
                        <span style={{ fontSize: '0.74rem', color: '#13366c', fontWeight: 700 }}>
                            {selectedTenantAdminId ? 'Organization' : (adminIdentity?.role === 'super_admin' ? 'Global' : 'Internal')}
                        </span>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gap: '0.65rem' }}>
                {visibleSidebarSections.map((section) => (
                    <div key={section.title}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.4px', color: '#3f6fb2', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                            {section.title}
                        </div>
                        <div style={{ display: 'grid', gap: '0.35rem' }}>
                            {section.views.map((viewKey) => {
                                const item = navItems.find((nav) => nav.key === viewKey);
                                if (!item) return null;

                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => openView(item.key)}
                                        style={{
                                            border: 'none',
                                            width: '100%',
                                            marginTop: 0,
                                            textAlign: 'left',
                                            padding: compact ? '0.6rem 0.6rem' : (isMobile ? '0.9rem 1rem' : '0.65rem 0.85rem'),
                                            borderRadius: '10px',
                                            background: activeView === item.key
                                                ? 'linear-gradient(90deg, #edf5ff 0%, #ffffff 100%)'
                                                : 'transparent',
                                            color: activeView === item.key ? '#1b4f95' : '#475569',
                                            borderLeft: activeView === item.key ? '4px solid #2a70dd' : '4px solid transparent',
                                            cursor: 'pointer',
                                            transition: 'all 200ms ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            boxShadow: activeView === item.key ? '0 4px 12px rgba(42,112,221,0.08)' : 'none'
                                        }}
                                    >
                                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon name={item.icon} color={activeView === item.key ? '#2a70dd' : '#64748b'} size={20} />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 800, fontSize: isMobile ? '1rem' : '0.88rem', color: activeView === item.key ? '#1b4f95' : '#1e293b' }}>{item.label}</div>
                                            {!compact && <div style={{ fontSize: '0.7rem', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.hint}</div>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={logout} style={{ ...dangerBtnStyle, marginTop: '0.3rem', borderRadius: '10px' }}>
                Logout
            </button>

        </div>
    );

    // ── Login page full-screen branded styles (WHITE + DYNAMIC CRYSTAL BLUE) ──
    const authShellStyle: React.CSSProperties = {
        minHeight: '100vh',
        width: '100%',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        position: 'relative',
        overflow: 'hidden'
    };

    // Ghosted Logo Pattern Background
    const logoPatternStyle: React.CSSProperties = {
        position: 'absolute', inset: 0,
        backgroundImage: `url(${BRAND_LOGO_URL})`,
        backgroundSize: '180px',
        backgroundRepeat: 'repeat',
        opacity: 0.015,
        filter: 'grayscale(1)',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'inc-bg-pattern-drift 120s linear infinite'
    };

    // soft background effects
    const bgMeshStyle: React.CSSProperties = {
        position: 'absolute', inset: 0,
        background: `
            radial-gradient(at 0% 0%, rgba(0,153,255,0.12) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(0,212,255,0.08) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(0,153,255,0.12) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(0,212,255,0.08) 0px, transparent 50%),
            radial-gradient(at 50% 50%, rgba(255,255,255,0.8) 0px, transparent 100%)
        `,
        filter: 'blur(60px)',
        zIndex: 0,
        animation: 'inc-bg-shift 15s ease-in-out infinite alternate'
    };

    const orb1: React.CSSProperties = {
        position: 'absolute', top: '-10%', left: '-5%',
        width: 'max(40vw, 500px)', height: 'max(40vw, 500px)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,170,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'inc-float-subtle 20s infinite'
    };
    const orb2: React.CSSProperties = {
        position: 'absolute', bottom: '-5%', right: '-5%',
        width: 'max(35vw, 400px)', height: 'max(35vw, 400px)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,140,240,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'inc-float-subtle 25s infinite reverse'
    };

    const authLayoutStyle: React.CSSProperties = {
        width: '100%',
        flex: 1,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr minmax(460px, 540px)',
        gap: 0,
        alignItems: 'stretch',
        position: 'relative',
        zIndex: 1
    };

    // Left showcase: pure white/very light
    const authShowcaseStyle: React.CSSProperties = {
        padding: isMobile ? '2rem 1.2rem' : 'clamp(2rem,4vw,4rem) clamp(2rem,5vw,5rem)',
        color: '#0f2b52',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '2rem',
        minHeight: isMobile ? '240px' : 'auto',
        position: 'relative',
        background: 'transparent'
    };

    // Right card: crisp white
    const authCardStyle: React.CSSProperties = {
        background: '#ffffff',
        borderLeft: '1px solid rgba(0,140,255,0.12)',
        boxShadow: '-8px 0 48px rgba(0,100,200,0.08)',
        padding: isMobile ? '2rem 1.4rem' : 'clamp(2rem,4vw,3.5rem) clamp(1.5rem,4vw,3rem)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '0.6rem',
        minHeight: isMobile ? 'auto' : '100vh'
    };

    const isDesktopSidebarVisible = !isMobile && (isSidebarPinned || isSidebarHovering);

    if (mode === 'admin-login') {
        return (
            <div style={authShellStyle}>
                <div style={bgMeshStyle} />
                <div style={logoPatternStyle} />
                <div style={orb1} />
                <div style={orb2} />

                <style>{`
                    @keyframes inc-bg-pattern-drift {
                        from { background-position: 0 0; }
                        to { background-position: 1000px 1000px; }
                    }
                    @keyframes inc-bg-shift {
                        0% { transform: scale(1) translate(0, 0); }
                        100% { transform: scale(1.1) translate(20px, 10px); }
                    }
                    @keyframes inc-float-subtle {
                        0%, 100% { transform: translate(0, 0); }
                        50% { transform: translate(20px, -20px); }
                    }
                    @keyframes inc-crystal-float {
                        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                        20% { opacity: 0.6; }
                        80% { opacity: 0.6; }
                        100% { transform: translateY(-300px) rotate(360deg); opacity: 0; }
                    }
                    @keyframes inc-float {
                        0%,100% { transform: translateY(0px) rotate(0deg); }
                        50%      { transform: translateY(-25px) rotate(2deg); }
                    }
                    @keyframes inc-punch-pop {
                        0% { transform: scale(0.9); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes inc-breathe {
                        0%,100% { box-shadow: 0 0 0 0 rgba(0,140,255,0.10), 0 20px 60px rgba(0,100,200,0.1); }
                        50%     { box-shadow: 0 0 0 25px rgba(0,140,255,0.05), 0 30px 80px rgba(0,100,200,0.15); }
                    }
                    @keyframes inc-ring-spin-fast {
                        from { transform: rotate(0deg) scale(1); }
                        50%  { transform: rotate(180deg) scale(1.05); }
                        to   { transform: rotate(360deg) scale(1); }
                    }
                    @keyframes inc-shimmer-sweep {
                        0%   { transform: translateX(-150%) skewX(-20deg); }
                        100% { transform: translateX(450%) skewX(-20deg); }
                    }
                    @keyframes inc-brand-glow {
                        0%,100% { opacity: 0.95; filter: drop-shadow(0 0 2px rgba(0,153,255,0.4)); background-position: 0% 50%; }
                        50%     { opacity: 1; filter: drop-shadow(0 0 8px rgba(0,153,255,0.6)); background-position: 100% 50%; }
                    }
                    @keyframes inc-scroll-line {
                        0% { height: 0; top: 0; }
                        50% { height: 100px; top: 0; }
                        100% { height: 0; top: 100px; }
                    }
                    .inc-card-input {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .inc-card-input:focus {
                        transform: scale(1.01);
                        border-color: #0099ff !important;
                        box-shadow: 0 4px 12px rgba(0,153,255,0.1) !important;
                    }
                    .inc-primary-btn {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .inc-primary-btn:hover {
                        transform: scale(1.02) translateY(-2px);
                        box-shadow: 0 10px 25px rgba(0,120,220,0.35) !important;
                    }
                `}</style>
                <NotificationBanner
                    message={bannerMessage}
                    type={bannerType}
                    sectionLabel={bannerSectionLabel}
                    onDismiss={handleBannerDismiss}
                />

                {/* Navbar */}
                <div style={{
                    position: 'relative', zIndex: 10,
                    padding: 'clamp(12px, 1.5vw, 18px) clamp(20px, 3vw, 40px)',
                    borderBottom: '1px solid rgba(0,140,255,0.1)',
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img src={BRAND_LOGO_URL} alt="logo" style={{
                            height: 'clamp(32px, 4vw, 42px)', width: 'auto',
                            filter: 'drop-shadow(0 4px 8px rgba(0,120,220,0.2))'
                        }} />
                        <div>
                            <div style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', fontWeight: 900, color: '#0f2b52' }}>
                                {BRAND_NAME}
                                <span style={{
                                    marginLeft: '10px', fontSize: '10px',
                                    background: 'linear-gradient(90deg,#0099ff,#00d4ff)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    fontWeight: 800, textTransform: 'uppercase'
                                }}>Admin</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#4a90c4', fontWeight: 600 }}>{BRAND_MOTTO}</div>
                        </div>
                    </div>
                </div>

                <div style={{ ...authLayoutStyle, flex: 1 }}>
                    <section style={authShowcaseStyle}>
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            gap: 'clamp(2rem, 5vh, 4rem)', zIndex: 2
                        }}>
                            {/* RE-DESIGNED BIG LOGO STAGE */}
                            <div style={{ position: 'relative' }}>
                                {/* Floating mini logos around the main one */}
                                {!isMobile && [0, 72, 144, 216, 288].map((deg) => (
                                    <div key={deg} style={{
                                        position: 'absolute', top: '50%', left: '50%',
                                        width: '40px', height: '40px',
                                        margin: '-20px',
                                        transform: `rotate(${deg}deg) translateY(-220px) rotate(-${deg}deg)`,
                                        opacity: 0.15,
                                        zIndex: -1
                                    }}>
                                        <img src={BRAND_LOGO_URL} alt="Mini brand logo" style={{ width: '100%', height: 'auto' }} />
                                    </div>
                                ))}

                                {/* Multi-layered Rings */}
                                <div style={{
                                    position: 'absolute', inset: '-80px', borderRadius: '50%',
                                    border: '1.5px solid rgba(0,153,255,0.08)',
                                    animation: 'inc-ring-spin-fast 40s linear infinite'
                                }} />
                                <div style={{
                                    position: 'absolute', inset: '-50px', borderRadius: '50%',
                                    border: '1px dashed rgba(0,153,255,0.12)',
                                    animation: 'inc-ring-spin-fast 20s linear infinite reverse'
                                }} />

                                <div style={{
                                    position: 'relative',
                                    width: 'clamp(280px, 35vw, 480px)',
                                    height: 'clamp(280px, 35vw, 480px)',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f0faff 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 40px 100px rgba(0,100,200,0.15), inset 0 2px 10px rgba(255,255,255,0.8)',
                                    border: '2px solid rgba(0,153,255,0.18)',
                                    animation: 'inc-float 6s ease-in-out infinite, inc-breathe 6s ease-in-out infinite',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                                        animation: 'inc-shimmer-sweep 4.5s ease-in-out infinite'
                                    }} />
                                    <img src={BRAND_LOGO_URL} alt="Hero Logo" style={{
                                        width: '72%', height: 'auto',
                                        filter: 'drop-shadow(0 20px 40px rgba(0,120,220,0.3))'
                                    }} />
                                </div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: 'clamp(3rem, 6vw, 6rem)',
                                    fontWeight: 1000,
                                    letterSpacing: '-2px',
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '2px',
                                    position: 'relative'
                                }}>
                                    {/* Google-style Multi-color brand title */}
                                    <span style={{
                                        background: 'linear-gradient(135deg, #4285F4 0%, #EA4335 30%, #FBBC05 60%, #34A853 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        animation: 'inc-brand-glow 8s infinite alternate',
                                        backgroundSize: '300% auto'
                                    }}>
                                        {BRAND_NAME}
                                    </span>

                                    {/* Shine overlay */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)',
                                        backgroundSize: '200% 100%',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        pointerEvents: 'none',
                                        animation: 'inc-shimmer-sweep 5s infinite'
                                    }}>
                                        {BRAND_NAME}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: 'clamp(0.9rem, 1.4vw, 1.3rem)', fontWeight: 800,
                                    color: '#2d5a8a', letterSpacing: '8px', textTransform: 'uppercase',
                                    marginTop: '15px', opacity: 0.9, textAlign: 'center',
                                    background: 'linear-gradient(90deg, #4285F4, #34A853)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                }}>{BRAND_MOTTO}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem', width: '100%', maxWidth: 900, marginBottom: '3rem' }}>
                            {[
                                { t: 'Secure Access', d: `Authorized ${BRAND_NAME} entry only` },
                                { t: 'Live Sync', d: 'Real-time organization metrics' },
                                { t: 'Enterprise Scale', d: `Powered by ${BRAND_NAME} Core` }
                            ].map((feat, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.4)',
                                    padding: '1rem', borderRadius: '16px',
                                    border: '1px solid rgba(0,153,255,0.1)',
                                    textAlign: 'center',
                                    animation: 'inc-punch-pop 0.8s ease both',
                                    animationDelay: `${1.2 + i * 0.15}s`
                                }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0f2b52', marginBottom: '4px' }}>{feat.t}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b8db5', fontWeight: 600 }}>{feat.d}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section style={authCardStyle}>
                        <div style={{
                            background: 'rgba(255,255,255,0.85)',
                            backdropFilter: 'blur(30px)',
                            padding: 'clamp(2.5rem, 6vw, 4rem)',
                            borderRadius: '40px',
                            border: '1px solid rgba(0,140,255,0.12)',
                            boxShadow: '0 30px 70px rgba(0,80,180,0.1)',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            {/* Small watermark logo in corner of card */}
                            <img src={BRAND_LOGO_URL} alt="logo watermark" style={{
                                position: 'absolute', top: '20px', right: '20px',
                                width: '32px', opacity: 0.2, filter: 'grayscale(1)'
                            }} />

                            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                                    <img src={BRAND_LOGO_URL} alt="card logo" style={{ height: '36px' }} />
                                    <span style={{
                                        fontSize: '1.4rem',
                                        fontWeight: 1000,
                                        letterSpacing: '0.5px',
                                        background: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>{BRAND_NAME}</span>
                                </div>
                                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f2b52', margin: 0, letterSpacing: '-0.5px' }}>Terminal Login</h2>
                                <p style={{ color: '#4a90c4', marginTop: '10px', fontSize: '1rem', fontWeight: 600 }}>Secure Administrative Portal</p>
                            </div>

                            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#2d5a8a', marginBottom: '8px' }}>Email Address</label>
                                    <input
                                        className="inc-card-input"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        type="email" required placeholder="name@indocreonix.com"
                                        style={loginInputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#2d5a8a', marginBottom: '8px' }}>Password</label>
                                    <input
                                        className="inc-card-input"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        type="password" required placeholder="••••••••"
                                        style={loginInputStyle}
                                    />
                                </div>
                                <button type="submit" className="inc-primary-btn" style={loginPrimaryBtnStyle}>Sign In <Icon name="arrow-right" size={18} /> </button>
                            </form>

                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <button type="button" className="inc-secondary-btn" onClick={() => navigate('/admin/super-admin/login')} style={loginSecondaryBtnStyle}>
                                    Super Admin Portal
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                <div style={{
                    position: 'relative', zIndex: 10,
                    padding: '15px 40px',
                    textAlign: 'center',
                    borderTop: '1px solid rgba(0,140,255,0.05)',
                    background: 'rgba(255,255,255,0.5)'
                }}>
                    <span style={{ fontSize: '12px', color: '#8aabb5', fontWeight: 600 }}>© 2026 {BRAND_NAME} Enterprise Solution</span>
                </div>
            </div>
        );
    }

    if (mode === 'super-admin-login') {
        return (
            <div style={{ ...authShellStyle, background: '#f8f9ff' }}>
                <div style={bgMeshStyle} />
                <div style={orb1} />
                <div style={orb2} />

                <style>{`
                    @keyframes inc-bg-shift { 0% { transform: scale(1); } 100% { transform: scale(1.05); } }
                    @keyframes inc-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                    @keyframes inc-shimmer-sweep { 0% { transform: translateX(-150%); } 100% { transform: translateX(450%); } }
                `}</style>
                <NotificationBanner
                    message={bannerMessage}
                    type={bannerType}
                    sectionLabel={bannerSectionLabel}
                    onDismiss={handleBannerDismiss}
                />

                <div style={{
                    position: 'relative', zIndex: 10,
                    padding: 'clamp(12px, 1.5vw, 18px) clamp(20px, 3vw, 40px)',
                    borderBottom: '1px solid rgba(0,80,200,0.1)',
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img src={BRAND_LOGO_URL} alt="logo" style={{ height: 'clamp(32px, 4vw, 42px)', width: 'auto' }} />
                        <div style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', fontWeight: 900, color: '#0f2b52' }}>
                            {BRAND_NAME} <span style={{ color: '#0055cc', fontSize: '10px', fontWeight: 800 }}>SUPER ADMIN</span>
                        </div>
                    </div>
                </div>

                <div style={{ ...authLayoutStyle, flex: 1 }}>
                    <section style={authShowcaseStyle}>
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: '2rem'
                        }}>
                            <div style={{
                                width: 'clamp(200px, 25vw, 380px)',
                                height: 'clamp(200px, 25vw, 380px)',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ffffff, #eaf4ff)',
                                border: '1px solid rgba(0,80,200,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 25px 50px rgba(0,80,200,0.1)',
                                animation: 'inc-float 6s ease-in-out infinite',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                <img src={BRAND_LOGO_URL} alt="Hero" style={{ width: '65%', height: 'auto', filter: 'drop-shadow(0 10px 20px rgba(0,80,200,0.2))' }} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 950, color: '#003a99' }}>{BRAND_NAME}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4a80b5', letterSpacing: '3px', textTransform: 'uppercase' }}>Command Console</div>
                            </div>
                        </div>
                    </section>

                    <section style={authCardStyle}>
                        <div style={{
                            background: '#ffffff',
                            padding: 'clamp(2rem, 5vw, 3.5rem)',
                            borderRadius: '30px',
                            border: '1px solid rgba(0,80,200,0.1)',
                            boxShadow: '0 15px 40px rgba(0,80,200,0.05)'
                        }}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0a2045' }}>Super Access</h2>
                                <p style={{ color: '#5a80aa' }}>Restricted command center entry</p>
                            </div>
                            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input className="inc-card-input" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} type="email" required placeholder="superadmin@indocreonix.com" style={loginInputStyle} />
                                <input className="inc-card-input" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} type="password" required placeholder="••••••••" style={loginInputStyle} />
                                <button type="submit" className="inc-primary-btn" style={{ ...loginPrimaryBtnStyle, background: '#0055cc' }}>Command Access <Icon name="arrow-right" size={18} /> </button>
                            </form>
                            <button type="button" className="inc-secondary-btn" onClick={() => navigate('/admin/login')} style={{ ...loginSecondaryBtnStyle, marginTop: '1.5rem' }}>Back to Admin</button>
                        </div>
                    </section>
                </div>

                <div style={{ padding: '15px 40px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#8aaabf', fontWeight: 600 }}>Super Admin Restricted Area</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <BrandSignature
                showMenuButton={true}
                isMenuOpen={isMobile ? isNavMenuOpen : isSidebarPinned}
                onMenuToggle={() => {
                    if (isMobile) {
                        setIsNavMenuOpen((prev) => !prev);
                    } else {
                        setIsSidebarPinned((prev) => !prev);
                    }
                }}
            />
            <NotificationBanner
                message={bannerMessage}
                type={bannerType}
                sectionLabel={bannerSectionLabel}
                onDismiss={handleBannerDismiss}
            />
            <div style={{ ...pageStyle, alignItems: 'stretch', paddingTop: '0.2rem' }}>
                {isMobile && isNavMenuOpen && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 40,
                            background: 'rgba(8, 23, 48, 0.45)',
                            backdropFilter: 'blur(2px)'
                        }}
                        onClick={() => setIsNavMenuOpen(false)}
                    >
                        <aside
                            style={{
                                position: 'absolute',
                                top: '68px',
                                left: 0,
                                width: '84%',
                                maxWidth: '320px',
                                height: 'calc(100% - 68px)',
                                background: '#ffffff',
                                borderRight: '1px solid #e2e8f0',
                                boxShadow: '10px 0 28px rgba(17, 45, 92, 0.24)',
                                padding: '1.25rem',
                                overflowY: 'auto'
                            }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            {renderSidebarContent(true)}
                        </aside>
                    </div>
                )}

                {!isMobile && !isDesktopSidebarVisible && (
                    <div
                        onMouseEnter={() => setIsSidebarHovering(true)}
                        style={{
                            position: 'fixed',
                            top: '72px',
                            left: 0,
                            bottom: '0.3rem',
                            width: '14px',
                            zIndex: 50,
                            background: 'transparent',
                            boxShadow: 'none',
                            cursor: 'pointer'
                        }}
                        aria-hidden="true"
                    />
                )}

                {!isMobile && (
                    <aside
                        onMouseEnter={() => setIsSidebarHovering(true)}
                        onMouseLeave={() => {
                            if (!isSidebarPinned) {
                                setIsSidebarHovering(false);
                            }
                        }}
                        style={{
                            ...cardStyle,
                            width: `${desktopSidebarWidth}px`,
                            background: 'linear-gradient(180deg, #ffe8d6 0%, #fff7f0 100%)',
                            border: '1px solid #e9c7af',
                            boxShadow: '0 14px 32px rgba(115, 72, 32, 0.2)',
                            position: 'fixed',
                            top: '68px',
                            left: 0,
                            bottom: '0.3rem',
                            overflowY: 'auto',
                            zIndex: 60,
                            transform: isDesktopSidebarVisible ? 'translateX(0)' : 'translateX(-104%)',
                            transition: isResizing ? 'none' : 'transform 220ms ease, width 220ms ease'
                        }}
                    >
                        {renderSidebarContent()}
                        <div
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setIsResizing(true);
                            }}
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                bottom: 0,
                                width: '8px',
                                cursor: 'col-resize',
                                zIndex: 70,
                                background: isResizing ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                transition: 'background 0.2s'
                            }}
                        />
                    </aside>
                )}

                <div
                    style={{
                        width: '100%',
                        margin: '0.2rem 0 0',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr)',
                        gap: '0.6rem',
                        alignItems: 'stretch',
                        minHeight: 'auto',
                        paddingLeft: isMobile ? 0 : (isDesktopSidebarVisible ? `${desktopSidebarWidth + 8}px` : 0),
                        transition: isResizing ? 'none' : 'padding-left 220ms ease'
                    }}
                >
                    <main style={{ width: '100%', display: 'grid', gap: '0.6rem' }}>
                        <section
                            style={{
                                ...cardStyle,
                                position: 'relative',
                                background: 'linear-gradient(90deg, rgba(243,247,255,0.95), rgba(255,244,242,0.95))',
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '0.75rem',
                                alignItems: 'flex-start',
                                flexWrap: 'wrap',
                                paddingRight: '1rem'
                            }}
                        >
                            <div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '0.72rem', border: '1px solid #9bc0f4', background: '#e8f1ff', color: '#2d6dd3', borderRadius: '999px', padding: '0.22rem 0.6rem', fontWeight: 700 }}>Dashboard</span>
                                    <span style={{ fontSize: '0.72rem', border: '1px solid #f0c6bf', background: '#fff1ef', color: '#d94f43', borderRadius: '999px', padding: '0.22rem 0.6rem', fontWeight: 700 }}>Analytics</span>
                                    <span style={{ fontSize: '0.72rem', border: '1px solid #bde0c3', background: '#ecfff0', color: '#2e8f4c', borderRadius: '999px', padding: '0.22rem 0.6rem', fontWeight: 700 }}>Audit Logs</span>
                                </div>
                                <h2 style={{ margin: 0, color: '#193c73' }}>{dashboardTitle[activeView]}</h2>
                                <p style={{ ...mutedStyle, marginTop: '0.2rem' }}>{dashboardSubtitle[activeView]}</p>
                            </div>

                            <div style={{
                                display: isMobile ? 'grid' : 'flex',
                                gap: '0.55rem',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(120px, 1fr))' : undefined
                            }}>
                                {!isMobile && (
                                    <button
                                        onClick={() => {
                                            setIsSidebarPinned((prev) => !prev);
                                            setIsSidebarHovering(true);
                                        }}
                                        style={{ ...secondaryBtnStyle, width: 'auto', marginTop: 0, padding: '0.55rem 0.9rem', borderRadius: '999px' }}
                                    >
                                        {isSidebarPinned ? 'Unpin Menu' : 'Pin Menu'}
                                    </button>
                                )}
                                <select
                                    value={activeView}
                                    onChange={(e) => openView(e.target.value as DashboardView)}
                                    style={{ ...inputStyle, width: isMobile ? '100%' : '220px', margin: 0 }}
                                >
                                    {navItems.map((item) => (
                                        <option key={item.key} value={item.key}>{item.label}</option>
                                    ))}
                                </select>

                                {adminIdentity?.role === 'super_admin' && (
                                    <select
                                        value={selectedTenantAdminId}
                                        onChange={(e) => setSelectedTenantAdminId(e.target.value)}
                                        style={{ ...inputStyle, width: isMobile ? '100%' : '260px', margin: 0 }}
                                    >
                                        <option value="">Select organization admin context</option>
                                        {managedAdmins.map((item) => (
                                            <option key={item._id} value={item._id}>
                                                {item.name} ({item.tenantKey})
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <button
                                    onClick={() => {
                                        loadAnalytics();
                                        loadRecentSubmissions();
                                        loadInsights();
                                        loadSections();
                                        loadStudents();
                                    }}
                                    disabled={adminIdentity?.role === 'super_admin' && !selectedTenantAdminId}
                                    style={{ ...secondaryBtnStyle, width: 'auto', marginTop: 0, padding: '0.55rem 0.9rem', borderRadius: '999px' }}
                                >
                                    Refresh
                                </button>
                                <button onClick={() => openView('help')} style={{ ...secondaryBtnStyle, width: 'auto', marginTop: 0, padding: '0.55rem 0.9rem', borderRadius: '999px' }}>
                                    Open Help
                                </button>
                                {activeView === 'responses' && (
                                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <button
                                            onClick={() => openView('students')}
                                            style={{ ...secondaryBtnStyle, width: 'auto', marginTop: 0, padding: '0.45rem 0.9rem', fontSize: '0.84rem', minWidth: 'fit-content' }}
                                        >
                                            <Icon name="arrow-left" size={14} /> Back to Students
                                        </button>
                                        <button
                                            onClick={exportSelectedStudentCsv}
                                            style={{ ...secondaryBtnStyle, width: 'auto', marginTop: 0, padding: '0.45rem 0.9rem', fontSize: '0.84rem', minWidth: 'fit-content' }}
                                        >
                                            <Icon name="download" size={14} /> Export Submissions CSV
                                        </button>
                                    </div>
                                )}
                                <span style={{ fontSize: '0.76rem', background: '#fff', border: '1px solid #d8e3f5', borderRadius: '999px', padding: '0.4rem 0.7rem', color: '#355887', fontWeight: 700 }}>
                                    {adminIdentity?.name || 'Admin'}
                                </span>
                                <span style={{ fontSize: '0.76rem', background: '#edf6ff', border: '1px solid #bcd4f6', borderRadius: '999px', padding: '0.4rem 0.7rem', color: '#2f5f9d', fontWeight: 700 }}>
                                    Session Active
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                style={{
                                    display: isMobile ? 'none' : 'inline-flex',
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    width: 'auto',
                                    marginTop: 0,
                                    padding: '0.75rem 1.1rem',
                                    borderRadius: '999px',
                                    minWidth: '110px',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    background: '#c03535',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    zIndex: 5,
                                    boxShadow: '0 8px 24px rgba(192,53,53,0.18)',
                                    transition: 'transform 180ms ease, box-shadow 180ms ease'
                                }}
                            >
                                Logout
                            </button>
                        </section>

                        {activeView === 'overview' && (
                            <>
                                <div style={responsiveGridStyle}>
                                    <section style={cardStyle}>
                                        <h3 style={{ marginTop: 0 }}>Snapshot</h3>
                                        <p style={{ ...mutedStyle, marginTop: '-0.25rem' }}>{BRAND_NAME} live telemetry</p>
                                        <p style={mutedStyle}>Students: <strong>{analytics?.studentsCount ?? 0}</strong></p>
                                        <p style={mutedStyle}>Sections: <strong>{analytics?.sectionsCount ?? 0}</strong></p>
                                        <p style={mutedStyle}>Questions: <strong>{analytics?.questionsCount ?? 0}</strong></p>
                                        <p style={mutedStyle}>Submissions: <strong>{analytics?.submissionsCount ?? 0}</strong></p>
                                        <p style={mutedStyle}>Average Score: <strong>{analytics?.averagePercent ?? 0}%</strong></p>
                                        <p style={mutedStyle}>Cheating Terminations: <strong>{analytics?.cheatingTerminations ?? 0}</strong></p>
                                        <p style={mutedStyle}>Total Cheating Attempts: <strong>{analytics?.totalCheatingAttempts ?? 0}</strong></p>
                                        <p style={mutedStyle}>Option Changes Logged: <strong>{analytics?.totalOptionChanges ?? 0}</strong></p>
                                    </section>

                                    <section style={cardStyle}>
                                        <h3 style={{ marginTop: 0 }}>Exam Safety Summary</h3>
                                        <div style={{ display: 'grid', gap: '0.85rem', marginTop: '1rem' }}>
                                            <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f3c79' }}>Students Live Now</div>
                                                <div style={{ marginTop: '0.65rem', fontSize: '1.75rem', fontWeight: 900, color: '#2563eb' }}>{analytics?.activeSessionCount ?? 0}</div>
                                                <p style={{ ...mutedStyle, marginTop: '0.45rem' }}>Active exam sessions currently in progress.</p>
                                            </div>
                                            <div style={{ padding: '1rem', borderRadius: '18px', background: '#fff1f2', border: '1px solid #fee2e2' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#9f1239' }}>Eliminated by Cheating</div>
                                                <div style={{ marginTop: '0.65rem', fontSize: '1.75rem', fontWeight: 900, color: '#be123c' }}>{analytics?.eliminatedDueToCheating ?? 0}</div>
                                                <p style={{ ...mutedStyle, marginTop: '0.45rem' }}>Students terminated for policy violations.</p>
                                            </div>
                                            <div style={{ padding: '1rem', borderRadius: '18px', background: '#fef3c7', border: '1px solid #fde68a' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#b45309' }}>Times Cheated</div>
                                                <div style={{ marginTop: '0.65rem', fontSize: '1.75rem', fontWeight: 900, color: '#c2410c' }}>{analytics?.totalCheatingAttempts ?? 0}</div>
                                                <p style={{ ...mutedStyle, marginTop: '0.45rem' }}>Total suspicious behavior events flagged so far.</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section style={cardStyle}>
                                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                                        <p style={{ ...mutedStyle, marginTop: '-0.25rem' }}>Branded shortcuts for rapid control</p>
                                        <button onClick={() => openView('sections')} style={primaryBtnStyle}>Manage Sections</button>
                                        <button onClick={() => openView('questions')} style={secondaryBtnStyle}>Open Question Bank</button>
                                        <button onClick={() => openView('students')} style={secondaryBtnStyle}>Review Student Results</button>
                                        <button onClick={() => openView('config')} style={secondaryBtnStyle}>Exam Time Settings</button>
                                        <button onClick={() => openView('insights')} style={secondaryBtnStyle}>Open Insights Charts</button>
                                    </section>

                                    <section style={cardStyle}>
                                        <h3 style={{ marginTop: 0 }}>Exam Config</h3>
                                        <p style={{ ...mutedStyle, marginTop: '-0.25rem' }}>{BRAND_NAME} paper identity controls</p>
                                        <p style={mutedStyle}>Duration: <strong>{examDuration} minutes</strong></p>
                                        <p style={mutedStyle}>Examiner: <strong>{examinerName}</strong></p>
                                        <p style={mutedStyle}>
                                            Last updated: {examConfigUpdatedAt ? new Date(examConfigUpdatedAt).toLocaleString() : 'Not set'}
                                        </p>
                                        <button onClick={() => openView('config')} style={primaryBtnStyle}>Open Config Page</button>
                                    </section>
                                    {adminIdentity?.role === 'admin' && (
                                        <section style={cardStyle}>
                                            <h3 style={{ marginTop: 0 }}>Student Seats</h3>
                                            <p style={{ ...mutedStyle, marginTop: '-0.25rem' }}>Current student seat usage for your organization.</p>
                                            <p style={mutedStyle}>Used: <strong>{analytics?.studentsCount ?? 0}</strong></p>
                                            <p style={mutedStyle}>Limit: <strong>{adminIdentity?.studentLimit ?? 0}</strong></p>
                                            <p style={mutedStyle}>Remaining: <strong>{Math.max((adminIdentity?.studentLimit ?? 0) - (analytics?.studentsCount ?? 0), 0)}</strong></p>
                                            <button onClick={loadAnalytics} style={secondaryBtnStyle}>Refresh Student Count</button>
                                        </section>
                                    )}
                                </div>

                                <section style={cardStyle}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                                        <div style={{ flex: '1 1 320px', minWidth: '280px' }}>
                                            <h3 style={{ marginTop: 0 }}>Integrity & Response Trends</h3>
                                            <p style={{ ...mutedStyle, marginTop: '-0.25rem' }}>In-depth analytics on cheating risk, answer revisions, and exam flow quality.</p>
                                            <div style={{ display: 'grid', gap: '0.85rem', marginTop: '1rem' }}>
                                                <div style={{ background: '#f8fafc', border: '1px solid #dbe4ef', borderRadius: '18px', padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f3c79' }}>Cheating Attempts</div>
                                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#be123c' }}>{cheatAttemptsTotal}</div>
                                                    <p style={{ ...mutedStyle, marginTop: '0.45rem' }}>Total recorded cheating attempt events during the exam cycle.</p>
                                                </div>
                                                <div style={{ background: '#f8fafc', border: '1px solid #dbe4ef', borderRadius: '18px', padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f3c79' }}>Option Change Intensity</div>
                                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1d4ed8' }}>{avgOptionChanges.toFixed(1)}</div>
                                                    <p style={{ ...mutedStyle, marginTop: '0.45rem' }}>Average number of answer revisions per student, showing hesitation and review behavior.</p>
                                                </div>
                                                <div style={{ background: '#f8fafc', border: '1px solid #dbe4ef', borderRadius: '18px', padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f3c79' }}>Exam Integrity Health</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.5rem' }}>
                                                        <span style={{ fontSize: '2rem', fontWeight: 800, color: integrityTone }}>{integrityHealth}%</span>
                                                        <span style={{ fontSize: '0.86rem', color: integrityTone, fontWeight: 700 }}>{integrityHealth >= 80 ? 'Strong' : integrityHealth >= 60 ? 'Watch' : 'Critical'}</span>
                                                    </div>
                                                    <p style={{ ...mutedStyle, marginTop: '0.45rem' }}>Estimated exam health based on cheating frequency compared to expected student counts.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ flex: '1 1 320px', minWidth: '280px', padding: '1rem', borderRadius: '24px', background: '#f8fafc', border: '1px solid #dbe4ef', display: 'grid', placeItems: 'center' }}>
                                            <div style={{ width: '220px', height: '220px', borderRadius: '999px', background: scorePieGradient, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(15,23,42,0.08)' }}>
                                                <div style={{ position: 'absolute', inset: '24%', borderRadius: '999px', background: '#f8fafc' }} />
                                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#0f172a' }}>
                                                    <div style={{ fontSize: '1.55rem', fontWeight: 900 }}>{scoreTotal}</div>
                                                    <div style={{ fontSize: '0.85rem', marginTop: '0.35rem', color: '#475569' }}>Score distribution segments</div>
                                                </div>
                                            </div>
                                            <p style={{ ...mutedStyle, marginTop: '1rem', textAlign: 'center' }}>Live score distribution by student performance buckets.</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.2rem' }}>
                                        <div style={{ padding: '1rem', borderRadius: '20px', background: '#ffffff', border: '1px solid #dbe4ef' }}>
                                            <h4 style={{ margin: 0, fontWeight: 700, color: '#0f3c79' }}>Cheating & Answer Review Trend</h4>
                                            <p style={{ ...mutedStyle, marginTop: '0.45rem' }}>Timeline of recent submissions, cheating flags, and answer changes.</p>
                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.55rem', marginTop: '1rem', minHeight: '150px' }}>
                                                {timeline.slice(-6).map((point, index) => {
                                                    const height = Math.max((point.cheatingAttempts / Math.max(timelineMaxValue, 1)) * 100, 8);
                                                    const altHeight = Math.max((point.optionChanges / Math.max(timelineMaxValue, 1)) * 100, 8);
                                                    return (
                                                        <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '0.35rem' }}>
                                                            <div style={{ height: `${height}%`, background: '#ef4444', borderRadius: '999px', width: '100%' }} />
                                                            <div style={{ height: `${altHeight}%`, background: '#2563eb', borderRadius: '999px', width: '100%' }} />
                                                            <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#64748b', textAlign: 'center' }}>{point.day.slice(0, 3)}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.81rem', color: '#ef4444' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />Cheat Attempts</span>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.81rem', color: '#2563eb' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }} />Option Changes</span>
                                            </div>
                                        </div>

                                        <div style={{ padding: '1rem', borderRadius: '20px', background: '#ffffff', border: '1px solid #dbe4ef' }}>
                                            <h4 style={{ margin: 0, fontWeight: 700, color: '#0f3c79' }}>Top Performer Insights</h4>
                                            <p style={{ ...mutedStyle, marginTop: '0.45rem' }}>Students with strong performance and minimal risky behavior.</p>
                                            <div style={{ display: 'grid', gap: '0.9rem', marginTop: '1rem' }}>
                                                {topStudents.slice(0, 3).map((student) => (
                                                    <div key={student.studentName} style={{ padding: '0.85rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
                                                            <strong style={{ color: '#0f3c79' }}>{student.studentName}</strong>
                                                            <span style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 700 }}>{student.avgPercent.toFixed(0)}%</span>
                                                        </div>
                                                        <p style={{ ...mutedStyle, margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>Average section success rate</p>
                                                    </div>
                                                ))}
                                                {topStudents.length === 0 && <p style={mutedStyle}>No top student insights available yet.</p>}
                                            </div>
                                        </div>

                                        <div style={{ padding: '1rem', borderRadius: '20px', background: '#ffffff', border: '1px solid #dbe4ef' }}>
                                            <h4 style={{ margin: 0, fontWeight: 700, color: '#0f3c79' }}>Option Change Alerts</h4>
                                            <p style={{ ...mutedStyle, marginTop: '0.45rem' }}>How frequently students revise answers before submission.</p>
                                            <div style={{ marginTop: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#334155' }}>
                                                    <span>Average changes</span>
                                                    <strong>{avgOptionChanges.toFixed(1)}</strong>
                                                </div>
                                                <div style={{ marginTop: '0.6rem', height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${Math.min((avgOptionChanges / 12) * 100, 100)}%`, height: '100%', background: '#1d4ed8' }} />
                                                </div>
                                                <p style={{ ...mutedStyle, marginTop: '0.9rem' }}>Total option revisions recorded: <strong>{optionChangeTotal}</strong>.</p>
                                                <p style={{ ...mutedStyle, marginTop: '0.6rem' }}>High levels can indicate careful review or confusing questions. Use this insight to refine content and reduce ambiguity.</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section style={cardStyle}>
                                    <h4 style={{ marginTop: 0 }}>Advanced Actionable Insights</h4>
                                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: '1rem' }}>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#0f3c79' }}>Risk Score</p>
                                            <p style={{ margin: '0.75rem 0 0', fontSize: '2rem', fontWeight: 900, color: '#be123c' }}>{riskIndex}%</p>
                                            <p style={{ ...mutedStyle, marginTop: '0.5rem' }}>A predictive score combining cheating density and answer revision behavior.</p>
                                        </div>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#0f3c79' }}>Top Cheat Risk Days</p>
                                            {topRiskDays.length === 0 ? (
                                                <p style={{ ...mutedStyle, marginTop: '0.75rem' }}>No risk timeline data available.</p>
                                            ) : (
                                                <ol style={{ margin: '0.75rem 0 0 1rem', padding: 0, color: '#334155' }}>
                                                    {topRiskDays.map((point: InsightsTimelineItem) => (
                                                        <li key={point.day} style={{ marginBottom: '0.45rem' }}>
                                                            <strong>{point.day}</strong>: {point.cheatingAttempts} attempts, {point.optionChanges} option changes
                                                        </li>
                                                    ))}
                                                </ol>
                                            )}
                                        </div>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#0f3c79' }}>Top Revision Days</p>
                                            {topOptionChangeDays.length === 0 ? (
                                                <p style={{ ...mutedStyle, marginTop: '0.75rem' }}>No revision timeline data available.</p>
                                            ) : (
                                                <ol style={{ margin: '0.75rem 0 0 1rem', padding: 0, color: '#334155' }}>
                                                    {topOptionChangeDays.map((point: InsightsTimelineItem) => (
                                                        <li key={point.day} style={{ marginBottom: '0.45rem' }}>
                                                            <strong>{point.day}</strong>: {point.optionChanges} option changes, {point.cheatingAttempts} cheat attempts
                                                        </li>
                                                    ))}
                                                </ol>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section style={cardStyle}>
                                    <h4 style={{ marginTop: 0 }}>Live Exam Watchlist</h4>
                                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: '1rem' }}>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f3c79' }}>Cheating Trend</div>
                                            <div style={{ marginTop: '0.75rem', fontSize: '1.5rem', fontWeight: 800, color: cheatingTrend === 'increasing' ? '#dc2626' : cheatingTrend === 'decreasing' ? '#16a34a' : '#1d4ed8' }}>{cheatingTrend.toUpperCase()}</div>
                                            <p style={{ ...mutedStyle, marginTop: '0.5rem' }}>Recent cheating activity is {cheatingTrend} based on the last two time periods.</p>
                                        </div>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#fff7ed', border: '1px solid #fed7aa' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>Lowest Performing Sections</div>
                                            <div style={{ marginTop: '0.75rem', fontSize: '1.5rem', fontWeight: 800, color: '#92400e' }}>{lowPerformingSections.length}</div>
                                            <p style={{ ...mutedStyle, marginTop: '0.5rem' }}>{lowSectionNames}</p>
                                        </div>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3730a3' }}>Flagged Students in Feed</div>
                                            <div style={{ marginTop: '0.75rem', fontSize: '1.5rem', fontWeight: 800, color: '#3730a3' }}>{suspiciousStudentCount}</div>
                                            <p style={{ ...mutedStyle, marginTop: '0.5rem' }}>Students showing live cheating flags in the current activity feed.</p>
                                        </div>
                                    </div>
                                </section>

                                <section style={cardStyle}>
                                    <h3 style={{ marginTop: 0 }}>Live Review Alerts</h3>
                                    <p style={{ ...mutedStyle, marginTop: '-0.25rem' }}>Useful signals to prioritize review and intervention while the exam is active.</p>
                                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: '1rem' }}>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f3c79' }}>Cheating Trend</div>
                                            <div style={{ marginTop: '0.75rem', fontSize: '1.65rem', fontWeight: 900, color: cheatingTrend === 'increasing' ? '#dc2626' : cheatingTrend === 'decreasing' ? '#16a34a' : '#1d4ed8' }}>{cheatingTrend.toUpperCase()}</div>
                                            <p style={{ ...mutedStyle, marginTop: '0.5rem' }}>Current cheating signals are {cheatingTrend}, based on recent activity.</p>
                                        </div>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#fff7ed', border: '1px solid #fed7aa' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400e' }}>High-Risk Sections</div>
                                            <div style={{ marginTop: '0.75rem', fontSize: '1.65rem', fontWeight: 900, color: '#92400e' }}>{lowPerformingSections.length}</div>
                                            <p style={{ ...mutedStyle, marginTop: '0.5rem' }}>{lowSectionNames}</p>
                                        </div>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3730a3' }}>Flagged Students</div>
                                            <div style={{ marginTop: '0.75rem', fontSize: '1.65rem', fontWeight: 900, color: '#3730a3' }}>{suspiciousStudentCount}</div>
                                            <p style={{ ...mutedStyle, marginTop: '0.5rem' }}>Students with live cheating flags in the recent feed.</p>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#0f3c79' }}>Staff Notes</p>
                                        <ul style={{ margin: '0.75rem 0 0 1rem', padding: 0, color: '#334155', lineHeight: 1.65 }}>
                                            <li>Verify flagged sessions with supporting evidence before taking final action.</li>
                                            <li>Review low-performing sections first where answer confusion may be highest.</li>
                                            <li>Watch for answer review spikes in the last 15 minutes of the exam window.</li>
                                        </ul>
                                    </div>
                                </section>

                                <section style={cardStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ margin: 0 }}>Recent Submissions</h3>
                                            <p style={{ ...mutedStyle, marginTop: '0.2rem' }}>Real-time feed — 1 card per student, all sections combined</p>
                                        </div>
                                        <button onClick={loadRecentSubmissions} style={{ ...primaryBtnStyle, margin: 0 }}>Refresh</button>
                                    </div>
                                    <div style={listStyle}>
                                        {recentSubmissions.length === 0 && <p style={mutedStyle}>No recent submissions found.</p>}
                                        {recentSubmissions.map((item) => {
                                            const pct = item.percent ?? 0;
                                            const pctColor = pct >= 75 ? '#15803d' : pct >= 50 ? '#b45309' : '#be123c';
                                            return (
                                                <div key={item._id} style={{ ...itemStyle, padding: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        <div>
                                                            <strong style={{ fontSize: '1rem', color: '#13366c' }}>{item.student?.name || 'Unknown Student'}</strong>
                                                            {item.student?.studentCredential && <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', background: '#e8f1ff', color: '#2d6dd3', borderRadius: '999px', padding: '0.15rem 0.5rem', fontWeight: 700 }}>{item.student.studentCredential}</span>}
                                                            {item.student?.email && <p style={{ ...mutedStyle, margin: '0.15rem 0 0 0', fontSize: '0.82rem' }}>{item.student.email}</p>}
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: pctColor }}>{pct}%</span>
                                                            <p style={{ ...mutedStyle, margin: '0.1rem 0 0 0', fontSize: '0.8rem' }}>{item.totalScore} / {item.totalMaxScore} pts</p>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem', margin: '0.75rem 0' }}>
                                                        <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '0.4rem 0.6rem' }}>
                                                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Sections</span>
                                                            <p style={{ margin: '0.1rem 0 0', fontWeight: 800, color: '#0f172a' }}>{item.submissionsCount}</p>
                                                        </div>
                                                        <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '0.4rem 0.6rem' }}>
                                                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Attempted</span>
                                                            <p style={{ margin: '0.1rem 0 0', fontWeight: 800, color: '#0f172a' }}>{item.totalAttempted} / {item.totalQuestions}</p>
                                                        </div>
                                                        <div style={{ background: item.terminatedDueToCheating ? '#fff1f2' : '#f0fdf4', borderRadius: '8px', padding: '0.5rem 0.75rem', border: item.terminatedDueToCheating ? '1px solid #fee2e2' : '1px solid #dcfce7' }}>
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: item.terminatedDueToCheating ? '#9f1239' : '#166534', letterSpacing: '0.04em' }}>Integrity</span>
                                                            <p style={{ margin: '0.15rem 0 0', fontWeight: 800, color: item.terminatedDueToCheating ? '#e11d48' : '#15803d', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                {item.terminatedDueToCheating ? (
                                                                    <>
                                                                        <Icon name="warning" color="#e11d48" size={16} /> Terminated
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Icon name="check" color="#15803d" size={16} /> Clean
                                                                    </>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div style={{ background: '#f8fafc', borderRadius: '6px', padding: '0.4rem 0.6rem' }}>
                                                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Cheat Flags</span>
                                                            <p style={{ margin: '0.1rem 0 0', fontWeight: 800, color: '#0f172a' }}>{item.cheatingAttempts}</p>
                                                        </div>
                                                    </div>

                                                    <div style={{ borderTop: '1px solid #e8eef6', paddingTop: '0.5rem', marginTop: '0.1rem' }}>
                                                        <p style={{ ...mutedStyle, fontSize: '0.8rem', margin: 0 }}><strong>Sections:</strong> {(item.sections ?? []).length > 0 ? (item.sections ?? []).map(s => `${s.name} (${s.score}/${s.maxScore})`).join(' · ') : '—'}</p>
                                                        <p style={{ ...mutedStyle, fontSize: '0.78rem', margin: '0.2rem 0 0 0' }}>Last submission: {item.lastSubmittedAt ? new Date(item.lastSubmittedAt).toLocaleString() : '—'}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </>
                        )}

                        {activeView === 'sections' && (
                            <section style={cardStyle}>
                                <h3>Sections</h3>
                                <form onSubmit={createSection}>
                                    <label>Name</label>
                                    <input value={sectionName} onChange={(e) => setSectionName(e.target.value)} required style={inputStyle} />
                                    <label>Description</label>
                                    <textarea value={sectionDescription} onChange={(e) => setSectionDescription(e.target.value)} style={inputStyle} />
                                    <button type="submit" style={primaryBtnStyle}>Create Section</button>
                                </form>
                                <div style={listStyle}>
                                    {sections.length === 0 && <p style={mutedStyle}>No sections yet. Create your first section.</p>}
                                    {sections.map((section) => (
                                        <div key={section._id} style={itemStyle}>
                                            <strong>{section.name}</strong>
                                            <p style={mutedStyle}>{section.description || 'No description'}</p>
                                            <p style={mutedStyle}>Status: {section.isActive ? 'Active' : 'Inactive'}</p>
                                            <div style={responsiveRowStyle}>
                                                <button onClick={() => updateSection(section)} style={primaryBtnStyle}>Update</button>
                                                <button onClick={() => promptDeleteSection(section)} style={dangerBtnStyle}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeView === 'add-question' && (
                            <section style={cardStyle}>
                                <h3>Create New Question</h3>
                                <p style={mutedStyle}>Draft question text, upload attachments, and configure marks. Select a target section first.</p>

                                <div style={{ padding: '1rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #dbe4ef', margin: '1.5rem 0' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                                        <div style={{ minWidth: '220px' }}>
                                            <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Excel import for bulk questions</p>
                                            <p style={{ margin: '0.35rem 0 0', color: '#475569', fontSize: '0.95rem' }}>
                                                Download the sample Excel template, then fill questions with section rows, options, and the correct option. The upload parser ignores the header row and creates the section automatically.
                                            </p>
                                        </div>
                                        <a href="/question-import-sample.xlsx" download style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', background: '#1d4ed8', color: '#fff', borderRadius: '999px', textDecoration: 'none', fontWeight: 700 }}>
                                            Download sample Excel
                                        </a>
                                    </div>

                                    <form onSubmit={importQuestions} style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={(e) => setImportQuestionFile(e.target.files?.[0] || null)}
                                            style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', width: '100%' }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isImportingQuestions}
                                            style={{
                                                ...primaryBtnStyle,
                                                width: '100%',
                                                padding: '0.85rem',
                                                opacity: isImportingQuestions ? 0.65 : 1,
                                            }}
                                        >
                                            {isImportingQuestions ? 'Importing questions…' : 'Upload Excel and Import'}
                                        </button>
                                        {importQuestionFile && (
                                            <p style={{ margin: 0, color: '#334155', fontSize: '0.92rem' }}>
                                                Selected file: {importQuestionFile.name}
                                            </p>
                                        )}
                                    </form>
                                </div>

                                <label style={{ display: 'block', marginTop: '1rem', fontWeight: 600 }}>Target Exam Section</label>
                                <select value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} style={inputStyle}>
                                    <option value="">-- Choose a section --</option>
                                    {sections.map((section) => (
                                        <option key={section._id} value={section._id}>{section.name}</option>
                                    ))}
                                </select>

                                <form onSubmit={createQuestion}>
                                    <label>Question text</label>
                                    <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} required style={inputStyle} rows={4} placeholder="Type the actual question statement here..." />

                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Multiple Choice Options</label>
                                        {options.map((opt, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem', padding: '0.5rem', background: correctOptionIndex === i ? '#f0fdf4' : '#f8fafc', border: correctOptionIndex === i ? '1px solid #86efac' : '1px solid #e2e8f0', borderRadius: '6px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '0.85rem', color: '#475569' }}>Option {i + 1}</label>
                                                    <input
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const next = [...options];
                                                            next[i] = e.target.value;
                                                            setOptions(next);
                                                        }}
                                                        required
                                                        style={{ ...inputStyle, marginBottom: 0, padding: '0.45rem', fontSize: '0.9rem' }}
                                                    />
                                                </div>
                                                <div style={{ flexShrink: 0, marginTop: '1.2rem', padding: '0 0.5rem' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0, fontWeight: 700, color: correctOptionIndex === i ? '#16a34a' : '#64748b' }}>
                                                        <input
                                                            type="radio"
                                                            name="correctOptionIndex"
                                                            checked={correctOptionIndex === i}
                                                            onChange={() => setCorrectOptionIndex(i)}
                                                            style={{ margin: 0, width: '18px', height: '18px', cursor: 'pointer' }}
                                                        />
                                                        Correct
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ ...responsiveRowStyle, marginTop: '1rem' }}>
                                        <div>
                                            <label>Marks assigned</label>
                                            <input value={marks} onChange={(e) => setMarks(Number(e.target.value))} type="number" min={1} required style={inputStyle} />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <label>Question Image Attachment (optional)</label>
                                        <input type="file" accept="image/*" onChange={(e) => setQuestionImage(e.target.files?.[0] || null)} style={inputStyle} />
                                    </div>

                                    <button type="submit" style={{ ...primaryBtnStyle, marginTop: '1.5rem', width: '100%', padding: '0.8rem' }}>Create Question <Icon name="arrow-right" size={18} /></button>
                                </form>
                            </section>
                        )}

                        {activeView === 'questions' && (
                            <section style={cardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, marginBottom: '0.3rem' }}>Question Bank</h3>
                                        <p style={{ ...mutedStyle, margin: 0 }}>Review, search, and edit existing questions in your database.</p>
                                    </div>
                                    <button onClick={() => openView('add-question')} style={{ ...primaryBtnStyle, padding: '0.45rem 1rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'auto' }}>
                                        <Icon name="add" size={16} /> Add Question
                                    </button>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                                    <label style={{ fontWeight: 600 }}>Filter by Section</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                                        <select value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} style={{ ...inputStyle, flex: 1, margin: 0 }}>
                                            <option value="">Select section to view</option>
                                            {sections.map((section) => (
                                                <option key={section._id} value={section._id}>{section.name}</option>
                                            ))}
                                        </select>
                                        <button onClick={loadQuestions} style={{ ...secondaryBtnStyle, margin: 0, padding: '0 1rem' }}>Load Data</button>
                                    </div>
                                </div>

                                {editingQuestionId && (
                                    <section style={{ ...cardStyle, marginTop: '0.8rem', border: '1px solid #9fbcf1' }}>
                                        <h4 style={{ marginTop: 0, marginBottom: '0.4rem', color: '#103b7b' }}>Edit Question</h4>
                                        <p style={{ ...mutedStyle, marginTop: 0 }}>Update question text, options, correct answer, marks, section, and image.</p>
                                        <form onSubmit={submitQuestionUpdate}>
                                            <label>Section</label>
                                            <select value={editSectionId} onChange={(e) => setEditSectionId(e.target.value)} style={inputStyle} required>
                                                <option value="">Select section</option>
                                                {sections.map((section) => (
                                                    <option key={section._id} value={section._id}>{section.name}</option>
                                                ))}
                                            </select>

                                            <label>Question text</label>
                                            <textarea value={editQuestionText} onChange={(e) => setEditQuestionText(e.target.value)} required style={inputStyle} />

                                            {editOptions.map((opt, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <label>Option {i + 1}</label>
                                                        <input
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const next = [...editOptions];
                                                                next[i] = e.target.value;
                                                                setEditOptions(next);
                                                            }}
                                                            required
                                                            style={{ ...inputStyle, marginBottom: 0 }}
                                                        />
                                                    </div>
                                                    <div style={{ flexShrink: 0, marginTop: '1.2rem' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', margin: 0, fontWeight: 600 }}>
                                                            <input
                                                                type="radio"
                                                                name="editCorrectOptionIndex"
                                                                checked={editCorrectOptionIndex === i}
                                                                onChange={() => setEditCorrectOptionIndex(i)}
                                                                style={{ margin: 0, width: '16px', height: '16px', cursor: 'pointer' }}
                                                            />
                                                            Correct
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}

                                            <div style={responsiveRowStyle}>
                                                <div>
                                                    <label>Marks</label>
                                                    <input
                                                        value={editMarks}
                                                        onChange={(e) => setEditMarks(Number(e.target.value))}
                                                        type="number"
                                                        min={1}
                                                        required
                                                        style={inputStyle}
                                                    />
                                                </div>
                                            </div>

                                            {editCurrentImageUrl && (
                                                <div style={{ marginTop: '0.35rem' }}>
                                                    <p style={{ ...mutedStyle, marginBottom: '0.25rem' }}>Current image</p>
                                                    <img src={editCurrentImageUrl} alt="Question" style={{ width: '100%', maxWidth: '240px', borderRadius: '8px', border: '1px solid #c9d9f2' }} />
                                                </div>
                                            )}

                                            <label style={{ marginTop: '0.45rem', display: 'block' }}>Replace image (optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setEditQuestionImage(e.target.files?.[0] || null)}
                                                style={inputStyle}
                                            />

                                            <div style={responsiveRowStyle}>
                                                <button type="submit" style={primaryBtnStyle}>Save All Changes</button>
                                                <button type="button" onClick={cancelQuestionEdit} style={secondaryBtnStyle}>Cancel Edit</button>
                                            </div>
                                        </form>
                                    </section>
                                )}

                                <label>Search question text</label>
                                <input
                                    value={questionSearch}
                                    onChange={(e) => setQuestionSearch(e.target.value)}
                                    placeholder="Type to filter questions"
                                    style={inputStyle}
                                />

                                <div style={listStyle}>
                                    {filteredQuestions.length === 0 && <p style={mutedStyle}>No questions loaded for current filter.</p>}
                                    {filteredQuestions.map((question) => (
                                        <div key={question._id} style={itemStyle}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem' }}>
                                                    <strong style={{ fontSize: '0.98rem', lineHeight: 1.4, flex: 1, whiteSpace: 'pre-wrap' }}>{question.questionText}</strong>
                                                    <span style={{ color: '#556987', fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                                                        Marks: {question.marks}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                                                    <span style={{ color: '#5c6f85', fontSize: '0.86rem' }}>
                                                        Correct: Option {Number(question.correctOptionIndex) + 1}
                                                    </span>
                                                    <span style={{ color: '#5c6f85', fontSize: '0.86rem' }}>
                                                        Section: {question.section ? (typeof question.section === 'string' ? question.section : question.section.name) : 'N/A'}
                                                    </span>
                                                </div>
                                                <p style={{ ...mutedStyle, margin: 0 }}>{question.options.map((o, i) => `${i}. ${o}`).join(' | ')}</p>
                                                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                                                    <button onClick={() => startQuestionEdit(question)} style={{ ...primaryBtnStyle, width: 'auto', padding: '0.45rem 0.9rem' }}>Edit</button>
                                                    <button onClick={() => promptDeleteQuestion(question)} style={{ ...dangerBtnStyle, width: 'auto', padding: '0.45rem 0.9rem' }}>Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeView === 'students' && (
                            <section style={cardStyle}>
                                <h3>Students & Results</h3>
                                <button onClick={loadStudents} style={primaryBtnStyle}>Refresh Students</button>
                                {adminIdentity?.role === 'super_admin' && (
                                    <button
                                        onClick={promptResetAllStudents}
                                        style={{ ...dangerBtnStyle, marginTop: '0.45rem' }}
                                    >
                                        Reset All Students Data
                                    </button>
                                )}
                                <button onClick={exportAllDetailedCsv} style={secondaryBtnStyle}>Export All Students Detailed CSV</button>

                                <label>Search student</label>
                                <input
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    placeholder="Name, email, credential"
                                    style={inputStyle}
                                />

                                <div style={listStyle}>
                                    {filteredStudents.length === 0 && <p style={mutedStyle}>No student records found for the current filter.</p>}
                                    {filteredStudents.map((student) => (
                                        <div key={student._id} style={itemStyle}>
                                            <strong>{student.name}</strong>
                                            <p style={mutedStyle}>{student.email}</p>
                                            <p style={mutedStyle}>Credential: {student.studentCredential || '-'}</p>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <button onClick={() => { loadSubmissions(student); openView('responses'); }} style={{ ...primaryBtnStyle, padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>View Responses</button>
                                                {adminIdentity?.role === 'super_admin' && (
                                                    <button onClick={() => promptDeleteStudent(student)} style={{ ...dangerBtnStyle, padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Delete Student</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeView === 'responses' && (
                            <section style={{ ...cardStyle, background: '#ffffff', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '2px solid #f0f4f9', paddingBottom: '1.2rem' }}>
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #1e4db7, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 800, flexShrink: 0 }}>
                                                {selectedStudent?.name?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a', lineHeight: 1.2 }}>{selectedStudent?.name || 'Candidate Responses'}</h3>
                                                <p style={{ ...mutedStyle, margin: '0.2rem 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '0.85rem' }}>{selectedStudent?.email}</span>
                                                    <span style={{ color: '#cbd5e1' }}>|</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>ID: {selectedStudent?.studentCredential}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <button onClick={() => openView('students')} style={{ ...secondaryBtnStyle, width: 'auto', marginTop: 0, padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.9rem' }}><Icon name="arrow-left" size={16} /> Exit View</button>
                                        <button onClick={exportSelectedStudentCsv} style={{ ...primaryBtnStyle, width: 'auto', marginTop: 0, padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.9rem' }}>Export Detailed PDF/CSV</button>
                                    </div>
                                </div>

                                {!selectedStudent ? (
                                    <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                                        <div style={{ marginBottom: '1.5rem', opacity: 0.15 }}>
                                            <Icon name="user" size={64} color="#1e293b" />
                                        </div>
                                        <h4 style={{ color: '#334155', fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>No Student Selected</h4>
                                        <p style={{ ...mutedStyle, maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>Please select a student from the directory to analyze their exam performance, responses, and behavioral insights.</p>
                                        <button onClick={() => openView('students')} style={{ ...primaryBtnStyle, width: 'auto', padding: '0.6rem 2rem' }}>Go to Students Directory</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        {submissions.length === 0 && (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No submissions found for this candidate.</div>
                                        )}
                                        {submissions.map((submission) => (
                                            <div key={submission._id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                                {/* Submission Header */}
                                                <div style={{ background: '#f8fafc', padding: '1.2rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                                    <div>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EXAM SECTION</span>
                                                        <h4 style={{ margin: '0.2rem 0 0 0', color: '#1e293b', fontSize: '1.2rem' }}>
                                                            {submission.section?.name || 'Standard Assessment'}
                                                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginLeft: '12px', opacity: 0.8 }}>
                                                                &mdash; {selectedStudent?.name}
                                                            </span>
                                                        </h4>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.02em' }}>SUBMITTED ON</div>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{new Date(submission.createdAt).toLocaleString()}</div>
                                                        </div>
                                                        {submission.examMeta?.terminatedDueToCheating && (
                                                            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.45rem 1rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <Icon name="warning" color="#dc2626" size={16} /> TERMINATED
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div style={{ padding: '1.5rem' }}>
                                                    {/* Key Metrics Row */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                                        <div style={{ padding: '1rem', borderRadius: '12px', background: '#f0f9ff', border: '1px solid #e0f2fe' }}>
                                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.25rem' }}>SCORE PERCENTAGE</div>
                                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0c4a6e' }}>
                                                                    {Math.round((submission.score / submission.maxScore) * 100)}%
                                                                </div>
                                                                <div style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 700, opacity: 0.8 }}>
                                                                    ({submission.score}/{submission.maxScore} pts)
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ padding: '1rem', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>ACCURACY</div>
                                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#064e3b' }}>
                                                                    {Math.round((submission.attemptedQuestions / submission.totalQuestions) * 100)}%
                                                                </div>
                                                                <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700, opacity: 0.8 }}>
                                                                    ({submission.attemptedQuestions}/{submission.totalQuestions} ans)
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ padding: '1rem', borderRadius: '12px', background: submission.examMeta?.cheatingAttempts ? '#fff1f2' : '#f8fafc', border: submission.examMeta?.cheatingAttempts ? '1px solid #ffe4e6' : '1px solid #e2e8f0' }}>
                                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: submission.examMeta?.cheatingAttempts ? '#9f1239' : '#64748b', marginBottom: '0.25rem' }}>POLICY VIOLATIONS</div>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: submission.examMeta?.cheatingAttempts ? '#e11d48' : '#334155' }}>
                                                                {submission.examMeta?.cheatingAttempts ?? 0}
                                                            </div>
                                                        </div>
                                                        <div style={{ padding: '1rem', borderRadius: '12px', background: '#fdf4ff', border: '1px solid #fae8ff' }}>
                                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#701a75', marginBottom: '0.25rem' }}>BEHAVIORAL SWAPS</div>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4a044e' }}>
                                                                {submission.examMeta?.totalOptionChanges ?? 0}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {(submission.examMeta?.terminationRemark || submission.remark) && (
                                                        <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '1.2rem', marginBottom: '1.5rem', borderRadius: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <Icon name="warning" color="#c2410c" size={20} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Administrative Remark</div>
                                                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#9a3412', lineHeight: '1.6', fontWeight: 500 }}>{submission.examMeta?.terminationRemark || submission.remark}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(submission.examMeta?.securityEvents?.length ?? 0) > 0 && (
                                                        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1.2rem', marginBottom: '1.5rem', borderRadius: '14px' }}>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>Security Events</div>
                                                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                                {submission.examMeta?.securityEvents?.map((event, idx) => (
                                                                    <div key={idx} style={{ padding: '0.85rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                                                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{event.type.replace(/_/g, ' ')}</div>
                                                                        <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem' }}>{event.message}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>{new Date(event.timestamp).toLocaleString()}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Behavioral Insights */}
                                                    {!!submission.examMeta?.questionInteractions?.length && (
                                                        <div style={{ marginBottom: '2.5rem' }}>
                                                            <h5 style={{ margin: '0 0 1.25rem 0', color: '#1e293b', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0f9ff', border: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                    <Icon name="lightning" color="#3b82f6" size={20} />
                                                                </span>
                                                                <span style={{ whiteSpace: 'nowrap' }}>Sequence &amp; Micro-Interaction Tracking</span>
                                                            </h5>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                                                {submission.examMeta.questionInteractions.map((interaction, ix) => (
                                                                    interaction.changeCount > 0 && (
                                                                        <div key={ix} style={{ padding: '0.8rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                                                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>QUESTION #{ix + 1}</span>
                                                                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b' }}>{interaction.changeCount} SWAPS</span>
                                                                            </div>
                                                                            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                                                                                Opt {interaction.firstSelectedOptionIndex ?? '-'} <Icon name="arrow-right" size={12} /> <strong style={{ color: '#1e40af' }}>Opt {interaction.finalSelectedOptionIndex ?? '-'}</strong>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Full Width Answer Breakdown */}
                                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                                                        <h5 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>
                                                            Question-by-Question Breakdown
                                                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginLeft: '10px' }}>
                                                                &mdash; {selectedStudent?.name}
                                                            </span>
                                                        </h5>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                            {submission.answers.map((answer, index) => (
                                                                <div key={index} style={{
                                                                    padding: '1.5rem',
                                                                    background: answer.isCorrect ? '#f0fdf4' : '#fff1f2',
                                                                    border: answer.isCorrect ? '1px solid #dcfce7' : '1px solid #ffe4e6',
                                                                    borderRadius: '16px',
                                                                    position: 'relative'
                                                                }}>
                                                                    <div style={{ position: 'absolute', top: '-10px', left: '20px', background: answer.isCorrect ? '#22c55e' : '#ef4444', color: '#fff', padding: '2px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800 }}>
                                                                        QUESTION {index + 1}
                                                                    </div>

                                                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                                                                        {answer.questionText}
                                                                    </div>

                                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                                                        <div style={{ background: 'rgba(255,255,255,0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Student Selection</div>
                                                                            <div style={{ fontSize: '1rem', color: answer.isCorrect ? '#166534' : '#991b1b', fontWeight: 600 }}>
                                                                                {answer.selectedOptionIndex === null || answer.selectedOptionIndex === undefined
                                                                                    ? <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not Attempted</span>
                                                                                    : (answer.options?.[answer.selectedOptionIndex] || `Option ${answer.selectedOptionIndex}`)}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ background: 'rgba(255,255,255,0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Correct Reference</div>
                                                                            <div style={{ fontSize: '1rem', color: '#166534', fontWeight: 600 }}>
                                                                                {answer.options?.[answer.correctOptionIndex] || `Option ${answer.correctOptionIndex}`}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <span style={{ width: '10px', height: '10px', borderRadius: '999px', background: answer.isCorrect ? '#22c55e' : '#ef4444' }}></span>
                                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: answer.isCorrect ? '#166534' : '#991b1b' }}>
                                                                                {answer.isCorrect ? 'MARKS AWARDED' : 'NO MARKS AWARDED'}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
                                                                            +{answer.marksAwarded} Points
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeView === 'config' && (
                            <section style={cardStyle}>
                                <h3 style={{ marginTop: 0 }}>Exam Configuration</h3>
                                <form onSubmit={saveExamConfig}>
                                    <label>Exam Duration (minutes)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={600}
                                        value={examDuration}
                                        onChange={(e) => setExamDuration(Number(e.target.value))}
                                        style={inputStyle}
                                        required
                                    />
                                    <label>Exam Start Date &amp; Time</label>
                                    <div style={{ position: 'relative', width: '100%' }}>
                                        <button
                                            type="button"
                                            onClick={openExamStartPicker}
                                            style={{
                                                ...inputStyle,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                cursor: 'pointer',
                                                background: '#f8fbff',
                                                border: '1px solid #c8d7f2',
                                                color: '#0f172a'
                                            }}
                                        >
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '12px', background: '#e0efff' }}>
                                                    <Icon name="calendar" size={18} color="#1765c1" />
                                                </span>
                                                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#102e56' }}>{examStartAt ? new Date(examStartAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Set exam start time'}</span>
                                                    <span style={{ fontSize: '0.78rem', color: '#5b708f' }}>{examStartAt ? 'Review or update the schedule' : 'Tap to pick date and time'}</span>
                                                </span>
                                            </span>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#1848a0' }}>
                                                <Icon name="clock" size={18} color="#1848a0" />
                                                <span style={{ fontWeight: 700 }}>Open</span>
                                            </span>
                                        </button>

                                        {isExamStartPickerOpen && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '110%',
                                                right: 0,
                                                left: 0,
                                                background: '#fff',
                                                border: '1px solid rgba(15, 23, 42, 0.08)',
                                                borderRadius: '18px',
                                                padding: '1rem',
                                                boxShadow: '0 22px 60px rgba(15, 23, 42, 0.12)',
                                                zIndex: 25
                                            }}>
                                                <div style={{ display: 'grid', gap: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                        <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                                                            <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 700, color: '#102e56' }}>Date</label>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.85rem', border: '1px solid #dbe4ef', borderRadius: '14px', background: '#f8fbff' }}>
                                                                <Icon name="calendar" size={18} color="#0f4fa8" />
                                                                <input
                                                                    type="date"
                                                                    value={examStartDate}
                                                                    onChange={(e) => setExamStartDate(e.target.value)}
                                                                    style={{
                                                                        flex: 1,
                                                                        border: 'none',
                                                                        outline: 'none',
                                                                        fontSize: '0.95rem',
                                                                        background: 'transparent',
                                                                        color: '#102e56'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                                                            <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 700, color: '#102e56' }}>Time</label>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.85rem', border: '1px solid #dbe4ef', borderRadius: '14px', background: '#f8fbff' }}>
                                                                <Icon name="clock" size={18} color="#0f4fa8" />
                                                                <input
                                                                    type="time"
                                                                    value={examStartTime}
                                                                    onChange={(e) => setExamStartTime(e.target.value)}
                                                                    style={{
                                                                        flex: 1,
                                                                        border: 'none',
                                                                        outline: 'none',
                                                                        fontSize: '0.95rem',
                                                                        background: 'transparent',
                                                                        color: '#102e56'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'grid', gap: '0.85rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                                                            <button
                                                                type="button"
                                                                onClick={applyExamStartPicker}
                                                                style={{
                                                                    ...primaryBtnStyle,
                                                                    width: 'auto',
                                                                    padding: '0.85rem 1.1rem',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '0.55rem'
                                                                }}
                                                            >
                                                                <Icon name="check" size={18} color="#fff" />
                                                                OK
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsExamStartPickerOpen(false)}
                                                                style={{
                                                                    ...secondaryBtnStyle,
                                                                    width: 'auto',
                                                                    padding: '0.85rem 1.1rem',
                                                                    borderRadius: '14px',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '0.55rem'
                                                                }}
                                                            >
                                                                <Icon name="close" size={18} color="#164c82" />
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={clearExamStart}
                                                                style={{
                                                                    ...dangerBtnStyle,
                                                                    width: 'auto',
                                                                    padding: '0.85rem 1.1rem',
                                                                    borderRadius: '14px',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '0.55rem'
                                                                }}
                                                            >
                                                                <Icon name="close" size={18} color="#fff" />
                                                                Clear
                                                            </button>
                                                        </div>
                                                        <div style={{ padding: '0.95rem 1rem', borderRadius: '16px', background: '#eef5ff', border: '1px solid #c7ddfb' }}>
                                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#1d3f71', fontWeight: 700 }}>Selected schedule</p>
                                                            <p style={{ margin: '0.4rem 0 0', color: '#334155' }}>{examStartDate ? `${new Date(`${examStartDate}T${examStartTime}`).toLocaleDateString([], { dateStyle: 'long' })} at ${examStartTime}` : 'No schedule chosen yet.'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.6rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={examAutoSubmitAfterTime}
                                            onChange={(e) => setExamAutoSubmitAfterTime(e.target.checked)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        Auto submit when exam time expires
                                    </label>
                                    <label>Examiner Name (shown on question paper)</label>
                                    <input
                                        type="text"
                                        minLength={2}
                                        maxLength={120}
                                        value={examinerName}
                                        onChange={(e) => setExaminerName(e.target.value)}
                                        style={inputStyle}
                                        required
                                    />
                                    <button type="submit" style={primaryBtnStyle}>Save Exam Schedule</button>
                                </form>
                                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                                    <button onClick={loadExamConfig} style={{ ...secondaryBtnStyle, padding: '0.45rem 1rem' }}>Reload Configuration</button>
                                    <button type="button" onClick={startExamNow} style={{ ...primaryBtnStyle, padding: '0.45rem 1rem' }}><Icon name="lightning" size={16} /> Start Now</button>
                                    <button onClick={endExamNow} style={{ ...dangerBtnStyle, padding: '0.45rem 1rem' }}>End Exam Now</button>
                                </div>
                                <p style={mutedStyle}>
                                    Scheduled start: {examStartAt ? new Date(examStartAt).toLocaleString() : 'Not set'}
                                </p>
                                <p style={mutedStyle}>
                                    Force ended at: {examForceEndedAt ? new Date(examForceEndedAt).toLocaleString() : 'Not ended'}
                                </p>
                                <p style={mutedStyle}>
                                    Last updated: {examConfigUpdatedAt ? new Date(examConfigUpdatedAt).toLocaleString() : 'Not set'}
                                </p>
                                <div style={{ ...itemStyle, marginTop: '0.7rem' }}>
                                    <strong>Guidance</strong>
                                    <p style={mutedStyle}>Schedule the exam window clearly and let students enter only during the allowed time. Automatic submission retains saved answers and closes the exam cleanly.</p>
                                </div>
                            </section>
                        )}

                        {activeView === 'activity' && (
                            <>
                                <section style={cardStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ margin: 0 }}>Activity Feed</h3>
                                            <p style={{ ...mutedStyle, marginTop: '0.2rem' }}>1 entry per student &mdash; all sections merged</p>
                                        </div>
                                        <button onClick={loadRecentSubmissions} style={{ ...primaryBtnStyle, margin: 0 }}>Refresh</button>
                                    </div>
                                    <div style={listStyle}>
                                        {recentSubmissions.length === 0 && <p style={mutedStyle}>No activity available right now.</p>}
                                        {recentSubmissions.map((item) => {
                                            const pct = item.percent ?? 0;
                                            const pctColor = pct >= 75 ? '#15803d' : pct >= 50 ? '#b45309' : '#be123c';
                                            return (
                                                <div key={item._id} style={{ ...itemStyle, padding: '0.9rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        <div>
                                                            <strong style={{ color: '#13366c' }}>{item.student?.name || 'Unknown Student'}</strong>
                                                            {item.student?.studentCredential && <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', background: '#e8f1ff', color: '#2d6dd3', borderRadius: '999px', padding: '0.1rem 0.45rem', fontWeight: 700 }}>{item.student.studentCredential}</span>}
                                                        </div>
                                                        <span style={{ fontWeight: 800, color: pctColor, fontSize: '1.1rem' }}>{pct}% &nbsp;<span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({item.totalScore}/{item.totalMaxScore})</span></span>
                                                    </div>
                                                    <p style={{ ...mutedStyle, margin: '0.4rem 0 0.2rem', fontSize: '0.82rem' }}>
                                                        <strong>Sections:</strong> {item.submissionsCount} &nbsp;&middot;&nbsp;
                                                        <strong>Answered:</strong> {item.totalAttempted}/{item.totalQuestions} &nbsp;&middot;&nbsp;
                                                        <strong>Cheat Flags:</strong> {item.cheatingAttempts} &nbsp;&middot;&nbsp;
                                                        <strong>Option Swaps:</strong> {item.totalOptionChanges}
                                                        {item.terminatedDueToCheating && (
                                                            <span style={{ marginLeft: '1rem', color: '#dc2626', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef2f2', padding: '0.15rem 0.65rem', borderRadius: '999px', fontSize: '0.74rem', border: '1px solid #fee2e2' }}>
                                                                <Icon name="warning" color="#dc2626" size={14} /> Terminated
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p style={{ ...mutedStyle, fontSize: '0.79rem', margin: '0.1rem 0 0' }}>{(item.sections ?? []).length > 0 ? (item.sections ?? []).map(s => `${s.name}: ${s.score}/${s.maxScore}`).join(' · ') : '—'}</p>
                                                    <p style={{ ...mutedStyle, fontSize: '0.76rem', margin: '0.1rem 0 0' }}>Last: {item.lastSubmittedAt ? new Date(item.lastSubmittedAt).toLocaleString() : '—'}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                <section style={cardStyle}>
                                    <h3 style={{ marginTop: 0 }}>Live Activity Summary</h3>
                                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: '1rem' }}>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f3c79' }}>Active Exam Sessions</div>
                                            <div style={{ marginTop: '0.8rem', fontSize: '1.9rem', fontWeight: 900, color: '#2563eb' }}>{analytics?.activeSessionCount ?? 0}</div>
                                            <p style={{ ...mutedStyle, marginTop: '0.55rem' }}>Students currently live in the exam environment.</p>
                                        </div>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#fff1f2', border: '1px solid #fee2e2' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#9f1239' }}>Eliminated This Exam</div>
                                            <div style={{ marginTop: '0.8rem', fontSize: '1.9rem', fontWeight: 900, color: '#be123c' }}>{analytics?.eliminatedDueToCheating ?? 0}</div>
                                            <p style={{ ...mutedStyle, marginTop: '0.55rem' }}>Students terminated for cheating policy violations.</p>
                                        </div>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#fef3c7', border: '1px solid #fde68a' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#b45309' }}>Suspicion Events</div>
                                            <div style={{ marginTop: '0.8rem', fontSize: '1.9rem', fontWeight: 900, color: '#c2410c' }}>{analytics?.totalCheatingAttempts ?? 0}</div>
                                            <p style={{ ...mutedStyle, marginTop: '0.55rem' }}>Total flagged suspicious events recorded so far.</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                            <strong style={{ fontSize: '0.92rem', color: '#0f3c79' }}>Students with Active Flags</strong>
                                            <p style={{ ...mutedStyle, margin: '0.75rem 0 0 0', fontSize: '1.45rem', fontWeight: 900, color: '#be123c' }}>{suspiciousStudentCount}</p>
                                            <p style={{ ...mutedStyle, marginTop: '0.45rem' }}>Number of students with at least one cheating attempt in the latest activity feed.</p>
                                        </div>
                                        <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                            <strong style={{ fontSize: '0.92rem', color: '#0f3c79' }}>Heavy Review Activity</strong>
                                            <p style={{ ...mutedStyle, margin: '0.75rem 0 0 0', fontSize: '1.45rem', fontWeight: 900, color: '#1d4ed8' }}>{highReviewStudents.length}</p>
                                            <p style={{ ...mutedStyle, marginTop: '0.45rem' }}>Students who changed 6+ answers in the latest feed.</p>
                                        </div>
                                    </div>
                                </section>

                                <section style={cardStyle}>
                                    <h3 style={{ marginTop: 0 }}>Top Flagged Students</h3>
                                    <p style={{ ...mutedStyle, marginTop: '0.25rem' }}>Live list of students with the highest recent cheat flags.</p>
                                    {topFlaggedStudents.length === 0 ? (
                                        <p style={mutedStyle}>No flagged students in the current activity feed.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
                                            {topFlaggedStudents.map((item) => (
                                                <div key={item._id} style={{ padding: '0.85rem', borderRadius: '16px', background: '#fff7ed', border: '1px solid #fed7aa' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                                                        <strong style={{ color: '#9a3412' }}>{item.student?.name || 'Unknown Student'}</strong>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c2410c' }}>{item.cheatingAttempts} flags</span>
                                                    </div>
                                                    <p style={{ ...mutedStyle, margin: '0.5rem 0 0 0', fontSize: '0.84rem' }}>Last submission: {item.lastSubmittedAt ? new Date(item.lastSubmittedAt).toLocaleString() : '—'}</p>
                                                    <p style={{ ...mutedStyle, margin: '0.25rem 0 0 0', fontSize: '0.84rem' }}>Option changes: {item.totalOptionChanges}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                <section style={cardStyle}>
                                    <h3 style={{ marginTop: 0 }}>Performance Snapshot</h3>
                                    <p style={mutedStyle}>Best Raw Score: <strong>{analytics?.bestScore ?? 0}</strong></p>
                                    <p style={mutedStyle}>Average Score: <strong>{analytics?.averagePercent ?? 0}%</strong></p>
                                    <p style={mutedStyle}>Total Submissions: <strong>{analytics?.submissionsCount ?? 0}</strong></p>
                                    <p style={mutedStyle}>Cheating Terminations: <strong>{analytics?.cheatingTerminations ?? 0}</strong></p>
                                    <p style={mutedStyle}>Average Option Changes: <strong>{analytics?.avgOptionChanges ?? 0}</strong></p>
                                </section>
                            </>
                        )}

                        {activeView === 'insights' && (
                            <>
                                <section style={cardStyle}>
                                    <h3 style={{ marginTop: 0 }}>Student Data Insights</h3>
                                    <p style={mutedStyle}>Dedicated chart hub for score, cheating behavior, and answer-change trends.</p>
                                    <button onClick={loadInsights} style={primaryBtnStyle}>Refresh Insights Data</button>
                                </section>

                                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                                    <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f3c79' }}>Students Live Now</div>
                                        <div style={{ marginTop: '0.75rem', fontSize: '2rem', fontWeight: 900, color: '#2563eb' }}>{analytics?.activeSessionCount ?? 0}</div>
                                        <p style={{ ...mutedStyle, marginTop: '0.5rem' }}>Active exam sessions currently in progress.</p>
                                    </div>
                                    <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f3c79' }}>Eliminated Students</div>
                                        <div style={{ marginTop: '0.75rem', fontSize: '2rem', fontWeight: 900, color: '#be123c' }}>{analytics?.eliminatedDueToCheating ?? 0}</div>
                                        <p style={{ ...mutedStyle, marginTop: '0.5rem' }}>Students terminated for cheating policy violations.</p>
                                    </div>
                                    <div style={{ padding: '1rem', borderRadius: '18px', background: '#f8fafc', border: '1px solid #dbe4ef' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f3c79' }}>Times Cheated</div>
                                        <div style={{ marginTop: '0.75rem', fontSize: '2rem', fontWeight: 900, color: '#c2410c' }}>{analytics?.totalCheatingAttempts ?? 0}</div>
                                        <p style={{ ...mutedStyle, marginTop: '0.5rem' }}>Total suspicious behavior events flagged so far.</p>
                                    </div>
                                </div>

                                <section style={cardStyle}>
                                    <h4 style={{ marginTop: 0 }}>Insights Action Plan</h4>
                                    <p style={{ ...mutedStyle, marginTop: '-0.25rem' }}>Quick, data-driven recommendations you can act on immediately.</p>
                                    <div style={{ display: 'grid', gap: '0.9rem', marginTop: '1rem' }}>
                                        <div style={{ padding: '1rem', borderRadius: '16px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                            <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#1d4ed8' }}>Review low-performing sections</strong>
                                            <p style={{ ...mutedStyle, margin: 0 }}>These sections may need immediate review: <strong>{lowSectionNames}</strong>.</p>
                                        </div>
                                        <div style={{ padding: '1rem', borderRadius: '16px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                                            <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#b91c1c' }}>Prioritize flagged students</strong>
                                            <p style={{ ...mutedStyle, margin: 0 }}>Focus on the {suspiciousStudentCount} student{suspiciousStudentCount === 1 ? '' : 's'} with active cheat flags.</p>
                                        </div>
                                        <div style={{ padding: '1rem', borderRadius: '16px', background: '#ecfdf5', border: '1px solid #bbf7d0' }}>
                                            <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#15803d' }}>Monitor score distribution</strong>
                                            <p style={{ ...mutedStyle, margin: 0 }}>If many students are in the lower score buckets, adjust question difficulty and pacing.</p>
                                        </div>
                                    </div>
                                </section>
                                <div style={responsiveGridStyle}>
                                    <section style={cardStyle}>
                                        <h4 style={{ marginTop: 0 }}>Score Distribution (Pie)</h4>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <div
                                                style={{
                                                    width: `${pieSize}px`,
                                                    height: `${pieSize}px`,
                                                    borderRadius: '50%',
                                                    background: scorePieGradient,
                                                    border: '1px solid #c7d9f4',
                                                    boxShadow: 'inset 0 0 0 10px rgba(255,255,255,0.55)'
                                                }}
                                            />
                                            <div style={{ flex: 1, minWidth: isMobile ? '100%' : '200px' }}>
                                                {scoreBuckets.length === 0 && <p style={mutedStyle}>No score data available.</p>}
                                                {scoreBuckets.map((bucket, index) => (
                                                    <div key={bucket.bucket} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#274978', fontSize: '0.86rem' }}>
                                                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: pieColors[index % pieColors.length], display: 'inline-block' }} />
                                                            {bucket.bucket}%
                                                        </span>
                                                        <span style={{ ...mutedStyle, margin: 0 }}>{bucket.count}</span>
                                                    </div>
                                                ))}
                                                <p style={{ ...mutedStyle, marginTop: '0.6rem' }}>Total attempts counted: <strong>{totalScoreBucketCount}</strong></p>
                                            </div>
                                        </div>
                                    </section>

                                    <section style={cardStyle}>
                                        <h4 style={{ marginTop: 0 }}>Section Performance (Bar)</h4>
                                        <div style={{ display: 'grid', gap: '0.55rem' }}>
                                            {sectionPerformance.length === 0 && <p style={mutedStyle}>No section analytics available.</p>}
                                            {sectionPerformance.map((item, idx) => (
                                                <div key={`${item.sectionName ?? 'unknown'}-${idx}`}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ color: '#224777', fontWeight: 700, fontSize: '0.84rem' }}>{item.sectionName}</span>
                                                        <span style={mutedStyle}>{item.avgPercent}% ({item.attempts} attempts)</span>
                                                    </div>
                                                    <div style={{ height: '10px', background: '#e2ebf8', borderRadius: '999px', overflow: 'hidden' }}>
                                                        <div
                                                            style={{
                                                                width: `${sectionMaxPercent > 0 ? (item.avgPercent / sectionMaxPercent) * 100 : 0}%`,
                                                                height: '100%',
                                                                borderRadius: '999px',
                                                                background: 'linear-gradient(120deg, #1d5fc5, #29b6f6)'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <section style={cardStyle}>
                                    <h4 style={{ marginTop: 0 }}>Top Students (Bar)</h4>
                                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                                        {topStudents.length === 0 && <p style={mutedStyle}>No student ranking data available.</p>}
                                        {topStudents.map((student, index) => (
                                            <div key={`${student.studentName}-${index}`} style={{ border: '1px solid #d1def4', borderRadius: '8px', padding: '0.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <strong style={{ color: '#1e3f73' }}>{student.studentName}</strong>
                                                    <span style={mutedStyle}>{student.avgPercent}%</span>
                                                </div>
                                                <p style={{ ...mutedStyle, margin: '0.18rem 0' }}>Credential: {student.studentCredential || '-'}</p>
                                                <p style={{ ...mutedStyle, margin: '0.18rem 0' }}>Attempts: {student.attempts}</p>
                                                <div style={{ height: '9px', background: '#e2ebf8', borderRadius: '999px', overflow: 'hidden' }}>
                                                    <div
                                                        style={{
                                                            width: `${topStudentMaxPercent > 0 ? (student.avgPercent / topStudentMaxPercent) * 100 : 0}%`,
                                                            height: '100%',
                                                            borderRadius: '999px',
                                                            background: 'linear-gradient(120deg, #0f9d58, #3bcf93)'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section style={cardStyle}>
                                    <h4 style={{ marginTop: 0 }}>Behavior Trends (Line)</h4>
                                    <p style={mutedStyle}>Last 14 days: submissions vs cheating attempts vs option changes.</p>
                                    {timeline.length === 0 ? (
                                        <p style={mutedStyle}>No trend timeline available yet.</p>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <svg width={timelineChartWidth} height={280} style={{ display: 'block' }}>
                                                <rect x="0" y="0" width="100%" height="100%" fill="#f8fbff" rx="10" />
                                                {timeline.map((_, idx) => {
                                                    const x = chartStartX + idx * chartPointGap;
                                                    return (
                                                        <line
                                                            key={`grid-${idx}`}
                                                            x1={x}
                                                            y1={24}
                                                            x2={x}
                                                            y2={chartBottomY}
                                                            stroke="#e1ebf9"
                                                            strokeWidth="1"
                                                        />
                                                    );
                                                })}
                                                <line x1={String(chartStartX - 8)} y1={String(chartBottomY)} x2={String(chartStartX + (timeline.length - 1) * chartPointGap)} y2={String(chartBottomY)} stroke="#8dadde" strokeWidth="1.4" />

                                                {['submissions', 'cheatingAttempts', 'optionChanges'].map((series, seriesIndex) => {
                                                    const color = seriesIndex === 0 ? '#2563eb' : (seriesIndex === 1 ? '#ef4444' : '#f59e0b');
                                                    const points = timeline.map((item, idx) => {
                                                        const value = series === 'submissions'
                                                            ? item.submissions
                                                            : (series === 'cheatingAttempts' ? item.cheatingAttempts : item.optionChanges);
                                                        const normalized = timelineMaxValue > 0 ? (value / timelineMaxValue) : 0;
                                                        const x = chartStartX + idx * chartPointGap;
                                                        const y = chartBottomY - normalized * chartMaxHeight;
                                                        return `${x},${y}`;
                                                    }).join(' ');

                                                    return (
                                                        <g key={series}>
                                                            <polyline
                                                                points={points}
                                                                fill="none"
                                                                stroke={color}
                                                                strokeWidth="2.8"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                            {timeline.map((item, idx) => {
                                                                const value = series === 'submissions'
                                                                    ? item.submissions
                                                                    : (series === 'cheatingAttempts' ? item.cheatingAttempts : item.optionChanges);
                                                                const normalized = timelineMaxValue > 0 ? (value / timelineMaxValue) : 0;
                                                                const x = chartStartX + idx * chartPointGap;
                                                                const y = chartBottomY - normalized * chartMaxHeight;

                                                                return <circle key={`${series}-${idx}`} cx={x} cy={y} r="3.2" fill={color} />;
                                                            })}
                                                        </g>
                                                    );
                                                })}

                                                {timeline.map((item, idx) => {
                                                    const x = chartStartX + idx * chartPointGap;
                                                    return (
                                                        <text key={`label-${idx}`} x={x} y="242" textAnchor="middle" fontSize="10" fill="#4a6ea3">
                                                            {item.day.slice(5)}
                                                        </text>
                                                    );
                                                })}
                                            </svg>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
                                        <span style={{ ...mutedStyle, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />Submissions</span>
                                        <span style={{ ...mutedStyle, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />Cheating Attempts</span>
                                        <span style={{ ...mutedStyle, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />Option Changes</span>
                                    </div>
                                </section>
                            </>
                        )}

                        {activeView === 'reports' && (
                            <>
                                <section style={cardStyle}>
                                    <h3 style={{ marginTop: 0 }}>Reports Center</h3>
                                    <p style={mutedStyle}>Use professional exports and executive snapshots for audits and management reporting.</p>
                                    <div style={responsiveRowStyle}>
                                        <button onClick={exportAllDetailedCsv} style={primaryBtnStyle}>Export Detailed Performance CSV</button>
                                        <button onClick={loadRecentSubmissions} style={secondaryBtnStyle}>Refresh Latest Records</button>
                                    </div>
                                </section>

                                <div style={responsiveGridStyle}>
                                    <section style={cardStyle}>
                                        <h4 style={{ marginTop: 0 }}>Executive Snapshot</h4>
                                        <p style={mutedStyle}>Total Students: <strong>{analytics?.studentsCount ?? 0}</strong></p>
                                        <p style={mutedStyle}>Total Sections: <strong>{analytics?.sectionsCount ?? 0}</strong></p>
                                        <p style={mutedStyle}>Total Submissions: <strong>{analytics?.submissionsCount ?? 0}</strong></p>
                                        <p style={mutedStyle}>Average Score: <strong>{analytics?.averagePercent ?? 0}%</strong></p>
                                        <p style={mutedStyle}>Best Score: <strong>{analytics?.bestScore ?? 0}</strong></p>
                                    </section>

                                    <section style={cardStyle}>
                                        <h4 style={{ marginTop: 0 }}>Integrity Summary</h4>
                                        <p style={mutedStyle}>Cheating Terminations: <strong>{analytics?.cheatingTerminations ?? 0}</strong></p>
                                        <p style={mutedStyle}>Cheating Attempts: <strong>{analytics?.totalCheatingAttempts ?? 0}</strong></p>
                                        <p style={mutedStyle}>Option Changes: <strong>{analytics?.totalOptionChanges ?? 0}</strong></p>
                                        <p style={mutedStyle}>Average Option Changes: <strong>{analytics?.avgOptionChanges ?? 0}</strong></p>
                                    </section>
                                </div>

                                <section style={cardStyle}>
                                    <h4 style={{ marginTop: 0, marginBottom: '0.25rem' }}>Recent Student Entries</h4>
                                    <p style={{ ...mutedStyle, marginBottom: '1rem' }}>Each student appears once — scores & sections are combined</p>
                                    <div style={listStyle}>
                                        {recentSubmissions.length === 0 && <p style={mutedStyle}>No recent submission records available.</p>}
                                        {recentSubmissions.slice(0, 10).map((item) => {
                                            const pct = item.percent ?? 0;
                                            const pctColor = pct >= 75 ? '#15803d' : pct >= 50 ? '#b45309' : '#be123c';
                                            return (
                                                <div key={item._id} style={{ ...itemStyle, padding: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        <div>
                                                            <strong style={{ fontSize: '1rem', color: '#13366c' }}>{item.student?.name || 'Unknown Student'}</strong>
                                                            {item.student?.studentCredential && <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', background: '#e8f1ff', color: '#2d6dd3', borderRadius: '999px', padding: '0.15rem 0.5rem', fontWeight: 700 }}>{item.student.studentCredential}</span>}
                                                        </div>
                                                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: pctColor }}>{pct}%</span>
                                                    </div>
                                                    <p style={{ ...mutedStyle, margin: '0.4rem 0 0.3rem 0', fontSize: '0.82rem' }}>
                                                        <strong>Total:</strong> {item.totalScore}/{item.totalMaxScore} pts &nbsp;&middot;&nbsp;
                                                        <strong>Sections:</strong> {item.submissionsCount} &nbsp;&middot;&nbsp;
                                                        <strong>Answered:</strong> {item.totalAttempted}/{item.totalQuestions}
                                                        {item.terminatedDueToCheating && <span style={{ marginLeft: '0.5rem', color: '#dc2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Icon name="warning" size={14} color="#dc2626" /> Flagged</span>}
                                                    </p>
                                                    <p style={{ ...mutedStyle, fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                                                        {(item.sections ?? []).length > 0 ? (item.sections ?? []).map(s => `${s.name} (${s.score}/${s.maxScore})`).join(' &middot; ') : '&mdash;'}
                                                    </p>
                                                    <p style={{ ...mutedStyle, fontSize: '0.76rem', margin: '0.2rem 0 0 0' }}>Last: {new Date(item.lastSubmittedAt).toLocaleString()}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </>
                        )}

                        {activeView === 'profile' && (
                            <div style={{ maxWidth: '850px', margin: '0 0' }}>
                                <section style={cardStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                                        <div style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '24px',
                                            background: 'linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `1px solid #c8d9f5`,
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
                                        }}>
                                            {adminIdentity?.imageUrl ? (
                                                <img src={adminIdentity.imageUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '24px', objectFit: 'cover' }} />
                                            ) : (
                                                <Icon name="user" size={48} color="#1d4ed8" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 style={{ margin: 0, color: '#13366c', fontSize: '1.75rem', fontWeight: 900 }}>{adminIdentity?.name || 'Administrator'}</h2>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.4rem' }}>
                                                <span style={{ background: adminIdentity?.role === 'super_admin' ? '#fef2f2' : '#f0f9ff', color: adminIdentity?.role === 'super_admin' ? '#dc2626' : '#0369a1', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, border: adminIdentity?.role === 'super_admin' ? '1px solid #fee2e2' : '1px solid #e0f2fe' }}>
                                                    {adminIdentity?.role === 'super_admin' ? 'SUPER ADMINISTRATOR' : 'ORGANIZATION ADMIN'}
                                                </span>
                                                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>&bull; Account Active</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ ...responsiveGridStyle, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                                        <div style={itemStyle}>
                                            <p style={{ ...mutedStyle, fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.4rem', color: '#1b4f95' }}>Official Email</p>
                                            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.05rem' }}>{adminIdentity?.email || 'N/A'}</p>
                                        </div>
                                        <div style={itemStyle}>
                                            <p style={{ ...mutedStyle, fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.4rem', color: '#1b4f95' }}>Contact Number</p>
                                            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.05rem' }}>{adminIdentity?.phone || 'N/A'}</p>
                                        </div>
                                        <div style={itemStyle}>
                                            <p style={{ ...mutedStyle, fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.4rem', color: '#1b4f95' }}>Subscription Level</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Icon name="lightning" size={16} color="#f59e0b" />
                                                <span style={{ color: '#b45309', fontWeight: 800, fontSize: '1.05rem' }}>
                                                    {adminIdentity?.plan || (adminIdentity?.role === 'super_admin' ? 'Enterprise Global' : 'Enterprise Business')}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={itemStyle}>
                                            <p style={{ ...mutedStyle, fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.4rem', color: '#1b4f95' }}>Organization Key</p>
                                            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.05rem', fontFamily: 'monospace' }}>{adminIdentity?.tenantKey || 'ROOT_TENANT'}</p>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '3rem', padding: '1.5rem', borderRadius: '16px', background: '#f8fbff', border: '1px solid #d8e5f8' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon name="help" size={18} color="#fff" />
                                            </div>
                                            <h4 style={{ margin: 0, color: '#13366c', fontSize: '1.1rem', fontWeight: 800 }}>Company & Engineering Support</h4>
                                        </div>
                                        <p style={{ ...mutedStyle, margin: '0 0 1.2rem 0', maxWidth: '600px' }}>
                                            For technical assistance, white-labeling requests, or customized exam infrastructure, please reach out directly to our engineering team.
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Primary Email:</span>
                                                <a href="mailto:info@indocreonix.com" style={{ fontSize: '0.95rem', color: '#2563eb', fontWeight: 800, textDecoration: 'none', borderBottom: '1.5px solid #bfdbfe' }}>info@indocreonix.com</a>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Tech Support:</span>
                                                <span style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 700 }}>support.help@indocreonix.com</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeView === 'users' && adminIdentity?.role === 'super_admin' && (
                            <>
                                <section style={cardStyle}>
                                    <h3 style={{ marginTop: 0 }}>User Management</h3>
                                    {adminIdentity?.role !== 'super_admin' ? (
                                        <>
                                            <p style={mutedStyle}>Your current account identity and access scope are shown below.</p>
                                            <div style={itemStyle}>
                                                <p style={mutedStyle}>Name: <strong>{adminIdentity?.name || '-'}</strong></p>
                                                <p style={mutedStyle}>Email: <strong>{adminIdentity?.email || '-'}</strong></p>
                                                <p style={mutedStyle}>Role: <strong>Organization Admin</strong></p>
                                                <p style={mutedStyle}>Organization Code: <strong>{adminIdentity?.tenantKey || 'Assigned by system'}</strong></p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p style={mutedStyle}>Super administrators can monitor and control organization-level admin access from here.</p>
                                            <div style={responsiveRowStyle}>
                                                <button onClick={loadManagedAdmins} style={primaryBtnStyle}>Reload Admin Accounts</button>
                                                <button onClick={() => openView('tenants')} style={secondaryBtnStyle}>Open Organization Control</button>
                                            </div>
                                            <div style={listStyle}>
                                                {managedAdmins.length === 0 && <p style={mutedStyle}>No managed organization admins available.</p>}
                                                {managedAdmins.map((item) => (
                                                    <div key={item._id} style={itemStyle}>
                                                        <strong>{item.name}</strong>
                                                        <p style={mutedStyle}>{item.email}</p>
                                                        <p style={mutedStyle}>Phone: {item.phone || 'N/A'}</p>
                                                        <p style={mutedStyle}>Organization Code: {item.tenantKey}</p>
                                                        <p style={mutedStyle}>Created: {new Date(item.createdAt).toLocaleString()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </section>
                            </>
                        )}

                        {activeView === 'settings' && (
                            <>
                                <section style={cardStyle}>
                                    <h3 style={{ marginTop: 0 }}>Platform Settings</h3>
                                    <p style={mutedStyle}>Central location for operational standards and readiness checks.</p>
                                    <div style={responsiveGridStyle}>
                                        <div style={itemStyle}>
                                            <strong>Exam Readiness</strong>
                                            <p style={mutedStyle}>Duration policy: {examDuration} minutes</p>
                                            <p style={mutedStyle}>Examiner identity: {examinerName}</p>
                                            <button onClick={() => openView('config')} style={secondaryBtnStyle}>Update Exam Configuration</button>
                                        </div>
                                        <div style={itemStyle}>
                                            <strong>Data Operations</strong>
                                            <p style={mutedStyle}>Refresh analytics before major reporting windows.</p>
                                            <button onClick={loadAnalytics} style={secondaryBtnStyle}>Reload Analytics</button>
                                        </div>
                                        <div style={itemStyle}>
                                            <strong>Support and Workflow</strong>
                                            <p style={mutedStyle}>Use guided help for standard day-to-day administration.</p>
                                            <button onClick={() => openView('help')} style={secondaryBtnStyle}>Open Help Center</button>
                                        </div>
                                    </div>
                                </section>

                                <section style={cardStyle}>
                                    <h3 style={{ marginTop: 0 }}>Calculator Permissions</h3>
                                    <p style={mutedStyle}>Control whether students can use calculators during exams and which calculator types are available.</p>
                                    <div style={responsiveGridStyle}>
                                        <div style={itemStyle}>
                                            <strong>Calculator Access</strong>
                                            <p style={mutedStyle}>Current permission: {calculatorEnabled ? 'Enabled' : 'Disabled'}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={toggleCalculatorEnabled}
                                                    style={{
                                                        ...secondaryBtnStyle,
                                                        borderRadius: 999,
                                                        padding: '0.75rem 1.25rem',
                                                        minWidth: 150,
                                                        background: calculatorEnabled ? '#22c55e' : '#f97316',
                                                        color: '#fff',
                                                        borderColor: calculatorEnabled ? '#16a34a' : '#ea580c',
                                                    }}
                                                >
                                                    {calculatorEnabled ? 'Calculator ON' : 'Calculator OFF'}
                                                </button>
                                                <span style={{ color: '#334155', fontSize: '0.95rem' }}>
                                                    {calculatorEnabled ? 'Students can access the calculator.' : 'Calculator access is disabled for students.'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={itemStyle}>
                                            <strong>Calculator Type Toggles</strong>
                                            <p style={{ ...mutedStyle, marginTop: '0.5rem' }}>
                                                Enable one calculator type at a time. Each calculator has its own dedicated on/off control.
                                            </p>
                                            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                                                {(['Simple', 'Scientific ES991', 'Scientific ES82', 'Financial'] as CalculatorMode[]).map((type) => {
                                                    const isActive = activeCalculatorType === type;
                                                    return (
                                                        <div key={type} style={{ alignItems: 'center', display: 'flex', gap: '0.75rem', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                                                            <div>
                                                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{type}</div>
                                                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{isActive ? 'Enabled for students' : 'Disabled for students'}</div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveCalculatorTypeAction(isActive ? null : type)}
                                                                style={{
                                                                    padding: '0.6rem 1rem',
                                                                    borderRadius: 999,
                                                                    border: '1px solid transparent',
                                                                    background: isActive ? '#22c55e' : '#f8fafc',
                                                                    color: isActive ? '#fff' : '#0f172a',
                                                                    cursor: 'pointer',
                                                                    minWidth: 90,
                                                                    fontWeight: 700,
                                                                    boxShadow: isActive ? '0 4px 12px rgba(34,118,186,0.16)' : 'none',
                                                                }}
                                                            >
                                                                {isActive ? 'ON' : 'OFF'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <p style={{ ...mutedStyle, marginTop: '0.75rem' }}>
                                                Only one calculator type may be active at a time. Click an active calculator to turn it off.
                                            </p>
                                            {!calculatorEnabled && (
                                                <p style={{ ...mutedStyle, marginTop: '0.5rem' }}>
                                                    Calculator access is currently off. The selected type will be active once calculator access is enabled.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}

                        {activeView === 'calculator' && (
                            <section style={cardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <h3 style={{ marginTop: 0 }}>Calculator Utility</h3>
                                        <p style={mutedStyle}>Use the built-in calculator for admin support. Student use is only available when the super admin enables it in settings.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleCalculatorEnabled}
                                        style={{
                                            ...secondaryBtnStyle,
                                            borderRadius: 999,
                                            padding: '0.8rem 1.25rem',
                                            minWidth: 140,
                                            background: calculatorEnabled ? '#22c55e' : '#f97316',
                                            color: '#fff',
                                            borderColor: calculatorEnabled ? '#16a34a' : '#ea580c',
                                            alignSelf: 'center',
                                        }}
                                    >
                                        {calculatorEnabled ? 'Calculator ON' : 'Calculator OFF'}
                                    </button>
                                </div>
                                <div style={{ marginTop: '1rem', color: '#475569', fontSize: '0.95rem' }}>
                                    Student calculator access is currently <strong>{calculatorEnabled ? 'Enabled' : 'Disabled'}</strong>.
                                </div>
                                <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                                        {(['Simple', 'Scientific ES991', 'Scientific ES82', 'Financial'] as CalculatorMode[]).map((type) => {
                                            const isActive = activeCalculatorType === type;
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setActiveCalculatorTypeAction(isActive ? null : type)}
                                                    style={{
                                                        padding: '0.85rem 1rem',
                                                        borderRadius: 999,
                                                        border: '1px solid',
                                                        borderColor: isActive ? '#2563eb' : '#cbd5e1',
                                                        background: isActive ? '#2563eb' : '#f8fafc',
                                                        color: isActive ? '#ffffff' : '#0f172a',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {type} - {isActive ? 'ON' : 'OFF'}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div style={{ color: '#475569', fontSize: '0.92rem' }}>
                                        <strong>Active calculator type:</strong> {activeCalculatorType || 'None selected'}.
                                        <br />
                                        {calculatorEnabled
                                            ? ' Students can use the selected calculator type.'
                                            : ' Calculator access is off; the selected type will apply once enabled.'}
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <Calculator allowedTypes={calculatorSettings.allowedTypes} />
                                </div>
                            </section>
                        )}

                        {activeView === 'tenants' && (
                            <>
                                <section style={cardStyle}>
                                    <h3 style={{ marginTop: 0 }}>Organization Admin Management</h3>
                                    {adminIdentity?.role !== 'super_admin' ? (
                                        <p style={errStyle}>Only super administrators can access this page.</p>
                                    ) : (
                                        <>
                                            <button onClick={loadManagedAdmins} style={secondaryBtnStyle}>Reload Organization Admins</button>
                                            <form onSubmit={createTenantAdmin}>
                                                <label>Admin Name</label>
                                                <input value={newTenantAdminName} onChange={(e) => setNewTenantAdminName(e.target.value)} required style={inputStyle} />
                                                <label>Admin Email</label>
                                                <input value={newTenantAdminEmail} onChange={(e) => setNewTenantAdminEmail(e.target.value)} type="email" required style={inputStyle} />
                                                <label>Admin Password</label>
                                                <input value={newTenantAdminPassword} onChange={(e) => setNewTenantAdminPassword(e.target.value)} type="password" minLength={6} required style={inputStyle} />
                                                <label>Admin Mobile Number</label>
                                                <input value={newTenantAdminPhone} onChange={(e) => setNewTenantAdminPhone(e.target.value)} placeholder="+91 ..." style={inputStyle} />
                                                <label>Maximum Student Intake (Student Limit)</label>
                                                <input type="number" value={newTenantAdminStudentLimit} onChange={(e) => setNewTenantAdminStudentLimit(e.target.value)} required style={inputStyle} min={1} />
                                                <label>Organization Code (optional, auto-generated if empty)</label>
                                                <input value={newTenantKey} onChange={(e) => setNewTenantKey(e.target.value)} style={inputStyle} />
                                                <button type="submit" style={primaryBtnStyle}>Create Organization Admin</button>
                                            </form>

                                            <div style={listStyle}>
                                                {managedAdmins.map((item) => (
                                                    <div key={item._id} style={itemStyle}>
                                                        <strong>{item.name}</strong>
                                                        <p style={mutedStyle}>{item.email}</p>
                                                        <p style={mutedStyle}>Phone: {item.phone || 'N/A'}</p>
                                                        <p style={mutedStyle}>Organization Code: {item.tenantKey}</p>
                                                        <p style={mutedStyle}>Student Limit: {item.studentLimit ?? 0}</p>
                                                        <p style={mutedStyle}>Students Used: {item.studentCount ?? 0}</p>
                                                        <p style={mutedStyle}>Created: {new Date(item.createdAt).toLocaleString()}</p>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTenantAdminId(item._id);
                                                                setStatus(`Active organization context switched to ${item.name}.`);
                                                            }}
                                                            style={secondaryBtnStyle}
                                                        >
                                                            Use This Organization Context
                                                        </button>
                                                        {adminIdentity?.role === 'super_admin' && (
                                                            <>
                                                                <button
                                                                    onClick={() => promptUpdateManagedAdminLimit(item._id)}
                                                                    style={{
                                                                        ...secondaryBtnStyle,
                                                                        fontSize: '0.74rem',
                                                                        padding: '0.25rem 0.6rem',
                                                                        margin: '0.5rem 0 0 0',
                                                                        width: 'auto'
                                                                    }}
                                                                >
                                                                    Edit Seat Limit
                                                                </button>
                                                                <button
                                                                    onClick={() => promptDeleteManagedAdmin(item._id)}
                                                                    style={{
                                                                        ...dangerBtnStyle,
                                                                        fontSize: '0.74rem',
                                                                        padding: '0.25rem 0.6rem',
                                                                        margin: '0.5rem 0 0 0',
                                                                        width: 'auto'
                                                                    }}
                                                                >
                                                                    Delete Admin
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                                {managedAdmins.length === 0 && <p style={mutedStyle}>No organization admins found yet.</p>}
                                            </div>
                                        </>
                                    )}
                                </section>

                                <section style={cardStyle}>
                                    <h3 style={{ marginTop: 0 }}>Super Administrator Management</h3>
                                    {adminIdentity?.role !== 'super_admin' ? (
                                        <p style={errStyle}>Only super administrators can create more super administrators.</p>
                                    ) : (
                                        <form onSubmit={createExtraSuperAdmin}>
                                            <label>Super Admin Name</label>
                                            <input value={newSuperAdminName} onChange={(e) => setNewSuperAdminName(e.target.value)} required style={inputStyle} />
                                            <label>Super Admin Email</label>
                                            <input value={newSuperAdminEmail} onChange={(e) => setNewSuperAdminEmail(e.target.value)} type="email" required style={inputStyle} />
                                            <label>Super Admin Password</label>
                                            <input value={newSuperAdminPassword} onChange={(e) => setNewSuperAdminPassword(e.target.value)} type="password" minLength={6} required style={inputStyle} />
                                            <label>Super Admin Mobile Number</label>
                                            <input value={newSuperAdminPhone} onChange={(e) => setNewSuperAdminPhone(e.target.value)} placeholder="+91 ..." style={inputStyle} />
                                            <button type="submit" style={primaryBtnStyle}>Create Additional Super Admin</button>
                                        </form>
                                    )}
                                </section>
                            </>
                        )}

                        {activeView === 'demo-exam' && renderDemoExamPanel()}
                        {activeView === 'help' && (
                            <section style={cardStyle}>
                                <h3 style={{ marginTop: 0 }}>Help Center</h3>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem', borderRadius: '18px', background: '#eef4ff', border: '1px solid #d3e2fb' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontWeight: 700, color: '#0f3c79' }}>Help Center Navigation</h4>
                                            <p style={{ margin: '0.6rem 0 0', color: '#334155', lineHeight: 1.7 }}>
                                                Click any page name below to show detailed help for that page. Use the button to expand or collapse all help sections at once.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={toggleAllHelpTopics}
                                            style={{
                                                ...secondaryBtnStyle,
                                                width: 'auto',
                                                padding: '0.85rem 1.2rem',
                                                borderRadius: '999px'
                                            }}
                                        >
                                            {allHelpExpanded ? 'Hide All Help' : 'Show All Help'}
                                        </button>
                                    </div>

                                    {helpTopics.map((topic) => (
                                        <div key={topic.key} style={{ padding: '1.2rem', borderRadius: '18px', background: '#ffffff', border: '1px solid #e4e9f7' }}>
                                            <button
                                                type="button"
                                                onClick={() => toggleHelpTopic(topic.key)}
                                                style={{
                                                    ...secondaryBtnStyle,
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '1rem 1.1rem',
                                                    borderRadius: '16px',
                                                    background: '#f8f9ff',
                                                    border: '1px solid #d8e2f4',
                                                    fontWeight: 700,
                                                    color: '#0f3c79'
                                                }}
                                            >
                                                <span>{topic.title}</span>
                                                <span style={{ fontSize: '0.95rem', color: '#475569' }}>{expandedHelpTopics.has(topic.key) ? 'Hide' : 'Show'}</span>
                                            </button>

                                            {expandedHelpTopics.has(topic.key) && (
                                                <div style={{ marginTop: '1rem', color: '#334155', lineHeight: 1.75 }}>
                                                    <p style={{ margin: '0 0 1rem 0' }}>{topic.description}</p>
                                                    <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                                                        {topic.steps.map((step, index) => (
                                                            <li key={index} style={{ margin: '0.5rem 0' }}>{step}</li>
                                                        ))}
                                                    </ol>
                                                    {topic.tips && topic.tips.length > 0 && (
                                                        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '16px', background: '#f8fbff', border: '1px solid #d8e5f8' }}>
                                                            <p style={{ margin: '0 0 0.75rem 0', fontWeight: 700, color: '#0f3c79' }}>Tips</p>
                                                            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.75 }}>
                                                                {topic.tips.map((tip, index) => (
                                                                    <li key={index} style={{ margin: '0.4rem 0' }}>{tip}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div style={{ padding: '1.2rem', borderRadius: '18px', background: '#f7fbff', border: '1px solid #d1dff5' }}>
                                        <h4 style={{ margin: 0, fontWeight: 700, color: '#0f3c79' }}>Question By AI</h4>
                                        <p style={{ margin: '0.75rem 0 0', color: '#334155', lineHeight: 1.75 }}>
                                            Use this ready-to-copy AI prompt to generate exam papers in XLSX format. After generating, verify the results manually before importing the file into the system.
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                            <p style={{ margin: 0, color: '#0f3c79', fontWeight: 600 }}>Copy the prompt and use it in a compatible AI tool.</p>
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                <button
                                                    type="button"
                                                    onClick={copyHelpPrompt}
                                                    style={{
                                                        ...secondaryBtnStyle,
                                                        width: 'auto',
                                                        padding: '0.75rem 1.1rem',
                                                        borderRadius: '999px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        background: helpPromptCopied ? '#10b981' : secondaryBtnStyle.background,
                                                        borderColor: helpPromptCopied ? '#059669' : secondaryBtnStyle.borderColor,
                                                        color: helpPromptCopied ? '#ffffff' : secondaryBtnStyle.color,
                                                    }}
                                                >
                                                    {helpPromptCopied ? 'Copied!' : 'Copy Prompt'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={getPromptForExam}
                                                    style={{
                                                        ...secondaryBtnStyle,
                                                        width: 'auto',
                                                        padding: '0.75rem 1.1rem',
                                                        borderRadius: '999px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        background: '#e0f2fe',
                                                        borderColor: '#7dd3fc',
                                                        color: '#0369a1'
                                                    }}
                                                >
                                                    Get Prompt
                                                </button>
                                            </div>
                                        </div>
                                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '1rem', padding: '1rem', borderRadius: '16px', background: '#0f1d3f', color: '#eef2ff', fontSize: '0.82rem', lineHeight: 1.6, maxHeight: '320px', overflowY: 'auto' }}>
                                            {getHelpPromptText()}
                                        </pre>
                                    </div>
                                </div>
                            </section>
                        )}
                    </main>
                </div>

                {modalState && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 200,
                            background: 'rgba(15, 23, 42, 0.45)',
                            backdropFilter: 'blur(6px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1.25rem'
                        }}
                        onClick={closeModal}
                    >
                        <div
                            onClick={(event) => event.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '540px',
                                background: '#f8fbff',
                                borderRadius: '24px',
                                padding: '1.5rem',
                                boxShadow: '0 32px 90px rgba(15, 23, 42, 0.18)',
                                border: '1px solid rgba(96, 165, 250, 0.18)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.45rem', color: '#0f3c79' }}>{modalState.title}</h3>
                                    <p style={{ margin: 0, color: '#475569', lineHeight: 1.75 }}>{modalState.message}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#0f172a',
                                        fontSize: '1.5rem',
                                        lineHeight: 1,
                                        cursor: 'pointer'
                                    }}
                                    aria-label="Close dialog"
                                >
                                    ×
                                </button>
                            </div>

                            {(modalState.type === 'examPrompt' || modalState.type === 'updateManagedAdminLimit') && (
                                <>
                                    <label style={{ marginBottom: '0.35rem', display: 'block', color: '#0f3c79', fontWeight: 700 }}>
                                        {modalState.inputLabel}
                                    </label>
                                    <input
                                        type={modalState.type === 'updateManagedAdminLimit' ? 'number' : 'text'}
                                        min={modalState.type === 'updateManagedAdminLimit' ? 1 : undefined}
                                        value={modalState.inputValue || ''}
                                        onChange={(event) => setModalState((previous) => previous ? { ...previous, inputValue: event.target.value } : previous)}
                                        placeholder={modalState.inputPlaceholder}
                                        style={inputStyle}
                                    />
                                </>
                            )}

                            {modalState.type === 'examPrompt' && (
                                <>
                                    <label style={{ margin: '1rem 0 0.35rem', display: 'block', color: '#0f3c79', fontWeight: 700 }}>
                                        Difficulty Level
                                    </label>
                                    <select
                                        value={examPromptDifficulty}
                                        onChange={(event) => setExamPromptDifficulty(event.target.value)}
                                        style={{ ...inputStyle, appearance: 'none', background: '#fff' }}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </>
                            )}

                            {modalState.type === 'editSection' && (
                                <>
                                    <label style={{ marginBottom: '0.35rem', display: 'block', color: '#0f3c79', fontWeight: 700 }}>Section Name</label>
                                    <input
                                        value={sectionModalName}
                                        onChange={(event) => setSectionModalName(event.target.value)}
                                        placeholder="Section title"
                                        style={inputStyle}
                                    />
                                    <label style={{ marginBottom: '0.35rem', display: 'block', color: '#0f3c79', fontWeight: 700 }}>Section Description</label>
                                    <textarea
                                        value={sectionModalDescription}
                                        onChange={(event) => setSectionModalDescription(event.target.value)}
                                        placeholder="Optional description"
                                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                    />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginTop: '0.5rem', color: '#0f3c79', fontWeight: 700 }}>
                                        <input
                                            type="checkbox"
                                            checked={sectionModalActive}
                                            onChange={(event) => setSectionModalActive(event.target.checked)}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        Keep section active
                                    </label>
                                </>
                            )}

                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.4rem' }}>
                                <button type="button" onClick={closeModal} style={{ ...secondaryBtnStyle, width: 'auto', padding: '0.75rem 1rem' }}>
                                    Cancel
                                </button>
                                <button type="button" onClick={handleModalConfirm} style={{ ...primaryBtnStyle, width: 'auto', padding: '0.75rem 1rem' }}>
                                    {modalState.type === 'editSection' ? 'Save Section' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const pageStyle: React.CSSProperties = {
    background: 'radial-gradient(circle at 20% 10%, #f2f7ff 0%, #e6f0ff 45%, #eaf2ff 100%)',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    width: '100%',
    padding: '0.3rem 0.5rem 0.8rem'
};

const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
    border: '1px solid #c8d9f5',
    borderRadius: '16px',
    padding: '1rem',
    boxShadow: '0 8px 18px rgba(16, 45, 99, 0.08)',
    overflow: 'hidden'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.55rem',
    marginTop: '0.3rem',
    marginBottom: '0.45rem',
    borderRadius: '8px',
    border: '1px solid #c8d7f2'
};

const primaryBtnStyle: React.CSSProperties = {
    width: '100%',
    marginTop: '0.4rem',
    padding: '0.55rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(120deg, #1b57b8, #2383d6)',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer'
};

const secondaryBtnStyle: React.CSSProperties = {
    width: '100%',
    marginTop: '0.4rem',
    padding: '0.55rem',
    borderRadius: '8px',
    border: '1px solid #b7c7e8',
    background: '#f7faff',
    color: '#173a7a',
    fontWeight: 600,
    cursor: 'pointer'
};

const dangerBtnStyle: React.CSSProperties = {
    ...primaryBtnStyle,
    background: '#c03535'
};

const okStyle: React.CSSProperties = {
    marginTop: '0.7rem',
    color: '#1e7b3d',
    background: '#e8f9ed',
    border: '1px solid #bde7c8',
    borderRadius: '8px',
    padding: '0.55rem',
    animation: 'fade-in 0.4s ease-out'
};

const errStyle: React.CSSProperties = {
    marginTop: '0.7rem',
    color: '#a92b2b',
    background: '#ffecec',
    border: '1px solid #f0c1c1',
    borderRadius: '8px',
    padding: '0.55rem',
    animation: 'fade-in 0.4s ease-out'
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '0.7rem'
};

const listStyle: React.CSSProperties = {
    marginTop: '0.45rem',
    maxHeight: 'calc(100vh - 360px)',
    overflow: 'auto'
};

const itemStyle: React.CSSProperties = {
    padding: '0.75rem 0',
    borderBottom: '1px solid #d8e8f3',
    marginBottom: 0,
    background: 'transparent'
};

const mutedStyle: React.CSSProperties = {
    color: '#587199',
    fontSize: '0.85rem'
};

const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
    marginTop: '0.4rem'
};

// ── Login-page-specific shared styles (WHITE/BLUE professional) ──────────────
const loginInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.72rem 1rem',
    marginBottom: '0',
    borderRadius: '10px',
    border: '1.5px solid #d0e4f5',
    background: '#f7fbff',
    color: '#0f2b52',
    fontSize: '0.93rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 180ms ease, box-shadow 180ms ease'
};

const loginPrimaryBtnStyle: React.CSSProperties = {
    width: '100%',
    marginTop: '1.1rem',
    padding: '0.82rem',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(120deg, #0077cc, #0099ff)',
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.93rem',
    letterSpacing: '0.3px',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(0,120,220,0.25)',
    transition: 'opacity 150ms ease, transform 150ms ease'
};

const loginSecondaryBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.7rem',
    borderRadius: '10px',
    border: '1.5px solid #c8dff5',
    background: '#f5faff',
    color: '#2a6db5',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    letterSpacing: '0.2px',
    transition: 'background 150ms ease'
};

const loginOkStyle: React.CSSProperties = {
    marginTop: '0.8rem',
    color: '#1a7a4a',
    background: '#eafaf2',
    border: '1px solid #b5e8ce',
    borderRadius: '8px',
    padding: '0.55rem 0.75rem',
    fontSize: '0.84rem',
    animation: 'fade-in 0.4s ease-out'
};

const loginErrStyle: React.CSSProperties = {
    marginTop: '0.8rem',
    color: '#b53030',
    background: '#fff0f0',
    border: '1px solid #f5bcbc',
    borderRadius: '8px',
    padding: '0.55rem 0.75rem',
    fontSize: '0.84rem',
    animation: 'fade-in 0.4s ease-out'
};

export default AdminApp;
