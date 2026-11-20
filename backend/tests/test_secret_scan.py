"""Checkpoint 14: Secret and Credential Leakage Scanner.

Scans all git-tracked files in the repository to guarantee no secrets,
passwords, private keys, or API tokens are inadvertently committed.
"""

import os
import re
import subprocess
from pathlib import Path

# Common high-risk secret regex patterns
SECRET_PATTERNS = [
    (re.compile(r"sk-[a-zA-Z0-9_-]{32,}", re.IGNORECASE), "OpenAI API Key"),
    (re.compile(r"AIza[0-9A-Za-z-_]{35}", re.IGNORECASE), "Google API Key"),
    (re.compile(r"AQ\.[a-zA-Z0-9_-]{30,}", re.IGNORECASE), "Gemini Studio API Key"),
    (re.compile(r"AKIA[0-9A-Z]{16}"), "AWS Access Key ID"),
    (re.compile(r"-----BEGIN (?:RSA|EC|DSA|OPENSSH|PGP)?\s*PRIVATE KEY-----"), "Private Key Header"),
    (re.compile(r"ghp_[a-zA-Z0-9]{36}"), "GitHub Personal Access Token"),
    (re.compile(r"gho_[a-zA-Z0-9]{36}"), "GitHub OAuth Token"),
]

# Patterns or paths that are allowed (e.g. test dummy values or gitignored files)
EXCLUDED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".ico", ".svg", ".lock", ".db"}


def get_tracked_files() -> list[str]:
    """Retrieve all files tracked by git in the repository."""
    try:
        root_dir = Path(__file__).resolve().parent.parent.parent
        res = subprocess.run(
            ["git", "ls-files"],
            cwd=str(root_dir),
            capture_output=True,
            text=True,
            check=True,
        )
        return [f.strip() for f in res.stdout.splitlines() if f.strip()]
    except Exception:
        # Fallback if git is not in PATH
        return []


def test_repository_contains_no_committed_secrets():
    """Verify that zero tracked files contain leaked credentials or API keys."""
    root_dir = Path(__file__).resolve().parent.parent.parent
    tracked_files = get_tracked_files()
    assert len(tracked_files) > 0, "Git tracked files should be non-empty"

    leaks = []
    for rel_path in tracked_files:
        file_path = root_dir / rel_path
        if not file_path.exists() or file_path.suffix.lower() in EXCLUDED_EXTENSIONS:
            continue

        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception:
            continue

        for pattern, desc in SECRET_PATTERNS:
            match = pattern.search(content)
            if match:
                # Exclude known mock strings or test filenames
                matched_str = match.group(0)
                if "dummy" in matched_str.lower() or "test" in rel_path.lower():
                    continue
                leaks.append(f"{rel_path}: Found potential {desc} ({matched_str[:8]}...)")

    assert len(leaks) == 0, f"Secret leakage detected in git tracked files:\n" + "\n".join(leaks)


def test_env_files_are_strictly_git_ignored():
    """Verify that .env and backend/.env are ignored by git."""
    root_dir = Path(__file__).resolve().parent.parent.parent
    res = subprocess.run(
        ["git", "check-ignore", ".env", "backend/.env"],
        cwd=str(root_dir),
        capture_output=True,
        text=True,
    )
    ignored_files = [line.strip() for line in res.stdout.splitlines() if line.strip()]
    assert ".env" in ignored_files or any(f.endswith(".env") for f in ignored_files), ".env must be git-ignored"
    assert "backend/.env" in ignored_files or any("backend" in f for f in ignored_files), "backend/.env must be git-ignored"
