import React, { useState } from 'react';
import FeaturePageShell from '../../components/FeaturePageShell';

const promptText = `Role: You are an expert Academic Content Creator and Data Specialist.

Task: Please generate a full-length, high-quality mock examination paper for the [INSERT EXAM NAME HERE].

Syllabus & Pattern Instructions:

Official Pattern: Research and use the most recent official exam pattern for [INSERT EXAM NAME HERE]. This must include the exact number of sections and the precise number of questions per section (e.g., if it is RRB JE, generate 100 questions; if SSC CGL, generate 100 questions).

Subject Mapping: Replace the placeholder section names with the actual subjects for this exam (e.g., General Awareness, Mathematics, General Intelligence & Reasoning, etc.).

Difficulty Level: Ensure the questions match the specific technical and educational level required for this exam.

Formatting Instructions (Strict):

File Type: You must output the final result as a downloadable .xlsx (Excel) file.

Column Structure: Follow the column headers from the attached sample exactly:

Section: The subject name (enter this only once at the beginning of each new section).

Question: The full text of the question.

Option1, Option2, Option3, Option4: Four distinct answer choices.

Correct Option: The label of the correct answer (Format: "Option1", "Option2", etc.).

Marks: The marks assigned per question based on the exam's marking scheme.

Execution: Please analyze the attached sample file for the style and then generate the complete dataset for the [INSERT EXAM NAME HERE]. Ensure every single question is unique and factually accurate.`;

const HelpPage: React.FC = () => {
    const [copyStatus, setCopyStatus] = useState('');

    const copyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(promptText);
            setCopyStatus('Prompt copied to clipboard.');
            window.setTimeout(() => setCopyStatus(''), 3000);
        } catch {
            setCopyStatus('Unable to copy prompt.');
            window.setTimeout(() => setCopyStatus(''), 3000);
        }
    };

    return (
        <section className="space-y-6">
            <FeaturePageShell title="Help Center" description="Comprehensive universal admin guide for the exam management software." />

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Question By AI</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
                            Use this AI prompt to generate complete exam papers in Excel format. This page is a detailed universal guide for administrators to operate the full software platform.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={copyPrompt}
                            className="rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                        >
                            Copy Prompt
                        </button>
                        {copyStatus && <span className="text-sm text-emerald-700">{copyStatus}</span>}
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 shadow-inner">
                <h3 className="text-xl font-semibold text-white">AI Prompt for Generating Exam XLSX Papers</h3>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                    The prompt below is ready to use. Replace the placeholder exam name with your target exam, then paste it into the AI tool that supports XLSX generation.
                </p>
                <div className="mt-4 rounded-2xl bg-slate-900 p-5 text-sm text-slate-100 shadow-lg">
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6">{promptText}</pre>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">Universal Admin Guide</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                    This guide describes how to use every part of the exam administration application. The instructions are written for any administrator and do not include specific names.
                </p>

                <article className="mt-6 space-y-10">
                    <section>
                        <h4 className="text-lg font-semibold text-slate-900">1. Overview and First Steps</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            The application is divided into core functional areas: sections, questions, students, exam configuration, analytics, and reports. Start by understanding the layout and the order in which these areas connect.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            As a new administrator, begin by reviewing the dashboard page. The dashboard provides a high-level summary of system activity and shortcuts to the most important areas. This snapshot helps you prioritize your tasks.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            The system uses role-based access controls. Ensure you are logged in with the correct administrator account. If you see an area hidden or disabled, your account may not have the required permissions.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-semibold text-slate-900">2. Managing Exam Sections</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Sections are the foundation of any exam. Each section should correspond to a clear subject or component of the paper, such as General Knowledge, Mathematics, Reasoning, or Technical Skills.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            To create a section, go to the Sections page and add a name and optional description. Use short, descriptive names so that the section appears clearly in reports and exam settings.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            If you update a section name, review any linked questions and exam configurations to ensure the mapping remains correct. When possible, avoid renaming sections after they are used in live exams.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            If you need to remove a section, first confirm that it is not currently part of an active exam. In many cases, it is safer to deactivate a section rather than delete it to preserve historical exam audit trails.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-semibold text-slate-900">3. Building and Maintaining the Question Bank</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            The Questions page is where you add individual exam questions. Each question can contain the question text, four possible answers, and the correct answer.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            To create questions manually, select the target section and enter the question details. Each question should have a unique stem, four distinct options, and a clearly identified correct option.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            For bulk imports, use the Excel upload feature. Download the sample template and populate it with question data. Ensure section names in the file exactly match the section names in the system.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            After import, review the questions to catch any formatting or content errors. Templates are strict, so if an import fails, correct the file structure and re-upload only the corrected batch.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Keep the question bank organized by using the section assignment and by maintaining consistent marking values. Well-organized questions make future exam creation faster and more reliable.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-semibold text-slate-900">4. Configuring the Exam</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            The Exam Configuration page controls the exam duration, start time, and auto-submit behavior. This is a critical step before opening the exam to students.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            When setting the start time, choose a date and time that matches the candidate schedule. Verify timezone handling if you are administering the exam across multiple regions.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            The duration should match the exam structure. Allow enough time for the complete paper, including all sections. If the paper has multiple parts, consider adding buffer time for student setup.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Auto-submit should generally be enabled so the exam closes cleanly when time expires. If required, you can disable auto-submit for manual review workflows, but that increases administrative effort.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            If you need to end the exam early, use the force end option cautiously. This will finalize active student sessions and should only be used for legitimate reasons, such as technical disruption or exam completion.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-semibold text-slate-900">5. Student Registration and Access</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            The Students page is used to register candidates and manage their login details. Ensure each student has a valid account and the correct access privileges.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            If students are created in bulk, verify the student list after import. Confirm that emails or user IDs are formatted correctly, and that no duplicate accounts exist.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Communicate the exam login instructions clearly to students. Include the exam start time, required credentials, and any technical requirements in your student-facing communications.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Monitor new student accounts to ensure they are activated before the exam begins. Address account or login issues ahead of time to reduce exam-day disruptions.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-semibold text-slate-900">6. Monitoring Live Exams</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            During a live exam, use dashboard summaries and analytics to track participation. Keep an eye on how many students have started and how many questions have been submitted.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            If a student reports an issue, first check whether the exam is scheduled correctly and whether the student is within the allowed time window. Then verify the student’s session status.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Use live metrics to detect any unusual behavior, such as a sudden drop in active users or an unexpected number of incomplete submissions. These can indicate technical problems or connectivity issues.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Keep a log of any intervention or forced exam ends. This helps preserve transparency and can be important if you need to review the event later.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-semibold text-slate-900">7. Reviewing Submissions and Reports</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            After the exam, open the submissions and reports pages. Use the data to analyze score distributions, section performance, and individual student outcomes.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Export report data to CSV or Excel for offline review, sharing with stakeholders, or maintaining records. Use clear file names and include the exam date for future reference.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Compare actual performance with expected benchmarks. Identify questions that may have been too easy or too difficult and adjust your question bank accordingly for future exams.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-semibold text-slate-900">8. Creating a Detailed Admin Workflow</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Use the following detailed workflow as a template for full exam administration. This workflow is designed so any administrator can follow it step by step.
                        </p>
                        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-700">
                            <li>Review the exam objectives and determine the required sections and question types.</li>
                            <li>Create all sections and validate the section names.</li>
                            <li>Build the question bank section by section, ensuring each question is complete and accurate.</li>
                            <li>Use the AI prompt to generate draft questions, then refine and review them carefully.</li>
                            <li>Configure the exam schedule and verify the start time and duration.</li>
                            <li>Register students and verify access at least one day before the exam.</li>
                            <li>Monitor the exam during the live window and be ready to address any issues.</li>
                            <li>Close the exam on time or force-end if there is an emergency.</li>
                            <li>Review submissions, export reports, and archive the exam record.</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="text-lg font-semibold text-slate-900">9. Troubleshooting Common Issues</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Here are common issues and how to resolve them:
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            - If students cannot log in, verify the student credentials and the account activation status.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            - If the exam does not start at the scheduled time, confirm the exam configuration and the current system time.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            - If questions fail to import, check the Excel template and ensure all required columns are present and formatted correctly.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            - If students report missing submissions, review the live session logs and confirm that the exam was not prematurely ended.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-semibold text-slate-900">10. Best Practices for Admins</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Use the following best practices to keep the system reliable and easy to manage.
                        </p>
                        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-700">
                            <li>Standardize section naming across exam cycles.</li>
                            <li>Use the question bank consistently and avoid duplicate questions.</li>
                            <li>Verify exam configuration before releasing it to students.</li>
                            <li>Keep student contact details up to date.</li>
                            <li>Use reports after each exam to improve question quality and exam structure.</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="text-lg font-semibold text-slate-900">11. Long-Form Workflow Notes</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            This software is designed to be a complete exam administration platform. Follow the workflows carefully and refer to this guide during each phase of exam creation, delivery, and review.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            The sections above are intentionally detailed. Use this help page as a reference whenever you need step-by-step guidance or when you want to confirm the correct order of tasks.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            If you are using AI-generated questions, always verify the results manually. The AI prompt is meant to support content creation, but the administrator is responsible for final quality control.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            The software supports multiple admin scenarios, from small mock exams to large supervised assessments. Keep the exam content organized and the student workflow clear for every exam cycle.
                        </p>
                    </section>

                    <section>
                        <h4 className="text-lg font-semibold text-slate-900">12. Final Summary</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Use this help page as the main admin reference. Start with sections, then questions, then exam configuration, and finish with student registration and monitoring.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            Always validate the exam schedule, confirm the question bank, and keep clear records of each exam process. This ensures a high-quality exam experience for both administrators and candidates.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                            This guide is intended to be broad and detailed enough for universal administrators. If you need more specific instructions, refer back to the system pages relevant to each workflow stage.
                        </p>
                    </section>
                </article>
            </section>
        </section>
    );
};

export default HelpPage;
