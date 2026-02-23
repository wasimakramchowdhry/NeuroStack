import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router';
import { topicAPI, type Topic } from '../../services/topicApi';
import { quizAPI, type QuizLearnerItem } from '../../services/quizApi';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { Badge } from '../../components/ui/badge';
import { useAuthStore } from '../../store/authStore';
import { Target, Plus, Edit, Trash2, Eye, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export function AdminQuizManager() {
    const { user } = useAuthStore();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [quizzesByTopic, setQuizzesByTopic] = useState<Record<string, QuizLearnerItem[]>>({});
    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    // Redirect if not admin
    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // First get all topics
            const response = await topicAPI.listTopics({ limit: 100 });
            setTopics(response.topics);

            // Then fetch quizzes for each topic (Admins see all quizzes including drafts based on the backend API logic)
            const quizzesMap: Record<string, QuizLearnerItem[]> = {};
            const expandedMap: Record<string, boolean> = {};

            // Parallelize fetching quizzes for topics
            await Promise.all(
                response.topics.map(async (topic) => {
                    try {
                        const topicQuizzes = await quizAPI.listQuizzesForTopic(topic.id);
                        quizzesMap[topic.id] = topicQuizzes;
                        expandedMap[topic.id] = topicQuizzes.length > 0; // expand topics that have quizzes by default
                    } catch (e) {
                        console.error(`Failed to load quizzes for topic ${topic.id}`, e);
                        quizzesMap[topic.id] = [];
                        expandedMap[topic.id] = false;
                    }
                })
            );

            setQuizzesByTopic(quizzesMap);
            setExpandedTopics(expandedMap);
        } catch (error) {
            console.error('Failed to load quiz dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const toggleTopic = (topicId: string) => {
        setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
    };

    const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
        if (window.confirm(`Are you sure you want to delete quiz "${quizTitle}"? This will erase all attempts as well.`)) {
            try {
                await quizAPI.deleteQuiz(quizId);
                toast.success('Quiz deleted successfully');
                loadData(); // Reload everything to reflect changes
            } catch (error) {
                toast.error('Failed to delete quiz');
                console.error(error);
            }
        }
    };

    const difficultyColors = {
        beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                            Quiz Management
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 ml-14">
                        Create, edit, and organize AI-powered quizzes for your topics
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : topics.length === 0 ? (
                <NeoCard className="p-12 text-center">
                    <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-slate-300" />
                    <h2 className="text-xl font-semibold mb-2">No Topics Available</h2>
                    <p className="text-slate-500 mb-6 flex flex-col items-center">
                        Quizzes are attached to Topics. Create a Topic first to build quizzes.
                    </p>
                    <Link to="/admin/topics/new">
                        <NeoButton>
                            Create Topic First
                        </NeoButton>
                    </Link>
                </NeoCard>
            ) : (
                <div className="space-y-6">
                    {topics.map(topic => {
                        const quizzes = quizzesByTopic[topic.id] || [];
                        const isExpanded = expandedTopics[topic.id];

                        return (
                            <NeoCard key={topic.id} className="overflow-hidden">
                                {/* Topic Header Row */}
                                <div
                                    className={`p-4 md:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isExpanded ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                                    onClick={() => toggleTopic(topic.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-slate-400">
                                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-none">
                                                    {topic.module}
                                                </Badge>
                                                <Badge className={`text-xs capitalize ${difficultyColors[topic.difficulty]}`}>
                                                    {topic.difficulty}
                                                </Badge>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                                {topic.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                            {quizzes.length} Quizzes
                                        </div>
                                        {/* Add Quiz Button (stop propagation so it doesn't toggle accordion) */}
                                        <div onClick={e => e.stopPropagation()}>
                                            <Link to={`/admin/quizzes/edit/new?topicId=${topic.id}`}>
                                                <NeoButton size="sm" className="flex items-center gap-1">
                                                    <Plus className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Add Quiz</span>
                                                </NeoButton>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Quizzes List (Accordion Body) */}
                                {isExpanded && (
                                    <div className="bg-slate-50/50 dark:bg-slate-900/20 p-4 md:p-6">
                                        {quizzes.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                                No quizzes created for this topic yet. Click "Add Quiz" to start.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {quizzes.map((quiz, qIdx) => (
                                                    <div key={quiz.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl neo-shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                                Quiz {qIdx + 1}
                                                            </span>
                                                            <Badge className={`text-xs ${difficultyColors[quiz.difficulty]}`}>
                                                                {quiz.difficulty}
                                                            </Badge>
                                                        </div>
                                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1 leading-tight line-clamp-2">
                                                            {quiz.title}
                                                        </h4>
                                                        <p className="text-sm text-slate-500 mb-4">
                                                            {quiz.question_count} Questions
                                                        </p>

                                                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                                            <Link to={`/quiz/session/${quiz.id}`} target="_blank">
                                                                <NeoButton size="sm" variant="ghost" title="Preview Learner Experience" className="text-indigo-600 hover:text-indigo-700">
                                                                    <Eye className="w-4 h-4" />
                                                                </NeoButton>
                                                            </Link>

                                                            <div className="flex gap-2">
                                                                <Link to={`/admin/quizzes/edit/${quiz.id}`}>
                                                                    <NeoButton size="sm" variant="secondary" className="px-2" title="Edit Quiz">
                                                                        <Edit className="w-4 h-4" />
                                                                    </NeoButton>
                                                                </Link>
                                                                <NeoButton size="sm" variant="secondary" className="px-2 text-red-500 hover:text-red-700" title="Delete Quiz" onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}>
                                                                    <Trash2 className="w-4 h-4" />
                                                                </NeoButton>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </NeoCard>
                        );
                    })}
                </div>
            )}

            {/* Back Link */}
            <div className="mt-8">
                <Link to="/admin">
                    <NeoButton variant="ghost">← Back to Admin Dashboard</NeoButton>
                </Link>
            </div>
        </div>
    );
}
