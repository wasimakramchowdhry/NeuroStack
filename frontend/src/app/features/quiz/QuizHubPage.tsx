import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { quizAPI, type QuizLearnerItem } from '../../services/quizApi';
import { topicAPI, type Topic } from '../../services/topicApi';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { Badge } from '../../components/ui/badge';
import { Brain, ChevronRight, Target, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface TopicWithQuizzes {
    topic: Topic;
    quizzes: QuizLearnerItem[];
}

export function QuizHubPage() {
    const [topicQuizzes, setTopicQuizzes] = useState<TopicWithQuizzes[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllQuizzes();
    }, []);

    const loadAllQuizzes = async () => {
        setLoading(true);
        try {
            const { topics } = await topicAPI.listTopics({ limit: 100 });
            const results: TopicWithQuizzes[] = [];

            const quizPromises = topics.map(async (topic) => {
                try {
                    const quizzes = await quizAPI.listQuizzesForTopic(topic.id);
                    if (quizzes.length > 0) {
                        return { topic, quizzes };
                    }
                    return null;
                } catch {
                    return null;
                }
            });

            const resolved = await Promise.all(quizPromises);
            for (const item of resolved) {
                if (item) results.push(item);
            }

            setTopicQuizzes(results);
        } catch (error) {
            console.error('Failed to load quizzes:', error);
            toast.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    const difficultyColors: Record<string, string> = {
        beginner: 'bg-green-100 text-green-800 border-green-200',
        intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        advanced: 'bg-red-100 text-red-800 border-red-200',
    };

    const totalQuizzes = topicQuizzes.reduce((sum, tq) => sum + tq.quizzes.length, 0);

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
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                            Quiz Hub
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Browse and take quizzes from your enrolled topics
                        </p>
                    </div>
                </div>
                {totalQuizzes > 0 && (
                    <p className="text-sm text-slate-500 mt-4 ml-14">
                        {totalQuizzes} quiz{totalQuizzes !== 1 ? 'zes' : ''} available across {topicQuizzes.length} topic{topicQuizzes.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {topicQuizzes.length === 0 ? (
                <NeoCard className="p-12 text-center text-slate-500">
                    <Target className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-slate-300" />
                    <h2 className="text-xl font-semibold mb-2">No Quizzes Available Yet</h2>
                    <p className="mb-6">Quizzes will appear here once they are created for your topics.</p>
                    <Link to="/topics">
                        <NeoButton>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Explore Topics
                        </NeoButton>
                    </Link>
                </NeoCard>
            ) : (
                <div className="space-y-8">
                    {topicQuizzes.map(({ topic, quizzes }) => (
                        <div key={topic.id}>
                            {/* Topic Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                        {topic.title}
                                    </h2>
                                    <Badge variant="outline" className="text-xs">
                                        {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}
                                    </Badge>
                                </div>
                                <Link to={`/topics/${topic.slug}`} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                    View Topic <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {/* Quiz Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {quizzes.map((quiz) => (
                                    <NeoCard key={quiz.id} className="flex flex-col h-full border hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                        <div className="p-5 flex-1">
                                            <div className="flex justify-between items-start mb-3">
                                                <Badge variant="outline" className={difficultyColors[quiz.difficulty] || ''}>
                                                    {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                                                </Badge>
                                                <div className="flex items-center text-sm text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                    <Brain className="w-3.5 h-3.5 mr-1" />
                                                    {quiz.question_count} Qs
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight">
                                                {quiz.title}
                                            </h3>
                                        </div>
                                        <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/50 pt-3">
                                            <Link to={`/quiz/session/${quiz.id}`} className="block">
                                                <NeoButton className="w-full justify-center group flex items-center" size="sm">
                                                    Start Assessment
                                                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                </NeoButton>
                                            </Link>
                                        </div>
                                    </NeoCard>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
