import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router';
import { quizAPI, type QuizResult } from '../../services/quizApi';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { Badge } from '../../components/ui/badge';
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton';
import { CheckCircle2, XCircle, BrainCircuit, RefreshCcw, Home, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function QuizResultPage() {
    const { attemptId } = useParams<{ attemptId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [result, setResult] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If we have result in router state (came directly from submission), use it
        if (location.state?.result) {
            setResult(location.state.result);
            setLoading(false);
        } else {
            // Otherwise, we shouldn't really be here, or we'd need a GET /attempt/:id endpoint.
            // Since Phase 4 plan doesn't explicitly mention a GET attempt endpoint yet,
            // we'll just redirect to dashboard or show an error if no state.
            toast.error('Quiz result data not found. Redirecting...');
            navigate('/topics');
        }
    }, [attemptId, location.state, navigate]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <LoadingSkeleton />
            </div>
        );
    }

    if (!result) return null;

    const isPass = result.score >= 70;
    const scoreColor = isPass ? 'text-green-500' : 'text-orange-500';
    const scoreBg = isPass ? 'from-green-500 to-emerald-600' : 'from-orange-500 to-red-600';

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Overview Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <NeoCard className="p-8 text-center mb-8 bg-gradient-to-br from-[var(--neo-bg-secondary)] to-background">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        Quiz Results
                    </h1>
                    <p className="text-slate-500 mb-8">{result.quiz_title}</p>

                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className={`relative w-48 h-48 rounded-full flex items-center justify-center mb-4
              shadow-[8px_8px_16px_var(--neo-shadow-dark),-8px_-8px_16px_var(--neo-shadow-light)]
              bg-background border-4 ${isPass ? 'border-green-100 dark:border-green-900/30' : 'border-orange-100 dark:border-orange-900/30'}
            `}>
                            {/* Circular propergress could go here, for now simple text */}
                            <div className="absolute inset-0 rounded-full border-8 border-transparent"
                                style={{
                                    background: `conic-gradient(var(--neo-accent-${isPass ? 'green' : 'orange'}) ${result.score}%, transparent 0)`,
                                    WebkitMask: 'radial-gradient(transparent 55%, black 56%)',
                                    mask: 'radial-gradient(transparent 55%, black 56%)'
                                }}
                            />
                            <div className="text-center z-10">
                                <span className={`text-5xl font-extrabold ${scoreColor}`}>
                                    {result.score}%
                                </span>
                                <p className="text-sm font-medium text-slate-500 mt-1">
                                    {result.correct_count} / {result.total_questions} Correct
                                </p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                            {isPass ? 'Great Job!' : 'Keep Practicing!'}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2">
                            {isPass
                                ? "You've demonstrated a solid understanding of this topic. Ready for the next challenge?"
                                : "You're getting there. Review the feedback below and try again to reinforce your learning."}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to={`/quiz/session/${result.quiz_id}`}>
                            <NeoButton variant="primary" className="flex items-center">
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Retake Quiz
                            </NeoButton>
                        </Link>
                        <Link to="/topics">
                            <NeoButton variant="secondary" className="flex items-center">
                                <Home className="w-4 h-4 mr-2" />
                                Back to Topics
                            </NeoButton>
                        </Link>
                    </div>
                </NeoCard>
            </motion.div>

            {/* Detailed Feedback */}
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
                <BrainCircuit className="w-6 h-6 mr-3 text-indigo-500" />
                Question Breakdown
            </h3>

            <div className="space-y-6">
                {result.results.map((qResult, idx) => (
                    <motion.div
                        key={qResult.question_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <NeoCard className={`p-6 border-l-4 ${qResult.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 flex-shrink-0">
                                    {qResult.is_correct ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-500" />
                                    )}
                                </div>

                                <div className="flex-1 w-full overflow-hidden">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                            Question {idx + 1}
                                        </span>
                                        <Badge variant="outline" className={qResult.is_correct ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
                                            {qResult.is_correct ? 'Correct' : 'Incorrect'}
                                        </Badge>
                                    </div>

                                    {/* We don't have the question prompt directly in the result payload by default phase 4 spec, 
                      but we display the user's answer and correct answer. */}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Your Answer</span>
                                            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300">
                                                {typeof qResult.user_answer === 'object' ? JSON.stringify(qResult.user_answer, null, 2) : String(qResult.user_answer || 'Skipped')}
                                            </pre>
                                        </div>

                                        {!qResult.is_correct && (
                                            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                                                <span className="block text-xs font-semibold text-green-600/70 dark:text-green-400 uppercase tracking-widest mb-2">Reference Answer</span>
                                                <pre className="whitespace-pre-wrap font-sans text-sm text-green-800 dark:text-green-300">
                                                    {typeof qResult.correct_answer === 'object' ? JSON.stringify(qResult.correct_answer, null, 2) : String(qResult.correct_answer)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>

                                    {qResult.ai_feedback && (
                                        <div className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 flex gap-3 items-start">
                                            <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="block text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">AI Evaluator Feedback</span>
                                                <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
                                                    {qResult.ai_feedback}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {qResult.explanation && !qResult.ai_feedback && (
                                        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                            <strong>Explanation:</strong> {qResult.explanation}
                                        </div>
                                    )}

                                </div>
                            </div>
                        </NeoCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
