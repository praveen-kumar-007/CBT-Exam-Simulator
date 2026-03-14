import React, { useEffect, useMemo, useState } from 'react';

type Mode = 'login' | 'signup' | 'dashboard';

type SectionItem = {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
};

type QuestionItem = {
  _id: string;
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
  selectedOptionIndex: number | null;
  correctOptionIndex: number;
  marksAwarded: number;
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
};

type RecentSubmission = {
  _id: string;
  student?: { name?: string; email?: string; studentCredential?: string };
  section?: { name?: string };
  score: number;
  maxScore: number;
  createdAt: string;
};

type ExamConfig = {
  durationInMinutes: number;
  updatedAt?: string;
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const BRAND_NAME = 'Indocreonix';
const BRAND_LOGO_URL = 'https://res.cloudinary.com/deiy8xksn/image/upload/v1773475385/logo_ujugop.png';

const BrandSignature: React.FC = () => (
  <div
    style={{
      width: '100%',
      borderBottom: '1px solid #d9e3f4',
      background: '#ffffff',
      boxShadow: '0 2px 8px rgba(16,45,99,0.08)',
      padding: '8px 12px'
    }}
  >
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
      }}
    >
      <img
        src={BRAND_LOGO_URL}
        alt={`${BRAND_NAME} logo`}
        style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
      />
      <span style={{ fontSize: '14px', color: '#1f365d', fontWeight: 700 }}>Made by brand {BRAND_NAME}</span>
    </div>
  </div>
);

const getModeFromPath = (): Mode => {
  const path = window.location.pathname.toLowerCase();
  if (path.startsWith('/admin/signup')) return 'signup';
  if (path.startsWith('/admin/dashboard')) return 'dashboard';
  return 'login';
};

const AdminApp: React.FC = () => {
  const [mode, setMode] = useState<Mode>(getModeFromPath());
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');

  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

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

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [examDuration, setExamDuration] = useState(60);
  const [examConfigUpdatedAt, setExamConfigUpdatedAt] = useState('');
  const [questionSearch, setQuestionSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

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
  };

  useEffect(() => {
    const handler = () => setMode(getModeFromPath());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

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
      const result = await api<AuthResponse>(
        '/api/auth/admin/login',
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
      setStatus('Login successful.');
      navigate('/admin/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setStatus('');

    try {
      const result = await api<AuthResponse>(
        '/api/auth/admin/signup',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword })
        },
        false
      );

      localStorage.setItem('adminToken', result.data.token);
      localStorage.setItem('adminUser', JSON.stringify(result.data.user));
      setToken(result.data.token);
      setStatus('Signup successful.');
      navigate('/admin/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed');
    }
  };

  const loadSections = async () => {
    setError('');
    const data = await api<{ data: SectionItem[] }>('/api/admin/sections');
    setSections(data.data || []);
    if (!selectedSectionId && data.data?.length) {
      setSelectedSectionId(data.data[0]._id);
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

  const loadExamConfig = async () => {
    try {
      const result = await api<{ data: ExamConfig }>('/api/admin/exam-config');
      setExamDuration(result.data?.durationInMinutes || 60);
      setExamConfigUpdatedAt(result.data?.updatedAt || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load exam configuration');
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

    try {
      const result = await api<{ data: ExamConfig }>(
        '/api/admin/exam-config',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ durationInMinutes: examDuration })
        }
      );

      setExamDuration(result.data?.durationInMinutes || examDuration);
      setExamConfigUpdatedAt(result.data?.updatedAt || '');
      setStatus('Exam duration updated successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update exam duration');
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

  const updateQuestion = async (question: QuestionItem) => {
    const newQuestionText = window.prompt('Question text', question.questionText);
    if (!newQuestionText) return;

    const updatedOptions = [...question.options];
    for (let i = 0; i < 4; i += 1) {
      const next = window.prompt(`Option ${i}`, updatedOptions[i]);
      if (!next) return;
      updatedOptions[i] = next;
    }

    const nextCorrect = window.prompt('Correct option index (0-3)', String(question.correctOptionIndex));
    const nextMarks = window.prompt('Marks', String(question.marks));

    try {
      await api(`/api/admin/questions/${question._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: selectedSectionId,
          questionText: newQuestionText,
          options: updatedOptions,
          correctOptionIndex: Number(nextCorrect),
          marks: Number(nextMarks)
        })
      });
      setStatus('Question updated successfully.');
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

  const deleteStudent = async (student: StudentItem) => {
    const ok = window.confirm(`Delete student ${student.name}? This will remove all submissions too.`);
    if (!ok) return;

    try {
      await api(`/api/admin/students/${student._id}`, { method: 'DELETE' });
      setStatus('Student deleted successfully.');

      if (selectedStudent?._id === student._id) {
        setSelectedStudent(null);
        setSubmissions([]);
      }

      await loadStudents();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete student');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken('');
    navigate('/admin/login');
  };

  useEffect(() => {
    if (mode === 'dashboard' && token) {
      loadSections().catch(() => {});
      loadStudents().catch(() => {});
      loadAnalytics().catch(() => {});
      loadRecentSubmissions().catch(() => {});
      loadExamConfig().catch(() => {});
    }
  }, [mode, token]);

  if (mode === 'login') {
    return (
      <>
        <div style={pageStyle}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Admin Login</h2>
            <form onSubmit={handleLogin}>
              <label>Email</label>
              <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} type="email" required style={inputStyle} />
              <label>Password</label>
              <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} type="password" minLength={6} required style={inputStyle} />
              <button type="submit" style={primaryBtnStyle}>Login</button>
            </form>
            <button type="button" onClick={() => navigate('/admin/signup')} style={secondaryBtnStyle}>Create admin account</button>
            {status && <p style={okStyle}>{status}</p>}
            {error && <p style={errStyle}>{error}</p>}
          </div>
        </div>
        <BrandSignature />
      </>
    );
  }

  if (mode === 'signup') {
    return (
      <>
        <div style={pageStyle}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Admin Signup</h2>
            <form onSubmit={handleSignup}>
              <label>Name</label>
              <input value={signupName} onChange={(e) => setSignupName(e.target.value)} required style={inputStyle} />
              <label>Email</label>
              <input value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} type="email" required style={inputStyle} />
              <label>Password</label>
              <input value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} type="password" minLength={6} required style={inputStyle} />
              <button type="submit" style={primaryBtnStyle}>Signup</button>
            </form>
            <button type="button" onClick={() => navigate('/admin/login')} style={secondaryBtnStyle}>Back to login</button>
            {status && <p style={okStyle}>{status}</p>}
            {error && <p style={errStyle}>{error}</p>}
          </div>
        </div>
        <BrandSignature />
      </>
    );
  }

  return (
    <>
      <div style={{ ...pageStyle, alignItems: 'stretch' }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '1rem auto' }}>
        <div style={{ ...cardStyle, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
          <button onClick={logout} style={secondaryBtnStyle}>Logout</button>
        </div>

        <div style={{ ...gridStyle, marginBottom: '1rem' }}>
          <section style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>Exam Analytics</h3>
            <p style={mutedStyle}>Students: <strong>{analytics?.studentsCount ?? 0}</strong></p>
            <p style={mutedStyle}>Sections: <strong>{analytics?.sectionsCount ?? 0}</strong></p>
            <p style={mutedStyle}>Questions: <strong>{analytics?.questionsCount ?? 0}</strong></p>
            <p style={mutedStyle}>Submissions: <strong>{analytics?.submissionsCount ?? 0}</strong></p>
            <p style={mutedStyle}>Average Score: <strong>{analytics?.averagePercent ?? 0}%</strong></p>
            <p style={mutedStyle}>Best Raw Score: <strong>{analytics?.bestScore ?? 0}</strong></p>
            <button onClick={loadAnalytics} style={primaryBtnStyle}>Refresh Analytics</button>
          </section>

          <section style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>Recent Submissions</h3>
            <button onClick={loadRecentSubmissions} style={primaryBtnStyle}>Refresh Activity</button>
            <div style={listStyle}>
              {recentSubmissions.map((item) => (
                <div key={item._id} style={itemStyle}>
                  <strong>{item.student?.name || 'Student'}</strong>
                  <p style={mutedStyle}>{item.student?.email || '-'}</p>
                  <p style={mutedStyle}>Section: {item.section?.name || '-'}</p>
                  <p style={mutedStyle}>Score: {item.score} / {item.maxScore}</p>
                  <p style={mutedStyle}>{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>

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
              <button type="submit" style={primaryBtnStyle}>Save Duration</button>
            </form>
            <button onClick={loadExamConfig} style={secondaryBtnStyle}>Reload Configuration</button>
            <p style={mutedStyle}>
              Last updated: {examConfigUpdatedAt ? new Date(examConfigUpdatedAt).toLocaleString() : 'Not set'}
            </p>
          </section>
        </div>

        <div style={gridStyle}>
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
              {sections.map((section) => (
                <div key={section._id} style={itemStyle}>
                  <strong>{section.name}</strong>
                  <p style={mutedStyle}>{section.description || 'No description'}</p>
                  <p style={mutedStyle}>Status: {section.isActive ? 'Active' : 'Inactive'}</p>
                  <div style={rowStyle}>
                    <button onClick={() => updateSection(section)} style={primaryBtnStyle}>Update</button>
                    <button onClick={() => deleteSection(section)} style={dangerBtnStyle}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={cardStyle}>
            <h3>Questions</h3>
            <label>Section</label>
            <select value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} style={inputStyle}>
              <option value="">Select section</option>
              {sections.map((section) => (
                <option key={section._id} value={section._id}>{section.name}</option>
              ))}
            </select>

            <form onSubmit={createQuestion}>
              <label>Question text</label>
              <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} required style={inputStyle} />
              {options.map((opt, i) => (
                <div key={i}>
                  <label>Option {i + 1}</label>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const next = [...options];
                      next[i] = e.target.value;
                      setOptions(next);
                    }}
                    required
                    style={inputStyle}
                  />
                </div>
              ))}
              <div style={rowStyle}>
                <div>
                  <label>Correct index (0-3)</label>
                  <input
                    value={correctOptionIndex}
                    onChange={(e) => setCorrectOptionIndex(Number(e.target.value))}
                    type="number"
                    min={0}
                    max={3}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label>Marks</label>
                  <input value={marks} onChange={(e) => setMarks(Number(e.target.value))} type="number" min={1} required style={inputStyle} />
                </div>
              </div>
              <label>Image (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setQuestionImage(e.target.files?.[0] || null)} style={inputStyle} />
              <button type="submit" style={primaryBtnStyle}>Create Question</button>
            </form>

            <div style={rowStyle}>
              <button onClick={loadQuestions} style={primaryBtnStyle}>Load Questions</button>
              <div style={{ ...mutedStyle, alignSelf: 'center' }}>{activeSection ? activeSection.name : ''}</div>
            </div>

            <label>Search question text</label>
            <input
              value={questionSearch}
              onChange={(e) => setQuestionSearch(e.target.value)}
              placeholder="Type to filter questions"
              style={inputStyle}
            />

            <div style={listStyle}>
              {filteredQuestions.map((question) => (
                <div key={question._id} style={itemStyle}>
                  <strong>{question.questionText}</strong>
                  <p style={mutedStyle}>Correct: {question.correctOptionIndex} | Marks: {question.marks}</p>
                  <p style={mutedStyle}>{question.options.map((o, i) => `${i}. ${o}`).join(' | ')}</p>
                  <div style={rowStyle}>
                    <button onClick={() => updateQuestion(question)} style={primaryBtnStyle}>Update</button>
                    <button onClick={() => deleteQuestion(question)} style={dangerBtnStyle}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={cardStyle}>
            <h3>Students & Results</h3>
            <button onClick={loadStudents} style={primaryBtnStyle}>Refresh Students</button>

            <label>Search student</label>
            <input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Name, email, credential"
              style={inputStyle}
            />

            <div style={listStyle}>
              {filteredStudents.map((student) => (
                <div key={student._id} style={itemStyle}>
                  <strong>{student.name}</strong>
                  <p style={mutedStyle}>{student.email}</p>
                  <p style={mutedStyle}>Credential: {student.studentCredential || '-'}</p>
                  <div style={rowStyle}>
                    <button onClick={() => loadSubmissions(student)} style={primaryBtnStyle}>View Submissions</button>
                    <button onClick={() => deleteStudent(student)} style={dangerBtnStyle}>Delete Student</button>
                  </div>
                </div>
              ))}
            </div>

            {selectedStudent && (
              <div>
                <h4>Submissions: {selectedStudent.name}</h4>
                <button onClick={exportSelectedStudentCsv} style={secondaryBtnStyle}>Export CSV</button>
                <div style={listStyle}>
                  {submissions.map((submission) => (
                    <div key={submission._id} style={itemStyle}>
                      <strong>{submission.section?.name || 'Section'}</strong>
                      <p style={mutedStyle}>Score: {submission.score} / {submission.maxScore}</p>
                      <p style={mutedStyle}>Attempted: {submission.attemptedQuestions} / {submission.totalQuestions}</p>
                      <p style={mutedStyle}>Submitted: {new Date(submission.createdAt).toLocaleString()}</p>
                      <div>
                        {submission.answers.map((answer, index) => (
                          <div key={index} style={{ ...itemStyle, marginTop: '0.3rem' }}>
                            <div style={mutedStyle}>Q{index + 1}: {answer.questionText}</div>
                            <div style={mutedStyle}>Selected: {answer.selectedOptionIndex ?? 'Not answered'} | Correct: {answer.correctOptionIndex} | Marks: {answer.marksAwarded}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {status && <p style={okStyle}>{status}</p>}
        {error && <p style={errStyle}>{error}</p>}
        </div>
      </div>
      <BrandSignature />
    </>
  );
};

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#eef3fb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem'
};

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #d6e0f4',
  borderRadius: '12px',
  padding: '1rem',
  boxShadow: '0 8px 20px rgba(16, 45, 99, 0.08)'
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
  background: '#1556c8',
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '1rem'
};

const listStyle: React.CSSProperties = {
  marginTop: '0.6rem',
  maxHeight: '360px',
  overflow: 'auto'
};

const itemStyle: React.CSSProperties = {
  border: '1px solid #d7e2f7',
  borderRadius: '8px',
  padding: '0.55rem',
  marginBottom: '0.5rem',
  background: '#fbfdff'
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
