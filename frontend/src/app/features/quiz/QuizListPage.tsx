import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { quizAPI, type QuizLearnerItem } from '../../services/quizApi';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { Badge } from '../../components/ui/badge';
import { Brain, Clock, ChevronLeft, Target } from 'lucide-react';
import { toast } from 'sonner';

export function QuizListPage() {
    const { topicId } = useParams<{ topicId: string }>();
    const [quizzes, setQuizzes] = useState<QuizLearnerItem[]>([]);
    const [topicTitle, setTopicTitle] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (topicId) {
            loadData(topicId);
        }
    }, [topicId]);

    const loadData = async (id: string) => {
        setLoading(true);
        try {
            const quizzesData = await quizAPI.listQuizzesForTopic(id);
            setQuizzes(quizzesData);
            if (quizzesData.length > 0 && quizzesData[0].topic_title) {
                setTopicTitle(quizzesData[0].topic_title);
            }
        } catch (error) {
            console.error('Failed to load quizzes:', error);
            toast.error('Failed to load available quizzes');
        } finally {
            setLoading(false);
        }
    };

    const difficultyColors = {
        beginner: 'bg-green-100 text-green-800 border-green-200',
        intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        advanced: 'bg-red-100 text-red-800 border-red-200',
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <Brain className="w-12 h-12 text-indigo-400 mb-4" />
                    <p className="text-slate-500">Loading quizzes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="mb-8">
                <Link to="/topics" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Topics
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        Quizzes{topicTitle ? ` for ${topicTitle}` : ''}
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400 ml-14">
                    Test your knowledge and verify your understanding of the material.
                </p>
            </div>

            {quizzes.length === 0 ? (
                <NeoCard className="p-12 text-center text-slate-500">
                    <Target className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-slate-300" />
                    <h2 className="text-xl font-semibold mb-2">No Quizzes Available</h2>
                    <p>There are currently no published quizzes for this topic. Check back later!</p>
                </NeoCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <NeoCard key={quiz.id} className="flex flex-col h-full border hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant="outline" className={difficultyColors[quiz.difficulty]}>
                                        {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                                    </Badge>
                                    <div className="flex items-center text-sm text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                        <Brain className="w-3.5 h-3.5 mr-1" />
                                        {quiz.question_count} Qs
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 leading-tight">
                                    {quiz.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    A dynamically evaluated assessment covering key concepts from this topic.
                                </p>
                            </div>

                            <div className="p-6 pt-0 mt-auto border-t border-slate-100 dark:border-slate-800/50 pt-4">
                                <Link to={`/quiz/session/${quiz.id}`} className="block">
                                    <NeoButton className="w-full justify-center group flex items-center">
                                        Start Assessment
                                        <ChevronLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </NeoButton>
                                </Link>
                            </div>
                        </NeoCard>
                    ))}
                </div>
            )}
        </div>
    );
}
