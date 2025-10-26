import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { examData as defaultExamData } from './data/questions';
import { GameState, QuestionStatus, Answers, Section, Question } from './types';
import { ClockIcon, CheckCircleIcon, XCircleIcon, EyeIcon, UserCircleIcon } from './components/icons';

// --- Helper Functions ---
const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// --- App Component ---
const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.Login);
    const [answers, setAnswers] = useState<Answers>({});
    const [markedForReview, setMarkedForReview] = useState<string[]>([]);
    const [timeRemaining, setTimeRemaining] = useState(defaultExamData.durationInMinutes * 60);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [visited, setVisited] = useState<string[]>([]);

    const allQuestions = useMemo(() => defaultExamData.sections.flatMap(s => s.questions), []);

    useEffect(() => {
        if (gameState === GameState.Ongoing && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prevTime => prevTime - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeRemaining === 0 && gameState === GameState.Ongoing) {
            handleSubmitExam();
        }
    }, [gameState, timeRemaining]);

    const startExam = () => {
        const firstQuestionId = defaultExamData.sections[0].questions[0].id;
        setVisited([firstQuestionId]);
        setGameState(GameState.Ongoing);
    };

    const handleSubmitExam = () => {
        setGameState(GameState.Finished)
    }

    const resetExam = () => {
        setGameState(GameState.Login);
        setAnswers({});
        setMarkedForReview([]);
        setTimeRemaining(defaultExamData.durationInMinutes * 60);
        setCurrentSectionIndex(0);
        setCurrentQuestionIndex(0);
        setVisited([]);
    };

    const calculateScore = useCallback(() => {
        return allQuestions.reduce((score, question) => {
            return answers[question.id] === question.answer ? score + 1 : score;
        }, 0);
    }, [answers, allQuestions]);

    const renderContent = () => {
        switch (gameState) {
            case GameState.Login:
                return <LoginScreen onLogin={() => setGameState(GameState.Instructions)} />;
            case GameState.Instructions:
                return <InstructionScreen onStart={startExam} />;
            case GameState.Ongoing:
                return (
                    <ExamScreen
                        answers={answers}
                        setAnswers={setAnswers}
                        markedForReview={markedForReview}
                        setMarkedForReview={setMarkedForReview}
                        timeRemaining={timeRemaining}
                        currentSectionIndex={currentSectionIndex}
                        setCurrentSectionIndex={setCurrentSectionIndex}
                        currentQuestionIndex={currentQuestionIndex}
                        setCurrentQuestionIndex={setCurrentQuestionIndex}
                        setGameState={setGameState}
                        visited={visited}
                        setVisited={setVisited}
                    />
                );
            case GameState.Review:
                return (
                    <ReviewScreen
                        answers={answers}
                        markedForReview={markedForReview}
                        visited={visited}
                        onConfirmSubmit={handleSubmitExam}
                        onGoBack={() => setGameState(GameState.Ongoing)}
                        allQuestions={allQuestions}
                    />
                );
            case GameState.Finished:
                return <ResultScreen score={calculateScore()} total={allQuestions.length} onRestart={resetExam} />;
            default:
                return <div>Loading...</div>;
        }
    };

    return (
        <div className="min-h-screen font-sans text-gray-800 bg-gray-200">
            {renderContent()}
        </div>
    );
};

const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [loginId, setLoginId] = useState('123456789');
    const [password, setPassword] = useState('**********');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-cover" style={{ backgroundImage: "url('https://i.imgur.com/eL8y4j3.png')" }}>
            <div className="w-full max-w-sm p-8 space-y-8 bg-white bg-opacity-90 rounded-lg shadow-2xl">
                <div className="text-center">
                    <img src="/components/back.png" alt="TCS iON Logo" className="w-32 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-700">Login</h2>
                </div>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="loginId" className="text-sm font-bold text-gray-600 block">Login ID</label>
                        <input
                            id="loginId"
                            type="text"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            className="w-full p-2 mt-1 text-gray-800 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-bold text-gray-600 block">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 mt-1 text-gray-800 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-bold transition-colors"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

const InstructionScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const [agreed, setAgreed] = useState(false);

    return (
        <div className="min-h-screen bg-white p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-blue-800 mb-4 border-b pb-2">{defaultExamData.examTitle}</h1>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">General Instructions:</h2>
                <div className="text-sm text-gray-600 space-y-3 p-4 border rounded-md bg-gray-50 max-h-96 overflow-y-auto">
                    <p>1. Total duration of this examination is <strong>{defaultExamData.durationInMinutes} minutes</strong>.</p>
                    <p>2. The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You need not terminate the examination or submit your paper.</p>
                    <p>3. The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li><span className="inline-block align-middle h-5 w-5 rounded-sm bg-gray-300 mr-2"></span> You have not visited the question yet.</li>
                        <li><span className="inline-block align-middle h-5 w-5 rounded-sm bg-red-500 mr-2"></span> You have not answered the question.</li>
                        <li><span className="inline-block align-middle h-5 w-5 rounded-sm bg-green-500 mr-2"></span> You have answered the question.</li>
                        <li><span className="inline-block align-middle h-5 w-5 rounded-sm bg-purple-500 mr-2"></span> You have NOT answered the question, but have marked the question for review.</li>
                        <li><span className="inline-block align-middle h-5 w-5 rounded-sm bg-gradient-to-br from-green-500 to-purple-500 mr-2"></span> You have answered the question, but marked it for review.</li>
                    </ul>
                    <p>4. You can click on the `&gt;` arrow which appears to the left of question palette to collapse the question palette, thereby maximizing the question window.</p>
                </div>

                <div className="mt-6 p-4 border-t">
                    <label className="flex items-center">
                        <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="ml-3 text-sm text-gray-700">I have read and understood all the instructions. I agree that in case of any dispute, the decision of the exam authority will be final.</span>
                    </label>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={onStart}
                        disabled={!agreed}
                        className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ExamScreenProps {
    answers: Answers;
    setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
    markedForReview: string[];
    setMarkedForReview: React.Dispatch<React.SetStateAction<string[]>>;
    timeRemaining: number;
    currentSectionIndex: number;
    setCurrentSectionIndex: React.Dispatch<React.SetStateAction<number>>;
    currentQuestionIndex: number;
    setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    visited: string[];
    setVisited: React.Dispatch<React.SetStateAction<string[]>>;
}

const ExamScreen: React.FC<ExamScreenProps> = (props) => {
    const {
        answers, setAnswers, markedForReview, setMarkedForReview, timeRemaining,
        currentSectionIndex, setCurrentSectionIndex, currentQuestionIndex,
        setCurrentQuestionIndex, setGameState, visited, setVisited
    } = props;

    const currentSection = defaultExamData.sections[currentSectionIndex];
    const currentQuestion = currentSection.questions[currentQuestionIndex];

    const handleOptionChange = (option: string) => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
    };

    const handleClearResponse = () => {
        const newAnswers = { ...answers };
        delete newAnswers[currentQuestion.id];
        setAnswers(newAnswers);
    };

    const handleMarkForReview = () => {
        setMarkedForReview(prev =>
            prev.includes(currentQuestion.id)
                ? prev.filter(id => id !== currentQuestion.id)
                : [...prev, currentQuestion.id]
        );
        handleNext();
    };

    const goToQuestion = (sectionIdx: number, questionIdx: number) => {
        setCurrentSectionIndex(sectionIdx);
        setCurrentQuestionIndex(questionIdx);
        const questionId = defaultExamData.sections[sectionIdx].questions[questionIdx].id;
        if (!visited.includes(questionId)) {
            setVisited(prev => [...prev, questionId]);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < currentSection.questions.length - 1) {
            goToQuestion(currentSectionIndex, currentQuestionIndex + 1);
        } else if (currentSectionIndex < defaultExamData.sections.length - 1) {
            goToQuestion(currentSectionIndex + 1, 0);
        }
    };

    const getQuestionStatus = (questionId: string): QuestionStatus => {
        const isAnswered = !!answers[questionId];
        const isMarked = markedForReview.includes(questionId);
        const isVisited = visited.includes(questionId);

        if (isAnswered && isMarked) return QuestionStatus.AnsweredAndMarked;
        if (isAnswered) return QuestionStatus.Answered;
        if (isMarked) return QuestionStatus.Marked;
        if (isVisited) return QuestionStatus.NotAnswered;
        return QuestionStatus.NotVisited;
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-blue-800 text-white shadow-md p-2 flex justify-between items-center z-10">
                <h1 className="text-lg font-bold ml-4">{defaultExamData.examTitle}</h1>
                <div className="flex items-center mr-4">
                    <div className="flex items-center mr-6">
                        <ClockIcon />
                        <span className="font-mono text-lg font-semibold">{formatTime(timeRemaining)}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-2 font-semibold">John Doe</span>
                        <UserCircleIcon className="w-8 h-8 text-gray-300" />
                    </div>
                </div>
            </header>
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="flex justify-between items-center border-b pb-2 mb-4 bg-white p-2 rounded-t-md">
                        <h2 className="text-md font-bold text-blue-700">{currentSection.name}</h2>
                        <span className="text-sm font-semibold text-gray-600">Question Type: MCQ</span>
                    </div>
                    <div className="bg-white p-4 rounded-b-md shadow">
                        <p className="font-bold mb-4">Question No. {currentQuestionIndex + 1}</p>
                        <p className="text-gray-800 text-base mb-6">{currentQuestion.text}</p>
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                                <label key={index} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-blue-50 transition-colors">
                                    <input
                                        type="radio"
                                        name={currentQuestion.id}
                                        value={option}
                                        checked={answers[currentQuestion.id] === option}
                                        onChange={() => handleOptionChange(option)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 p-2 flex flex-wrap gap-2 border-t bg-gray-50 rounded-md">
                        <button onClick={handleNext} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 shadow">Save & Next</button>
                        <button onClick={handleMarkForReview} className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-600">Mark for Review & Next</button>
                        <button onClick={handleClearResponse} className="bg-gray-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-gray-600">Clear Response</button>
                    </div>
                </div>
                <aside className="w-full md:w-72 lg:w-80 bg-white p-3 border-l shadow-lg">
                    <div className="flex mb-3 border-b">
                        {defaultExamData.sections.map((section, index) => (
                            <button
                                key={section.name}
                                onClick={() => goToQuestion(index, 0)}
                                className={`flex-1 py-2 text-xs font-semibold focus:outline-none ${currentSectionIndex === index ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                {section.name}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-4">
                        {currentSection.questions.map((q, index) => {
                            const status = getQuestionStatus(q.id);
                            let style = 'bg-gray-300 text-gray-700'; // Not Visited
                            if (status === QuestionStatus.NotAnswered) style = 'bg-red-500 text-white';
                            if (status === QuestionStatus.Answered) style = 'bg-green-500 text-white';
                            if (status === QuestionStatus.Marked) style = 'bg-purple-500 text-white';
                            if (status === QuestionStatus.AnsweredAndMarked) style = 'bg-gradient-to-br from-green-500 to-purple-500 text-white';

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => goToQuestion(currentSectionIndex, index)}
                                    className={`h-8 w-8 flex items-center justify-center rounded-sm font-bold text-sm ${style} ${currentQuestionIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>
                    <div className="text-xs space-y-1 text-gray-600 border-t pt-3">
                        <div className="flex items-center"><span className="h-4 w-4 rounded-sm bg-green-500 mr-2"></span> Answered</div>
                        <div className="flex items-center"><span className="h-4 w-4 rounded-sm bg-red-500 mr-2"></span> Not Answered</div>
                        <div className="flex items-center"><span className="h-4 w-4 rounded-sm bg-purple-500 mr-2"></span> Marked for Review</div>
                        <div className="flex items-center"><span className="h-4 w-4 rounded-sm bg-gray-300 mr-2"></span> Not Visited</div>
                        <div className="flex items-center"><span className="h-4 w-4 rounded-sm bg-gradient-to-br from-green-500 to-purple-500 mr-2"></span> Answered & Marked</div>
                    </div>
                    <button onClick={() => setGameState(GameState.Review)} className="mt-4 w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 shadow">Submit</button>
                </aside>
            </main>
        </div>
    );
};

interface ReviewScreenProps {
    answers: Answers;
    markedForReview: string[];
    visited: string[];
    allQuestions: Question[];
    onConfirmSubmit: () => void;
    onGoBack: () => void;
}
const ReviewScreen: React.FC<ReviewScreenProps> = ({ answers, markedForReview, visited, allQuestions, onConfirmSubmit, onGoBack }) => {
    const answeredCount = Object.keys(answers).length;
    const notAnsweredCount = visited.filter(id => !answers[id]).length;
    const notVisitedCount = allQuestions.length - visited.length;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
            <div className="p-8 bg-white rounded-md shadow-lg max-w-md text-center">
                <h1 className="text-2xl font-bold mb-6">Exam Summary</h1>
                <div className="grid grid-cols-2 gap-4 text-md mb-8">
                    <div className="p-4 bg-green-100 text-green-800 rounded">
                        <p className="font-bold text-2xl">{answeredCount}</p>
                        <p>Answered</p>
                    </div>
                    <div className="p-4 bg-red-100 text-red-800 rounded">
                        <p className="font-bold text-2xl">{notAnsweredCount}</p>
                        <p>Not Answered</p>
                    </div>
                    <div className="p-4 bg-purple-100 text-purple-800 rounded">
                        <p className="font-bold text-2xl">{markedForReview.length}</p>
                        <p>Marked for Review</p>
                    </div>
                    <div className="p-4 bg-gray-100 text-gray-800 rounded">
                        <p className="font-bold text-2xl">{notVisitedCount}</p>
                        <p>Not Visited</p>
                    </div>
                </div>
                <p className="text-gray-600 mb-8">Are you sure you want to submit for final marking? No changes will be allowed after submission.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onGoBack} className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded hover:bg-gray-400 transition-colors">No, Go Back</button>
                    <button onClick={onConfirmSubmit} className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition-colors">Yes, Submit</button>
                </div>
            </div>
        </div>
    );
};


const ResultScreen: React.FC<{ score: number, total: number, onRestart: () => void }> = ({ score, total, onRestart }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
        <div className="p-10 bg-white rounded-md shadow-lg text-center max-w-sm w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Exam Submitted Successfully!</h1>
            <p className="text-gray-600 mb-6">Thank you!</p>

            <div className="my-8">
                <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                    <h2 className="text-lg font-semibold text-blue-800">Your Score</h2>
                    <p className={`text-5xl font-bold my-2 ${score / total >= 0.5 ? 'text-green-600' : 'text-red-600'}`}>{score} <span className="text-3xl text-gray-500">/ {total}</span></p>
                    <p className="text-md font-semibold">
                        {score / total >= 0.5 ? 'Congratulations! You Passed.' : 'Better luck next time.'}
                    </p>
                </div>
            </div>

            <button
                onClick={onRestart}
                className="w-full bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-blue-300 transition-all duration-300"
            >
                Logout
            </button>
        </div>
    </div>
);

export default App;
