#!/usr/bin/env python3
"""Extract 6 ACTIVE chefs (+ dishes/tags/additions) from a bychef pg_dump
into foodme seed SQL.

Chef display names are course-friendly kitchen brands (not real PII).
Images are served by the backend from Postgres (apps/backend/src/main/resources/img-seed
← bychef CDN downloads, loaded into foodme.image on first start).
"""

from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

# Top ACTIVE chefs by dish count (excluding the "For testing" account).
CHOSEN_CHEF_IDS = [24, 32, 17, 39, 28, 21]

# API-relative base the browser uses to load images from the backend.
IMAGE_API_BASE = "/api/images"
BYCHEF_CDN = "https://static.bychef.am/"

# Course kitchen brands — personal PII stripped; contacts stay fake.
FAKE_IDENTITY = {
    24: {
        "username": "alans_kitchen",
        "full_name_en": "Alans Kitchen",
        "full_name_am": "Alans Kitchen",
        "full_name_ru": "Alans Kitchen",
        "kitchen_en": "Alans Kitchen",
        "kitchen_am": "Alans Kitchen",
        "kitchen_ru": "Alans Kitchen",
        "description_en": "Comfort food from Alans Kitchen.",
        "description_am": "Comfort food from Alans Kitchen.",
        "description_ru": "Comfort food from Alans Kitchen.",
        "email": "chef1@example.com",
        "phone_number": "+37499110001",
        "avatar_url": f"{IMAGE_API_BASE}/chefs/24/avatar.jpeg",
        "banner_url": None,
    },
    32: {
        "username": "italiano_margarino",
        "full_name_en": "Italiano Margarino",
        "full_name_am": "Italiano Margarino",
        "full_name_ru": "Italiano Margarino",
        "kitchen_en": "Italiano Margarino",
        "kitchen_am": "Italiano Margarino",
        "kitchen_ru": "Italiano Margarino",
        "description_en": "Italian-inspired dishes from Italiano Margarino.",
        "description_am": "Italian-inspired dishes from Italiano Margarino.",
        "description_ru": "Italian-inspired dishes from Italiano Margarino.",
        "email": "chef2@example.com",
        "phone_number": "+37499110002",
        "avatar_url": f"{IMAGE_API_BASE}/chefs/32/avatar.jpg",
        "banner_url": None,
    },
    17: {
        "username": "chef_verona",
        "full_name_en": "Chef Verona",
        "full_name_am": "Chef Verona",
        "full_name_ru": "Chef Verona",
        "kitchen_en": "Chef Verona",
        "kitchen_am": "Chef Verona",
        "kitchen_ru": "Chef Verona",
        "description_en": "Sweet treats from Chef Verona.",
        "description_am": "Sweet treats from Chef Verona.",
        "description_ru": "Sweet treats from Chef Verona.",
        "email": "chef3@example.com",
        "phone_number": "+37499110003",
        "avatar_url": f"{IMAGE_API_BASE}/chefs/17/avatar.jpg",
        "banner_url": None,
    },
    39: {
        "username": "argentinean",
        "full_name_en": "Argentinean",
        "full_name_am": "Argentinean",
        "full_name_ru": "Argentinean",
        "kitchen_en": "Argentinean",
        "kitchen_am": "Argentinean",
        "kitchen_ru": "Argentinean",
        "description_en": "Grill and classics from Argentinean kitchen.",
        "description_am": "Grill and classics from Argentinean kitchen.",
        "description_ru": "Grill and classics from Argentinean kitchen.",
        "email": "chef4@example.com",
        "phone_number": "+37499110004",
        "avatar_url": f"{IMAGE_API_BASE}/chefs/39/avatar.jpg",
        "banner_url": None,
    },
    28: {
        "username": "armenian_traditional",
        "full_name_en": "Armenian Traditional",
        "full_name_am": "Armenian Traditional",
        "full_name_ru": "Armenian Traditional",
        "kitchen_en": "Armenian Traditional",
        "kitchen_am": "Armenian Traditional",
        "kitchen_ru": "Armenian Traditional",
        "description_en": "Homestyle Armenian dishes.",
        "description_am": "Homestyle Armenian dishes.",
        "description_ru": "Homestyle Armenian dishes.",
        "email": "chef5@example.com",
        "phone_number": "+37499110005",
        "avatar_url": f"{IMAGE_API_BASE}/chefs/28/avatar.jpg",
        "banner_url": None,
    },
    21: {
        "username": "sakura_kitchen",
        "full_name_en": "Sakura Kitchen",
        "full_name_am": "Sakura Kitchen",
        "full_name_ru": "Sakura Kitchen",
        "kitchen_en": "Sakura Kitchen",
        "kitchen_am": "Sakura Kitchen",
        "kitchen_ru": "Sakura Kitchen",
        "description_en": "Fresh rolls and bowls from Sakura Kitchen.",
        "description_am": "Fresh rolls and bowls from Sakura Kitchen.",
        "description_ru": "Fresh rolls and bowls from Sakura Kitchen.",
        "email": "chef6@example.com",
        "phone_number": "+37499110006",
        "avatar_url": f"{IMAGE_API_BASE}/chefs/21/avatar.jpg",
        "banner_url": None,
    },
}

DEFAULT_DELIVERY_PRICE = 500.0
DEFAULT_FREE_DELIVERY_FROM = 5000.0


def to_image_url(url: str | None) -> str | None:
    """Map a bychef CDN URL onto the API-relative image path."""
    if not url:
        return None
    if url.startswith(BYCHEF_CDN):
        return f"{IMAGE_API_BASE}/{url[len(BYCHEF_CDN):]}"
    if url.startswith(IMAGE_API_BASE):
        return url
    m = re.search(r"/chefs/(.+)$", url)
    if m:
        return f"{IMAGE_API_BASE}/chefs/{m.group(1)}"
    return url


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


def sql_str(value) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if isinstance(value, float):
            return str(value)
        return str(value)
    s = str(value).replace("'", "''")
    # Truncate to stay within foodme column limits.
    return f"'{s}'"


def sql_str_max(value, max_len: int) -> str:
    if value is None:
        return "NULL"
    s = str(value)
    if len(s) > max_len:
        s = s[: max_len - 1] + "…"
    return sql_str(s)


def load_backup(path: Path):
    chefs = {}
    dishes = {}
    dish_tags = {}  # id -> tag code
    tag_translations = defaultdict(dict)  # tag_id -> {lang: value}
    dish_additions = {}  # id -> row
    dish_dish_addition = []  # (dish_id, addition_id, overrided_price)
    dish_dish_tag = []  # (dish_id, tag_id)

    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if line.startswith("INSERT INTO by_chef.chef VALUES"):
            v = parse_values(line)
            chefs[v[0]] = {
                "id": v[0],
                "email": v[1],
                "status": v[2],
                "phone_number": v[3],
                "avatar_url": v[4],
                "description_am": v[6],
                "description_en": v[7],
                "description_ru": v[8],
                "full_name_am": v[9],
                "full_name_en": v[10],
                "full_name_ru": v[11],
                "kitchen_en": v[12],
                "kitchen_am": v[13],
                "kitchen_ru": v[14],
                "rating": v[16] if v[16] is not None else 0.0,
                "platform_fee": v[17] if v[17] is not None else 0.0,
                "username": v[19],
                "priority_index": v[20] if v[20] is not None else 0,
                "banner_url": v[21],
            }
        elif line.startswith("INSERT INTO by_chef.dish VALUES"):
            v = parse_values(line)
            dishes[v[0]] = {
                "id": v[0],
                "price": v[1] if v[1] is not None else 0.0,
                "name_am": v[3],
                "name_en": v[4],
                "name_ru": v[5],
                "url": v[6],
                "chef_id": v[7],
                "portion_am": v[11],
                "portion_ru": v[12],
                "portion_en": v[13],
                "status": v[14],
                "minimum_order_count": v[16] if v[16] is not None else 1,
                "dish_tag_id": v[17],
                "priority_index": v[18] if v[18] is not None else 0,
            }
        elif line.startswith("INSERT INTO by_chef.dish_tag VALUES"):
            v = parse_values(line)
            dish_tags[v[0]] = v[1]
        elif line.startswith("INSERT INTO by_chef.dish_tag_translation VALUES"):
            v = parse_values(line)
            tag_translations[v[0]][v[2]] = v[1]
        elif line.startswith("INSERT INTO by_chef.dish_addition VALUES"):
            v = parse_values(line)
            dish_additions[v[0]] = {
                "id": v[0],
                "name_en": v[1],
                "name_ru": v[2],
                "name_am": v[3],
                "price": v[4] if v[4] is not None else 0.0,
                "chef_id": v[5],
                "status": v[6],
            }
        elif line.startswith("INSERT INTO by_chef.dish_dish_addition VALUES"):
            v = parse_values(line)
            dish_dish_addition.append((v[0], v[1], v[2]))
        elif line.startswith("INSERT INTO by_chef.dish_dish_tag VALUES"):
            v = parse_values(line)
            dish_dish_tag.append((v[0], v[1]))

    return {
        "chefs": chefs,
        "dishes": dishes,
        "dish_tags": dish_tags,
        "tag_translations": tag_translations,
        "dish_additions": dish_additions,
        "dish_dish_addition": dish_dish_addition,
        "dish_dish_tag": dish_dish_tag,
    }


def humanize_tag(code: str) -> str:
    return code.replace("_", " ").title() if code else "Other"


def emit_seed(data) -> str:
    chefs = data["chefs"]
    dishes = data["dishes"]
    tag_translations = data["tag_translations"]
    dish_tags = data["dish_tags"]
    dish_additions = data["dish_additions"]
    dish_dish_addition = data["dish_dish_addition"]
    dish_dish_tag = data["dish_dish_tag"]

    chosen = set(CHOSEN_CHEF_IDS)
    for cid in CHOSEN_CHEF_IDS:
        if cid not in chefs or chefs[cid]["status"] != "ACTIVE":
            raise SystemExit(f"Chosen chef {cid} missing or not ACTIVE")

    selected_dishes = {
        did: d
        for did, d in dishes.items()
        if d["chef_id"] in chosen and d["status"] == "ACTIVE"
    }

    # Tags used by selected dishes (prefer junction, fall back to dish.dish_tag_id).
    tags_needed = set()
    dish_primary_tag = {}
    tags_by_dish = defaultdict(list)
    for dish_id, tag_id in dish_dish_tag:
        if dish_id in selected_dishes:
            tags_by_dish[dish_id].append(tag_id)
            tags_needed.add(tag_id)
    for did, d in selected_dishes.items():
        if tags_by_dish[did]:
            dish_primary_tag[did] = tags_by_dish[did][0]
        elif d["dish_tag_id"]:
            dish_primary_tag[did] = d["dish_tag_id"]
            tags_needed.add(d["dish_tag_id"])

    lines = []
    lines.append("-- Seed generated from db_backup_2026-02-10.sql")
    lines.append("-- 6 ACTIVE chefs; generic chef/kitchen names; dish catalog kept.")
    lines.append("")

    # Admin (bcrypt hash for 'admin' — same as prior V2 seed)
    lines.append("-- Admin")
    lines.append(
        "INSERT INTO foodme.admin (id, username, password_hash, role) VALUES "
        "(1, 'admin', '$2y$10$oMkXATQDgiPBCh29e2u7ROJkWXECjE2kmHPwCpJGAvkf3TuFbnZCi', 'ADMIN');"
    )
    lines.append("")

    # Dish tags
    lines.append("-- Dish tags")
    for tid in sorted(tags_needed):
        tr = tag_translations.get(tid, {})
        fallback = humanize_tag(dish_tags.get(tid, f"Tag {tid}"))
        name_en = tr.get("en") or fallback
        name_am = tr.get("hy") or tr.get("am") or name_en
        name_ru = tr.get("ru") or name_en
        lines.append(
            "INSERT INTO foodme.dish_tag (id, name_en, name_am, name_ru) VALUES "
            f"({tid}, {sql_str(name_en)}, {sql_str(name_am)}, {sql_str(name_ru)});"
        )
    lines.append("")

    # Chefs
    lines.append("-- Chefs (generic names, kitchens, descriptions, contacts, local logos)")
    for cid in CHOSEN_CHEF_IDS:
        c = chefs[cid]
        fake = FAKE_IDENTITY[cid]
        lines.append(
            "INSERT INTO foodme.chef ("
            "id, username, phone_number, email, avatar_url, banner_url, status, "
            "full_name_en, full_name_am, full_name_ru, "
            "description_en, description_am, description_ru, "
            "kitchen_en, kitchen_am, kitchen_ru, "
            "rating, platform_fee, delivery_price, free_delivery_from, priority_index"
            ") VALUES ("
            f"{cid}, {sql_str(fake['username'])}, {sql_str(fake['phone_number'])}, "
            f"{sql_str(fake['email'])}, {sql_str(fake['avatar_url'])}, {sql_str(fake['banner_url'])}, "
            f"'ACTIVE', {sql_str(fake['full_name_en'])}, {sql_str(fake['full_name_am'])}, "
            f"{sql_str(fake['full_name_ru'])}, "
            f"{sql_str(fake['description_en'])}, {sql_str(fake['description_am'])}, "
            f"{sql_str(fake['description_ru'])}, "
            f"{sql_str(fake['kitchen_en'])}, {sql_str(fake['kitchen_am'])}, "
            f"{sql_str(fake['kitchen_ru'])}, "
            f"{c['rating']}, {c['platform_fee']}, {DEFAULT_DELIVERY_PRICE}, "
            f"{DEFAULT_FREE_DELIVERY_FROM}, {c['priority_index']}"
            ");"
        )
    lines.append("")

    # Dishes — image URLs rewritten to API-relative paths
    lines.append("-- Dishes (image URLs)")
    for did in sorted(selected_dishes):
        d = selected_dishes[did]
        tag_id = dish_primary_tag.get(did)
        tag_sql = "NULL" if tag_id is None else str(tag_id)
        name_en = d["name_en"] or d["name_am"] or d["name_ru"] or f"Dish {did}"
        name_am = d["name_am"] or name_en
        name_ru = d["name_ru"] or name_en
        img = to_image_url(d["url"])
        lines.append(
            "INSERT INTO foodme.dish ("
            "id, name_en, name_am, name_ru, description_en, price, url, "
            "portion_en, portion_am, portion_ru, status, minimum_order_count, "
            "priority_index, chef_id, dish_tag_id"
            ") VALUES ("
            f"{did}, {sql_str(name_en)}, {sql_str(name_am)}, {sql_str(name_ru)}, NULL, "
            f"{d['price']}, {sql_str(img)}, "
            f"{sql_str(d['portion_en'])}, {sql_str(d['portion_am'])}, {sql_str(d['portion_ru'])}, "
            f"'ACTIVE', {d['minimum_order_count']}, {d['priority_index']}, "
            f"{d['chef_id']}, {tag_sql}"
            ");"
        )
    lines.append("")

    # chef_tag_order — unique tags per chef
    lines.append("-- Chef tag order")
    cto_id = 1
    chef_tags = defaultdict(set)
    for did, d in selected_dishes.items():
        tag_id = dish_primary_tag.get(did)
        if tag_id is not None:
            chef_tags[d["chef_id"]].add(tag_id)
    for cid in CHOSEN_CHEF_IDS:
        for idx, tag_id in enumerate(sorted(chef_tags[cid])):
            lines.append(
                "INSERT INTO foodme.chef_tag_order (id, chef_id, dish_tag_id, priority_index) VALUES "
                f"({cto_id}, {cid}, {tag_id}, {idx});"
            )
            cto_id += 1
    lines.append("")

    # Dish additions — flatten junction into per-dish rows (ACTIVE only)
    lines.append("-- Dish additions")
    addition_out_id = 1
    for dish_id, addition_id, overrided_price in dish_dish_addition:
        if dish_id not in selected_dishes:
            continue
        add = dish_additions.get(addition_id)
        if not add or add["status"] not in (None, "ACTIVE"):
            continue
        name_en = add["name_en"] or add["name_am"] or add["name_ru"]
        if not name_en:
            continue
        name_am = add["name_am"] or name_en
        name_ru = add["name_ru"] or name_en
        price = overrided_price if overrided_price is not None else add["price"]
        lines.append(
            "INSERT INTO foodme.dish_addition (id, name_en, name_am, name_ru, price, dish_id) VALUES "
            f"({addition_out_id}, {sql_str(name_en)}, {sql_str(name_am)}, {sql_str(name_ru)}, "
            f"{price}, {dish_id});"
        )
        addition_out_id += 1
    lines.append("")

    # Sequences
    max_chef = max(CHOSEN_CHEF_IDS)
    max_dish = max(selected_dishes) if selected_dishes else 1
    max_tag = max(tags_needed) if tags_needed else 1
    lines.append("-- Sequences")
    lines.append(f"SELECT setval('foodme.chef_id_seq', {max_chef + 1}, false);")
    lines.append(f"SELECT setval('foodme.dish_id_seq', {max_dish + 1}, false);")
    lines.append(f"SELECT setval('foodme.dish_tag_id_seq', {max_tag + 1}, false);")
    lines.append(f"SELECT setval('foodme.chef_tag_order_id_seq', {cto_id}, false);")
    lines.append(f"SELECT setval('foodme.dish_addition_id_seq', {addition_out_id}, false);")
    lines.append("SELECT setval('foodme.address_id_seq', 1, false);")
    lines.append("SELECT setval('foodme.order_id_seq', 1, false);")
    lines.append("SELECT setval('foodme.order_dish_id_seq', 1, false);")
    lines.append("SELECT setval('foodme.order_dish_addition_id_seq', 1, false);")
    lines.append("SELECT setval('foodme.admin_id_seq', 2, false);")
    lines.append("SELECT setval('foodme.order_number_seq', 1, false);")
    lines.append("")

    lines.append(
        f"-- Summary: {len(CHOSEN_CHEF_IDS)} chefs, {len(selected_dishes)} dishes, "
        f"{len(tags_needed)} tags, {addition_out_id - 1} additions"
    )
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--backup",
        type=Path,
        default=Path.home() / "Downloads" / "db_backup_2026-02-10.sql",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("scripts/generated_seed.sql"),
    )
    args = parser.parse_args()
    if not args.backup.exists():
        print(f"Backup not found: {args.backup}", file=sys.stderr)
        sys.exit(1)
    data = load_backup(args.backup)
    sql = emit_seed(data)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(sql, encoding="utf-8")
    print(f"Wrote {args.out} ({len(sql.splitlines())} lines)")


if __name__ == "__main__":
    main()
