"""
FitTrack Analytics - AI Autocomplete Engine
Provides intelligent, context-aware autocomplete completions for fitness-center
member re-engagement, retention campaigns, and staff outreach.
"""

import json
import re
import urllib.request
import urllib.error


class AIAutocompleteEngine:
    """Intelligent autocomplete engine supporting rule-based semantic predictions

    and live LLM completions via Google Gemini API.
    """

    TEMPLATES = {
        "Re-engagement Outreach": [
            "we noticed you haven't visited in {days} days and wanted to check in on how your fitness journey is going.",
            "we would love to welcome you back with a complimentary 1-on-1 personal training session this week.",
            "we've missed seeing you at the gym! Your favorite workout equipment and trainers are ready for you.",
            "we'd like to offer you 2 free group fitness passes to help you reboot your workout routine.",
            "our trainers noticed you've been away—let us help you redesign a customized workout plan that fits your current schedule.",
        ],
        "Special Retention Offer": [
            "renew your membership before the end of the month to unlock an exclusive 20% loyalty discount.",
            "as a valued member, extend your plan today and receive a complimentary nutrition consultation and shaker bottle.",
            "lock in your current renewal rate for the next 12 months with zero maintenance fees.",
            "switch to our flexible monthly access plan so you can keep progressing without long-term commitment.",
        ],
        "Class & Training Recommendation": [
            "based on your goals, our new high-energy HIIT and spin classes on Tuesdays would be a great fit for you.",
            "we invite you to try our beginner-friendly Strength & Mobility workshop this Saturday at 10 AM.",
            "attend 2 more classes this month to achieve your quarterly fitness milestone badge!",
            "our evening yoga and recovery sessions are perfect for relieving workday stress and boosting flexibility.",
        ],
        "Check-in & Feedback Inquiry": [
            "is there anything our coaching team or facility can improve to better support your health goals?",
            "we want to make sure you're getting the best experience possible—how can we support you this week?",
            "have your fitness goals or preferred workout hours changed? Let's connect for a quick 5-minute check-in.",
        ]
    }

    GENERIC_CONTINUATIONS = {
        "we noticed": [
            " you haven't visited recently and wanted to see how we can support your fitness goals.",
            " that you've been away for {days} days, and we'd love to invite you for a free refresher session.",
            " your attendance has dropped this month and wanted to offer a complimentary trainer consultation."
        ],
        "we would love": [
            " to invite you back with a free personal training session and customized workout routine.",
            " to offer you a 20% discount on your upcoming membership renewal.",
            " to hear your feedback on how we can improve your gym experience."
        ],
        "to help you": [
            " stay on track, we've reserved a free spot for you in our upcoming conditioning class.",
            " get back into your rhythm, our team is offering a complimentary body-composition scan.",
            " achieve your milestones, here is an exclusive renewal discount valid through this Sunday."
        ],
        "as a valued": [
            " member of FitTrack, we're giving you priority booking for all group classes this month.",
            " member, you are eligible for an exclusive renewal upgrade with zero joining fees.",
            " member, we would love your thoughts on our latest fitness equipment and class schedules."
        ],
        "renew your": [
            " membership this week to secure 20% off and 2 complimentary personal training sessions.",
            " annual pass today and get an extra month completely free.",
            " plan before it expires to retain your grandfathered membership rate."
        ],
        "our team": [
            " is always here to support your health journey with tailored fitness and nutrition guidance.",
            " noticed you haven't booked any classes recently—here are top picks matching your profile.",
            " would love to schedule a quick 10-minute progress review with our head coach."
        ],
        "how can": [
            " we best support your fitness journey and workout routine this season?",
            " we assist in helping you hit your monthly attendance and workout targets?",
            " we improve our class timings or equipment to better suit your busy schedule?"
        ]
    }

    def __init__(self, api_key: str = None):
        self.api_key = api_key

    def get_completions(
        self,
        prefix: str,
        category: str = "Re-engagement Outreach",
        member_context: dict = None,
        max_suggestions: int = 3
    ) -> list[str]:
        """Returns autocomplete suggestions for the user's typed prefix.

        Tries live Gemini LLM if API key is provided; otherwise uses semantic engine.
        """
        prefix_clean = prefix.strip()
        if not prefix_clean:
            return self._default_starters(category, member_context)[:max_suggestions]

        # 1. If API key exists, try LLM first
        if self.api_key:
            llm_results = self._call_gemini_autocomplete(prefix_clean, category, member_context)
            if llm_results:
                return llm_results[:max_suggestions]

        # 2. Semantic fallback autocomplete
        return self._semantic_autocomplete(prefix_clean, category, member_context, max_suggestions)

    def _default_starters(self, category: str, member_context: dict = None) -> list[str]:
        """Provides smart starters when the input is empty."""
        days = member_context.get("days_inactive", 14) if member_context else 14
        templates = self.TEMPLATES.get(category, self.TEMPLATES["Re-engagement Outreach"])
        formatted = [t.format(days=days).capitalize() for t in templates]
        return formatted

    def _semantic_autocomplete(
        self,
        prefix: str,
        category: str,
        member_context: dict = None,
        max_suggestions: int = 3
    ) -> list[str]:
        """Synthesizes context-aware completions based on prefix matching and n-grams."""
        days = member_context.get("days_inactive", 14) if member_context else 14
        risk = member_context.get("risk_level", "Medium") if member_context else "Medium"
        prefix_lower = prefix.lower().strip()

        suggestions = []

        # Check generic continuation keys
        for key, continuations in self.GENERIC_CONTINUATIONS.items():
            if prefix_lower == key or prefix_lower.endswith(key) or key.startswith(prefix_lower):
                for cont in continuations:
                    c = cont.format(days=days)
                    if key.startswith(prefix_lower):
                        full = key[len(prefix_lower):] + c
                    else:
                        full = c
                    suggestions.append(full.strip())

        # Check template matching
        templates = self.TEMPLATES.get(category, [])
        for tmpl in templates:
            formatted = tmpl.format(days=days)
            if formatted.lower().startswith(prefix_lower):
                completion = formatted[len(prefix_lower):].strip()
                if completion and completion not in suggestions:
                    suggestions.append(completion)

        # Context-rich fallback completions if matches are sparse
        if len(suggestions) < max_suggestions:
            if "visit" in prefix_lower or "miss" in prefix_lower:
                suggestions.append(f"to help you reboot your consistency after {days} days of absence.")
                suggestions.append("with our complimentary weekend fitness re-orientation class.")
            elif "offer" in prefix_lower or "discount" in prefix_lower:
                suggestions.append("exclusive 20% off renewal plus zero admin fees for returning members.")
                suggestions.append("a free 30-day guest pass for a workout buddy to keep you motivated.")
            elif "class" in prefix_lower or "train" in prefix_lower:
                suggestions.append("and join our group sessions designed for all fitness levels.")
                suggestions.append("with certified instructors to maximize your workout results.")
            else:
                if risk == "High":
                    suggestions.append(f"and we're reaching out with a special re-engagement offer just for you.")
                    suggestions.append(f"to ensure you have everything needed to achieve your health goals.")
                    suggestions.append(f"plus a 1-on-1 coach check-in to get back on track.")
                else:
                    suggestions.append("to support your routine and maintain your active membership perks.")
                    suggestions.append("with upcoming workshops and member-only community challenges.")

        # Deduplicate while preserving order
        unique_suggestions = []
        for s in suggestions:
            cleaned = s.lstrip(" ,.")
            if cleaned and cleaned not in unique_suggestions:
                unique_suggestions.append(cleaned)

        return unique_suggestions[:max_suggestions]

    def _call_gemini_autocomplete(
        self,
        prefix: str,
        category: str,
        member_context: dict = None
    ) -> list[str]:
        """Calls Google Gemini API for real-time natural language completions."""
        try:
            ctx_str = ""
            if member_context:
                ctx_str = (
                    f"Member Context: ID={member_context.get('member_id')}, "
                    f"Risk={member_context.get('risk_level')}, "
                    f"Days Inactive={member_context.get('days_inactive')}, "
                    f"Visits Last 30 Days={member_context.get('visits')}, "
                    f"Classes Attended={member_context.get('classes')}."
                )

            prompt = (
                f"You are an AI autocomplete engine for a fitness-center member retention dashboard.\n"
                f"The user is typing an outreach message under category: '{category}'.\n"
                f"{ctx_str}\n"
                f"The user has currently typed: \"{prefix}\"\n\n"
                f"Task: Provide exactly 3 short, natural completions (continuations) that seamlessly "
                f"complete the text. Do NOT repeat what the user already typed. Only provide the trailing continuation text.\n"
                f"Return ONLY a valid JSON array of 3 strings, e.g. [\"continuation 1\", \"continuation 2\", \"continuation 3\"]."
            )

            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 150
                }
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                # Parse JSON array from output
                match = re.search(r"\[.*\]", text, re.DOTALL)
                if match:
                    items = json.loads(match.group(0))
                    return [str(i).strip().lstrip(" ,.") for i in items if str(i).strip()]
        except Exception:
            pass
        return []
