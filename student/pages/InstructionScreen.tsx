import React, { useState } from 'react';
import { ExamData } from '../../types';

type InstructionScreenProps = {
    onStart: () => void;
    examData: ExamData;
    examinerName: string;
};

const InstructionScreen: React.FC<InstructionScreenProps> = ({ onStart, examData, examinerName }) => {
    const [agreed, setAgreed] = useState(false);

    return (
        <div className="min-h-screen bg-white p-4 sm:p-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-4 border-b pb-2 text-2xl font-bold text-blue-800">{examData.examTitle}</h1>
                <p className="mb-4 text-sm text-slate-600">Examiner: <strong>{examinerName}</strong></p>

                <h2 className="mb-4 text-lg font-semibold text-gray-700">General Instructions:</h2>
                <div className="max-h-96 space-y-3 overflow-y-auto rounded-md border bg-gray-50 p-4 text-sm text-gray-600">
                    <p>1. Total duration of this examination is <strong>{examData.durationInMinutes} minutes</strong>.</p>
                    <p>2. The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You need not terminate the examination or submit your paper.</p>
                    <p>3. The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</p>
                    <ul className="mt-2 list-disc space-y-2 pl-6">
                        <li><span className="mr-2 inline-block h-5 w-5 rounded-sm bg-gray-300 align-middle"></span> You have not visited the question yet.</li>
                        <li><span className="mr-2 inline-block h-5 w-5 rounded-sm bg-red-500 align-middle"></span> You have not answered the question.</li>
                        <li><span className="mr-2 inline-block h-5 w-5 rounded-sm bg-green-500 align-middle"></span> You have answered the question.</li>
                        <li><span className="mr-2 inline-block h-5 w-5 rounded-sm bg-purple-500 align-middle"></span> You have NOT answered the question, but have marked the question for review.</li>
                        <li><span className="mr-2 inline-block h-5 w-5 rounded-sm bg-gradient-to-br from-green-500 to-purple-500 align-middle"></span> You have answered the question, but marked it for review.</li>
                    </ul>
                    <p>4. You can click on the {`>`} arrow which appears to the left of question palette to collapse the question palette, thereby maximizing the question window.</p>
                </div>

                <div className="mt-6 border-t p-4">
                    <label className="flex items-center">
                        <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-3 text-sm text-gray-700">I have read and understood all the instructions.</span>
                    </label>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onStart}
                        disabled={!agreed}
                        className="rounded-md bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        Proceed to Exam (Full-Screen)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructionScreen;
