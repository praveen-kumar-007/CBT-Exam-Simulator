import React, { useMemo, useState } from 'react';
import FeaturePageShell from '../../components/FeaturePageShell';
import NotificationBanner from '../../components/NotificationBanner';

type HelpTopicKey =
    | 'overview'
    | 'sections'
    | 'questions'
    | 'add-question'
    | 'students'
    | 'responses'
    | 'config'
    | 'activity'
    | 'insights'
    | 'reports'
    | 'users'
    | 'settings'
    | 'tenants'
    | 'profile'
    | 'demo-exam'
    | 'help';

type HelpTopic = {
    key: HelpTopicKey;
    title: string;
    description: string;
    steps: string[];
    tips?: string[];
};

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

Execution: Please analyze the attached sample file for the style and then generate the complete dataset for the [INSERT EXAM NAME HERE].`;

const helpTopics: HelpTopic[] = [
    {
        key: 'overview',
        title: 'Overview (Home)',
        description: 'Use the dashboard page to view key exam metrics and quick links. It is the starting point for every administration workflow.',
        steps: [
            'Review the summary tiles to see total students, submissions, question counts, and active exam status.',
            'Use the dashboard action cards or shortcut tiles to jump to other admin pages quickly.',
            'Check notifications and alerts on the home page for items that require attention before the exam.',
            'Use the dashboard to confirm the system is ready before you move into exam configuration and student setup.',
        ],
        tips: ['Treat the overview page as your daily status board, especially before the exam starts.'],
    },
    {
        key: 'sections',
        title: 'Sections',
        description: 'Sections organize the exam into subject areas or groups. Create and manage these before adding questions to the question bank.',
        steps: [
            'Open the Sections page and add a section name and optional description.',
            'Choose names that clearly identify the section, such as Mathematics, English, or Logical Reasoning.',
            'Review section assignments for accuracy before associating questions or exam schedules.',
            'Disable sections instead of deleting them if you want to preserve historical record and exam history.',
        ],
        tips: ['Use consistent section naming to avoid errors during question and exam configuration.'],
    },
    {
        key: 'questions',
        title: 'Question Bank',
        description: 'The Questions page is where you review and manage the full question bank for all sections.',
        steps: [
            'Filter questions by section to review the relevant content quickly.',
            'Edit existing questions to correct wording, answers, or marks.',
            'Use search and sort tools to find questions by keyword or tag.',
            'Validate imported questions after upload to confirm the section mapping is correct.',
        ],
        tips: ['Keep the question bank consistent and avoid duplicate questions across sections.'],
    },
    {
        key: 'add-question',
        title: 'Add Question',
        description: 'Create individual questions with a full set of answer options and the correct option selected.',
        steps: [
            'Select the proper section for the question before entering content.',
            'Write clear question text and provide exactly four answer options.',
            'Mark the correct answer and include marks or difficulty if available.',
            'Save the question and then review it in the Question Bank to confirm it appears correctly.',
        ],
        tips: ['Create new questions one at a time for controlled quality and review.'],
    },
    {
        key: 'students',
        title: 'Students',
        description: 'Use the Students page to register candidates, manage their exam access, and confirm their login credentials.',
        steps: [
            'Add or import student records with name, email, and login details.',
            'Verify account status for each student before the exam day.',
            'Fix any duplicate or incomplete records immediately after import.',
            'Use the student list to confirm who has access and who may need a reset.',
        ],
        tips: ['Notify students with exam login instructions and the exam schedule in advance.'],
    },
    {
        key: 'responses',
        title: 'Responses',
        description: 'The Responses page shows student exam submissions, answers, scores, and any flagged behavior.',
        steps: [
            'Open the Responses page after the test to view completed submissions.',
            'Review answer details and score breakdown for individual students.',
            'Examine any flagged or terminated submissions for a reason and resolution.',
            'Export response data if you need backup records or further offline analysis.',
        ],
        tips: ['Use response review to catch grading or behavioral issues quickly.'],
    },
    {
        key: 'config',
        title: 'Exam Config',
        description: 'Exam configuration controls timing, duration, and delivery rules for the test.',
        steps: [
            'Set the exam start time, duration, and auto-submit behavior clearly.',
            'Confirm section settings and the total exam configuration before publishing.',
            'Check the schedule and timezone settings if you have candidates in multiple locations.',
            'Apply configuration changes well before exam day to avoid last-minute issues.',
        ],
        tips: ['Keep auto-submit enabled unless you have a clear reason to manage submissions manually.'],
    },
    {
        key: 'activity',
        title: 'Activity',
        description: 'The Activity page records system and user actions. Use it for troubleshooting and auditing.',
        steps: [
            'Review activity logs to see when exam settings or student records changed.',
            'Use this history to confirm the sequence of events for any issue.',
            'Monitor candidate login attempts and exam session activity.',
            'Look for repeated failures or unusual actions around the exam window.',
        ],
        tips: ['Activity logs are useful for incident review and verifying administrative changes.'],
    },
    {
        key: 'insights',
        title: 'Insights',
        description: 'Insights show exam performance trends, score distribution, and section-level strengths.',
        steps: [
            'Open Insights after submissions are available to review performance metrics.',
            'Compare section averages and score buckets to identify weak or strong areas.',
            'Review top student performance and participation trends.',
            'Use timeline charts to understand how the exam progress changed over time.',
        ],
        tips: ['Use insights for post-exam review and planning improvements for future exams.'],
    },
    {
        key: 'reports',
        title: 'Reports',
        description: 'Reports provide downloadable exam summaries and analytics for stakeholders.',
        steps: [
            'Generate reports for scores, participation, and section performance.',
            'Choose the correct report type and export to CSV or Excel.',
            'Save exported files with clear naming including exam date and type.',
            'Share reports with exam coordinators or supervisors as needed.',
        ],
        tips: ['Use reports to compare performance across exams and improve question quality.'],
    },
    {
        key: 'users',
        title: 'Users',
        description: 'The Users page manages administrator accounts, roles, and access permissions.',
        steps: [
            'Add or remove admin users based on their responsibilities.',
            'Assign roles and permissions so each user has the correct access level.',
            'Update contact details and reset access for users who need help logging in.',
            'Review existing users to make sure inactive accounts are removed or disabled.',
        ],
        tips: ['Use least privilege principles so each admin only sees the tools they need.'],
    },
    {
        key: 'settings',
        title: 'Settings',
        description: 'Settings control global application options, brand preferences, and system defaults.',
        steps: [
            'Review global settings and confirm your organization preferences.',
            'Update support or contact information if the portal exposes it to users.',
            'Adjust security and login-related settings according to your policies.',
            'Save and test settings changes before relying on them for live exams.',
        ],
        tips: ['Keep system preferences consistent across exam cycles for a stable experience.'],
    },
    {
        key: 'tenants',
        title: 'Tenants',
        description: 'Tenants let you separate groups, clients, or institutions using the platform independently.',
        steps: [
            'Create a tenant for each separate business unit, school, or customer.',
            'Assign limits and users to each tenant as needed.',
            'Review tenant-specific settings and access controls.',
            'Use tenant management to keep data isolated for multi-organization deployments.',
        ],
        tips: ['Tenants keep exam data cleanly separated between different organizations or teams.'],
    },
    {
        key: 'profile',
        title: 'Profile',
        description: 'The Profile page is where you manage your own administrator account details and security.',
        steps: [
            'Update your name, email, and contact details if they change.',
            'Change your password or security settings if you suspect unauthorized access.',
            'Confirm profile information is accurate for audit and notification purposes.',
            'Use the profile page for account-specific updates that do not affect the whole system.',
        ],
        tips: ['Keep your profile current so notifications and support reach you reliably.'],
    },
    {
        key: 'demo-exam',
        title: 'Demo Exam',
        description: 'The Demo Exam page lets you test the exam flow safely before launching the live exam.',
        steps: [
            'Run a sample exam using the demo page to verify the full student experience.',
            'Check question display, timing, and submission behavior.',
            'Review demo results to identify any configuration or workflow issues.',
            'Use this page as a final validation step before the real exam date.',
        ],
        tips: ['Use a colleague or test account when running a demo exam for real-world validation.'],
    },
    {
        key: 'help',
        title: 'Help Center',
        description: 'This page provides help for all admin pages and explains how to use this help system itself.',
        steps: [
            'Click a page section heading to show detailed usage instructions for that page.',
            'Use the Show All Help button to expand every topic at once.',
            'Read the step-by-step instructions for the workflow you are currently working on.',
            'Return to this Help Center at any time for a quick refresher on a specific section.',
        ],
        tips: ['This page lets you access help for every admin page without creating dedicated help pages.'],
    },
];

const HelpPage: React.FC = () => {
    const [expandedTopics, setExpandedTopics] = useState<Set<HelpTopicKey>>(new Set(['help']));
    const [copyStatus, setCopyStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const allExpanded = expandedTopics.size === helpTopics.length;

    const activeSectionLabel = useMemo(() => {
        if (allExpanded) {
            return 'Live section: Help Center — all topics are open';
        }

        if (expandedTopics.size === 1) {
            const activeKey = Array.from(expandedTopics)[0];
            const topic = helpTopics.find((item) => item.key === activeKey);
            return topic ? `Live section: ${topic.title}` : 'Live section: Help Center';
        }

        return 'Live section: Help Center';
    }, [expandedTopics, allExpanded]);

    const toggleTopic = (key: HelpTopicKey) => {
        setExpandedTopics((current) => {
            const next = new Set(current);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const toggleAllTopics = () => {
        setExpandedTopics((current) => {
            if (current.size === helpTopics.length) {
                return new Set();
            }
            return new Set(helpTopics.map((topic) => topic.key));
        });
    };

    const copyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(promptText);
            setCopyStatus({ message: 'Prompt copied to clipboard.', type: 'success' });
            window.setTimeout(() => setCopyStatus(null), 3000);
        } catch {
            setCopyStatus({ message: 'Unable to copy prompt.', type: 'error' });
            window.setTimeout(() => setCopyStatus(null), 3000);
        }
    };

    const renderedHelpList = useMemo(
        () =>
            helpTopics.map((topic) => (
                <div key={topic.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <button
                        type="button"
                        onClick={() => toggleTopic(topic.key)}
                        className="flex w-full items-start justify-between gap-4 text-left"
                    >
                        <div>
                            <h4 className="text-lg font-semibold text-slate-900">{topic.title}</h4>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{topic.description}</p>
                        </div>
                        <span className="mt-1 text-sm font-semibold text-slate-500">{expandedTopics.has(topic.key) ? 'Hide' : 'Show'}</span>
                    </button>

                    {expandedTopics.has(topic.key) && (
                        <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
                            <div className="space-y-3 text-sm leading-7 text-slate-700">
                                {topic.steps.map((step, index) => (
                                    <p key={index}>
                                        <strong>Step {index + 1}:</strong> {step}
                                    </p>
                                ))}
                            </div>
                            {topic.tips && topic.tips.length > 0 && (
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <h5 className="text-sm font-semibold text-slate-900">Tips</h5>
                                    <ul className="mt-3 space-y-2 pl-5 text-sm leading-7 text-slate-700 list-disc">
                                        {topic.tips.map((tip, index) => (
                                            <li key={index}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )),
        [expandedTopics],
    );

    return (
        <section className="space-y-6">
            <FeaturePageShell title="Help Center" description="Comprehensive universal admin guide for the exam management software." />
            <NotificationBanner
                message={copyStatus?.message ?? null}
                type={copyStatus?.type ?? 'info'}
                sectionLabel={activeSectionLabel}
            />

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Admin Help Navigator</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
                            Click any page title below to show its detailed usage instructions. Use the button to show or hide all help sections at once.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleAllTopics}
                            className="rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                        >
                            {allExpanded ? 'Hide All Help' : 'Show All Help'}
                        </button>
                        <span className="text-sm text-slate-500">
                            {allExpanded ? 'All help sections are visible.' : 'Collapse or open a topic to read its help.'}
                        </span>
                    </div>
                </div>
            </section>

            <section className="space-y-4">{renderedHelpList}</section>

            <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 shadow-inner">
                <h3 className="text-xl font-semibold text-white">AI Prompt for Generating Exam XLSX Papers</h3>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                    The prompt below is ready to use. Replace the placeholder exam name with your target exam, then paste it into the AI tool that supports XLSX generation.
                </p>
                <div className="mt-4 rounded-2xl bg-slate-900 p-5 text-sm text-slate-100 shadow-lg">
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6">{promptText}</pre>
                </div>
                <div className="mt-4 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={copyPrompt}
                        className="rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                    >
                        Copy Prompt
                    </button>
                </div>
            </section>
        </section>
    );
};

export default HelpPage;
