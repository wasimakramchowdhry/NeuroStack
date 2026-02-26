import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { NeoCard } from '../components/neo/NeoCard';
import { NeoButton } from '../components/neo/NeoButton';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../store/authStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import {
  Brain,
  Zap,
  Target,
  Globe,
  BookOpen,
  Trophy,
  Sparkles,
  ArrowRight,
  ChevronDown,
  GraduationCap,
  Code2,
  Cpu,
  Network,
  Layers,
  Rocket,
  CheckCircle2,
  Clock,
  BarChart3,
  Languages,
  FlaskConical,
} from 'lucide-react';

// ── Floating Particle Background ─────────────────────────────
function NeuralParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const init = () => {
      resize();
      const count = Math.min(60, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 15000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.5 + 0.15,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 122, 48, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 122, 48, ${p.opacity})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;
      }

      animationId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

// ── Animated Counter ─────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

// ── Scroll-triggered Section Wrapper ─────────────────────────
function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Typing Text Animation ────────────────────────────────────
function TypingText({ texts }: { texts: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[currentIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 60);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 30);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, currentIndex, texts]);

  return (
    <span className="text-[var(--neo-accent-orange)]">
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-[3px] h-[1em] bg-[var(--neo-accent-orange)] ml-0.5 align-middle"
      />
    </span>
  );
}

// ── Phase Detail Modal Content ───────────────────────────────
const phaseDetails = [
  {
    phase: 0,
    title: 'Mathematical Foundations',
    duration: '20 Weeks (5 Months)',
    level: 'Pre-L1 → L1 Foundation',
    icon: FlaskConical,
    color: '#8B5CF6',
    summary: 'Build rock-solid mathematical intuition for AI — not to pass exams, but to debug training instability, design custom loss functions, and reason about gradient flow through sparse networks.',
    subphases: [
      { name: 'Phase 0A: Linear Algebra', weeks: 'Weeks 1-6', topics: 'Vectors, matrices, transformations, eigenvalues, SVD, attention math' },
      { name: 'Phase 0B: Calculus & Optimization', weeks: 'Weeks 7-12', topics: 'Gradients, chain rule, backpropagation, Adam optimizer, loss functions' },
      { name: 'Phase 0C: Probability & Information Theory', weeks: 'Weeks 13-16', topics: 'Distributions, Bayes theorem, entropy, KL divergence, softmax routing' },
      { name: 'Phase 0D: NumPy Mastery', weeks: 'Weeks 17-20', topics: 'Vectorization, einsum, broadcasting, complete neural network from scratch' },
    ],
    milestone: 'Build a working neural network from scratch in NumPy. Understand the linear algebra inside attention mechanisms.',
  },
  {
    phase: 1,
    title: 'Deep Learning Core in PyTorch',
    duration: '12 Weeks (3 Months)',
    level: 'L1 → L2 (ML Engineer)',
    icon: Code2,
    color: '#3B82F6',
    summary: 'Transition from NumPy to PyTorch. Build production-grade deep learning intuition — autograd, GPU acceleration, and the full transformer architecture from scratch.',
    subphases: [
      { name: 'Phase 1A: PyTorch Fundamentals', weeks: 'Weeks 21-24', topics: 'Tensors, autograd, nn.Module, DataLoader, mixed precision, gradient accumulation' },
      { name: 'Phase 1B: Transformer Architecture', weeks: 'Weeks 25-30', topics: 'Multi-head attention, LayerNorm, FFN, positional encoding, build GPT from scratch' },
    ],
    milestone: 'Build GPT from scratch. Understand transformers at every level — mathematical, code, and systems.',
  },
  {
    phase: 2,
    title: 'Fine-Tuning & Transfer Learning',
    duration: '8 Weeks (2 Months)',
    level: 'L2 → L3 Foundation',
    icon: Target,
    color: '#10B981',
    summary: 'In production, you rarely train from scratch. Master the art of adapting existing models efficiently — the skill that 90% of industry ML work requires.',
    subphases: [
      { name: 'HuggingFace Ecosystem', weeks: 'Weeks 31-32', topics: 'Model loading, tokenization (BPE, WordPiece), hidden state analysis' },
      { name: 'LoRA & QLoRA', weeks: 'Weeks 33-34', topics: 'Low-rank adaptation, 4-bit quantization, PEFT library, memory efficiency' },
      { name: 'RLHF & Alignment', weeks: 'Weeks 35-36', topics: 'SFT, reward modeling, DPO, safety and alignment' },
      { name: 'Dataset Engineering', weeks: 'Weeks 37-38', topics: 'Synthetic data, curation, deduplication, domain-specific pipelines' },
    ],
    milestone: 'Fine-tune models efficiently, understand LoRA/QLoRA mathematically and practically.',
  },
  {
    phase: 3,
    title: 'Model Optimization & Compression',
    duration: '10 Weeks (2.5 Months)',
    level: 'L3 (Efficient Model Engineer)',
    icon: Cpu,
    color: '#F59E0B',
    summary: 'Where your MoE journey truly begins. Master quantization, distillation, pruning, and optimized inference — every technique directly applies to making MoE experts practical.',
    subphases: [
      { name: 'Quantization Deep Dive', weeks: 'Weeks 39-40', topics: 'PTQ, QAT, GPTQ, AWQ, GGUF, INT8/INT4 tradeoffs' },
      { name: 'Knowledge Distillation', weeks: 'Weeks 41-42', topics: 'Teacher-student framework, temperature scaling, feature distillation' },
      { name: 'Pruning & Sparsity', weeks: 'Weeks 43-44', topics: 'Magnitude pruning, structured vs unstructured, lottery ticket hypothesis' },
      { name: 'Inference Optimization', weeks: 'Weeks 45-48', topics: 'KV cache, vLLM, PagedAttention, ONNX, TensorRT, FastAPI serving' },
    ],
    milestone: 'End-to-end pipeline: fine-tune → quantize → optimize → serve. Level 3: Efficient Model Engineer.',
  },
  {
    phase: 4,
    title: 'AI Systems Engineering',
    duration: '8 Weeks (2 Months)',
    level: 'L4 (AI Systems Engineer)',
    icon: Network,
    color: '#EF4444',
    summary: 'Where your backend experience becomes your superpower. Most ML engineers struggle here because they lack systems intuition. This phase will be accelerated thanks to your production engineering background.',
    subphases: [
      { name: 'GPU Architecture', weeks: 'Weeks 49-50', topics: 'Memory hierarchy, CUDA cores, tensor cores, memory profiling' },
      { name: 'Distributed Training', weeks: 'Weeks 51-52', topics: 'Data/model/tensor parallelism, DeepSpeed ZeRO, expert parallelism' },
      { name: 'Production Infrastructure', weeks: 'Weeks 53-54', topics: 'Serving architecture, auto-scaling, A/B testing, cost optimization' },
      { name: 'Vector DBs & RAG', weeks: 'Weeks 55-56', topics: 'ANN search, HNSW, RAG systems, embedding-based routing' },
    ],
    milestone: 'Build production inference systems. Level 4: AI Systems Engineer — already a high-salary position.',
  },
  {
    phase: 5,
    title: 'Mixture of Experts Architecture',
    duration: '10 Weeks (2.5 Months)',
    level: 'L4 → L5 (Architecture Specialist)',
    icon: Layers,
    color: '#EC4899',
    summary: 'The core phase. Everything before was preparation. Now you build MoE systems — sparse architectures, routing networks, and hybrid cloud-edge deployment.',
    subphases: [
      { name: 'MoE Theory & Math', weeks: 'Weeks 57-58', topics: 'Gating networks, top-k routing, load balancing, Switch Transformer' },
      { name: 'Build Sparse MoE Transformer', weeks: 'Weeks 59-60', topics: 'Router + N expert FFNs, auxiliary loss, routing entropy monitoring' },
      { name: 'Modular Router Design', weeks: 'Weeks 61-62', topics: 'Embedding classifiers, hot-loading experts, confidence thresholds' },
      { name: 'CPU/Mobile + Hybrid Cloud', weeks: 'Weeks 63-66', topics: 'ONNX Mobile, GGUF on Android, cloud-edge MoE, cost modeling' },
    ],
    milestone: 'Build a modular MoE system from scratch: router, experts, CPU optimization, hybrid cloud-edge.',
  },
  {
    phase: 6,
    title: 'Capstone: Smart Modular LLM Framework',
    duration: '6 Weeks (1.5 Months)',
    level: 'L5 (Architecture Specialist)',
    icon: Rocket,
    color: '#FF7A30',
    summary: 'Your portfolio-defining project. Build an open-source framework embodying everything you\'ve learned — not a toy, but a product-grade modular MoE system.',
    subphases: [
      { name: 'Framework Architecture', weeks: 'Weeks 67-68', topics: 'Plugin system, expert registry, router interface, config system' },
      { name: 'Implementation & Optimization', weeks: 'Weeks 69-70', topics: 'All routing strategies, all serving modes, monitoring & benchmarks' },
      { name: 'Open Source Release', weeks: 'Weeks 71-72', topics: 'Documentation, demo apps, technical blog, GitHub release' },
    ],
    milestone: 'Open-source release of your modular MoE framework. Program complete: AI Architecture Specialist.',
  },
];

// ── Feature Detail Data ──────────────────────────────────────
const featureDetails = [
  {
    icon: Brain,
    title: 'AI Systems Mastery',
    description: 'Deep dive into transformers, MoE, quantization, and production systems',
    details: {
      heading: 'Master AI Systems Architecture',
      body: 'Go beyond surface-level understanding. NeuroStack teaches you to build, debug, and optimize AI systems from the ground up — not just use them.',
      bullets: [
        'Build a complete GPT model from scratch — no copy-paste, full understanding',
        'Implement multi-head attention, KV-cache, and causal masking yourself',
        'Master Mixture of Experts: routing networks, load balancing, expert specialization',
        'Quantize models to INT4/INT8 and measure the accuracy-speed tradeoff',
        'Design production inference systems with vLLM, ONNX Runtime, and TensorRT',
        'Understand every tensor shape, gradient flow, and memory allocation',
      ],
    },
  },
  {
    icon: Globe,
    title: '22 Languages',
    description: 'Learn in your native language with AI-powered translations',
    details: {
      heading: 'Learn in Your Mother Tongue',
      body: 'Powered by Bhashini (Indian Government Translation API), NeuroStack translates all learning content into 22 languages with intelligent caching and Text-to-Speech audio.',
      bullets: [
        'Hindi, Telugu, Tamil, Bengali, Marathi, Gujarati, Kannada, Malayalam, and 14 more',
        '3-tier caching system: Redis → PostgreSQL → API for instant translations',
        'Async Celery workers process translations in the background',
        'Text-to-Speech (TTS) audio for every topic in every supported language',
        'Audio is permanently cached as Base64 blobs — play anytime, even offline',
        'Admin dashboard to review, force-translate, and manage localizations',
      ],
    },
  },
  {
    icon: Target,
    title: 'Adaptive Learning',
    description: 'Personalized roadmaps that adapt to your progress and goals',
    details: {
      heading: 'Your Path, Your Pace',
      body: 'Based on a comprehensive 72-week roadmap engineered for your specific profile — structured learning from mathematical foundations all the way to MoE architecture specialist.',
      bullets: [
        '7 progressive phases with strict dependency graphs — no hand-waving',
        'Evaluation checkpoints at every milestone to verify understanding',
        'Topics cascade in difficulty: beginner → intermediate → advanced',
        'Module-based organization: Fundamentals, Deep Learning, Transformers, Systems',
        'Adapts pace based on your background — backend engineers save ~14 weeks',
        'Every topic connects back to the end goal: building MoE systems',
      ],
    },
  },
  {
    icon: Trophy,
    title: 'Interactive Quizzes',
    description: 'Test your knowledge with multi-type assessments and AI evaluation',
    details: {
      heading: 'AI-Powered Assessment Engine',
      body: 'The quiz system uses a local LLM (Ollama/vLLM) to both generate questions and semantically evaluate your answers — not just pattern matching, but real understanding.',
      bullets: [
        'Multiple question types: MCQ, code completion, short answer, architecture, scenario analysis',
        'AI auto-generates targeted questions from topic content using Mistral 7B',
        'Semantic grading: LLM evaluates short answers against rubrics, not just exact match',
        'Timed quiz sessions with sleek progress tracking UI',
        'Detailed results with per-question AI feedback and explanations',
        'Admin Quiz Editor for manual or AI-assisted assessment creation',
      ],
    },
  },
  {
    icon: Zap,
    title: 'Visual Learning',
    description: 'Animated explanations of complex concepts like attention mechanisms',
    details: {
      heading: 'See It, Understand It',
      body: 'Complex AI concepts are hard to understand from text alone. NeuroStack uses rich visual content sections — animations, diagrams, and interactive code — to make abstractions concrete.',
      bullets: [
        'Animated attention mechanism visualizations',
        'Architecture diagrams for MLP, CNN, Transformer, and MoE',
        'Live code sections with syntax highlighting in multiple languages',
        'LaTeX-rendered mathematical formulas (KaTeX)',
        'Benchmark comparisons with interactive charts (Recharts)',
        'Neo-tactoid neumorphic design — a visual experience, not just a textbook',
      ],
    },
  },
  {
    icon: Sparkles,
    title: 'AI Mentor',
    description: 'Get personalized guidance, exercises, and interview preparation',
    details: {
      heading: 'Your Personal AI Tutor',
      body: 'An embedded AI mentor powered by local LLMs provides personalized guidance throughout your learning journey — exercises, debugging help, and interview prep.',
      bullets: [
        'Context-aware responses based on your current learning phase',
        'Custom exercise generation tailored to your weak areas',
        'Code review and debugging assistance for implementation tasks',
        'Interview preparation questions for AI/ML engineering roles',
        'Runs locally via Ollama — your data never leaves your machine',
        'Supports multiple models: Mistral 7B, Llama 3, and more',
      ],
    },
  },
];

// ── Main Landing Page ────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [selectedFeature, setSelectedFeature] = useState<typeof featureDetails[0] | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<typeof phaseDetails[0] | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div className="relative overflow-hidden">

      {/* ── HERO SECTION ───────────────────────────────────── */}
      <motion.div
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 -mt-6"
      >
        {/* Particle background */}
        <NeuralParticles />

        {/* Glowing orb behind logo */}
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,122,48,0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Animated brain icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative z-10 mb-8"
        >
          <NeoCard className="inline-block p-8">
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            >
              <Brain className="w-20 h-20 text-[var(--neo-accent-orange)]" />
            </motion.div>
          </NeoCard>
        </motion.div>

        {/* Headline with typing effect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-[var(--neo-text-primary)] mb-4">
            Master{' '}
            <TypingText texts={['AI Systems', 'Transformers', 'MoE Architecture', 'Production ML']} />
          </h1>
          <p className="text-lg md:text-xl text-[var(--neo-text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            72-week structured roadmap from mathematical foundations to
            AI Architecture Specialist — build everything from scratch
          </p>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 flex gap-4 flex-wrap justify-center"
        >
          {isAuthenticated ? (
            <NeoButton variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </NeoButton>
          ) : (
            <>
              <NeoButton variant="primary" size="lg" onClick={() => navigate('/register')}>
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </NeoButton>
              <NeoButton variant="ghost" size="lg" onClick={() => navigate('/login')}>
                Sign In
              </NeoButton>
            </>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-[var(--neo-text-secondary)]"
          >
            <span className="text-xs uppercase tracking-widest">Explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 px-4">
          {[
            { icon: Clock, value: 72, suffix: ' Weeks', label: 'Structured Curriculum' },
            { icon: GraduationCap, value: 7, suffix: ' Phases', label: 'Progressive Mastery' },
            { icon: Languages, value: 22, suffix: '+', label: 'Languages Supported' },
            { icon: BarChart3, value: 5, suffix: ' Levels', label: 'L1 to L5 Progression' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <NeoCard className="p-6 text-center">
                  <Icon className="w-6 h-6 text-[var(--neo-accent-orange)] mx-auto mb-3" />
                  <div className="text-3xl font-bold text-[var(--neo-text-primary)] mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-[var(--neo-text-secondary)] uppercase tracking-wide">
                    {stat.label}
                  </div>
                </NeoCard>
              </motion.div>
            );
          })}
        </div>
      </ScrollReveal>

      {/* ── FEATURES GRID (Clickable) ─────────────────────── */}
      <ScrollReveal className="mb-20 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--neo-text-primary)] mb-3">
            Everything You Need to Master AI
          </h2>
          <p className="text-[var(--neo-text-secondary)] max-w-xl mx-auto">
            Click any card to explore what's inside
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureDetails.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <NeoCard
                  className="p-6 h-full group cursor-pointer"
                  onClick={() => setSelectedFeature(feature)}
                >
                  <div className="flex items-start gap-4">
                    <NeoCard variant="flat" className="p-3 shrink-0">
                      <Icon className="w-7 h-7 text-[var(--neo-accent-orange)]" />
                    </NeoCard>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-[var(--neo-text-primary)] mb-1 flex items-center gap-2">
                        {feature.title}
                        <ArrowRight className="w-4 h-4 text-[var(--neo-accent-orange)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-[var(--neo-text-secondary)] text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </NeoCard>
              </motion.div>
            );
          })}
        </div>
      </ScrollReveal>

      {/* ── LEARNING JOURNEY — 7 PHASES (Clickable) ────────── */}
      <ScrollReveal className="mb-20 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--neo-text-primary)] mb-3">
            Your 72-Week Learning Journey
          </h2>
          <p className="text-[var(--neo-text-secondary)] max-w-2xl mx-auto">
            From zero to AI Architecture Specialist — every phase builds precisely on the previous one.
            Click any phase to see the full breakdown.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--neo-accent-orange)] via-[var(--neo-accent-orange)]/50 to-transparent" />

          {phaseDetails.map((phase, index) => {
            const Icon = phase.icon;
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: 0.1 }}
                className={`relative flex items-start mb-8 ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-row`}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                  <motion.div
                    whileHover={{ scale: 1.3 }}
                    className="w-4 h-4 rounded-full border-2 border-[var(--neo-accent-orange)] bg-background"
                    style={{ borderColor: phase.color }}
                  />
                </div>

                {/* Card */}
                <div className={`ml-14 md:ml-0 ${isLeft ? 'md:mr-[calc(50%+2rem)] md:pr-0' : 'md:ml-[calc(50%+2rem)] md:pl-0'} w-full md:w-[calc(50%-2rem)]`}>
                  <NeoCard
                    className="p-5 group cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => setSelectedPhase(phase)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="p-2 rounded-xl"
                        style={{ backgroundColor: `${phase.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: phase.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: phase.color }}>
                          Phase {phase.phase} — {phase.duration}
                        </div>
                        <h3 className="text-base font-semibold text-[var(--neo-text-primary)] flex items-center gap-2">
                          {phase.title}
                          <ArrowRight className="w-3.5 h-3.5 text-[var(--neo-accent-orange)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--neo-text-secondary)] leading-relaxed line-clamp-2">
                      {phase.summary}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[var(--neo-text-secondary)]">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {phase.level}
                    </div>
                  </NeoCard>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollReveal>

      {/* ── SKILL PROGRESSION BAR ──────────────────────────── */}
      <ScrollReveal className="mb-20 px-4">
        <NeoCard className="p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-[var(--neo-text-primary)] mb-6 text-center">
            Skill Level Progression
          </h3>
          <div className="space-y-4">
            {[
              { level: 'L1', title: 'AI Application Engineer', phase: 'Phase 0-1', width: '20%', color: '#8B5CF6' },
              { level: 'L2', title: 'ML Engineer', phase: 'Phase 2', width: '35%', color: '#3B82F6' },
              { level: 'L3', title: 'Efficient Model Engineer', phase: 'Phase 3', width: '55%', color: '#F59E0B' },
              { level: 'L4', title: 'AI Systems Engineer', phase: 'Phase 4', width: '75%', color: '#EF4444' },
              { level: 'L5', title: 'AI Architecture Specialist', phase: 'Phase 5-6', width: '100%', color: '#FF7A30' },
            ].map((item, i) => (
              <motion.div
                key={item.level}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-8 text-xs font-bold" style={{ color: item.color }}>
                  {item.level}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--neo-text-primary)] font-medium">{item.title}</span>
                    <span className="text-[var(--neo-text-secondary)] text-xs">{item.phase}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--neo-shadow-dark)]/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: item.width }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </NeoCard>
      </ScrollReveal>

      {/* ── CTA SECTION ────────────────────────────────────── */}
      <ScrollReveal className="px-4 pb-16">
        <NeoCard className="p-12 text-center bg-gradient-to-br from-[var(--neo-accent-orange)]/5 via-transparent to-[var(--neo-accent-orange)]/3 max-w-3xl mx-auto">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <BookOpen className="w-16 h-16 text-[var(--neo-accent-orange)] mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--neo-text-primary)] mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-[var(--neo-text-secondary)] mb-8 max-w-md mx-auto leading-relaxed">
            From zero to AI Architecture Specialist in 18 months.
            Every week is designed with surgical precision.
          </p>
          {isAuthenticated ? (
            <NeoButton variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
              Continue Learning
              <ArrowRight className="w-5 h-5" />
            </NeoButton>
          ) : (
            <NeoButton variant="primary" size="lg" onClick={() => navigate('/register')}>
              Start Learning Now
              <ArrowRight className="w-5 h-5" />
            </NeoButton>
          )}
        </NeoCard>
      </ScrollReveal>

      {/* ── FEATURE DETAIL MODAL ──────────────────────────── */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          {selectedFeature && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-[var(--neo-accent-orange)]/10">
                    <selectedFeature.icon className="w-6 h-6 text-[var(--neo-accent-orange)]" />
                  </div>
                  <DialogTitle className="text-xl">{selectedFeature.details.heading}</DialogTitle>
                </div>
                <DialogDescription className="text-sm leading-relaxed">
                  {selectedFeature.details.body}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                {selectedFeature.details.bullets.map((bullet, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[var(--neo-accent-success)] mt-0.5 shrink-0" />
                    <span className="text-sm text-[var(--neo-text-secondary)] leading-relaxed">{bullet}</span>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── PHASE DETAIL MODAL ────────────────────────────── */}
      <Dialog open={!!selectedPhase} onOpenChange={() => setSelectedPhase(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedPhase && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: `${selectedPhase.color}15` }}
                  >
                    <selectedPhase.icon className="w-6 h-6" style={{ color: selectedPhase.color }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: selectedPhase.color }}>
                      Phase {selectedPhase.phase} — {selectedPhase.duration}
                    </div>
                    <DialogTitle className="text-xl">{selectedPhase.title}</DialogTitle>
                  </div>
                </div>
                <DialogDescription className="text-sm leading-relaxed">
                  {selectedPhase.summary}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-[var(--neo-accent-orange)]" />
                  <span className="text-[var(--neo-text-primary)] font-medium">Level Progression:</span>
                  <span className="text-[var(--neo-text-secondary)]">{selectedPhase.level}</span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[var(--neo-text-primary)] uppercase tracking-wider">
                    Curriculum Breakdown
                  </h4>
                  {selectedPhase.subphases.map((sub, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="p-3 rounded-xl border border-[var(--neo-shadow-dark)]/20 bg-background"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[var(--neo-text-primary)]">{sub.name}</span>
                        <span className="text-xs text-[var(--neo-text-secondary)] bg-[var(--neo-shadow-dark)]/10 px-2 py-0.5 rounded-full">
                          {sub.weeks}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--neo-text-secondary)] leading-relaxed">{sub.topics}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border-l-4 bg-[var(--neo-accent-orange)]/5" style={{ borderColor: selectedPhase.color }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Rocket className="w-4 h-4" style={{ color: selectedPhase.color }} />
                    <span className="text-sm font-semibold text-[var(--neo-text-primary)]">Milestone</span>
                  </div>
                  <p className="text-sm text-[var(--neo-text-secondary)] leading-relaxed">
                    {selectedPhase.milestone}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
