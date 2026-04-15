import React from 'react';

const StudentDisqualifiedPage: React.FC = () => (
    <main className="student-flow-page student-flow-alert-page">
        <section className="student-flow-shell student-flow-alert-shell">
            <header className="student-flow-head">
                <p>Policy Alert</p>
                <h1>Session Terminated</h1>
                <span>Your exam session was ended due to repeated policy violations.</span>
            </header>

            <article className="student-flow-card student-flow-danger-card">
                <h2>Reasons Recorded</h2>
                <ul className="student-flow-list">
                    <li>Multiple tab-switch attempts detected.</li>
                    <li>Face not visible for extended duration.</li>
                    <li>Unauthorized copy-paste event captured.</li>
                </ul>
            </article>

            <footer className="student-flow-actions">
                <button
                    type="button"
                    className="student-flow-secondary"
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            window.location.pathname = '/student/login';
                        }
                    }}
                >
                    Return to Login
                </button>
            </footer>
        </section>
    </main>
);

export default StudentDisqualifiedPage;
