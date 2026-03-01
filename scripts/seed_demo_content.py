"""
Seed script to populate the database with 4 complete demo topics
(with rich content sections) and corresponding quizzes with questions.

Usage (from project root):
    python scripts/seed_demo_content.py

If your DB is in Docker but you're running this locally, the script
automatically overrides POSTGRES_SERVER to localhost.
"""
import asyncio
import os
import sys

# Add the backend folder to the python path and chdir so .env is found
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(project_root, "backend")
sys.path.append(backend_dir)
os.chdir(backend_dir)

# When running outside Docker, override postgres host to localhost
if os.environ.get("POSTGRES_SERVER") is None:
    os.environ.setdefault("POSTGRES_SERVER", "localhost")

from app.database import AsyncSessionLocal
from app.modules.auth.models import User  # needed for SQLAlchemy relationship resolution
from app.modules.topics.models import Topic, TopicContent, DifficultyLevel, SectionType
from app.modules.quiz.models import Quiz, Question, QuestionType
from sqlalchemy import select


# ──────────────────────────────────────────────
# TOPIC 1: Python for AI
# ──────────────────────────────────────────────
TOPIC_1 = {
    "title": "Python for AI & Machine Learning",
    "slug": "python-for-ai-ml",
    "module": "Fundamentals",
    "difficulty": DifficultyLevel.beginner,
    "order": 10,
    "is_published": True,
    "contents": [
        {
            "type": SectionType.concept,
            "json": {
                "markdown": """## Why Python for AI?

Python has become the **lingua franca** of artificial intelligence and machine learning. Here's why:

1. **Simplicity** — Python's clean syntax lets you focus on algorithms, not boilerplate.
2. **Rich Ecosystem** — NumPy, Pandas, Scikit-learn, PyTorch, TensorFlow, Hugging Face — all Python-first.
3. **Community** — The largest AI research community publishes code in Python.
4. **Interoperability** — Python binds easily to C/C++ for performance-critical code (e.g., PyTorch's C++ backend).

> "Python is the second-best language for everything — and that's exactly what makes it the best for AI." — A wise ML engineer"""
            }
        },
        {
            "type": SectionType.code,
            "json": {
                "language": "python",
                "code": """import numpy as np

# Vectorized operations are 100x faster than Python loops
a = np.random.randn(1000000)
b = np.random.randn(1000000)

# This runs in C under the hood
dot_product = np.dot(a, b)
print(f"Dot product of 1M vectors: {dot_product:.4f}")

# Matrix operations for ML
X = np.random.randn(100, 5)   # 100 samples, 5 features
W = np.random.randn(5, 3)     # Weight matrix (5 inputs -> 3 outputs)
b = np.zeros(3)                # Bias vector

# Forward pass of a linear layer
output = X @ W + b  # @ is matrix multiply
print(f"Output shape: {output.shape}")  # (100, 3)"""
            }
        },
        {
            "type": SectionType.concept,
            "json": {
                "markdown": """## Key Python Patterns in ML Code

### List Comprehensions for Data Processing
```python
# Clean and tokenize text data
texts = ["Hello World!", "ML is Great!", "Python Rocks!"]
tokens = [text.lower().split() for text in texts]
# [['hello', 'world!'], ['ml', 'is', 'great!'], ['python', 'rocks!']]
```

### Generator Functions for Large Datasets
```python
def data_loader(file_path, batch_size=32):
    \"\"\"Yields batches without loading entire dataset into memory.\"\"\"
    batch = []
    for line in open(file_path):
        batch.append(process(line))
        if len(batch) == batch_size:
            yield np.array(batch)
            batch = []
```

### Context Managers for Resource Management
```python
import torch

# Disable gradient computation during inference
with torch.no_grad():
    predictions = model(input_tensor)
```"""
            }
        },
        {
            "type": SectionType.code,
            "json": {
                "language": "python",
                "code": """# Building a simple neural network from scratch
import numpy as np

class SimpleNeuralNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        # Xavier initialization
        self.W1 = np.random.randn(input_size, hidden_size) * np.sqrt(2.0 / input_size)
        self.b1 = np.zeros(hidden_size)
        self.W2 = np.random.randn(hidden_size, output_size) * np.sqrt(2.0 / hidden_size)
        self.b2 = np.zeros(output_size)

    def relu(self, x):
        return np.maximum(0, x)

    def softmax(self, x):
        exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=-1, keepdims=True)

    def forward(self, X):
        self.z1 = X @ self.W1 + self.b1
        self.a1 = self.relu(self.z1)
        self.z2 = self.a1 @ self.W2 + self.b2
        return self.softmax(self.z2)

# Create network: 4 inputs -> 8 hidden -> 3 outputs
nn = SimpleNeuralNetwork(4, 8, 3)
X = np.random.randn(5, 4)  # 5 samples
probs = nn.forward(X)
print(f"Predictions shape: {probs.shape}")
print(f"Sum of probabilities: {probs[0].sum():.4f}")  # Should be ~1.0"""
            }
        },
        {
            "type": SectionType.reflection,
            "json": {
                "markdown": """## Key Takeaways

- Python's simplicity + NumPy's speed = perfect for AI prototyping
- Vectorized operations (NumPy/PyTorch) are **orders of magnitude** faster than Python loops
- Understanding Python patterns (generators, context managers, comprehensions) is essential for writing clean ML code
- Xavier/He initialization prevents vanishing/exploding gradients in neural networks

**Next Steps**: Try implementing the backpropagation algorithm for the SimpleNeuralNetwork class above!"""
            }
        }
    ]
}

QUIZ_1 = {
    "title": "Python for AI Quiz",
    "difficulty": "beginner",
    "is_published": True,
    "questions": [
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "Why is Python the most popular language for AI and Machine Learning?",
                "options": [
                    "It is the fastest programming language",
                    "It has a rich ecosystem of ML libraries and simple syntax",
                    "It was specifically designed for AI",
                    "It compiles to native machine code"
                ]
            },
            "correct_answer": {"answer": 1, "text": "It has a rich ecosystem of ML libraries and simple syntax"},
            "difficulty": 1,
            "explanation": "Python's popularity in AI stems from its clean syntax (focus on algorithms, not boilerplate) and its unmatched ecosystem: NumPy, PyTorch, TensorFlow, Scikit-learn, and Hugging Face are all Python-first libraries.",
            "order": 1
        },
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "What does the `@` operator do in NumPy?",
                "options": [
                    "Element-wise multiplication",
                    "Matrix multiplication",
                    "Power/exponentiation",
                    "Array concatenation"
                ]
            },
            "correct_answer": {"answer": 1, "text": "Matrix multiplication"},
            "difficulty": 1,
            "explanation": "The `@` operator in Python (PEP 465) performs matrix multiplication. `X @ W` is equivalent to `np.matmul(X, W)` or `np.dot(X, W)` for 2D arrays. Element-wise multiplication uses `*`.",
            "order": 2
        },
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "What is Xavier initialization used for in neural networks?",
                "options": [
                    "To speed up Python execution",
                    "To prevent vanishing/exploding gradients by properly scaling initial weights",
                    "To normalize input data",
                    "To reduce the number of parameters"
                ]
            },
            "correct_answer": {"answer": 1, "text": "To prevent vanishing/exploding gradients by properly scaling initial weights"},
            "difficulty": 2,
            "explanation": "Xavier initialization scales weights by sqrt(2/n) where n is the number of input neurons. This keeps the variance of activations roughly constant across layers, preventing gradients from vanishing or exploding during backpropagation.",
            "order": 3
        },
        {
            "type": QuestionType.short_answer,
            "content_json": {
                "question": "Explain why vectorized NumPy operations are faster than Python for loops when processing large arrays. What happens under the hood?",
                "hint": "Think about how Python and NumPy execute computations at a lower level."
            },
            "correct_answer": {"text": "NumPy operations are implemented in optimized C/Fortran code and operate on contiguous memory blocks, while Python loops have per-iteration interpreter overhead, dynamic type checking, and poor memory locality. NumPy also uses SIMD instructions for parallel computation on CPU."},
            "difficulty": 2,
            "explanation": "NumPy delegates computation to compiled C/Fortran routines that operate on contiguous memory arrays. This eliminates Python's per-iteration overhead (type checking, reference counting, bytecode interpretation) and enables SIMD (Single Instruction, Multiple Data) parallelism at the CPU level.",
            "order": 4
        },
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "What is the output shape of `np.random.randn(100, 5) @ np.random.randn(5, 3)`?",
                "options": [
                    "(100, 5)",
                    "(5, 3)",
                    "(100, 3)",
                    "(3, 100)"
                ]
            },
            "correct_answer": {"answer": 2, "text": "(100, 3)"},
            "difficulty": 1,
            "explanation": "Matrix multiplication of (100×5) @ (5×3) results in (100×3). The inner dimensions must match (5=5), and the result has the outer dimensions of each matrix.",
            "order": 5
        }
    ]
}


# ──────────────────────────────────────────────
# TOPIC 2: Transformer Architecture
# ──────────────────────────────────────────────
TOPIC_2 = {
    "title": "The Transformer Architecture",
    "slug": "transformer-architecture",
    "module": "Transformers",
    "difficulty": DifficultyLevel.intermediate,
    "order": 11,
    "is_published": True,
    "contents": [
        {
            "type": SectionType.concept,
            "json": {
                "markdown": """## The Architecture That Changed Everything

The Transformer, introduced in the 2017 paper **"Attention Is All You Need"** by Vaswani et al., revolutionized NLP and eventually all of deep learning. Unlike RNNs that process tokens sequentially, Transformers process all tokens **in parallel** using self-attention.

### Key Innovation: Self-Attention
Instead of processing words one by one (like RNNs), self-attention lets every word "look at" every other word in the sequence simultaneously. This means:
- **No information bottleneck** — distant words can interact directly
- **Parallelizable** — all positions computed at once (GPU-friendly)
- **Learnable relationships** — the model learns which words to attend to"""
            }
        },
        {
            "type": SectionType.architecture,
            "json": {
                "diagram": "transformer_full",
                "description": "Full Transformer architecture with encoder and decoder stacks"
            }
        },
        {
            "type": SectionType.math,
            "json": {
                "latex": "\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V",
                "description": "The scaled dot-product attention formula. Q (Query), K (Key), V (Value) are linear projections of the input. Division by sqrt(d_k) prevents the dot products from growing too large."
            }
        },
        {
            "type": SectionType.concept,
            "json": {
                "markdown": """## The Encoder-Decoder Structure

### Encoder (left side)
Each encoder layer has two sub-layers:
1. **Multi-Head Self-Attention** — Each token attends to all tokens in the input
2. **Feed-Forward Network** — Two linear layers with ReLU activation

Both sub-layers use **residual connections** and **layer normalization**:
```
output = LayerNorm(x + SubLayer(x))
```

### Decoder (right side)
Each decoder layer has three sub-layers:
1. **Masked Multi-Head Self-Attention** — Prevents looking at future tokens
2. **Cross-Attention** — Attends to encoder output (connects encoder and decoder)
3. **Feed-Forward Network** — Same as encoder

### Positional Encoding
Since attention is permutation-invariant, we add positional information:
```
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```
This lets the model know the ORDER of tokens."""
            }
        },
        {
            "type": SectionType.code,
            "json": {
                "language": "python",
                "code": """import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class ScaledDotProductAttention(nn.Module):
    def forward(self, query, key, value, mask=None):
        d_k = query.size(-1)

        # Step 1: Compute attention scores
        scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)

        # Step 2: Apply mask (for decoder / padding)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)

        # Step 3: Softmax to get attention weights
        attention_weights = F.softmax(scores, dim=-1)

        # Step 4: Weighted sum of values
        output = torch.matmul(attention_weights, value)
        return output, attention_weights

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model=512, num_heads=8):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

        self.attention = ScaledDotProductAttention()

    def forward(self, query, key, value, mask=None):
        batch_size = query.size(0)

        # Linear projections and reshape for multi-head
        Q = self.W_q(query).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(key).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(value).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)

        # Apply attention
        attn_output, weights = self.attention(Q, K, V, mask)

        # Concatenate heads and apply final linear
        attn_output = attn_output.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        return self.W_o(attn_output)

# Example usage
mha = MultiHeadAttention(d_model=512, num_heads=8)
x = torch.randn(2, 10, 512)  # batch=2, seq_len=10, d_model=512
output = mha(x, x, x)  # Self-attention: Q=K=V=x
print(f"Output shape: {output.shape}")  # torch.Size([2, 10, 512])"""
            }
        },
        {
            "type": SectionType.visual,
            "json": {
                "animation_id": "transformer_attention",
                "fallback_image": "/assets/attention.png",
                "fallback_description": "Self-attention mechanism showing Query, Key, Value computations"
            }
        },
        {
            "type": SectionType.reflection,
            "json": {
                "markdown": """## Key Takeaways

- Transformers replaced sequential RNNs with **parallel self-attention**
- The attention formula `softmax(QK^T/sqrt(d_k))V` is the core building block
- Multi-head attention lets the model attend to different aspects simultaneously
- Residual connections + layer norm enable training very deep networks
- Positional encoding injects sequence order information

**This architecture is the foundation of GPT, BERT, T5, LLaMA, and virtually all modern LLMs.**"""
            }
        }
    ]
}

QUIZ_2 = {
    "title": "Transformer Architecture Quiz",
    "difficulty": "intermediate",
    "is_published": True,
    "questions": [
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "What is the main advantage of self-attention over recurrent neural networks (RNNs)?",
                "options": [
                    "Self-attention uses fewer parameters",
                    "Self-attention processes all tokens in parallel, avoiding sequential bottlenecks",
                    "Self-attention doesn't require GPU computation",
                    "Self-attention only works with English text"
                ]
            },
            "correct_answer": {"answer": 1, "text": "Self-attention processes all tokens in parallel, avoiding sequential bottlenecks"},
            "difficulty": 1,
            "explanation": "RNNs process tokens one at a time, creating a sequential bottleneck where distant tokens struggle to communicate. Self-attention lets every token attend to every other token simultaneously, enabling full parallelization on GPUs and direct long-range dependencies.",
            "order": 1
        },
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "Why do we divide the attention scores by sqrt(d_k) in scaled dot-product attention?",
                "options": [
                    "To make the computation faster",
                    "To normalize the output to unit length",
                    "To prevent dot products from growing too large, which would cause softmax to produce very sharp distributions",
                    "To reduce memory usage"
                ]
            },
            "correct_answer": {"answer": 2, "text": "To prevent dot products from growing too large, which would cause softmax to produce very sharp distributions"},
            "difficulty": 2,
            "explanation": "When d_k is large, dot products can have large magnitude, pushing softmax into regions with extremely small gradients (near 0 or 1). Dividing by sqrt(d_k) keeps the variance of the scores at ~1, ensuring softmax produces useful (non-saturated) gradients.",
            "order": 2
        },
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "What is the purpose of positional encoding in Transformers?",
                "options": [
                    "To reduce the model size",
                    "To add information about token order since attention is permutation-invariant",
                    "To speed up training",
                    "To handle multiple languages"
                ]
            },
            "correct_answer": {"answer": 1, "text": "To add information about token order since attention is permutation-invariant"},
            "difficulty": 1,
            "explanation": "Self-attention treats its input as a SET — it has no built-in sense of order. Without positional encoding, 'The cat sat on the mat' and 'mat the on sat cat The' would produce identical attention patterns. Positional encoding adds unique position information to each token embedding.",
            "order": 3
        },
        {
            "type": QuestionType.short_answer,
            "content_json": {
                "question": "Explain the difference between self-attention in the encoder and masked self-attention in the decoder. Why is masking necessary?",
                "hint": "Think about what information is available during training vs. inference in a sequence-to-sequence task."
            },
            "correct_answer": {"text": "In the encoder, each token can attend to all tokens in the input sequence (bidirectional). In the decoder, masked self-attention prevents tokens from attending to future positions — each token can only see itself and previous tokens. This is necessary because during inference (autoregressive generation), future tokens haven't been generated yet, so the model must learn to predict without seeing them."},
            "difficulty": 3,
            "explanation": "Masking ensures the decoder is autoregressive: when generating token at position t, it can only use tokens 1 to t-1. Without masking, the decoder could 'cheat' during training by looking at the answer. The mask sets future positions to -infinity before softmax, making their attention weights effectively zero.",
            "order": 4
        },
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "In multi-head attention with d_model=512 and 8 heads, what is the dimensionality of each head (d_k)?",
                "options": [
                    "512",
                    "8",
                    "64",
                    "4096"
                ]
            },
            "correct_answer": {"answer": 2, "text": "64"},
            "difficulty": 2,
            "explanation": "d_k = d_model / num_heads = 512 / 8 = 64. Each head independently computes attention in a 64-dimensional subspace. This is more efficient than a single 512-dimensional attention and lets different heads learn different attention patterns.",
            "order": 5
        }
    ]
}


# ──────────────────────────────────────────────
# TOPIC 3: Loss Functions & Optimization
# ──────────────────────────────────────────────
TOPIC_3 = {
    "title": "Loss Functions & Optimization in Deep Learning",
    "slug": "loss-functions-optimization",
    "module": "Deep Learning Basics",
    "difficulty": DifficultyLevel.intermediate,
    "order": 12,
    "is_published": True,
    "contents": [
        {
            "type": SectionType.concept,
            "json": {
                "markdown": """## The Training Loop: How Neural Networks Learn

Training a neural network follows this loop:
1. **Forward Pass** — Compute predictions from input
2. **Loss Computation** — Measure how wrong the predictions are
3. **Backward Pass** — Compute gradients via backpropagation
4. **Parameter Update** — Adjust weights using an optimizer

The **loss function** is the compass that tells the model which direction to improve. Choosing the right loss function is critical."""
            }
        },
        {
            "type": SectionType.math,
            "json": {
                "latex": "\\mathcal{L}_{CE} = -\\sum_{i=1}^{C} y_i \\log(\\hat{y}_i)",
                "description": "Cross-Entropy Loss — the most common loss for classification tasks. y_i is the true label (one-hot), ŷ_i is the predicted probability for class i."
            }
        },
        {
            "type": SectionType.concept,
            "json": {
                "markdown": """## Common Loss Functions

### 1. Mean Squared Error (MSE) — Regression
```
L = (1/n) * Σ(y_true - y_pred)²
```
- Heavily penalizes large errors (quadratic)
- Used for regression tasks (predicting continuous values)

### 2. Cross-Entropy Loss — Classification
```
L = -Σ y_true * log(y_pred)
```
- Standard for multi-class classification
- Used with softmax output layer
- Measures the "distance" between predicted probability distribution and true distribution

### 3. Binary Cross-Entropy — Binary Classification
```
L = -[y*log(p) + (1-y)*log(1-p)]
```
- For two-class problems (spam/not-spam, positive/negative)
- Used with sigmoid output

### 4. Contrastive Loss — Representation Learning
- Used in models like CLIP, SimCLR
- Pulls similar examples together, pushes dissimilar examples apart in embedding space"""
            }
        },
        {
            "type": SectionType.code,
            "json": {
                "language": "python",
                "code": """import torch
import torch.nn as nn

# ── Cross-Entropy Loss ──
criterion = nn.CrossEntropyLoss()

# Logits (raw model output, before softmax)
logits = torch.tensor([[2.0, 1.0, 0.1],    # Sample 1: predicts class 0
                        [0.1, 2.5, 0.3]])   # Sample 2: predicts class 1
labels = torch.tensor([0, 1])  # True classes

loss = criterion(logits, labels)
print(f"Cross-Entropy Loss: {loss.item():.4f}")

# ── Optimizers Compared ──
model = nn.Linear(10, 3)

# SGD with Momentum
sgd = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)

# Adam (most popular) - combines momentum + adaptive learning rates
adam = torch.optim.Adam(model.parameters(), lr=0.001, betas=(0.9, 0.999))

# AdamW (Adam with decoupled weight decay) - used for training LLMs
adamw = torch.optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)

# Training step example
optimizer = adamw
optimizer.zero_grad()       # Clear old gradients
output = model(torch.randn(5, 10))
loss = criterion(output, torch.tensor([0, 1, 2, 0, 1]))
loss.backward()             # Compute gradients
optimizer.step()            # Update parameters
print(f"Training loss: {loss.item():.4f}")"""
            }
        },
        {
            "type": SectionType.concept,
            "json": {
                "markdown": """## Optimizers: SGD vs Adam vs AdamW

| Optimizer | Pros | Cons | Best For |
|-----------|------|------|----------|
| **SGD + Momentum** | Simple, generalizes well | Sensitive to learning rate | Computer Vision (ResNet, etc.) |
| **Adam** | Adaptive LR, fast convergence | Can overfit, higher memory | General purpose, prototyping |
| **AdamW** | Better regularization than Adam | Slightly more compute | LLM training (GPT, LLaMA) |

### Learning Rate Scheduling
A fixed learning rate is rarely optimal. Common schedules:
- **Warmup + Cosine Decay** — Start low, ramp up, then gradually decrease (used in LLMs)
- **Step Decay** — Drop LR by factor every N epochs
- **ReduceOnPlateau** — Drop LR when validation loss plateaus"""
            }
        },
        {
            "type": SectionType.reflection,
            "json": {
                "markdown": """## Key Takeaways

- Loss functions define WHAT the model learns; optimizers define HOW it learns
- Cross-Entropy + Softmax is the standard for classification
- AdamW is the go-to optimizer for modern LLM training
- Learning rate is the most important hyperparameter — use scheduling!
- The training loop (forward → loss → backward → step) is the heartbeat of deep learning"""
            }
        }
    ]
}

QUIZ_3 = {
    "title": "Loss Functions & Optimization Quiz",
    "difficulty": "intermediate",
    "is_published": True,
    "questions": [
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "Which loss function is most commonly used for multi-class classification?",
                "options": [
                    "Mean Squared Error (MSE)",
                    "Cross-Entropy Loss",
                    "Hinge Loss",
                    "L1 Loss"
                ]
            },
            "correct_answer": {"answer": 1, "text": "Cross-Entropy Loss"},
            "difficulty": 1,
            "explanation": "Cross-Entropy Loss measures the distance between the predicted probability distribution (from softmax) and the true distribution (one-hot label). MSE is for regression, Hinge Loss is for SVMs.",
            "order": 1
        },
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "What does `optimizer.zero_grad()` do in PyTorch?",
                "options": [
                    "Resets all model weights to zero",
                    "Clears accumulated gradients from the previous backward pass",
                    "Sets the learning rate to zero",
                    "Removes the optimizer from memory"
                ]
            },
            "correct_answer": {"answer": 1, "text": "Clears accumulated gradients from the previous backward pass"},
            "difficulty": 1,
            "explanation": "PyTorch accumulates gradients by default. If you don't call zero_grad(), gradients from multiple backward passes will add up, leading to incorrect parameter updates. This accumulation feature is useful for simulating larger batch sizes.",
            "order": 2
        },
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "Which optimizer is most commonly used for training large language models (LLMs)?",
                "options": [
                    "SGD with Momentum",
                    "RMSprop",
                    "AdamW",
                    "Adagrad"
                ]
            },
            "correct_answer": {"answer": 2, "text": "AdamW"},
            "difficulty": 2,
            "explanation": "AdamW (Adam with decoupled weight decay) is the standard optimizer for LLM training (GPT, LLaMA, etc.). It combines adaptive learning rates with proper L2 regularization, which Adam handles incorrectly.",
            "order": 3
        },
        {
            "type": QuestionType.short_answer,
            "content_json": {
                "question": "Why is 'warmup + cosine decay' a popular learning rate schedule for training Transformers? What problem does the warmup phase solve?",
                "hint": "Think about what happens at the very beginning of training when parameters are randomly initialized."
            },
            "correct_answer": {"text": "At the start of training, the model parameters are randomly initialized, so gradients can be very large and unstable. The warmup phase uses a small learning rate initially, gradually increasing it, which prevents the optimizer from making large, destructive updates early on. After warmup, cosine decay smoothly reduces the learning rate, allowing fine-grained convergence. This schedule is especially important for Transformers because their attention mechanism can produce very sharp (large magnitude) gradients early in training."},
            "difficulty": 3,
            "explanation": "Without warmup, large initial gradients (especially from attention layers) can cause the model to diverge. Warmup stabilizes early training, while cosine decay ensures the model doesn't overshoot the minimum in later stages.",
            "order": 4
        }
    ]
}


# ──────────────────────────────────────────────
# TOPIC 4: Tokenization & Embeddings
# ──────────────────────────────────────────────
TOPIC_4 = {
    "title": "Tokenization & Embeddings for LLMs",
    "slug": "tokenization-embeddings",
    "module": "Transformers",
    "difficulty": DifficultyLevel.beginner,
    "order": 13,
    "is_published": True,
    "contents": [
        {
            "type": SectionType.concept,
            "json": {
                "markdown": """## From Text to Numbers

Neural networks don't understand text — they only understand **numbers**. The pipeline from raw text to model-ready input has two critical steps:

1. **Tokenization** — Split text into tokens (subwords, not just whole words)
2. **Embedding** — Convert each token ID into a dense vector

### Why Not Just Use Characters or Words?

| Approach | Problem |
|----------|---------|
| **Character-level** | Sequences are too long (e.g., "transformer" = 11 tokens). Model needs huge context windows. |
| **Word-level** | Vocabulary too large (100K+ words). Can't handle typos, new words, or other languages. |
| **Subword (BPE)** | Best of both worlds! Common words stay whole, rare words split into pieces. |

Example of BPE tokenization:
```
"unhappiness"  →  ["un", "happiness"]
"transformers" →  ["transform", "ers"]
"ChatGPT"      →  ["Chat", "G", "PT"]
```"""
            }
        },
        {
            "type": SectionType.code,
            "json": {
                "language": "python",
                "code": """# Using the Hugging Face tokenizer (GPT-2's BPE tokenizer)
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("gpt2")

text = "Transformers are amazing for NLP!"
tokens = tokenizer.tokenize(text)
print(f"Tokens: {tokens}")
# ['Trans', 'formers', ' are', ' amazing', ' for', ' NLP', '!']

token_ids = tokenizer.encode(text)
print(f"Token IDs: {token_ids}")
# [8291, 1232, 389, 4998, 329, 399, 19930, 0]

# Decode back to text
decoded = tokenizer.decode(token_ids)
print(f"Decoded: {decoded}")
# 'Transformers are amazing for NLP!'

# Vocabulary size
print(f"Vocab size: {tokenizer.vocab_size}")  # 50257 for GPT-2"""
            }
        },
        {
            "type": SectionType.concept,
            "json": {
                "markdown": """## Embeddings: Meaning in Vector Space

Once we have token IDs, we look up their **embedding vectors** from a learned embedding table.

### What Makes Embeddings Powerful?
- **Semantic similarity** → Similar words have similar vectors
  - `king - man + woman ≈ queen`
  - `Paris - France + Italy ≈ Rome`
- **Learnable** → The model learns the best representations during training
- **Dense** → Unlike one-hot encoding (50,000-dimensional sparse vector), embeddings are dense (e.g., 768-dimensional)

### Embedding Dimensions in Popular Models
| Model | d_model (embedding dim) | Vocab Size |
|-------|------------------------|------------|
| GPT-2 Small | 768 | 50,257 |
| GPT-3 | 12,288 | 50,257 |
| LLaMA 2 7B | 4,096 | 32,000 |
| LLaMA 3 8B | 4,096 | 128,256 |"""
            }
        },
        {
            "type": SectionType.code,
            "json": {
                "language": "python",
                "code": """import torch
import torch.nn as nn

# Create an embedding layer
vocab_size = 50257   # GPT-2 vocabulary
d_model = 768        # Embedding dimension

embedding = nn.Embedding(vocab_size, d_model)
print(f"Embedding table shape: {embedding.weight.shape}")
# torch.Size([50257, 768]) — 38.6M parameters just for embeddings!

# Look up embeddings for token IDs
token_ids = torch.tensor([8291, 1232, 389, 4998])  # "Transformers are amazing"
vectors = embedding(token_ids)
print(f"Output shape: {vectors.shape}")  # torch.Size([4, 768])

# Cosine similarity between embeddings
from torch.nn.functional import cosine_similarity

# After training, similar words will have high cosine similarity
sim = cosine_similarity(vectors[0].unsqueeze(0), vectors[2].unsqueeze(0))
print(f"Similarity between tokens: {sim.item():.4f}")

# Positional embedding
max_seq_len = 1024
pos_embedding = nn.Embedding(max_seq_len, d_model)
positions = torch.arange(4)  # [0, 1, 2, 3]

# Final input = token embedding + positional embedding
final_input = embedding(token_ids) + pos_embedding(positions)
print(f"Final input shape: {final_input.shape}")  # torch.Size([4, 768])"""
            }
        },
        {
            "type": SectionType.reflection,
            "json": {
                "markdown": """## Key Takeaways

- **Tokenization** converts text to token IDs using subword algorithms (BPE, SentencePiece)
- **Embeddings** convert token IDs to dense vectors that capture semantic meaning
- BPE is the sweet spot: handles unknown words by splitting into known subwords
- Embedding tables are LARGE — GPT-2's is 38.6M parameters (768 × 50,257)
- Positional embeddings are added to token embeddings to encode sequence order
- The quality of embeddings determines how well the model understands language"""
            }
        }
    ]
}

QUIZ_4 = {
    "title": "Tokenization & Embeddings Quiz",
    "difficulty": "beginner",
    "is_published": True,
    "questions": [
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "Why do modern LLMs use subword tokenization (like BPE) instead of word-level tokenization?",
                "options": [
                    "Subword tokenization is faster to compute",
                    "It handles unknown words, reduces vocabulary size, and works across languages",
                    "Word-level tokenization uses more memory",
                    "Subword tokens are easier to visualize"
                ]
            },
            "correct_answer": {"answer": 1, "text": "It handles unknown words, reduces vocabulary size, and works across languages"},
            "difficulty": 1,
            "explanation": "Word-level tokenization requires an enormous vocabulary and can't handle typos, new words, or code. BPE splits rare words into known subwords (e.g., 'unhappiness' → 'un' + 'happiness') while keeping common words intact, resulting in a manageable vocabulary that generalizes well.",
            "order": 1
        },
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "What is the dimensionality of GPT-2's embedding table?",
                "options": [
                    "50,257 × 50,257",
                    "50,257 × 768",
                    "768 × 768",
                    "1024 × 768"
                ]
            },
            "correct_answer": {"answer": 1, "text": "50,257 × 768"},
            "difficulty": 1,
            "explanation": "GPT-2's embedding table has shape (vocab_size × d_model) = (50,257 × 768). Each of the 50,257 tokens in the vocabulary is represented by a 768-dimensional vector, totaling ~38.6 million parameters.",
            "order": 2
        },
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "What does the famous equation 'king - man + woman ≈ queen' demonstrate about word embeddings?",
                "options": [
                    "Embeddings can perform arithmetic operations",
                    "Embeddings capture semantic relationships as vector directions",
                    "Embeddings are always accurate",
                    "Embeddings work only for English words"
                ]
            },
            "correct_answer": {"answer": 1, "text": "Embeddings capture semantic relationships as vector directions"},
            "difficulty": 2,
            "explanation": "This analogy shows that embedding vectors encode semantic relationships as directions in vector space. The 'gender direction' (man→woman) can be applied to 'king' to get 'queen', demonstrating that embeddings learn meaningful structure from data.",
            "order": 3
        },
        {
            "type": QuestionType.short_answer,
            "content_json": {
                "question": "Why are positional embeddings necessary in Transformer models? What would happen if we removed them?",
                "hint": "Think about what self-attention computes and whether it cares about the order of tokens."
            },
            "correct_answer": {"text": "Self-attention is permutation-invariant — it computes the same output regardless of token order. Without positional embeddings, the model would treat 'The cat sat on the mat' and 'mat the on sat cat The' identically, losing all understanding of word order and sentence structure. Positional embeddings inject information about each token's position in the sequence."},
            "difficulty": 2,
            "explanation": "Transformers use attention which is fundamentally a set operation (no inherent ordering). Positional embeddings add unique position signals to each token, allowing the model to distinguish 'I love cats' from 'cats love I'.",
            "order": 4
        },
        {
            "type": QuestionType.mcq,
            "content_json": {
                "question": "What is the final input to a Transformer model?",
                "options": [
                    "Just the token embeddings",
                    "Token embeddings + positional embeddings",
                    "Raw text strings",
                    "One-hot encoded vectors"
                ]
            },
            "correct_answer": {"answer": 1, "text": "Token embeddings + positional embeddings"},
            "difficulty": 1,
            "explanation": "The final input to a Transformer is the sum of token embeddings (semantic meaning) and positional embeddings (position information). This combined representation is then processed by the attention layers.",
            "order": 5
        }
    ]
}


# ──────────────────────────────────────────────
# SEEDING LOGIC
# ──────────────────────────────────────────────

async def create_topic_with_content(session, topic_data):
    """Create a topic and its content sections."""
    topic = Topic(
        title=topic_data["title"],
        slug=topic_data["slug"],
        module=topic_data["module"],
        difficulty=topic_data["difficulty"],
        order=topic_data["order"],
        is_published=topic_data["is_published"]
    )
    session.add(topic)
    await session.flush()

    for idx, content in enumerate(topic_data["contents"]):
        tc = TopicContent(
            topic_id=topic.id,
            section_type=content["type"],
            content_json=content["json"],
            order=idx + 1
        )
        session.add(tc)

    return topic


async def create_quiz_with_questions(session, topic_id, quiz_data):
    """Create a quiz and its questions for a given topic."""
    quiz = Quiz(
        topic_id=topic_id,
        title=quiz_data["title"],
        difficulty=quiz_data["difficulty"],
        is_published=quiz_data["is_published"]
    )
    session.add(quiz)
    await session.flush()

    for q_data in quiz_data["questions"]:
        question = Question(
            quiz_id=quiz.id,
            type=q_data["type"],
            content_json=q_data["content_json"],
            correct_answer=q_data["correct_answer"],
            difficulty=q_data["difficulty"],
            explanation=q_data["explanation"],
            order=q_data["order"]
        )
        session.add(question)

    return quiz


async def seed_demo_content():
    """Main seeding function."""
    print("=" * 60)
    print("  NeuroStack — Seeding Demo Topics & Quizzes")
    print("=" * 60)

    all_topics = [
        (TOPIC_1, QUIZ_1),
        (TOPIC_2, QUIZ_2),
        (TOPIC_3, QUIZ_3),
        (TOPIC_4, QUIZ_4),
    ]

    async with AsyncSessionLocal() as session:
        for topic_data, quiz_data in all_topics:
            # Check if topic already exists
            result = await session.execute(
                select(Topic).where(Topic.slug == topic_data["slug"])
            )
            existing = result.scalar_one_or_none()

            if existing:
                print(f"  [SKIP] Topic already exists: {topic_data['title']}")
                continue

            # Create topic
            topic = await create_topic_with_content(session, topic_data)
            print(f"  [+] Created topic: {topic_data['title']} ({len(topic_data['contents'])} sections)")

            # Create quiz
            quiz = await create_quiz_with_questions(session, topic.id, quiz_data)
            print(f"  [+] Created quiz: {quiz_data['title']} ({len(quiz_data['questions'])} questions)")

        await session.commit()

    print()
    print("  Done! 4 topics with quizzes seeded successfully.")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_demo_content())
