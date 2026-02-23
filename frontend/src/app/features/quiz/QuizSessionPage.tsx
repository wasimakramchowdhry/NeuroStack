import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { quizAPI, type LearnerQuestion, type AnswerSubmission } from '../../services/quizApi';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { Badge } from '../../components/ui/badge';
import { LoadingSkeleton } from '../../components/feedback/LoadingSkeleton';
import { ChevronLeft, ChevronRight, Send, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function QuizSessionPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<LearnerQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (quizId) startQuiz(quizId);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [quizId]);

  const startQuiz = async (id: string) => {
    setLoading(true);
    try {
      const data = await quizAPI.startQuiz(id);
      setAttemptId(data.attempt_id);
      setQuizTitle(data.quiz_title);
      setQuestions(data.questions);
      // Start timer
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch (error: any) {
      console.error('Failed to start quiz:', error);
      toast.error(error.message || 'Failed to start quiz');
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const setAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    if (!attemptId) return;

    const unanswered = questions.length - answeredCount;
    if (unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }

    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const submissions: AnswerSubmission[] = questions.map((q) => ({
        question_id: q.id,
        user_answer: answers[q.id] ?? '',
      }));
      const result = await quizAPI.submitQuiz(attemptId, submissions);
      navigate(`/quiz/results/${result.attempt_id}`, { state: { result } });
    } catch (error: any) {
      console.error('Failed to submit quiz:', error);
      toast.error(error.message || 'Failed to submit quiz');
      // Resume timer
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
          No questions found
        </h1>
        <NeoButton onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            window.close();
          }
        }}>Go Back</NeoButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Quiz Header */}
      <NeoCard className="p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {quizTitle}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(elapsed)}</span>
            </div>
            <Badge variant="outline" className="text-sm">
              {answeredCount}/{questions.length} answered
            </Badge>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[var(--neo-accent-orange)]"
            initial={false}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </NeoCard>

      {/* Question Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
      >
        <QuestionRenderer
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onAnswer={(val) => setAnswer(currentQuestion.id, val)}
        />
      </motion.div>

      {/* Question Dots */}
      <div className="flex items-center justify-center gap-2 my-6 flex-wrap">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center
              ${i === currentIndex
                ? 'bg-[var(--neo-accent-orange)] text-white shadow-md scale-110'
                : answers[q.id] !== undefined
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 shadow-sm'
              }`}
          >
            {answers[q.id] !== undefined ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <NeoButton
          variant="secondary"
          size="sm"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </NeoButton>

        {currentIndex < questions.length - 1 ? (
          <NeoButton
            variant="secondary"
            size="sm"
            onClick={() => setCurrentIndex((i) => i + 1)}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </NeoButton>
        ) : (
          <NeoButton
            variant="primary"
            size="md"
            loading={submitting}
            onClick={handleSubmit}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Quiz
          </NeoButton>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// QuestionRenderer — renders UI based on question type
// ──────────────────────────────────────────────

function QuestionRenderer({
  question,
  answer,
  onAnswer,
}: {
  question: LearnerQuestion;
  answer: any;
  onAnswer: (val: any) => void;
}) {
  const { type, content_json } = question;
  const prompt = content_json.prompt || content_json.markdown || '';

  return (
    <NeoCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="text-xs capitalize">
          {type.replace('_', ' ')}
        </Badge>
        <Badge variant="outline" className="text-xs">
          Difficulty: {question.difficulty}/10
        </Badge>
      </div>

      <p className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-6 whitespace-pre-wrap">
        {prompt}
      </p>

      {type === 'mcq' && (
        <MCQInput
          options={content_json.options || []}
          selected={answer}
          onSelect={(val) => onAnswer({ answer: val })}
        />
      )}

      {type === 'short_answer' && (
        <TextInput
          value={typeof answer === 'object' ? answer?.answer || '' : answer || ''}
          onChange={(val) => onAnswer({ answer: val })}
          placeholder="Type your answer..."
        />
      )}

      {type === 'code_completion' && (
        <CodeInput
          starterCode={content_json.starter_code || ''}
          value={typeof answer === 'object' ? answer?.answer || '' : answer || ''}
          onChange={(val) => onAnswer({ answer: val })}
        />
      )}

      {(type === 'architecture' || type === 'scenario_analysis') && (
        <TextInput
          value={typeof answer === 'object' ? answer?.answer || '' : answer || ''}
          onChange={(val) => onAnswer({ answer: val })}
          placeholder="Describe your analysis..."
          rows={6}
        />
      )}
    </NeoCard>
  );
}

// ──────────────────────────────────────────────
// Input Sub-components
// ──────────────────────────────────────────────

function MCQInput({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: any;
  onSelect: (val: string) => void;
}) {
  const selectedVal = typeof selected === 'object' ? selected?.answer : selected;

  return (
    <div className="space-y-3">
      {options.map((opt, i) => {
        const isSelected = selectedVal === opt;
        return (
          <button
            key={i}
            onClick={() => onSelect(opt)}
            className={`w-full text-left p-4 rounded-xl transition-all duration-200 border-2
              ${isSelected
                ? 'border-[var(--neo-accent-orange)] bg-orange-50 dark:bg-orange-900/20 shadow-[inset_2px_2px_4px_var(--neo-shadow-dark),inset_-2px_-2px_4px_var(--neo-shadow-light)]'
                : 'border-transparent bg-background shadow-[3px_3px_6px_var(--neo-shadow-dark),-3px_-3px_6px_var(--neo-shadow-light)] hover:shadow-[1px_1px_3px_var(--neo-shadow-dark),-1px_-1px_3px_var(--neo-shadow-light)]'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${isSelected
                  ? 'border-[var(--neo-accent-orange)] bg-[var(--neo-accent-orange)]'
                  : 'border-slate-400 dark:border-slate-500'
                }`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
              <span className="text-slate-800 dark:text-slate-200">{opt}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full p-4 rounded-xl bg-background text-slate-800 dark:text-slate-200 placeholder-slate-400
        shadow-[inset_3px_3px_6px_var(--neo-shadow-dark),inset_-3px_-3px_6px_var(--neo-shadow-light)]
        focus:outline-none focus:ring-2 focus:ring-[var(--neo-focus)] transition-all resize-none"
    />
  );
}

function CodeInput({
  starterCode,
  value,
  onChange,
}: {
  starterCode: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const displayValue = value || starterCode;

  return (
    <textarea
      value={displayValue}
      onChange={(e) => onChange(e.target.value)}
      rows={10}
      spellCheck={false}
      className="w-full p-4 rounded-xl bg-slate-900 text-green-400 font-mono text-sm
        shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.05)]
        focus:outline-none focus:ring-2 focus:ring-[var(--neo-focus)] transition-all resize-none"
    />
  );
}
