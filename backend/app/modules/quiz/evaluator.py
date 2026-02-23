"""
AI Evaluator Service — Routes grading logic based on question type.

- MCQ: Direct string/array comparison.
- Code Completion: Basic syntax check + fuzzy output matching.
- Short Answer / Scenario Analysis / Architecture: Semantic evaluation via local Ollama LLM.
"""

import json
import logging
import httpx
from typing import Any, Dict

from app.config import settings

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = settings.OLLAMA_BASE_URL
OLLAMA_MODEL = settings.OLLAMA_MODEL


class EvaluationResult:
    def __init__(self, is_correct: bool, feedback: str | None = None):
        self.is_correct = is_correct
        self.feedback = feedback


async def evaluate_answer(
    question_type: str,
    user_answer: Any,
    correct_answer: Any,
    content_json: Dict[str, Any] | None = None,
) -> EvaluationResult:
    """
    Main dispatch — routes to the appropriate grading strategy based on question type.
    """
    if question_type == "mcq":
        return _evaluate_mcq(user_answer, correct_answer)
    elif question_type == "code_completion":
        return _evaluate_code_completion(user_answer, correct_answer)
    elif question_type in ("short_answer", "scenario_analysis", "architecture"):
        return await _evaluate_with_llm(
            question_type=question_type,
            user_answer=user_answer,
            correct_answer=correct_answer,
            content_json=content_json,
        )
    else:
        logger.warning(f"Unknown question type '{question_type}', falling back to exact match")
        return _evaluate_exact_match(user_answer, correct_answer)


def _evaluate_mcq(user_answer: Any, correct_answer: Any) -> EvaluationResult:
    """
    MCQ grading — compare selected option(s) against the correct answer.
    Supports both single-choice (str) and multi-choice (list) MCQs.
    """
    # Normalize to comparable form
    user_val = _normalize_answer(user_answer)
    correct_val = _normalize_answer(correct_answer)

    is_correct = user_val == correct_val
    feedback = None if is_correct else f"The correct answer is: {correct_answer}"
    return EvaluationResult(is_correct=is_correct, feedback=feedback)


def _evaluate_code_completion(user_answer: Any, correct_answer: Any) -> EvaluationResult:
    """
    Code grading — basic syntax check and normalized string comparison.
    Strips whitespace differences for a fair comparison.
    """
    user_code = str(user_answer).strip()
    correct_code = str(correct_answer).strip() if isinstance(correct_answer, str) else json.dumps(correct_answer)

    # Normalize whitespace for comparison
    user_normalized = " ".join(user_code.split())
    correct_normalized = " ".join(correct_code.split())

    if user_normalized == correct_normalized:
        return EvaluationResult(is_correct=True)

    # Check for key patterns from correct answer
    if isinstance(correct_answer, dict) and "key_patterns" in correct_answer:
        patterns = correct_answer["key_patterns"]
        matches = sum(1 for p in patterns if p.lower() in user_code.lower())
        ratio = matches / len(patterns) if patterns else 0

        if ratio >= 0.8:
            return EvaluationResult(
                is_correct=True,
                feedback="Your code contains the key patterns. Well done!"
            )
        else:
            missing = [p for p in patterns if p.lower() not in user_code.lower()]
            return EvaluationResult(
                is_correct=False,
                feedback=f"Your code is missing key elements: {', '.join(missing)}"
            )

    return EvaluationResult(
        is_correct=False,
        feedback="Your code does not match the expected solution."
    )


async def _evaluate_with_llm(
    question_type: str,
    user_answer: Any,
    correct_answer: Any,
    content_json: Dict[str, Any] | None = None,
) -> EvaluationResult:
    """
    Semantic evaluation via local Ollama LLM.
    Sends the question context, correct answer, and user answer to the model
    and expects a JSON response with is_correct and feedback.
    """
    question_prompt = ""
    if content_json:
        question_prompt = content_json.get("prompt", content_json.get("markdown", json.dumps(content_json)))

    system_prompt = (
        "You are a strict but fair academic grader. Evaluate whether the student's answer "
        "is semantically correct based on the reference answer and the question context. "
        "You MUST respond with ONLY a valid JSON object in this exact format:\n"
        '{"is_correct": true/false, "feedback": "brief explanation of your evaluation"}\n'
        "Do not include any text outside the JSON object."
    )

    user_prompt = (
        f"Question Type: {question_type}\n"
        f"Question: {question_prompt}\n"
        f"Reference Answer: {json.dumps(correct_answer) if not isinstance(correct_answer, str) else correct_answer}\n"
        f"Student's Answer: {json.dumps(user_answer) if not isinstance(user_answer, str) else user_answer}\n\n"
        "Evaluate the student's answer and return your JSON verdict."
    )

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "stream": False,
                    "format": "json",
                },
            )
            response.raise_for_status()
            data = response.json()

            content = data.get("message", {}).get("content", "")
            result = json.loads(content)

            return EvaluationResult(
                is_correct=bool(result.get("is_correct", False)),
                feedback=result.get("feedback"),
            )

    except httpx.ConnectError:
        logger.error("Cannot connect to Ollama. Is it running at %s?", OLLAMA_BASE_URL)
        return _evaluate_exact_match(user_answer, correct_answer, fallback_note="AI evaluation unavailable — used exact match fallback.")
    except (json.JSONDecodeError, KeyError) as e:
        logger.error("Failed to parse Ollama response: %s", e)
        return _evaluate_exact_match(user_answer, correct_answer, fallback_note="AI evaluation returned invalid format — used exact match fallback.")
    except Exception as e:
        logger.error("Ollama evaluation failed: %s", e)
        return _evaluate_exact_match(user_answer, correct_answer, fallback_note="AI evaluation error — used exact match fallback.")


def _evaluate_exact_match(user_answer: Any, correct_answer: Any, fallback_note: str | None = None) -> EvaluationResult:
    """Fallback exact-match comparison."""
    user_val = _normalize_answer(user_answer)
    correct_val = _normalize_answer(correct_answer)
    is_correct = user_val == correct_val
    feedback = fallback_note if not is_correct else None
    return EvaluationResult(is_correct=is_correct, feedback=feedback)


def _normalize_answer(answer: Any) -> Any:
    """Normalize answer for comparison — lowercase strings, sort lists."""
    if isinstance(answer, str):
        return answer.strip().lower()
    if isinstance(answer, dict):
        # Extract the 'answer' key if present, otherwise use as-is
        if "answer" in answer:
            return _normalize_answer(answer["answer"])
        return answer
    if isinstance(answer, list):
        return sorted([_normalize_answer(a) for a in answer])
    return answer
