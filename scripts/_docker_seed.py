"""Seed script designed to run INSIDE the Docker backend container."""
import asyncio
from app.database import AsyncSessionLocal
from app.modules.auth.models import User
from app.modules.topics.models import Topic, TopicContent, DifficultyLevel, SectionType
from app.modules.quiz.models import Quiz, Question, QuestionType
from app.modules.translations.models import UITranslation
from sqlalchemy import select, delete


DEMO_TOPICS = [
    {
        "title": "Python for AI & Machine Learning",
        "slug": "python-for-ai-ml",
        "module": "Fundamentals",
        "difficulty": DifficultyLevel.beginner,
        "order": 10,
        "contents": [
            (SectionType.concept, {"markdown": "## Why Python for AI?\n\nPython has become the **lingua franca** of AI and ML:\n\n1. **Simplicity** - Focus on algorithms, not boilerplate\n2. **Rich Ecosystem** - NumPy, PyTorch, TensorFlow, Hugging Face\n3. **Community** - Largest AI research community\n4. **Interoperability** - Python binds easily to C/C++ for performance"}),
            (SectionType.code, {"language": "python", "code": "import numpy as np\n\n# Vectorized operations are 100x faster than loops\na = np.random.randn(1000000)\nb = np.random.randn(1000000)\ndot = np.dot(a, b)\nprint(f'Dot product of 1M vectors: {dot:.4f}')\n\n# Matrix operations for ML\nX = np.random.randn(100, 5)  # 100 samples, 5 features\nW = np.random.randn(5, 3)    # Weight matrix\noutput = X @ W  # @ is matrix multiply\nprint(f'Output shape: {output.shape}')  # (100, 3)"}),
            (SectionType.concept, {"markdown": "## Key Patterns in ML Code\n\n- **List comprehensions** for data processing\n- **Generators** for large datasets (memory efficient)\n- **Context managers** for resource management (`with torch.no_grad():`)\n- **Xavier initialization** prevents vanishing/exploding gradients"}),
            (SectionType.reflection, {"markdown": "## Key Takeaways\n\n- Python simplicity + NumPy speed = perfect for AI prototyping\n- Vectorized operations are orders of magnitude faster than loops\n- Understanding Python patterns is essential for clean ML code"}),
        ],
        "quiz_title": "Python for AI Quiz",
        "quiz_difficulty": "beginner",
        "questions": [
            {"type": QuestionType.mcq, "content_json": {"question": "Why is Python the most popular language for AI?", "options": ["It is the fastest language", "Rich ML ecosystem and simple syntax", "Designed specifically for AI", "Compiles to native code"]}, "correct_answer": {"answer": 1}, "difficulty": 1, "explanation": "Python's popularity stems from its clean syntax and rich ecosystem of ML libraries.", "order": 1},
            {"type": QuestionType.mcq, "content_json": {"question": "What does the @ operator do in NumPy?", "options": ["Element-wise multiply", "Matrix multiplication", "Power/exponentiation", "Concatenation"]}, "correct_answer": {"answer": 1}, "difficulty": 1, "explanation": "The @ operator (PEP 465) performs matrix multiplication.", "order": 2},
            {"type": QuestionType.mcq, "content_json": {"question": "What is Xavier initialization used for?", "options": ["Speed up Python", "Prevent vanishing/exploding gradients", "Normalize input data", "Reduce parameters"]}, "correct_answer": {"answer": 1}, "difficulty": 2, "explanation": "Xavier init scales weights by sqrt(2/n) to keep activation variance stable.", "order": 3},
            {"type": QuestionType.short_answer, "content_json": {"question": "Why are vectorized NumPy operations faster than Python for loops?"}, "correct_answer": {"text": "NumPy operations run optimized C/Fortran code on contiguous memory with SIMD parallelism, while Python loops have per-iteration interpreter overhead and type checking."}, "difficulty": 2, "explanation": "NumPy delegates to compiled C routines, eliminating Python's per-iteration overhead.", "order": 4},
            {"type": QuestionType.mcq, "content_json": {"question": "Output shape of np.random.randn(100,5) @ np.random.randn(5,3)?", "options": ["(100, 5)", "(5, 3)", "(100, 3)", "(3, 100)"]}, "correct_answer": {"answer": 2}, "difficulty": 1, "explanation": "(100x5) @ (5x3) = (100x3). Inner dimensions must match.", "order": 5},
        ],
    },
    {
        "title": "The Transformer Architecture",
        "slug": "transformer-architecture",
        "module": "Transformers",
        "difficulty": DifficultyLevel.intermediate,
        "order": 11,
        "contents": [
            (SectionType.concept, {"markdown": "## The Architecture That Changed Everything\n\nThe Transformer (\"Attention Is All You Need\", 2017) revolutionized NLP. Unlike RNNs that process tokens sequentially, Transformers process all tokens **in parallel** using self-attention.\n\n### Key Innovation: Self-Attention\n- **No information bottleneck** - distant words interact directly\n- **Parallelizable** - all positions computed at once (GPU-friendly)\n- **Learnable relationships** - model learns which words to attend to"}),
            (SectionType.math, {"latex": "\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V", "description": "Scaled dot-product attention. Q (Query), K (Key), V (Value) are linear projections. Division by sqrt(d_k) prevents sharp softmax distributions."}),
            (SectionType.concept, {"markdown": "## Encoder-Decoder Structure\n\n### Encoder\n1. **Multi-Head Self-Attention** - each token attends to all tokens\n2. **Feed-Forward Network** - two linear layers with ReLU\n\nBoth use residual connections + layer norm: `output = LayerNorm(x + SubLayer(x))`\n\n### Decoder\n1. **Masked Self-Attention** - prevents looking at future tokens\n2. **Cross-Attention** - attends to encoder output\n3. **Feed-Forward Network**"}),
            (SectionType.code, {"language": "python", "code": "import torch\nimport torch.nn.functional as F\nimport math\n\ndef scaled_dot_product_attention(query, key, value, mask=None):\n    d_k = query.size(-1)\n    scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)\n    if mask is not None:\n        scores = scores.masked_fill(mask == 0, -1e9)\n    weights = F.softmax(scores, dim=-1)\n    return torch.matmul(weights, value)\n\n# Example: batch=2, seq_len=10, d_model=64\nq = k = v = torch.randn(2, 10, 64)\nout = scaled_dot_product_attention(q, k, v)\nprint(f'Output: {out.shape}')  # torch.Size([2, 10, 64])"}),
            (SectionType.visual, {"animation_id": "transformer_attention", "fallback_image": "/assets/attention.png"}),
            (SectionType.reflection, {"markdown": "## Key Takeaways\n\n- Transformers replaced sequential RNNs with parallel self-attention\n- The attention formula `softmax(QK^T/sqrt(d_k))V` is the core building block\n- Multi-head attention lets the model attend to different aspects simultaneously\n- **This architecture powers GPT, BERT, T5, LLaMA, and all modern LLMs**"}),
        ],
        "quiz_title": "Transformer Architecture Quiz",
        "quiz_difficulty": "intermediate",
        "questions": [
            {"type": QuestionType.mcq, "content_json": {"question": "Main advantage of self-attention over RNNs?", "options": ["Uses fewer parameters", "Processes all tokens in parallel", "Doesn't need GPU", "Only works with English"]}, "correct_answer": {"answer": 1}, "difficulty": 1, "explanation": "Self-attention processes all tokens simultaneously, enabling GPU parallelization.", "order": 1},
            {"type": QuestionType.mcq, "content_json": {"question": "Why divide scores by sqrt(d_k)?", "options": ["Faster computation", "Normalize to unit length", "Prevent large dot products causing sharp softmax", "Reduce memory"]}, "correct_answer": {"answer": 2}, "difficulty": 2, "explanation": "Large dot products push softmax into regions with extremely small gradients.", "order": 2},
            {"type": QuestionType.mcq, "content_json": {"question": "Purpose of positional encoding?", "options": ["Reduce model size", "Add token order info since attention is permutation-invariant", "Speed up training", "Handle multiple languages"]}, "correct_answer": {"answer": 1}, "difficulty": 1, "explanation": "Attention treats input as a set; positional encoding adds sequence order.", "order": 3},
            {"type": QuestionType.short_answer, "content_json": {"question": "Explain the difference between encoder self-attention and decoder masked self-attention."}, "correct_answer": {"text": "Encoder: bidirectional, each token sees all tokens. Decoder: masked, each token only sees previous tokens. Masking prevents cheating during autoregressive generation."}, "difficulty": 3, "explanation": "Masking ensures the decoder learns to predict without seeing future tokens.", "order": 4},
            {"type": QuestionType.mcq, "content_json": {"question": "With d_model=512 and 8 heads, what is d_k per head?", "options": ["512", "8", "64", "4096"]}, "correct_answer": {"answer": 2}, "difficulty": 2, "explanation": "d_k = d_model / num_heads = 512 / 8 = 64.", "order": 5},
        ],
    },
    {
        "title": "Loss Functions & Optimization",
        "slug": "loss-functions-optimization",
        "module": "Deep Learning Basics",
        "difficulty": DifficultyLevel.intermediate,
        "order": 12,
        "contents": [
            (SectionType.concept, {"markdown": "## The Training Loop\n\n1. **Forward Pass** - compute predictions\n2. **Loss Computation** - measure how wrong predictions are\n3. **Backward Pass** - compute gradients via backpropagation\n4. **Parameter Update** - adjust weights using optimizer\n\nThe loss function is the compass that tells the model which direction to improve."}),
            (SectionType.math, {"latex": "\\mathcal{L}_{CE} = -\\sum_{i=1}^{C} y_i \\log(\\hat{y}_i)", "description": "Cross-Entropy Loss. y_i is the true label (one-hot), y-hat_i is predicted probability."}),
            (SectionType.concept, {"markdown": "## Optimizers Compared\n\n| Optimizer | Pros | Best For |\n|-----------|------|----------|\n| **SGD + Momentum** | Generalizes well | Computer Vision |\n| **Adam** | Adaptive LR, fast convergence | General purpose |\n| **AdamW** | Better regularization | LLM training |\n\n### Learning Rate Scheduling\n- **Warmup + Cosine Decay** - standard for LLMs\n- **Step Decay** - drop LR every N epochs\n- **ReduceOnPlateau** - drop when validation loss stalls"}),
            (SectionType.reflection, {"markdown": "## Key Takeaways\n\n- Loss functions define WHAT the model learns; optimizers define HOW\n- Cross-Entropy + Softmax is standard for classification\n- AdamW is the go-to for modern LLM training\n- Learning rate is the most important hyperparameter"}),
        ],
        "quiz_title": "Loss & Optimization Quiz",
        "quiz_difficulty": "intermediate",
        "questions": [
            {"type": QuestionType.mcq, "content_json": {"question": "Most common loss for multi-class classification?", "options": ["MSE", "Cross-Entropy Loss", "Hinge Loss", "L1 Loss"]}, "correct_answer": {"answer": 1}, "difficulty": 1, "explanation": "Cross-Entropy measures distance between predicted and true probability distributions.", "order": 1},
            {"type": QuestionType.mcq, "content_json": {"question": "What does optimizer.zero_grad() do?", "options": ["Resets all weights to zero", "Clears accumulated gradients", "Sets learning rate to zero", "Removes optimizer"]}, "correct_answer": {"answer": 1}, "difficulty": 1, "explanation": "PyTorch accumulates gradients by default; zero_grad clears them.", "order": 2},
            {"type": QuestionType.mcq, "content_json": {"question": "Best optimizer for training LLMs?", "options": ["SGD with Momentum", "RMSprop", "AdamW", "Adagrad"]}, "correct_answer": {"answer": 2}, "difficulty": 2, "explanation": "AdamW combines adaptive learning rates with proper weight decay.", "order": 3},
            {"type": QuestionType.short_answer, "content_json": {"question": "Why is learning rate warmup important for training Transformers?"}, "correct_answer": {"text": "At training start, randomly initialized parameters produce large unstable gradients. Warmup uses a small LR initially, gradually increasing it, preventing destructive early updates. This is critical for Transformers whose attention layers can produce very sharp gradients."}, "difficulty": 3, "explanation": "Warmup prevents divergence from large initial gradients in attention layers.", "order": 4},
        ],
    },
    {
        "title": "Tokenization & Embeddings for LLMs",
        "slug": "tokenization-embeddings",
        "module": "Transformers",
        "difficulty": DifficultyLevel.beginner,
        "order": 13,
        "contents": [
            (SectionType.concept, {"markdown": "## From Text to Numbers\n\nNeural networks only understand numbers. The pipeline:\n\n1. **Tokenization** - split text into tokens (subwords via BPE)\n2. **Embedding** - convert token IDs into dense vectors\n\n### Why Subword Tokenization?\n| Approach | Problem |\n|----------|--------|\n| Character-level | Sequences too long |\n| Word-level | Vocab too large, can't handle new words |\n| **Subword (BPE)** | Best of both worlds! |\n\nExample: `unhappiness` -> `[un, happiness]`"}),
            (SectionType.concept, {"markdown": "## Embeddings: Meaning in Vector Space\n\n- **Semantic similarity**: similar words have similar vectors\n  - `king - man + woman ~ queen`\n- **Dense**: 768-dimensional vs 50,000-dimensional one-hot\n- **Learnable**: model learns best representations during training\n\n| Model | d_model | Vocab Size |\n|-------|---------|------------|\n| GPT-2 | 768 | 50,257 |\n| LLaMA 3 8B | 4,096 | 128,256 |"}),
            (SectionType.code, {"language": "python", "code": "import torch\nimport torch.nn as nn\n\n# Embedding layer\nvocab_size = 50257  # GPT-2\nd_model = 768\n\nembedding = nn.Embedding(vocab_size, d_model)\nprint(f'Embedding table: {embedding.weight.shape}')  # [50257, 768]\n\n# Look up embeddings\ntoken_ids = torch.tensor([8291, 1232, 389])  # \"Transformers are\"\nvectors = embedding(token_ids)  # Shape: [3, 768]\n\n# Add positional embedding\npos_emb = nn.Embedding(1024, d_model)\npositions = torch.arange(3)\nfinal_input = embedding(token_ids) + pos_emb(positions)"}),
            (SectionType.reflection, {"markdown": "## Key Takeaways\n\n- BPE tokenization handles unknown words via subword splitting\n- Embedding tables are LARGE (GPT-2: 38.6M parameters)\n- Positional embeddings encode sequence order\n- Final input = token embedding + positional embedding"}),
        ],
        "quiz_title": "Tokenization & Embeddings Quiz",
        "quiz_difficulty": "beginner",
        "questions": [
            {"type": QuestionType.mcq, "content_json": {"question": "Why use subword tokenization (BPE) instead of word-level?", "options": ["Faster to compute", "Handles unknown words and reduces vocab size", "Uses more memory", "Easier to visualize"]}, "correct_answer": {"answer": 1}, "difficulty": 1, "explanation": "BPE splits rare words into known subwords while keeping common words intact.", "order": 1},
            {"type": QuestionType.mcq, "content_json": {"question": "GPT-2 embedding table dimensionality?", "options": ["50,257 x 50,257", "50,257 x 768", "768 x 768", "1024 x 768"]}, "correct_answer": {"answer": 1}, "difficulty": 1, "explanation": "Shape is (vocab_size x d_model) = (50,257 x 768) = ~38.6M parameters.", "order": 2},
            {"type": QuestionType.mcq, "content_json": {"question": "What does 'king - man + woman = queen' demonstrate?", "options": ["Arithmetic operations", "Semantic relationships as vector directions", "Embeddings are always accurate", "Only works for English"]}, "correct_answer": {"answer": 1}, "difficulty": 2, "explanation": "Embedding vectors encode semantic relationships as directions in vector space.", "order": 3},
            {"type": QuestionType.mcq, "content_json": {"question": "Final input to a Transformer model?", "options": ["Just token embeddings", "Token + positional embeddings", "Raw text strings", "One-hot vectors"]}, "correct_answer": {"answer": 1}, "difficulty": 1, "explanation": "The sum of token embeddings (meaning) and positional embeddings (position).", "order": 4},
        ],
    },
]

HINDI_TRANSLATIONS = {
    "nav.profile": "प्रोफ़ाइल", "nav.logout": "लॉग आउट",
    "auth.welcomeBack": "वापस स्वागत है", "auth.continueJourney": "अपनी AI सीखने की यात्रा जारी रखें",
    "auth.email": "ईमेल", "auth.password": "पासवर्ड", "auth.signIn": "साइन इन करें",
    "auth.noAccount": "खाता नहीं है?", "auth.createOne": "एक बनाएं",
    "auth.createAccount": "अपना खाता बनाएं", "auth.joinNeuroStack": "NeuroStack से जुड़ें और AI सिस्टम में महारत हासिल करें",
    "auth.fullName": "पूरा नाम", "auth.confirmPassword": "पासवर्ड की पुष्टि करें",
    "auth.createAccountBtn": "खाता बनाएं", "auth.haveAccount": "पहले से खाता है?",
    "auth.signInLink": "साइन इन करें",
    "dashboard.welcomeBack": "वापस स्वागत है, {{name}}!",
    "dashboard.readyContinue": "AI सिस्टम की महारत यात्रा जारी रखने के लिए तैयार हैं?",
    "dashboard.topics": "विषय", "dashboard.quizzes": "क्विज़", "dashboard.badges": "बैज",
    "dashboard.streak": "स्ट्रीक", "dashboard.learningPath": "आपका सीखने का मार्ग",
    "dashboard.startLearning": "सीखना शुरू करें",
    "dashboard.exploreTopics": "विषय पुस्तकालय देखें और अपनी यात्रा शुरू करें",
    "dashboard.recentActivity": "हाल की गतिविधि", "dashboard.weeklyGoal": "साप्ताहिक लक्ष्य",
    "dashboard.topicsThisWeek": "इस सप्ताह के विषय",
    "topics.library": "विषय पुस्तकालय",
    "topics.exploreCollection": "AI और ML विषयों का हमारा व्यापक संग्रह देखें",
    "topics.searchPlaceholder": "विषय खोजें...", "topics.allDifficulties": "सभी स्तर",
    "topics.beginner": "शुरुआती", "topics.intermediate": "मध्यम", "topics.advanced": "उन्नत",
    "topics.noTopicsFound": "कोई विषय नहीं मिला", "topics.adjustFilters": "अपनी खोज या फ़िल्टर समायोजित करें",
    "common.loading": "लोड हो रहा है...", "common.error": "त्रुटि", "common.back": "वापस",
    "common.next": "अगला", "common.submit": "जमा करें", "common.cancel": "रद्द करें",
    "common.save": "सहेजें", "common.delete": "हटाएं", "common.edit": "संपादित करें",
    "quiz.testKnowledge": "अपना ज्ञान परखें", "quiz.startQuiz": "क्विज़ शुरू करें",
    "quiz.question": "प्रश्न", "quiz.of": "का", "quiz.submitQuiz": "क्विज़ जमा करें",
    "quiz.yourScore": "आपका स्कोर", "quiz.retake": "फिर से लें", "quiz.backToTopic": "विषय पर वापस जाएं",
}


async def seed_all():
    print("=" * 60)
    print("  NeuroStack — Docker DB Seed (Topics + Quizzes + Hindi)")
    print("=" * 60)

    async with AsyncSessionLocal() as session:
        # Seed demo topics + quizzes
        for td in DEMO_TOPICS:
            r = await session.execute(select(Topic).where(Topic.slug == td["slug"]))
            if r.scalar_one_or_none():
                print(f"  [SKIP] {td['title']}")
                continue

            t = Topic(title=td["title"], slug=td["slug"], module=td["module"],
                      difficulty=td["difficulty"], order=td["order"], is_published=True)
            session.add(t)
            await session.flush()

            for idx, (stype, cjson) in enumerate(td["contents"]):
                session.add(TopicContent(topic_id=t.id, section_type=stype,
                                         content_json=cjson, order=idx + 1))

            q = Quiz(topic_id=t.id, title=td["quiz_title"],
                     difficulty=td["quiz_difficulty"], is_published=True)
            session.add(q)
            await session.flush()

            for qd in td["questions"]:
                session.add(Question(quiz_id=q.id, type=qd["type"],
                                     content_json=qd["content_json"],
                                     correct_answer=qd["correct_answer"],
                                     difficulty=qd["difficulty"],
                                     explanation=qd["explanation"], order=qd["order"]))

            print(f"  [+] {td['title']} ({len(td['contents'])} sections, {len(td['questions'])} questions)")

        # Seed Hindi UI translations (replace existing)
        await session.execute(delete(UITranslation).where(UITranslation.language_code == "hi"))
        for key, value in HINDI_TRANSLATIONS.items():
            session.add(UITranslation(key=key, language_code=lang, value=value))
        print(f"  [+] Hindi UI translations: {len(HINDI_TRANSLATIONS)} keys")

        await session.commit()

    print("=" * 60)
    print("  Done!")
    print("=" * 60)


if __name__ == "__main__":
    lang = "hi"
    asyncio.run(seed_all())
