import React from 'react';

const StudentDashboardPage: React.FC = () => (
    <main className="student-flow-page">
        <section className="student-flow-shell">
            <header className="student-flow-head">
                <p>Step 1 of 6</p>
                <h1>Student Dashboard</h1>
                <span>Manage your assigned exams, progress, and secure sessions.</span>
            </header>

            <section className="student-flow-kpis student-flow-kpis-large">
                <div><strong>2</strong><span>Upcoming Exams</span></div>
                <div><strong>1</strong><span>In Progress</span></div>
                <div><strong>4</strong><span>Completed</span></div>
            </section>

            <section className="student-flow-grid-two">
                <article className="student-flow-card">
                    <h2>CBT Mock Test - Set A</h2>
                    <ul className="student-flow-list">
                        <li>Sections: Quant, Verbal, Reasoning, Technical</li>
                        <li>Duration: 60 minutes</li>
                        <li>Questions: 80</li>
                    </ul>
                    <button
                        type="button"
                        className="student-flow-primary"
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.location.pathname = '/student/instructions';
                            }
                        }}
                    >
                        Open Instructions
                    </button>
                </article>

                <article className="student-flow-card">
                    <h2>CBT Mock Test - Set B</h2>
                    <ul className="student-flow-list">
                        <li>Sections: Aptitude, Coding, Domain</li>
                        <li>Duration: 90 minutes</li>
                        <li>Questions: 100</li>
                    </ul>
                    <button
                        type="button"
                        className="student-flow-secondary"
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.location.pathname = '/student/instructions';
                            }
                        }}
                    >
                        View Exam Flow
                    </button>
                </article>
            </section>
        </section>
    </main>
);

export default StudentDashboardPage;
