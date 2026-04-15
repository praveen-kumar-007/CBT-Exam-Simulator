import React from 'react';

const StudentExamCardPage: React.FC = () => {
    const beginExam = () => {
        if (typeof window !== 'undefined') {
            window.location.pathname = '/student/review';
        }
    };

    return (
        <main className="student-flow-page">
            <section className="student-flow-shell">
                <header className="student-flow-head">
                    <p>Step 3 of 6</p>
                    <h1>CBT Exam Card</h1>
                    <span>Verify exam details before you begin.</span>
                </header>

                <article className="student-flow-card">
                    <div className="student-flow-metadata">
                        <div>
                            <strong>Exam Name</strong>
                            <span>CBT Mock Test - Set A</span>
                        </div>
                        <div>
                            <strong>Duration</strong>
                            <span>60 Minutes</span>
                        </div>
                        <div>
                            <strong>Total Questions</strong>
                            <span>80 Questions</span>
                        </div>
                        <div>
                            <strong>Negative Marking</strong>
                            <span>0.25 per wrong answer</span>
                        </div>
                    </div>
                </article>

                <div className="student-flow-grid-two">
                    <article className="student-flow-card">
                        <h2>Section Breakdown</h2>
                        <ul className="student-flow-list">
                            <li>Quantitative Aptitude - 20 questions</li>
                            <li>Logical Reasoning - 20 questions</li>
                            <li>Verbal Ability - 20 questions</li>
                            <li>Technical MCQ - 20 questions</li>
                        </ul>
                    </article>

                    <article className="student-flow-card">
                        <h2>Attempt Strategy</h2>
                        <ul className="student-flow-list">
                            <li>Complete easy questions in first 30 minutes.</li>
                            <li>Mark uncertain ones for review.</li>
                            <li>Reserve final 10 minutes for revision.</li>
                        </ul>
                    </article>
                </div>

                <footer className="student-flow-actions">
                    <button type="button" className="student-flow-primary" onClick={beginExam}>
                        Begin Exam Session
                    </button>
                </footer>
            </section>
        </main>
    );
};

export default StudentExamCardPage;
