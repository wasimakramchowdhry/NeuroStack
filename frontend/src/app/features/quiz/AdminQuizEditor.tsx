import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Navigate } from 'react-router';
import { quizAPI, type QuizDetail, type QuestionCreate, type QuestionType } from '../../services/quizApi';
import { topicAPI, type Topic, type Difficulty } from '../../services/topicApi';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { Badge } from '../../components/ui/badge';
import { useAuthStore } from '../../store/authStore';
import { Target, Save, Sparkles, Plus, Trash2, ArrowLeft, GripVertical, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AdminQuizEditor() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const isNew = id === 'new';
    const initialTopicId = searchParams.get('topicId');

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Quiz Metadata
    const [title, setTitle] = useState('');
    const [topicId, setTopicId] = useState(initialTopicId || '');
    const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
    const [isPublished, setIsPublished] = useState(false);

    // Topic lookup
    const [topics, setTopics] = useState<Topic[]>([]);

    // Questions
    const [questions, setQuestions] = useState<QuestionCreate[]>([]);

    // Redirect if not admin
    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    useEffect(() => {
        loadTopics();
        if (!isNew && id) {
            loadQuiz(id);
        }
    }, [id, isNew]);

    const loadTopics = async () => {
        try {
            const resp = await topicAPI.listTopics({ limit: 100 });
            setTopics(resp.topics);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load topics for dropdown');
        }
    };

    const loadQuiz = async (quizId: string) => {
        setLoading(true);
        try {
            const data = await quizAPI.getQuiz(quizId);
            setTitle(data.title);
            setTopicId(data.topic_id);
            setDifficulty(data.difficulty);
            setIsPublished(data.is_published);

            // Map existing questions to QuestionCreate format for editing
            setQuestions(data.questions.map(q => ({
                type: q.type,
                content_json: q.content_json,
                correct_answer: q.correct_answer,
                difficulty: q.difficulty,
                explanation: q.explanation,
                order: q.order
            })));
        } catch (error) {
            console.error('Failed to load quiz:', error);
            toast.error('Failed to load quiz data');
            navigate('/admin/quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !topicId) {
            toast.error('Title and Topic are required');
            return;
        }

        setSaving(true);
        try {
            // 1. Create or Update Quiz container
            let savedQuizId = id;
            if (isNew) {
                const newQuiz = await quizAPI.createQuiz({
                    title,
                    topic_id: topicId,
                    difficulty,
                    is_published: isPublished
                });
                savedQuizId = newQuiz.id;
            } else if (id) {
                await quizAPI.updateQuiz(id, {
                    title,
                    difficulty,
                    is_published: isPublished
                });
            }

            // 2. Set Questions
            if (savedQuizId) {
                // Enforce ordering array index
                const cleanedQs = questions.map((q, idx) => ({ ...q, order: idx }));
                await quizAPI.setQuizQuestions(savedQuizId, cleanedQs);

                toast.success(`Quiz ${isNew ? 'created' : 'updated'} successfully`);
                navigate('/admin/quizzes');
            }
        } catch (error: any) {
            console.error('Failed to save quiz:', error);
            toast.error(error.message || 'Failed to save quiz');
        } finally {
            setSaving(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!topicId) {
            toast.error('Please select a topic first before generating questions.');
            return;
        }

        if (questions.length > 0) {
            if (!window.confirm('Generating new questions will append them to the current list. Proceed?')) {
                return;
            }
        }

        setGenerating(true);
        toast.info('AI is analyzing the topic and drafting questions... This may take up to 2 minutes.');
        try {
            const response = await quizAPI.generateQuestions(topicId, 3, 1);

            const newQuestions: QuestionCreate[] = response.generated_questions.map((gq, idx) => ({
                type: gq.type,
                content_json: gq.content_json,
                correct_answer: gq.correct_answer,
                difficulty: gq.difficulty,
                explanation: gq.explanation,
                order: questions.length + idx
            }));

            setQuestions(prev => [...prev, ...newQuestions]);
            toast.success(`Successfully generated ${newQuestions.length} questions from Ollama!`);

            if (!title) {
                setTitle(`Generated Quiz for Topic`);
            }
        } catch (error: any) {
            console.error('AI Generation failed:', error);
            toast.error(error.message || 'Failed to generate questions');
        } finally {
            setGenerating(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            type: 'mcq',
            content_json: { prompt: '', options: ['', '', '', ''] },
            correct_answer: { answer: '' },
            difficulty: 1,
            explanation: '',
            order: questions.length
        }]);
    };

    const updateQuestion = (index: number, updates: Partial<QuestionCreate>) => {
        const newQs = [...questions];

        // Auto-adjust content_json shapes if type changes
        if (updates.type && updates.type !== newQs[index].type) {
            if (updates.type === 'mcq') {
                newQs[index].content_json = { prompt: newQs[index].content_json.prompt || '', options: ['', '', '', ''] };
                newQs[index].correct_answer = { answer: '' };
            } else if (updates.type === 'code_completion') {
                newQs[index].content_json = { prompt: newQs[index].content_json.prompt || '', starter_code: '# Write your code here\n' };
                newQs[index].correct_answer = '# Expected solution logic';
            } else {
                newQs[index].content_json = { prompt: newQs[index].content_json.prompt || '' };
                newQs[index].correct_answer = { answer: '' };
            }
        }

        newQs[index] = { ...newQs[index], ...updates };
        setQuestions(newQs);
    };

    const removeQuestion = (index: number) => {
        if (window.confirm('Remove this question?')) {
            const newQs = questions.filter((_, i) => i !== index);
            setQuestions(newQs);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-5xl animate-pulse">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-8"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl mb-6"></div>
                <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/quizzes')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Target className="w-6 h-6 text-indigo-500" />
                            {isNew ? 'Create New Quiz' : 'Edit Quiz'}
                        </h1>
                        <p className="text-sm text-slate-500">Configure quiz metadata and question sets</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <NeoButton
                        variant="ghost"
                        onClick={handleAIGenerate}
                        loading={generating}
                        className={`flex items-center gap-2 font-semibold ${generating ? 'text-indigo-600' : 'text-purple-600 dark:text-purple-400 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 border-purple-200 dark:border-purple-800 border'}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Auto-Generate
                    </NeoButton>
                    <NeoButton
                        variant="primary"
                        onClick={handleSave}
                        loading={saving}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Quiz
                    </NeoButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Metadata */}
                <div className="lg:col-span-4 space-y-6">
                    <NeoCard className="p-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b pb-2">Quiz Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Topic <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={topicId}
                                    onChange={(e) => setTopicId(e.target.value)}
                                    disabled={!isNew && !!topicId} // Optional: lock topic after creation
                                >
                                    <option value="">Select a Topic</option>
                                    {topics.map(t => (
                                        <option key={t.id} value={t.id}>{t.title} ({t.module})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Quiz Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Intermediate Transformers Test"
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Difficulty
                                </label>
                                <select
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                                <div>
                                    <div className="font-medium text-slate-800 dark:text-slate-200">Publish Status</div>
                                    <div className="text-xs text-slate-500">Make it visible to learners</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isPublished}
                                        onChange={(e) => setIsPublished(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>
                                <strong>Evaluation Engine:</strong> Standard MCQs are evaluated exactly. Short Answer and Code questions will hit your local <strong>Ollama daemon</strong> for semantic scoring when learners submit.
                            </p>
                        </div>
                    </NeoCard>
                </div>

                {/* Right Column: Question Editor */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            Questions <Badge variant="secondary" className="ml-2">{questions.length}</Badge>
                        </h2>
                        <NeoButton variant="secondary" size="sm" onClick={addQuestion}>
                            <Plus className="w-4 h-4 mr-1" /> Add Manual Question
                        </NeoButton>
                    </div>

                    {questions.length === 0 ? (
                        <NeoCard className="p-12 text-center border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/20">
                            <Target className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-500 mb-4 max-w-sm mx-auto">
                                Start by generating questions automatically with AI, or adding them manually.
                            </p>
                            <div className="flex justify-center gap-3">
                                <NeoButton variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" onClick={handleAIGenerate} loading={generating}>
                                    <Sparkles className="w-4 h-4 mr-2" /> Auto-Generate
                                </NeoButton>
                                <NeoButton variant="secondary" onClick={addQuestion}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Question
                                </NeoButton>
                            </div>
                        </NeoCard>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, idx) => (
                                <NeoCard key={idx} className="overflow-visible border border-slate-200 dark:border-slate-700">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between rounded-t-[19px]">
                                        <div className="flex items-center gap-3">
                                            <div className="cursor-move text-slate-400 hover:text-slate-600">
                                                <GripVertical className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                                                Q{idx + 1}
                                            </span>
                                            <select
                                                className="text-sm p-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-medium"
                                                value={q.type}
                                                onChange={(e) => updateQuestion(idx, { type: e.target.value as QuestionType })}
                                            >
                                                <option value="mcq">Multiple Choice</option>
                                                <option value="short_answer">Short Answer</option>
                                                <option value="code_completion">Code Completion</option>
                                                <option value="scenario_analysis">Scenario Analysis</option>
                                                <option value="architecture">Architecture</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => removeQuestion(idx)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                            title="Remove Question"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        {/* Prompt */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prompt / Question Text</label>
                                            <textarea
                                                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-medium font-sans resize-y outline-none focus:ring-2 focus:ring-indigo-500"
                                                rows={2}
                                                value={q.content_json.prompt || ''}
                                                onChange={(e) => updateQuestion(idx, {
                                                    content_json: { ...q.content_json, prompt: e.target.value }
                                                })}
                                                placeholder="E.g., What is the primary function of the self-attention mechanism?"
                                            />
                                        </div>

                                        {/* MCQ Options Rendering */}
                                        {q.type === 'mcq' && (
                                            <div className="space-y-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Options & Correct Answer</label>
                                                {(q.content_json.options || ['', '', '', '']).map((opt: string, optIdx: number) => (
                                                    <div key={optIdx} className="flex flex-col sm:flex-row gap-2">
                                                        <input
                                                            type="text"
                                                            className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 text-sm"
                                                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const newOpts = [...(q.content_json.options || [])];
                                                                newOpts[optIdx] = e.target.value;
                                                                updateQuestion(idx, { content_json: { ...q.content_json, options: newOpts } });
                                                            }}
                                                        />
                                                        <button
                                                            className={`px-3 py-2 text-xs font-semibold rounded-lg border whitespace-nowrap transition-colors ${(q.correct_answer?.answer || q.correct_answer) === opt && opt.trim() !== ''
                                                                ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800'
                                                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700'
                                                                }`}
                                                            onClick={() => {
                                                                updateQuestion(idx, { correct_answer: { answer: opt } });
                                                            }}
                                                        >
                                                            {((q.correct_answer?.answer || q.correct_answer) === opt && opt.trim() !== '') ? 'Correct Answer' : 'Mark as Correct'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Short Answer / Scenario Exact Validation or AI Reference */}
                                        {q.type !== 'mcq' && (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Reference Answer <span className="text-[10px] text-indigo-500 normal-case ml-2">(Used by AI Evaluator as ground truth)</span>
                                                </label>
                                                {q.type === 'code_completion' ? (
                                                    <textarea
                                                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#0d1117] text-green-400 font-mono text-sm resize-y outline-none focus:ring-2 focus:ring-indigo-500"
                                                        rows={3}
                                                        value={typeof q.correct_answer === 'object' ? JSON.stringify(q.correct_answer, null, 2) : String(q.correct_answer || '')}
                                                        onChange={(e) => updateQuestion(idx, { correct_answer: e.target.value })}
                                                        placeholder="def attention(q, k, v): ..."
                                                    />
                                                ) : (
                                                    <textarea
                                                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-green-50/50 dark:bg-green-900/10 text-green-900 dark:text-green-300 font-medium resize-y outline-none focus:ring-2 focus:ring-green-500"
                                                        rows={2}
                                                        value={typeof q.correct_answer === 'object' ? q.correct_answer?.answer || '' : String(q.correct_answer || '')}
                                                        onChange={(e) => updateQuestion(idx, { correct_answer: { answer: e.target.value } })}
                                                        placeholder="The canonical correct explanation."
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {/* Explanation */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Explanation (Shown after submission)</label>
                                            <input
                                                type="text"
                                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500"
                                                value={q.explanation || ''}
                                                onChange={(e) => updateQuestion(idx, { explanation: e.target.value })}
                                                placeholder="Explain why the answer is correct..."
                                            />
                                        </div>
                                    </div>
                                </NeoCard>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
