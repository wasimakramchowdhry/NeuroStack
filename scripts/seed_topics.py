import asyncio
import os
import sys
import uuid

# Add the backend folder to the python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(project_root, "backend"))

from app.database import AsyncSessionLocal
from app.modules.topics.models import Topic, TopicContent, DifficultyLevel, SectionType
from sqlalchemy import select

async def create_topic_with_content(session, title, slug, module, difficulty, order, is_published, contents):
    topic = Topic(
        title=title,
        slug=slug,
        module=module,
        difficulty=difficulty,
        order=order,
        is_published=is_published
    )
    session.add(topic)
    await session.flush() # get ID
    
    topic_contents = []
    for idx, content in enumerate(contents):
        tc = TopicContent(
            topic_id=topic.id,
            section_type=content["type"],
            content_json=content["json"],
            order=idx + 1
        )
        topic_contents.append(tc)
        
    session.add_all(topic_contents)

async def seed_topics():
    print("Seeding initial topics...")
    async with AsyncSessionLocal() as session:
        # Check if topics already exist
        result = await session.execute(select(Topic))
        existing_topics = result.scalars().all()
        if existing_topics:
            print(f"Database already contains {len(existing_topics)} topics. Skipping seeding.")
            return

        mock_data = [
            {
                "title": "Linear Algebra for Machine Learning",
                "slug": "linear-algebra-refresher",
                "module": "Fundamentals",
                "difficulty": DifficultyLevel.beginner,
                "order": 1,
                "is_published": True,
                "contents": [
                    {"type": SectionType.concept, "json": {"markdown": "Linear algebra is the mathematics of data. In machine learning, vectors represent data points, and matrices represent collections of data points or linear transformations."}},
                    {"type": SectionType.math, "json": {"latex": "y = Wx + b"}},
                    {"type": SectionType.code, "json": {"language": "python", "code": "import numpy as np\nx = np.array([1, 2, 3])\nW = np.array([[1, 0, 0], [0, 1, 0], [0, 0, 1]])\ny = np.dot(W, x)\nprint(y)"}}
                ]
            },
            {
                "title": "Introduction to Neural Networks",
                "slug": "intro-neural-networks",
                "module": "Deep Learning Basics",
                "difficulty": DifficultyLevel.beginner,
                "order": 2,
                "is_published": True,
                "contents": [
                    {"type": SectionType.concept, "json": {"markdown": "A neural network is a series of algorithms that endeavors to recognize underlying relationships in a set of data through a process that mimics the way the human brain operates."}},
                    {"type": SectionType.architecture, "json": {"diagram": "mlp_basic"}},
                    {"type": SectionType.math, "json": {"latex": "a^{(l+1)} = \\sigma(W^{(l)} a^{(l)} + b^{(l)})"}}
                ]
            },
            {
                "title": "Backpropagation Calculus",
                "slug": "backpropagation-calculus",
                "module": "Deep Learning Basics",
                "difficulty": DifficultyLevel.intermediate,
                "order": 3,
                "is_published": True,
                "contents": [
                    {"type": SectionType.concept, "json": {"markdown": "Backpropagation is the practice of fine-tuning the weights of a neural network based on the error rate (i.e., loss) obtained in the previous epoch (i.e., iteration)."}},
                    {"type": SectionType.math, "json": {"latex": "\\frac{\\partial L}{\\partial W^{(l)}} = a^{(l-1)} (\\delta^{(l)})^T"}},
                    {"type": SectionType.code, "json": {"language": "python", "code": "def backward(self, d_out):\n    self.d_W = np.dot(self.x.T, d_out)\n    self.d_b = np.sum(d_out, axis=0)\n    return np.dot(d_out, self.W.T)"}}
                ]
            },
            {
                "title": "Convolutional Neural Networks",
                "slug": "cnn-architecture",
                "module": "Computer Vision",
                "difficulty": DifficultyLevel.intermediate,
                "order": 4,
                "is_published": True,
                "contents": [
                    {"type": SectionType.concept, "json": {"markdown": "A Convolutional Neural Network (CNN) is a Deep Learning algorithm which can take in an input image, assign importance (learnable weights and biases) to various aspects/objects in the image and be able to differentiate one from the other."}},
                    {"type": SectionType.visual, "json": {"animation_id": "cnn_filter_sweep"}}
                ]
            },
            {
                "title": "The Attention Mechanism",
                "slug": "attention-mechanism",
                "module": "Transformers",
                "difficulty": DifficultyLevel.advanced,
                "order": 5,
                "is_published": True,
                "contents": [
                    {"type": SectionType.concept, "json": {"markdown": "The core of the Transformer is the self-attention mechanism, which allows the model to weigh the importance of different words in a sequence when processing any single word."}},
                    {"type": SectionType.visual, "json": {"animation_id": "transformer_attention", "fallback_image": "/assets/attention.png"}},
                    {"type": SectionType.math, "json": {"latex": "\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V"}},
                    {"type": SectionType.code, "json": {"language": "python", "code": "import torch.nn.functional as F\n\ndef attention(query, key, value):\n    d_k = query.size(-1)\n    scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)\n    p_attn = F.softmax(scores, dim=-1)\n    return torch.matmul(p_attn, value)"}}
                ]
            },
            {
                "title": "Mixture of Experts (MoE)",
                "slug": "mixture-of-experts",
                "module": "Advanced LLMs",
                "difficulty": DifficultyLevel.advanced,
                "order": 6,
                "is_published": False, # Keep one as a draft
                "contents": [
                    {"type": SectionType.concept, "json": {"markdown": "Mixture of Experts represents a paradigm shift where instead of a dense feed-forward network, the model uses a router to select a subset of 'expert' sub-networks for each token."}},
                    {"type": SectionType.architecture, "json": {"diagram": "moe_router"}}
                ]
            }
        ]

        for topic_data in mock_data:
            await create_topic_with_content(
                session, 
                topic_data["title"], 
                topic_data["slug"], 
                topic_data["module"], 
                topic_data["difficulty"], 
                topic_data["order"], 
                topic_data["is_published"], 
                topic_data["contents"]
            )

        await session.commit()
        print("Successfully seeded topics into the database!")

if __name__ == "__main__":
    asyncio.run(seed_topics())
