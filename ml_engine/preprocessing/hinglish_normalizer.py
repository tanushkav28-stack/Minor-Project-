"""
Cognivibe AI - Code-Mixed Hinglish Preprocessing Pipeline
Handles:
1. Social media cleaning (handles, links, noise)
2. Character elongation normalization (e.g. 'sooo' -> 'soo', 'bhooooot' -> 'bhoot')
3. Romanized Hindi slang and phonetic standardization
4. Emoji emotional context retention
5. Code-mixing and script ratio identification (Devanagari vs Roman)
"""

import re
import unicodedata
from typing import Dict, Any, Tuple, List

# Common Hinglish phonetic variants and slang mappings
HINGLISH_LEXICON: Dict[str, str] = {
    # Pronouns & determiners
    "mjhe": "mujhe",
    "mujhko": "mujhe",
    "mje": "mujhe",
    "meri": "meri",
    "mera": "mera",
    "mere": "mere",
    "kch": "kuch",
    "kuchh": "kuch",
    "kuchbhi": "kuch bhi",
    "sb": "sab",
    "sabb": "sab",
    "koi": "koi",
    "kisi": "kisi",
    "kisiko": "kisi ko",
    "apna": "apna",
    "apne": "apne",
    
    # Negations & connectors
    "nhi": "nahi",
    "nhin": "nahi",
    "nh": "nahi",
    "naa": "na",
    "b": "bhi",
    "bh": "bhi",
    "lekin": "lekin",
    "magar": "magar",
    "pr": "par",
    "aur": "aur",
    "or": "aur",
    "yrr": "yaar",
    "yr": "yaar",
    "yaarr": "yaar",
    
    # Emotional and mental state descriptors
    "bhot": "bahut",
    "bohot": "bahut",
    "bht": "bahut",
    "bahutt": "bahut",
    "accha": "accha",
    "acha": "accha",
    "achha": "accha",
    "achaa": "accha",
    "achi": "acchi",
    "burra": "bura",
    "khraab": "kharab",
    "udas": "udaas",
    "udaas": "udaas",
    "sukoon": "sukoon",
    "shanti": "shanti",
    "pareshan": "pareshan",
    "preshan": "pareshan",
    "akela": "akela",
    "akeli": "akela",
    "akelaa": "akela",
    "akelapan": "akelapan",
    "tanha": "akelapan",
    "tanhai": "akelapan",
    "thak": "thak",
    "exhaust": "exhausted",
    "exhausted": "exhausted",
    "darr": "dar",
    "khauf": "dar",
    "rona": "rona",
    "ro": "rona",
    "dard": "dard",
    "takleef": "takleef",
    "dardnak": "dard",
    "ummeed": "ummeed",
    "umeed": "ummeed",
    "naumeed": "naumeed",
    "zindagi": "zindagi",
    "zindgi": "zindagi",
    "jeena": "jeena",
    "marne": "marne",
    "marna": "marna",
    
    # Common verbs & auxiliaries
    "krna": "karna",
    "krta": "karta",
    "krti": "karti",
    "kr": "kar",
    "karo": "karo",
    "ho": "ho",
    "h": "hai",
    "hain": "hai",
    "hie": "hai",
    "tha": "tha",
    "thi": "thi",
    "the": "the",
    "rha": "raha",
    "rhi": "rahi",
    "rhe": "rahe",
    "lag": "lag",
    "lg": "lag",
    "laga": "laga",
    "lga": "laga",
    "lagta": "lagta",
    "lgta": "lagta",
    "lagti": "lagti",
    "lgti": "lagti",
    "paungi": "paungi",
    "paunga": "paunga",
    "samajh": "samajh",
    "smjh": "samajh",
    "soch": "soch",
    "chahiye": "chahiye",
    "chye": "chahiye",
}

# English contraction mappings
ENGLISH_CONTRACTIONS: Dict[str, str] = {
    "can't": "cannot",
    "won't": "will not",
    "n't": " not",
    "'re": " are",
    "'s": " is",
    "'d": " would",
    "'ll": " will",
    "'t": " not",
    "'ve": " have",
    "'m": " am",
    "im": "i am",
    "dont": "do not",
    "didnt": "did not",
    "isnt": "is not",
    "arent": "are not",
    "wont": "will not",
    "cant": "cannot",
    "idk": "i do not know",
    "tbh": "to be honest",
    "smh": "shaking my head",
    "fml": "frustrated",
    "pls": "please",
    "plz": "please",
    "thx": "thanks",
    "ty": "thank you",
}

# Emoji sentiment semantic translation
EMOJI_SEMANTICS: Dict[str, str] = {
    "😭": " [crying heavily] ",
    "😢": " [crying sad] ",
    "🥺": " [pleading sad] ",
    "💔": " [broken heart] ",
    "😞": " [disappointed] ",
    "😔": " [pensive depressed] ",
    "🙁": " [frowning] ",
    "☹️": " [frowning sad] ",
    "😩": " [weary distressed] ",
    "😫": " [tired exhausted] ",
    "😣": " [struggling] ",
    "😓": " [downcast sweat] ",
    "😰": " [anxious worried] ",
    "😨": " [fearful] ",
    "😱": " [screaming fear] ",
    "😡": " [angry] ",
    "😠": " [enraged] ",
    "🤬": " [cursing angry] ",
    "😊": " [smiling happy] ",
    "😀": " [grinning joyful] ",
    "😃": " [happy] ",
    "✨": " [positive sparkle] ",
    "❤️": " [love affection] ",
    "💀": " [dying skull] ",
    "🥀": " [wilted flower loss] ",
    "🖤": " [black heart grief] ",
}

# Crisis / Self-harm linguistic indicators for immediate safety intervention
CRISIS_TRIGGERS: List[str] = [
    "suicide", "kill myself", "want to die", "end my life", "end it all",
    "marne ka mann", "khatam kar dunga", "mar jana chahta", "mar jana chahti",
    "no reason to live", "better off dead", "cutting myself", "self harm",
    "zindagi khatam", "i hate my life so much i want to die"
]


class HinglishNormalizer:
    """Preprocesses and normalizes English and Hinglish social media text."""

    def __init__(self):
        # Regex for elongation normalization (3 or more same characters -> 2)
        # e.g., 'sooooo' -> 'soo', 'bhooot' -> 'bhoot'
        self.elongation_pattern = re.compile(r'(.)\1{2,}', re.IGNORECASE)
        self.url_pattern = re.compile(r'https?://\S+|www\.\S+')
        self.mention_pattern = re.compile(r'@\w+')
        self.hashtag_pattern = re.compile(r'#(\w+)')
        self.whitespace_pattern = re.compile(r'\s+')

    def detect_scripts(self, text: str) -> Dict[str, float]:
        """Calculates script proportions in the text (Devanagari vs Latin)."""
        devanagari_count = 0
        latin_count = 0
        total_letters = 0

        for char in text:
            name = unicodedata.name(char, "")
            if "DEVANAGARI" in name:
                devanagari_count += 1
                total_letters += 1
            elif "LATIN" in name:
                latin_count += 1
                total_letters += 1

        if total_letters == 0:
            return {"devanagari_ratio": 0.0, "latin_ratio": 1.0, "code_mixed": False}

        dev_ratio = round(devanagari_count / total_letters, 3)
        lat_ratio = round(latin_count / total_letters, 3)
        code_mixed = dev_ratio > 0.15 and lat_ratio > 0.15

        return {
            "devanagari_ratio": dev_ratio,
            "latin_ratio": lat_ratio,
            "code_mixed": code_mixed or self._detect_romanized_hinglish(text)
        }

    def _detect_romanized_hinglish(self, text: str) -> bool:
        """Checks if text written in Roman script contains common Hindi words."""
        tokens = re.findall(r'\b\w+\b', text.lower())
        hindi_token_count = sum(1 for t in tokens if t in HINGLISH_LEXICON)
        return hindi_token_count >= 2 or (len(tokens) > 0 and (hindi_token_count / len(tokens)) >= 0.20)

    def check_crisis_indicators(self, text: str) -> bool:
        """Scans for explicit self-harm or emergency crisis distress language."""
        text_lower = text.lower()
        for trigger in CRISIS_TRIGGERS:
            if trigger in text_lower:
                return True
        return False

    def normalize(self, text: str) -> Tuple[str, Dict[str, Any]]:
        """
        Executes full normalization pipeline:
        1. Unicode normalization (NFC)
        2. Preserves emoji semantics
        3. Removes URLs & @handles (retains hashtags as words)
        4. Expands English contractions
        5. Normalizes character elongation
        6. Standardizes Romanized Hinglish vocabulary
        7. Returns normalized text and metadata
        """
        if not text or not isinstance(text, str):
            return "", {"crisis_flag": False, "is_hinglish": False, "length": 0}

        original_text = text.strip()
        has_crisis = self.check_crisis_indicators(original_text)

        # 1. Unicode normalization
        clean = unicodedata.normalize("NFC", original_text)

        # 2. Replace emojis with semantic tokens to preserve emotional intensity
        for emoji_char, semantic_tag in EMOJI_SEMANTICS.items():
            clean = clean.replace(emoji_char, semantic_tag)

        # 3. Clean URLs & @user mentions
        clean = self.url_pattern.sub(" ", clean)
        clean = self.mention_pattern.sub(" ", clean)
        # Keep hashtag words without '#'
        clean = self.hashtag_pattern.sub(r'\1', clean)

        # 4. English contractions
        lower_clean = clean.lower()
        for contraction, expansion in ENGLISH_CONTRACTIONS.items():
            lower_clean = re.sub(rf'\b{re.escape(contraction)}\b', expansion, lower_clean)

        # 5. Normalize repeated characters (e.g. 'sooo' -> 'soo')
        lower_clean = self.elongation_pattern.sub(r'\1\1', lower_clean)

        # 6. Normalize Romanized Hinglish vocabulary
        words = re.findall(r'\b\w+\b|[^\w\s]', lower_clean)
        normalized_words: List[str] = []
        hinglish_tokens_matched = 0

        for word in words:
            if word in HINGLISH_LEXICON:
                normalized_words.append(HINGLISH_LEXICON[word])
                hinglish_tokens_matched += 1
            else:
                normalized_words.append(word)

        normalized_text = " ".join(normalized_words)
        normalized_text = self.whitespace_pattern.sub(" ", normalized_text).strip()

        # Metadata
        script_info = self.detect_scripts(original_text)
        metadata = {
            "original_length": len(original_text),
            "normalized_length": len(normalized_text),
            "crisis_flag": has_crisis,
            "hinglish_tokens_count": hinglish_tokens_matched,
            "is_hinglish": script_info["code_mixed"] or hinglish_tokens_matched >= 1,
            "scripts": script_info
        }

        return normalized_text, metadata


# Global singleton instance
normalizer = HinglishNormalizer()

