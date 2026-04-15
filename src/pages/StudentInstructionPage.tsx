import React from 'react';

const StudentInstructionPage: React.FC = () => {
    const goToExamCard = () => {
        if (typeof window !== 'undefined') {
            window.location.pathname = '/student/exam-card';
        }
    };

    return (
        <main className="student-flow-page">
            <section className="student-flow-shell">
                <header className="student-flow-head">
                    <p>Step 2 of 6</p>
                    <h1>Read Instructions Before Starting</h1>
                    <span>Make sure your camera, internet, and environment are exam-ready.</span>
                </header>

                <div className="student-flow-grid-two">
                    <article className="student-flow-card">
                        <h2>Exam Rules</h2>
                        <ul className="student-flow-list">
                            <li>Do not switch tabs or open other applications.</li>
                            <li>Keep your face visible throughout the exam.</li>
                            <li>Use only one active browser window.</li>
                            <li>Submit before timer expiration.</li>
                        </ul>
                    </article>

                    <article className="student-flow-card">
                        <h2>System Readiness</h2>
                        <ul className="student-flow-list">
                            <li>Webcam: Connected and active</li>
                            <li>Microphone: Optional but recommended</li>
                            <li>Network: Stable connection required</li>
                            <li>Identity: Roll number verified</li>
                        </ul>
                    </article>
                </div>

                <footer className="student-flow-actions">
                    <button type="button" className="student-flow-primary" onClick={goToExamCard}>
                        Continue to Exam Card
                    </button>
                </footer>
            </section>
        </main>
    );
};

export default StudentInstructionPage;
