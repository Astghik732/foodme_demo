#!/usr/bin/env python3
"""Download bychef static images for the 6 course chefs into the backend image seed
(apps/backend/src/main/resources/img-seed, loaded into foodme.image on first start).

Uses curl (more reliable through Cloudflare than urllib). Parallel workers.
"""

from __future__ import annotations

import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

CHOSEN = {24, 32, 17, 39, 28, 21}
BACKUP = Path.home() / "Downloads" / "db_backup_2026-02-10.sql"
SEED_ROOT = Path(__file__).resolve().parents[1] / "apps" / "backend" / "src" / "main" / "resources" / "img-seed"
WORKERS = 10


def parse_values(raw_line: str):
    m = re.search(r"VALUES\s*\((.*)\);\s*$", raw_line)
    if not m:
        return None
    raw = m.group(1)
    vals = []
    i = 0
    n = len(raw)
    while i < n:
        while i < n and raw[i] in " \t\n,":
            i += 1
        if i >= n:
            break
        if raw[i] == "'":
            i += 1
            buf = []
            while i < n:
                if raw[i] == "'":
                    if i + 1 < n and raw[i + 1] == "'":
                        buf.append("'")
                        i += 2
                    else:
                        i += 1
                        break
                else:
                    buf.append(raw[i])
                    i += 1
            vals.append("".join(buf))
        elif raw.startswith("NULL", i):
            vals.append(None)
            i += 4
        elif raw.startswith("true", i):
            vals.append(True)
            i += 4
        elif raw.startswith("false", i):
            vals.append(False)
            i += 5
        else:
            j = i
            while j < n and raw[j] not in ",":
                j += 1
            token = raw[i:j].strip()
            try:
                vals.append(float(token) if "." in token else int(token))
            except ValueError:
                vals.append(token)
            i = j
    return vals


def collect_urls(backup: Path) -> list[str]:
    urls: list[str] = []
    seen: set[str] = set()
    for line in backup.read_text(encoding="utf-8", errors="replace").splitlines():
        if line.startswith("INSERT INTO by_chef.chef VALUES"):
            v = parse_values(line)
            if v and v[0] in CHOSEN and v[4]:
                u = v[4]
                if u not in seen:
                    seen.add(u)
                    urls.append(u)
        if line.startswith("INSERT INTO by_chef.dish VALUES"):
            v = parse_values(line)
            if v and v[7] in CHOSEN and v[14] == "ACTIVE" and v[6]:
                u = v[6]
                if isinstance(u, str) and u.startswith("http") and u not in seen:
                    seen.add(u)
                    urls.append(u)
    return urls


def url_to_relpath(url: str) -> str | None:
    prefix = "https://static.bychef.am/"
    if url.startswith(prefix):
        return url[len(prefix) :]
    m = re.search(r"/chefs/(.+)$", url)
    return f"chefs/{m.group(1)}" if m else None


def download_one(url: str) -> tuple[str, bool, str]:
    rel = url_to_relpath(url)
    if not rel:
        return url, False, "bad path"
    dest = SEED_ROOT / rel
    if dest.exists() and dest.stat().st_size > 0:
        return url, True, "cached"
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".part")
    cmd = [
        "curl",
        "-fsSL",
        "--retry",
        "3",
        "--retry-delay",
        "1",
        "--connect-timeout",
        "15",
        "--max-time",
        "90",
        "-A",
        "Mozilla/5.0 (compatible; foodme-course-seed/1.2)",
        "-o",
        str(tmp),
        url,
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        if not tmp.exists() or tmp.stat().st_size == 0:
            return url, False, "empty"
        tmp.replace(dest)
        return url, True, "ok"
    except subprocess.CalledProcessError as exc:
        tmp.unlink(missing_ok=True)
        err = (exc.stderr or b"").decode("utf-8", errors="replace")[:200]
        return url, False, err or f"curl exit {exc.returncode}"


def main() -> int:
    if not BACKUP.exists():
        print(f"Backup not found: {BACKUP}", file=sys.stderr)
        return 1
    urls = collect_urls(BACKUP)
    SEED_ROOT.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {len(urls)} images → {SEED_ROOT} ({WORKERS} workers)")
    ok = fail = 0
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = [pool.submit(download_one, u) for u in urls]
        for i, fut in enumerate(as_completed(futures), 1):
            _url, success, msg = fut.result()
            if success:
                ok += 1
            else:
                fail += 1
                print(f"FAIL {_url}: {msg}", file=sys.stderr)
            if i % 40 == 0 or i == len(urls):
                print(f"  … {i}/{len(urls)} (ok={ok} fail={fail})")
    print(f"Done: ok={ok} fail={fail} under {SEED_ROOT}")
    return 0 if fail == 0 else (0 if ok > len(urls) // 2 else 1)


if __name__ == "__main__":
    raise SystemExit(main())
