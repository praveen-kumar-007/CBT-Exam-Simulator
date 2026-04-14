import React, { useEffect, useMemo, useState } from 'react';

type Mode = 'admin-login' | 'super-admin-login' | 'dashboard';
type DashboardView = 'overview' | 'sections' | 'questions' | 'add-question' | 'students' | 'responses' | 'config' | 'activity' | 'insights' | 'reports' | 'users' | 'settings' | 'tenants' | 'help';

type AdminIdentity = {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    tenantKey?: string | null;
};

type ManagedAdminItem = {
    _id: string;
    name: string;
    email: string;
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

type SubmissionExamMeta = {
    terminatedDueToCheating?: boolean;
    terminationRemark?: string;
    cheatingAttempts?: number;
    totalOptionChanges?: number;
    questionInteractions?: SubmissionInteraction[];
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
        };
    };
};

type Analytics = {
    studentsCount: number;
    sectionsCount: number;
    questionsCount: number;
    submissionsCount: number;
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

const DASHBOARD_VIEWS: DashboardView[] = ['overview', 'sections', 'questions', 'add-question', 'students', 'responses', 'config', 'activity', 'insights', 'reports', 'users', 'settings', 'tenants', 'help'];
const DEFAULT_DASHBOARD_VIEW: DashboardView = 'overview';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const BRAND_NAME = 'Indocreonix';
const BRAND_LOGO_URL = 'https://res.cloudinary.com/deiy8xksn/image/upload/v1773475385/logo_ujugop.png';
const BRAND_MOTTO = 'Smart Assessment Infrastructure';
const BRAND_TAG = 'Build.Scale.Lead';

type BrandSignatureProps = {
    showMenuButton?: boolean;
    isMenuOpen?: boolean;
    onMenuToggle?: () => void;
};

const BrandSignature: React.FC<BrandSignatureProps> = ({ showMenuButton = false, isMenuOpen = false, onMenuToggle }) => (
    <div
        style={{
            width: '100%',
            borderBottom: '1px solid #99b5ea',
            background: 'linear-gradient(90deg, #ffffff 0%, #eaf2ff 45%, #f3fbff 100%)',
            boxShadow: '0 6px 20px rgba(16,45,99,0.12)',
            padding: '10px 14px',
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
                padding: `0 ${showMenuButton ? '52px' : '6px'} 0 6px`
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                    src={BRAND_LOGO_URL}
                    alt={`${BRAND_NAME} logo`}
                    style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
                />
                <div>
                    <div style={{ fontSize: '16px', color: '#17366f', fontWeight: 800 }}>{BRAND_NAME} Admin Suite</div>
                    <div style={{ fontSize: '11px', color: '#5b73a0', fontWeight: 600, letterSpacing: '0.2px' }}>{BRAND_MOTTO}</div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <span style={{ fontSize: '13px', color: '#1f365d', fontWeight: 700 }}>Powered by {BRAND_NAME}</span>
            </div>
            {showMenuButton && onMenuToggle && (
                <button
                    type="button"
                    onClick={onMenuToggle}
                    aria-label={isMenuOpen ? 'Close admin pages menu' : 'Open admin pages menu'}
                    style={{
                        border: '1px solid #1f5fbd',
                        background: 'linear-gradient(120deg, #1b57b8, #2383d6)',
                        borderRadius: '10px',
                        width: '42px',
                        height: '38px',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 8px 16px rgba(35, 95, 181, 0.28)'
                    }}
                >
                    <span
                        style={{
                            display: 'inline-flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '4px'
                        }}
                    >
                        <span style={{ width: '17px', height: '2px', background: '#ffffff', borderRadius: '999px', display: 'block' }} />
                        <span style={{ width: '17px', height: '2px', background: '#ffffff', borderRadius: '999px', display: 'block' }} />
                        <span style={{ width: '17px', height: '2px', background: '#ffffff', borderRadius: '999px', display: 'block' }} />
                    </span>
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

const AdminApp: React.FC = () => {
    const getIsMobile = () => (typeof window !== 'undefined' ? window.innerWidth <= 900 : false);
    const [mode, setMode] = useState<Mode>(getModeFromPath());
    const [activeView, setActiveView] = useState<DashboardView>(getDashboardViewFromPath());
    const [isMobile, setIsMobile] = useState(getIsMobile());
    const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
    const [isSidebarHovering, setIsSidebarHovering] = useState(false);
    const [isSidebarPinned, setIsSidebarPinned] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
    const [adminIdentity, setAdminIdentity] = useState<AdminIdentity | null>(readAdminIdentity());

    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
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
    const [examAutoSubmitAfterTime, setExamAutoSubmitAfterTime] = useState(true);
    const [examForceEndedAt, setExamForceEndedAt] = useState<string | null>(null);
    const [examConfigUpdatedAt, setExamConfigUpdatedAt] = useState('');
    const [questionSearch, setQuestionSearch] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [insights, setInsights] = useState<InsightsPayload | null>(null);
    const [menuSearch, setMenuSearch] = useState('');
    const [managedAdmins, setManagedAdmins] = useState<ManagedAdminItem[]>([]);
    const [selectedTenantAdminId, setSelectedTenantAdminId] = useState('');
    const [newTenantAdminName, setNewTenantAdminName] = useState('');
    const [newTenantAdminEmail, setNewTenantAdminEmail] = useState('');
    const [newTenantAdminPassword, setNewTenantAdminPassword] = useState('');
    const [newTenantKey, setNewTenantKey] = useState('');
    const [newSuperAdminName, setNewSuperAdminName] = useState('');
    const [newSuperAdminEmail, setNewSuperAdminEmail] = useState('');
    const [newSuperAdminPassword, setNewSuperAdminPassword] = useState('');

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
        if ((mode === 'dashboard') && !token) {
            navigate('/admin/login');
        }
    }, [mode, token]);

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
            !path.includes('/super-admins')
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

    const loadExamConfig = async () => {
        try {
            const result = await api<{ data: ExamConfig }>('/api/admin/exam-config');
            setExamDuration(result.data?.durationInMinutes || 60);
            setExaminerName(result.data?.examinerName || 'CBT Examination Cell');
            setExamStartAt(formatLocalDateTime(result.data?.startAt || null));
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

    const loadManagedAdmins = async () => {
        if (adminIdentity?.role !== 'super_admin') {
            return;
        }

        try {
            const result = await api<{ data: ManagedAdminItem[] }>('/api/admin/managed-admins');
            setManagedAdmins(result.data || []);

            if (!selectedTenantAdminId && result.data?.length) {
                setSelectedTenantAdminId(result.data[0]._id);
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
                    organizationCode: newTenantKey || undefined
                })
            });

            setNewTenantAdminName('');
            setNewTenantAdminEmail('');
            setNewTenantAdminPassword('');
            setNewTenantKey('');
            setStatus('Organization admin created successfully.');
            await loadManagedAdmins();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create organization admin');
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
                    password: newSuperAdminPassword
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
            const result = await api<{ data: ExamConfig }>(
                '/api/admin/exam-config',
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        durationInMinutes: examDuration,
                        examinerName: examinerName.trim(),
                        startAt: examStartAt || null,
                        autoSubmitAfterTime: examAutoSubmitAfterTime,
                    })
                }
            );

            setExamDuration(result.data?.durationInMinutes || examDuration);
            setExaminerName(result.data?.examinerName || examinerName.trim());
            setExamStartAt(formatLocalDateTime(result.data?.startAt || null));
            setExamAutoSubmitAfterTime(result.data?.autoSubmitAfterTime ?? true);
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
        const name = window.prompt('Section name', section.name);
        if (!name) return;
        const description = window.prompt('Description', section.description || '') || '';
        const active = window.prompt('Active? yes/no', section.isActive ? 'yes' : 'no');
        const isActive = String(active || '').toLowerCase() !== 'no';

        try {
            await api(`/api/admin/sections/${section._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, isActive })
            });
            setStatus('Section updated successfully.');
            await loadSections();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to update section');
        }
    };

    const deleteSection = async (section: SectionItem) => {
        const ok = window.confirm(`Delete section ${section.name}?`);
        if (!ok) return;

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

            const res = await fetch(`${API_BASE}/api/admin/questions`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const body = await res.json();
            if (!res.ok || body.success === false) {
                throw new Error(body.message || 'Failed to create question');
            }

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

            const res = await fetch(`${API_BASE}/api/admin/questions/${editingQuestionId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const body = await res.json();
            if (!res.ok || body.success === false) {
                throw new Error(body.message || 'Failed to update question');
            }

            setStatus('Question updated successfully with all details.');
            setSelectedSectionId(editSectionId);
            cancelQuestionEdit();
            await loadQuestions();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to update question');
        }
    };

    const deleteQuestion = async (question: QuestionItem) => {
        const ok = window.confirm('Delete this question?');
        if (!ok) return;

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
                headers: { Authorization: `Bearer ${token}` }
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
                headers: { Authorization: `Bearer ${token}` }
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
        const ok = window.confirm(`Delete student ${student.name}? This will remove all submissions too.`);
        if (!ok) return;

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

        const confirmed = window.confirm(
            `Delete ALL ${students.length} students and all their submissions? This action cannot be undone.`
        );
        if (!confirmed) return;

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
            setAdminIdentity(readAdminIdentity());

            if (adminIdentity?.role === 'super_admin') {
                loadManagedAdmins().catch(() => { });
            }

            const canLoadTenantData = adminIdentity?.role !== 'super_admin' || Boolean(selectedTenantAdminId);

            if (canLoadTenantData) {
                loadSections().catch(() => { });
                loadStudents().catch(() => { });
                loadAnalytics().catch(() => { });
                loadRecentSubmissions().catch(() => { });
                loadInsights().catch(() => { });
                loadExamConfig().catch(() => { });
            }
        }
    }, [mode, token, adminIdentity?.role, selectedTenantAdminId]);

    const navItems: Array<{ key: DashboardView; label: string; hint: string }> = [
        { key: 'overview', label: 'Overview', hint: 'Summary and quick actions' },
        { key: 'sections', label: 'Sections', hint: 'Create and manage exam sections' },
        { key: 'questions', label: 'Question Bank', hint: 'View and edit existing questions' },
        { key: 'add-question', label: 'Add Question', hint: 'Create new questions for the exam' },
        { key: 'students', label: 'Students', hint: 'Account management and resets' },
        { key: 'responses', label: 'Responses', hint: 'View student submissions and answers' },
        { key: 'config', label: 'Exam Config', hint: 'Duration and examiner setup' },
        { key: 'activity', label: 'Activity', hint: 'Recent submission timeline' },
        { key: 'insights', label: 'Insights', hint: 'Data charts and trends' },
        { key: 'reports', label: 'Reports', hint: 'Export center and audit-ready summaries' },
        { key: 'users', label: 'User Management', hint: 'Manage admin access and identity data' },
        { key: 'settings', label: 'Platform Settings', hint: 'Govern platform behavior and preferences' },
        { key: 'help', label: 'Help Center', hint: 'Usage guide and best practices' }
    ];

    if (adminIdentity?.role === 'super_admin') {
        navItems.splice(7, 0, { key: 'tenants', label: 'Organization Control', hint: 'Create and switch admin organizations' });
    }

    const menuSearchKey = menuSearch.trim().toLowerCase();
    const sidebarSections: Array<{ title: string; views: DashboardView[] }> = [
        { title: 'Overview', views: ['overview', 'activity', 'insights'] },
        { title: 'Exam Workspace', views: ['sections', 'add-question', 'questions', 'students', 'config'] },
        { title: 'Operations', views: ['reports'] },
        { title: 'Administration', views: adminIdentity?.role === 'super_admin' ? ['users', 'settings', 'tenants'] : ['users', 'settings'] },
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
        overview: 'Admin Overview',
        sections: 'Section Management',
        questions: 'Question Bank',
        'add-question': 'Create New Question',
        students: 'Student Management',
        responses: 'Student Responses',
        config: 'Exam Configuration',
        activity: 'Live Activity',
        insights: 'Data Insights',
        reports: 'Reports Center',
        users: 'User Management',
        settings: 'Platform Settings',
        tenants: 'Organization Control Center',
        help: 'Help Center'
    };

    const dashboardSubtitle: Record<DashboardView, string> = {
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
        tenants: 'Create organization admins and choose which organization dataset you are operating on.',
        help: 'Follow the recommended workflow for smooth exam operations.'
    };

    const responsiveGridStyle: React.CSSProperties = isMobile
        ? { ...gridStyle, gridTemplateColumns: '1fr' }
        : gridStyle;

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
                <div style={{ ...itemStyle, marginBottom: 0, padding: '0.55rem 0.65rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#3f6fb2', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Workspace Status
                    </div>
                    <div style={{ ...mutedStyle, fontSize: '0.76rem' }}>Role: <strong>{adminIdentity?.role === 'super_admin' ? 'Super Admin' : 'Organization Admin'}</strong></div>
                    <div style={{ ...mutedStyle, fontSize: '0.76rem' }}>View: <strong>{dashboardTitle[activeView]}</strong></div>
                    <div style={{ ...mutedStyle, fontSize: '0.76rem' }}>
                        Context: <strong>{selectedTenantAdminId ? 'Organization Selected' : (adminIdentity?.role === 'super_admin' ? 'No Organization Context' : 'Own Organization')}</strong>
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
                                            padding: compact ? '0.5rem 0.45rem' : '0.58rem 0.58rem',
                                            borderRadius: '6px',
                                            background: activeView === item.key
                                                ? '#edf5ff'
                                                : 'transparent',
                                            color: activeView === item.key ? '#1b4f95' : '#1d3d70',
                                            borderLeft: activeView === item.key ? '4px solid #2a70dd' : '4px solid transparent',
                                            borderBottom: '1px solid #d8e5f8',
                                            cursor: 'pointer',
                                            transition: 'background 180ms ease, border-left-color 180ms ease, color 180ms ease'
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{item.label}</div>
                                        {!compact && <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>{item.hint}</div>}
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

    const authShellStyle: React.CSSProperties = {
        ...pageStyle,
        alignItems: 'stretch',
        justifyContent: 'stretch',
        padding: isMobile ? '0.55rem' : '0.8rem'
    };

    const authLayoutStyle: React.CSSProperties = {
        width: '100%',
        minHeight: isMobile ? 'auto' : 'calc(100vh - 102px)',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(300px, 1fr) minmax(420px, 560px)',
        gap: '0.7rem',
        alignItems: 'stretch'
    };

    const authShowcaseStyle: React.CSSProperties = {
        ...cardStyle,
        background: 'linear-gradient(140deg, #0f3f89 0%, #165eb4 52%, #1d89d7 100%)',
        border: '1px solid #1f5eb4',
        color: '#f8fbff',
        display: 'grid',
        alignContent: 'space-between',
        minHeight: isMobile ? '220px' : '100%'
    };

    const authCardStyle: React.CSSProperties = {
        ...cardStyle,
        width: '100%',
        margin: 0,
        alignSelf: 'center'
    };

    const isDesktopSidebarVisible = !isMobile && (isSidebarPinned || isSidebarHovering);
    const desktopSidebarWidth = 260;

    if (mode === 'admin-login') {
        return (
            <>
                <div style={authShellStyle}>
                    <div style={authLayoutStyle}>
                        {!isMobile && (
                            <section style={authShowcaseStyle}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.78rem', letterSpacing: '0.8px', textTransform: 'uppercase', opacity: 0.9 }}>Assessment Control Center</p>
                                    <h1 style={{ margin: '0.4rem 0 0', fontSize: '1.8rem', lineHeight: 1.2 }}>Professional Admin Operations for Every Organization</h1>
                                    <p style={{ marginTop: '0.7rem', fontSize: '0.95rem', opacity: 0.92 }}>
                                        Secure role-based access, complete data isolation, and real-time exam supervision from one unified workspace.
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gap: '0.55rem' }}>
                                    <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>1. Sign in with organization admin credentials</div>
                                    <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>2. Manage sections, questions, and exam policy</div>
                                    <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>3. Track live activity and export verified reports</div>
                                </div>
                            </section>
                        )}
                        <section style={authCardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.7rem' }}>
                                <img src={BRAND_LOGO_URL} alt={`${BRAND_NAME} logo`} style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
                                <div>
                                    <div style={{ fontWeight: 800, color: '#133870' }}>{BRAND_NAME}</div>
                                    <div style={{ ...mutedStyle, fontSize: '0.76rem' }}>Branded Command Authentication</div>
                                </div>
                            </div>
                            <h2 style={{ marginTop: 0 }}>Organization Admin Login</h2>
                            <form onSubmit={handleLogin}>
                                <label>Email</label>
                                <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} type="email" required style={inputStyle} />
                                <label>Password</label>
                                <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} type="password" minLength={6} required style={inputStyle} />
                                <button type="submit" style={primaryBtnStyle}>Login</button>
                            </form>
                            <button type="button" onClick={() => navigate('/admin/super-admin/login')} style={secondaryBtnStyle}>Go to Super Admin Login</button>
                            {status && <p style={okStyle}>{status}</p>}
                            {error && <p style={errStyle}>{error}</p>}
                        </section>
                    </div>
                </div>
                <BrandSignature />
            </>
        );
    }

    if (mode === 'super-admin-login') {
        return (
            <>
                <div style={authShellStyle}>
                    <div style={authLayoutStyle}>
                        {!isMobile && (
                            <section style={authShowcaseStyle}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.78rem', letterSpacing: '0.8px', textTransform: 'uppercase', opacity: 0.9 }}>Leadership Access Layer</p>
                                    <h1 style={{ margin: '0.4rem 0 0', fontSize: '1.8rem', lineHeight: 1.2 }}>Super Administrator Command Console</h1>
                                    <p style={{ marginTop: '0.7rem', fontSize: '0.95rem', opacity: 0.92 }}>
                                        Provision new organization admins, switch organization context, and govern exam infrastructure at scale.
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gap: '0.55rem' }}>
                                    <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>1. Authenticate as super administrator</div>
                                    <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>2. Create and assign organization admins</div>
                                    <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>3. Switch controlled data context securely</div>
                                </div>
                            </section>
                        )}
                        <section style={authCardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.7rem' }}>
                                <img src={BRAND_LOGO_URL} alt={`${BRAND_NAME} logo`} style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
                                <div>
                                    <div style={{ fontWeight: 800, color: '#133870' }}>{BRAND_NAME}</div>
                                    <div style={{ ...mutedStyle, fontSize: '0.76rem' }}>Super Admin Authentication</div>
                                </div>
                            </div>
                            <h2 style={{ marginTop: 0 }}>Super Admin Login</h2>
                            <form onSubmit={handleLogin}>
                                <label>Email</label>
                                <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} type="email" required style={inputStyle} />
                                <label>Password</label>
                                <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} type="password" minLength={6} required style={inputStyle} />
                                <button type="submit" style={primaryBtnStyle}>Login</button>
                            </form>
                            <button type="button" onClick={() => navigate('/admin/login')} style={secondaryBtnStyle}>Go to Organization Admin Login</button>
                            {status && <p style={okStyle}>{status}</p>}
                            {error && <p style={errStyle}>{error}</p>}
                        </section>
                    </div>
                </div>
                <BrandSignature />
            </>
        );
    }

    return (
        <>
            <BrandSignature
                showMenuButton={isMobile}
                isMenuOpen={isNavMenuOpen}
                onMenuToggle={() => setIsNavMenuOpen((prev) => !prev)}
            />
            <div style={{ ...pageStyle, alignItems: 'stretch', paddingTop: '0.2rem' }}>
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
                            borderTopRightRadius: '12px',
                            borderBottomRightRadius: '12px',
                            background: 'linear-gradient(180deg, rgba(35,117,207,0.75), rgba(26,76,153,0.75))',
                            boxShadow: '4px 0 16px rgba(18, 54, 108, 0.28)',
                            cursor: 'e-resize'
                        }}
                        aria-hidden="true"
                    />
                )}

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
                                top: 0,
                                left: 0,
                                width: '84%',
                                maxWidth: '320px',
                                height: '100%',
                                background: 'linear-gradient(170deg, #fff8f2 0%, #fff1e7 100%)',
                                borderRight: '1px solid #efcfb8',
                                boxShadow: '10px 0 28px rgba(17, 45, 92, 0.24)',
                                padding: '0.85rem',
                                overflowY: 'auto'
                            }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            {renderSidebarContent(true)}
                        </aside>
                    </div>
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
                            transition: 'transform 220ms ease'
                        }}
                    >
                        {renderSidebarContent()}
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
                        transition: 'padding-left 220ms ease'
                    }}
                >
                    <main style={{ width: '100%', display: 'grid', gap: '0.6rem' }}>
                        <section
                            style={{
                                ...cardStyle,
                                background: 'linear-gradient(90deg, rgba(243,247,255,0.95), rgba(255,244,242,0.95))',
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '0.75rem',
                                alignItems: 'center',
                                flexWrap: 'wrap'
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

                            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
                                            &larr; Back to Students
                                        </button>
                                        <button
                                            onClick={exportSelectedStudentCsv}
                                            style={{ ...secondaryBtnStyle, width: 'auto', marginTop: 0, padding: '0.45rem 0.9rem', fontSize: '0.84rem', minWidth: 'fit-content' }}
                                        >
                                            &#8681; Export Submissions CSV
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
                        </section>

                        {status && <p style={okStyle}>{status}</p>}
                        {error && <p style={errStyle}>{error}</p>}

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
                                </div>

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
                                                        <div style={{ background: item.terminatedDueToCheating ? '#fff1f2' : '#f0fdf4', borderRadius: '6px', padding: '0.4rem 0.6rem' }}>
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: item.terminatedDueToCheating ? '#9f1239' : '#166534' }}>Integrity</span>
                                                            <p style={{ margin: '0.1rem 0 0', fontWeight: 800, color: item.terminatedDueToCheating ? '#e11d48' : '#15803d', fontSize: '0.85rem' }}>{item.terminatedDueToCheating ? '⚠ Terminated' : '✓ Clean'}</p>
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
                                                <button onClick={() => deleteSection(section)} style={dangerBtnStyle}>Delete</button>
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
                                    
                                    <button type="submit" style={{ ...primaryBtnStyle, marginTop: '1.5rem', width: '100%', padding: '0.8rem' }}>Create Question &rarr;</button>
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
                                    <button onClick={() => openView('add-question')} style={{ ...primaryBtnStyle, padding: '0.45rem 1rem', fontSize: '0.9rem' }}>+ Add Question</button>
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
                                            <strong>{question.questionText}</strong>
                                            <p style={mutedStyle}>Correct: Option {Number(question.correctOptionIndex) + 1} | Marks: {question.marks}</p>
                                            {question.imageUrl && (
                                                <img
                                                    src={question.imageUrl}
                                                    alt="Question"
                                                    style={{ width: '100%', maxWidth: '240px', borderRadius: '8px', border: '1px solid #c9d9f2', marginBottom: '0.45rem' }}
                                                />
                                            )}
                                            <p style={mutedStyle}>{question.options.map((o, i) => `${i}. ${o}`).join(' | ')}</p>
                                            <div style={responsiveRowStyle}>
                                                <button onClick={() => startQuestionEdit(question)} style={primaryBtnStyle}>Edit</button>
                                                <button onClick={() => deleteQuestion(question)} style={dangerBtnStyle}>Delete</button>
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
                                <button
                                    onClick={resetAllStudentsData}
                                    style={{ ...dangerBtnStyle, marginTop: '0.45rem' }}
                                >
                                    Reset All Students Data
                                </button>
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
                                                <button onClick={() => deleteStudent(student)} style={{ ...dangerBtnStyle, padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Delete Student</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeView === 'responses' && (
                            <section style={cardStyle}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1, minWidth: '250px' }}>
                                        <h3 style={{ marginTop: 0, marginBottom: '0.3rem' }}>Detailed Student Responses</h3>
                                        <p style={mutedStyle}>Complete breakdown of student answers, analytics, and cheat detection tracking.</p>
                                    </div>
                                </div>
                                
                                {!selectedStudent ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fbff', borderRadius: '8px', border: '1px dashed #c9d9f2' }}>
                                        <h4 style={{ color: '#1b4f95', margin: '0 0 0.5rem 0' }}>No Student Selected</h4>
                                        <p style={mutedStyle}>Navigate to the Students page and click "View Responses" to analyze a student's performance.</p>
                                        <button onClick={() => openView('students')} style={{ ...primaryBtnStyle, marginTop: '1rem', padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Go to Students Page</button>
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '0.5rem', padding: '1.2rem', background: '#f8fbff', borderRadius: '10px', border: '1px solid #d1def4' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div style={{ flex: 1, minWidth: '200px' }}>
                                                <h4 style={{ margin: 0, color: '#13366c', fontSize: '1.2rem' }}>{selectedStudent.name}</h4>
                                                <p style={{ ...mutedStyle, margin: '0.2rem 0 0 0' }}>{selectedStudent.email} | Credential: {selectedStudent.studentCredential}</p>
                                            </div>
                                        </div>

                                        <div style={{ ...listStyle, marginTop: '1.5rem' }}>
                                            {submissions.length === 0 && <p style={mutedStyle}>No submissions found for this student.</p>}
                                            {submissions.map((submission) => (
                                                <div key={submission._id} style={{ ...itemStyle, background: '#ffffff', boxShadow: '0 4px 12px rgba(16,45,99,0.04)', padding: '1.2rem' }}>
                                                    <div style={{ paddingBottom: '0.8rem', borderBottom: '1px solid #e2ebf8', marginBottom: '1rem' }}>
                                                        <strong style={{ fontSize: '1.15rem', color: '#1b4f95' }}>{submission.section?.name || 'Section'}</strong>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', marginTop: '0.8rem' }}>
                                                            <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px' }}>
                                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Score</span>
                                                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{submission.score} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>/ {submission.maxScore}</span></span>
                                                            </div>
                                                            <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px' }}>
                                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Attempted</span>
                                                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{submission.attemptedQuestions} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>/ {submission.totalQuestions}</span></span>
                                                            </div>
                                                            <div style={{ background: '#fff1f2', padding: '0.6rem', borderRadius: '6px' }}>
                                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#9f1239', textTransform: 'uppercase', fontWeight: 700 }}>Cheating Logs</span>
                                                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e11d48' }}>{submission.examMeta?.cheatingAttempts ?? 0}</span>
                                                            </div>
                                                            <div style={{ background: '#f0fdf4', padding: '0.6rem', borderRadius: '6px' }}>
                                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase', fontWeight: 700 }}>Option Changes</span>
                                                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>{submission.examMeta?.totalOptionChanges ?? 0}</span>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                                                            <span style={{ ...mutedStyle, fontSize: '0.86rem' }}><strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleString()}</span>
                                                            <span style={{ ...mutedStyle, fontSize: '0.86rem', color: submission.examMeta?.terminatedDueToCheating ? '#dc2626' : '#64748b' }}>
                                                                <strong>Terminated by System:</strong> {submission.examMeta?.terminatedDueToCheating ? 'Yes' : 'No'}
                                                            </span>
                                                        </div>
                                                        {(submission.examMeta?.terminationRemark || submission.remark) && (
                                                            <div style={{ background: '#fff7ed', borderLeft: '4px solid #f97316', padding: '0.6rem', marginTop: '0.8rem', borderRadius: '4px' }}>
                                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c2410c' }}>REMARK</span>
                                                                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: '#9a3412' }}>{submission.examMeta?.terminationRemark || submission.remark}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {!!submission.examMeta?.questionInteractions?.length && (
                                                        <div style={{ ...itemStyle, marginTop: '0.8rem', background: '#fafbfc', border: '1px dashed #c9d9f2' }}>
                                                            <div style={{ ...mutedStyle, fontWeight: 800, color: '#3f6fb2', fontSize: '0.9rem' }}>Micro-Interaction Insights (Option Swaps)</div>
                                                            <p style={{ margin: '0.3rem 0 0.8rem 0', fontSize: '0.8rem', color: '#64748b' }}>Tracks questions where the student constantly changed their selection.</p>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.4rem' }}>
                                                                {submission.examMeta.questionInteractions.slice(0, 16).map((interaction, insightIndex) => (
                                                                    <div key={insightIndex} style={{ ...mutedStyle, fontSize: '0.75rem', background: '#eef2f6', padding: '0.4rem', borderRadius: '4px' }}>
                                                                        <strong>Q#{insightIndex + 1}:</strong> {interaction.changeCount} swaps<br/>
                                                                        (Opt {interaction.firstSelectedOptionIndex ?? '-'} &rarr; Opt {interaction.finalSelectedOptionIndex ?? '-'})
                                                                    </div>
                                                                ))}
                                                                {submission.examMeta.questionInteractions.length > 16 && (
                                                                    <div style={{ ...mutedStyle, fontSize: '0.75rem', padding: '0.4rem', display: 'flex', alignItems: 'center' }}>
                                                                        +{submission.examMeta.questionInteractions.length - 16} more
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div style={{ marginTop: '1.2rem' }}>
                                                        <h5 style={{ margin: '0 0 0.8rem 0', color: '#475569', fontSize: '1rem', borderBottom: '1px solid #e2ebf8', paddingBottom: '0.4rem' }}>Detailed Answer Breakdown</h5>
                                                        <div style={{ display: 'grid', gap: '0.6rem' }}>
                                                            {submission.answers.map((answer, index) => (
                                                                <div key={index} style={{ ...itemStyle, borderLeft: answer.isCorrect ? '4px solid #10b981' : '4px solid #ef4444', background: answer.isCorrect ? '#f0fdf4' : '#fef2f2', padding: '0.8rem' }}>
                                                                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Q{index + 1}: {answer.questionText}</div>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem', marginTop: '0.6rem' }}>
                                                                        <div style={{ fontSize: '0.85rem' }}>
                                                                            <span style={{ color: '#64748b', fontWeight: 600 }}>Selected Answer:</span><br/>
                                                                            <span style={{ fontWeight: 500, color: '#334155' }}>
                                                                                {answer.selectedOptionIndex === null || answer.selectedOptionIndex === undefined
                                                                                    ? <em style={{color: '#94a3b8'}}>Not answered</em>
                                                                                    : (answer.options?.[answer.selectedOptionIndex] || 'Option unavailable')}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ fontSize: '0.85rem' }}>
                                                                            <span style={{ color: '#64748b', fontWeight: 600 }}>Correct Answer:</span><br/>
                                                                            <span style={{ fontWeight: 500, color: '#166534' }}>
                                                                                {answer.options?.[answer.correctOptionIndex] || 'Option unavailable'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: answer.isCorrect ? '1px solid #bbf7d0' : '1px solid #fecdd3' }}>
                                                                        <strong style={{ color: answer.isCorrect ? '#15803d' : '#be123c', fontSize: '0.85rem' }}>{answer.isCorrect ? 'ACCURATE' : 'INCORRECT'}</strong>
                                                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Marks Awarded: {answer.marksAwarded}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
                                    <input
                                        type="datetime-local"
                                        value={examStartAt}
                                        onChange={(e) => setExamStartAt(e.target.value)}
                                        style={inputStyle}
                                    />
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
                                                        {item.terminatedDueToCheating && <span style={{ marginLeft: '0.5rem', color: '#dc2626', fontWeight: 700 }}>&#9888; Terminated</span>}
                                                    </p>
                                                    <p style={{ ...mutedStyle, fontSize: '0.79rem', margin: '0.1rem 0 0' }}>{(item.sections ?? []).length > 0 ? (item.sections ?? []).map(s => `${s.name}: ${s.score}/${s.maxScore}`).join(' · ') : '—'}</p>
                                                    <p style={{ ...mutedStyle, fontSize: '0.76rem', margin: '0.2rem 0 0' }}>Last: {item.lastSubmittedAt ? new Date(item.lastSubmittedAt).toLocaleString() : '—'}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
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
                                            {sectionPerformance.map((item) => (
                                                <div key={item.sectionName}>
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
                                                        <strong>Total:</strong> {item.totalScore}/{item.totalMaxScore} pts &nbsp;·&nbsp;
                                                        <strong>Sections:</strong> {item.submissionsCount} &nbsp;·&nbsp;
                                                        <strong>Answered:</strong> {item.totalAttempted}/{item.totalQuestions}
                                                        {item.terminatedDueToCheating && <span style={{ marginLeft: '0.5rem', color: '#dc2626', fontWeight: 700 }}>⚠ Flagged</span>}
                                                    </p>
                                                    <p style={{ ...mutedStyle, fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                                                        {(item.sections ?? []).length > 0 ? (item.sections ?? []).map(s => `${s.name} (${s.score}/${s.maxScore})`).join(' · ') : '—'}
                                                    </p>
                                                    <p style={{ ...mutedStyle, fontSize: '0.76rem', margin: '0.2rem 0 0 0' }}>Last: {new Date(item.lastSubmittedAt).toLocaleString()}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </>
                        )}

                        {activeView === 'users' && (
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
                            </>
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
                                                <label>Organization Code (optional, auto-generated if empty)</label>
                                                <input value={newTenantKey} onChange={(e) => setNewTenantKey(e.target.value)} style={inputStyle} />
                                                <button type="submit" style={primaryBtnStyle}>Create Organization Admin</button>
                                            </form>

                                            <div style={listStyle}>
                                                {managedAdmins.map((item) => (
                                                    <div key={item._id} style={itemStyle}>
                                                        <strong>{item.name}</strong>
                                                        <p style={mutedStyle}>{item.email}</p>
                                                        <p style={mutedStyle}>Organization Code: {item.tenantKey}</p>
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
                                            <button type="submit" style={primaryBtnStyle}>Create Additional Super Admin</button>
                                        </form>
                                    )}
                                </section>
                            </>
                        )}

                        {activeView === 'help' && (
                            <section style={cardStyle}>
                                <h3 style={{ marginTop: 0 }}>Help Center</h3>
                                <div style={listStyle}>
                                    <div style={itemStyle}>
                                        <strong>1. Setup Sections</strong>
                                        <p style={mutedStyle}>Create sections first, then add questions to each section.</p>
                                    </div>
                                    <div style={itemStyle}>
                                        <strong>2. Build Question Bank</strong>
                                        <p style={mutedStyle}>Use the Questions page to create and review MCQ quality before publishing sections.</p>
                                    </div>
                                    <div style={itemStyle}>
                                        <strong>3. Monitor Student Performance</strong>
                                        <p style={mutedStyle}>Use Students page to inspect submissions and export reports as CSV.</p>
                                    </div>
                                    <div style={itemStyle}>
                                        <strong>4. Configure Duration</strong>
                                        <p style={mutedStyle}>Set exam duration centrally in Exam Config; it is applied to student exam timers.</p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};

const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 20% 10%, #f2f7ff 0%, #e6f0ff 45%, #eaf2ff 100%)',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    width: '100%',
    padding: '0.45rem 0.6rem'
};

const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
    border: '1px solid #c8d9f5',
    borderRadius: '12px',
    padding: '0.85rem',
    boxShadow: '0 10px 22px rgba(16, 45, 99, 0.09)'
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
    padding: '0.55rem'
};

const errStyle: React.CSSProperties = {
    marginTop: '0.7rem',
    color: '#a92b2b',
    background: '#ffecec',
    border: '1px solid #f0c1c1',
    borderRadius: '8px',
    padding: '0.55rem'
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '0.7rem'
};

const listStyle: React.CSSProperties = {
    marginTop: '0.45rem',
    maxHeight: '360px',
    overflow: 'auto'
};

const itemStyle: React.CSSProperties = {
    border: '1px solid #ceddf6',
    borderRadius: '8px',
    padding: '0.55rem',
    marginBottom: '0.4rem',
    background: 'linear-gradient(180deg, #fbfdff, #f6faff)'
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

export default AdminApp;
