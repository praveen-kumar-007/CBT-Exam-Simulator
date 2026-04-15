import React from 'react';

const StudentResultPage: React.FC = () => (
    <main className="student-flow-page">
        <section className="student-flow-shell">
            <header className="student-flow-head">
                <p>Step 5 of 6</p>
                <h1>Exam Submitted Successfully</h1>
                <span>Your responses have been recorded and evaluated.</span>
            </header>

            <div className="student-flow-grid-two">
                <article className="student-flow-card">
                    <h2>Performance Snapshot</h2>
                    <div className="student-flow-kpis">
                        <div><strong>72%</strong><span>Score</span></div>
                        <div><strong>58/80</strong><span>Correct</span></div>
                        <div><strong>18m</strong><span>Time Left</span></div>
                    </div>
                </article>

                <article className="student-flow-card">
                    <h2>Result Status</h2>
                    <ul className="student-flow-list">
                        <li>Status: Qualified for next round</li>
                        <li>Rank Band: Top 20%</li>
                        <li>Detailed report will be shared by email</li>
                    </ul>
                </article>
            </div>

            <footer className="student-flow-actions">
                <button
                    type="button"
                    className="student-flow-primary"
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            window.location.pathname = '/student/dashboard';
                        }
                    }}
                >
                    Back to Dashboard
                </button>
            </footer>
        </section>
    </main>
);

export default StudentResultPage;
