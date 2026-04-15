import React from 'react';

const StudentReviewPage: React.FC = () => {
    const submitExam = () => {
        if (typeof window !== 'undefined') {
            window.location.pathname = '/student/result';
        }
    };

    return (
        <main className="student-flow-page">
            <section className="student-flow-shell">
                <header className="student-flow-head">
                    <p>Step 4 of 6</p>
                    <h1>Review Your Responses</h1>
                    <span>Check all marked and unattempted questions before final submit.</span>
                </header>

                <div className="student-flow-grid-two">
                    <article className="student-flow-card">
                        <h2>Attempt Summary</h2>
                        <div className="student-flow-kpis">
                            <div><strong>62</strong><span>Answered</span></div>
                            <div><strong>11</strong><span>Marked</span></div>
                            <div><strong>7</strong><span>Unattempted</span></div>
                        </div>
                    </article>

                    <article className="student-flow-card">
                        <h2>Flagged Items</h2>
                        <ul className="student-flow-list">
                            <li>Q12 - Quantitative Aptitude</li>
                            <li>Q31 - Logical Reasoning</li>
                            <li>Q56 - Verbal Ability</li>
                        </ul>
                    </article>
                </div>

                <footer className="student-flow-actions">
                    <button type="button" className="student-flow-primary" onClick={submitExam}>
                        Submit Exam
                    </button>
                </footer>
            </section>
        </main>
    );
};

export default StudentReviewPage;
