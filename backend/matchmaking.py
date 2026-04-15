"""Utilities for pairing users with politically opposing debate partners.

The matcher is intentionally schema-aware but lightweight:
- It uses the current Firestore user fields from the general survey.
- It optionally adds extra weight for topic-specific issue answers.
- It returns the strongest available ideological contrast instead of the
  first user who happens to match a hard-coded political label.
"""

from __future__ import annotations

from typing import Dict, Iterable, List, Optional, Tuple


POLITICAL_SCALE = {
    "far_left": -3,
    "left": -2,
    "center_left": -1,
    "center": 0,
    "center_right": 1,
    "right": 2,
    "far_right": 3,
}

ECONOMIC_SCALE = {
    "socialist": -2,
    "progressive": -1,
    "moderate": 0,
    "conservative": 1,
    "libertarian": 2,
}

SOCIAL_SCALE = {
    "very_liberal": -2,
    "liberal": -1,
    "moderate": 0,
    "conservative": 1,
    "very_conservative": 2,
}

STANCE_SCALE = {
    "strongly_agree": 2,
    "agree": 1,
    "neutral": 0,
    "disagree": -1,
    "strongly_disagree": -2,
}

TOPIC_FIELDS = {
    "immigration": [
        "healthy_society",
        "immigrant_children",
        "healthy_economy",
    ],
}


def _normalized_distance(
    user_a: Dict,
    user_b: Dict,
    field: str,
    scale_map: Dict[str, int],
) -> Optional[float]:
    """Return a 0..1 distance score for a categorical field."""
    a_value = scale_map.get(user_a.get(field))
    b_value = scale_map.get(user_b.get(field))
    if a_value is None or b_value is None:
        return None

    max_distance = max(scale_map.values()) - min(scale_map.values())
    if max_distance == 0:
        return 0.0
    return abs(a_value - b_value) / max_distance


def _average(values: Iterable[Optional[float]]) -> Optional[float]:
    present = [value for value in values if value is not None]
    if not present:
        return None
    return sum(present) / len(present)


def _topic_issue_distance(
    current_user: Dict,
    candidate_user: Dict,
    debate_topic: Optional[str],
) -> Tuple[Optional[float], int]:
    if not debate_topic:
        return None, 0

    fields = TOPIC_FIELDS.get(debate_topic.strip().lower())
    if not fields:
        return None, 0

    distances = [
        _normalized_distance(current_user, candidate_user, field, STANCE_SCALE)
        for field in fields
    ]
    issue_score = _average(distances)
    answered_count = len([value for value in distances if value is not None])
    return issue_score, answered_count


def calculate_match_score(
    current_user: Dict,
    candidate_user: Dict,
    debate_topic: Optional[str] = None,
) -> Dict:
    """Score how well a candidate represents a contrasting political match."""
    political_distance = _normalized_distance(
        current_user, candidate_user, "political_spectrum", POLITICAL_SCALE
    )
    economic_distance = _normalized_distance(
        current_user, candidate_user, "economic_views", ECONOMIC_SCALE
    )
    social_distance = _normalized_distance(
        current_user, candidate_user, "social_views", SOCIAL_SCALE
    )
    topic_distance, topic_answer_count = _topic_issue_distance(
        current_user, candidate_user, debate_topic
    )

    broad_opposition = _average(
        [political_distance, economic_distance, social_distance]
    )
    if broad_opposition is None:
        broad_opposition = 0.0

    topic_weight = 0.35 if topic_distance is not None else 0.0
    broad_weight = 1.0 - topic_weight
    final_score = (broad_opposition * broad_weight) + (
        (topic_distance or 0.0) * topic_weight
    )

    political_gap = 0.0 if political_distance is None else political_distance
    is_opposing_enough = final_score >= 0.45 or political_gap >= 0.5

    return {
        "score": round(final_score, 4),
        "broad_opposition": round(broad_opposition, 4),
        "political_distance": None
        if political_distance is None
        else round(political_distance, 4),
        "economic_distance": None
        if economic_distance is None
        else round(economic_distance, 4),
        "social_distance": None
        if social_distance is None
        else round(social_distance, 4),
        "topic_distance": None if topic_distance is None else round(topic_distance, 4),
        "topic_answer_count": topic_answer_count,
        "is_opposing_enough": is_opposing_enough,
    }


def find_best_opposing_match(
    current_user: Dict,
    candidates: Iterable[Dict],
    debate_topic: Optional[str] = None,
    excluded_user_ids: Optional[Iterable[str]] = None,
) -> Optional[Dict]:
    """Return the best available opposing user and score details."""
    excluded_ids = set(excluded_user_ids or [])
    current_user_id = current_user.get("user_id")

    ranked_matches: List[Dict] = []

    for candidate in candidates:
        candidate_user_id = candidate.get("user_id")
        if not candidate_user_id or candidate_user_id == current_user_id:
            continue
        if candidate_user_id in excluded_ids:
            continue
        if candidate.get("status") != "available":
            continue
        if not candidate.get("survey_completed"):
            continue

        match_score = calculate_match_score(current_user, candidate, debate_topic)
        if not match_score["is_opposing_enough"]:
            continue

        ranked_matches.append(
            {
                "user": candidate,
                "match_score": match_score,
            }
        )

    if not ranked_matches:
        return None

    ranked_matches.sort(
        key=lambda item: (
            item["match_score"]["score"],
            item["match_score"]["political_distance"] or 0.0,
            item["match_score"]["topic_answer_count"],
        ),
        reverse=True,
    )
    return ranked_matches[0]
