import re
import random

with open("apps/backend/src/main/resources/db/migration/V3__import_popular_chefs.sql", "r") as f:
    sql = f.read()

# Replace names
replacements = [
    ("Kristine Avagyan", "Chef Anna"),
    ("Քրիստինե Ավագյան", "Խոհարար Աննա"),
    ("Кристина Авагян", "Шеф Анна"),
    ("Star Bakery", "Star Treats"),
    ("Սթար Բեյքրի", "Սթար Տրիտս"),
    ("Стар Бейкри", "Стар Тритс"),
    ("Hasmik Arakelyan", "Chef Bella"),
    ("Հասմիկ Առաքելյան", "Խոհարար Բելլա"),
    ("Асмик Аракелян", "Шеф Белла"),
    ("Sweetberg&kitchen", "Sweet Kitchen"),
    ("Sofya Petrosyan", "Chef Chloe"),
    ("Սոֆյա Պետրոսյան", "Խոհարար Քլոե"),
    ("София Петросян", "Шеф Хлоя"),
    ("OMAKASE SUSHI", "Tokyo Sushi"),
    ("Irma Asatryan", "Chef Diana"),
    ("Իրմա Ասատրյան", "Խոհարար Դիանա"),
    ("Ирма Асатрян", "Шеф Диана"),
    ("Irmas Corner", "Diana's Corner"),
    ("Samvel Arshakyan", "Chef Eric"),
    ("Սամվել Արշակյան", "Խոհարար Էրիկ"),
    ("Самвел Аршакян", "Шеф Эрик"),
    ("SAM KHINKALI", "Georgian Khinkali"),
]

for old, new in replacements:
    sql = sql.replace(old, new)

# Anonymize emails
sql = re.sub(r"'[^@'\s]+@[^'\s]+\.[^'\s]+'", r"'user_' || trunc(random()*10000) || '@example.com'", sql)

# Anonymize phone numbers (+374...)
sql = re.sub(r"'\+374[0-9]{8}'", r"'+37499' || trunc(random()*1000000)", sql)

# Anonymize receiver_name in orders (the 5th value in the INSERT INTO foodme."order" list)
# Actually it's easier to just do a simple replacement for common names if we can, or regex
# INSERT INTO foodme."order" (id, number, status, address_id, receiver_name, receiver_phone_number, receiver_email, chef_id) VALUES (403, '892780', 'DELIVERED', 403, 'Lid', '+37455828230', NULL, 12)
# We can regex the receiver_name.
import ast
lines = sql.split("\n")
new_lines = []
for line in lines:
    if line.startswith("INSERT INTO foodme.\"order\""):
        # Very hacky parsing for SQL VALUES (...)
        match = re.search(r"VALUES \((.*)\) ON CONFLICT", line)
        if match:
            vals_str = match.group(1)
            # split by comma but respect quotes
            # since we know the schema: id, number, status, address_id, receiver_name, receiver_phone_number, receiver_email, chef_id
            parts = re.split(r",(?=(?:[^']*'[^']*')*[^']*$)", vals_str)
            if len(parts) >= 8:
                parts[4] = "'Customer'"
            new_vals_str = ",".join(parts)
            line = line.replace(vals_str, new_vals_str)
    elif line.startswith("INSERT INTO foodme.address"):
        # id, city, street, building, apartment, note
        match = re.search(r"VALUES \((.*)\) ON CONFLICT", line)
        if match:
            vals_str = match.group(1)
            parts = re.split(r",(?=(?:[^']*'[^']*')*[^']*$)", vals_str)
            if len(parts) >= 6:
                parts[2] = "'Main Street'"
                if parts[5].strip() != "NULL":
                    parts[5] = "'Leave at door'"
            new_vals_str = ",".join(parts)
            line = line.replace(vals_str, new_vals_str)
    new_lines.append(line)

sql = "\n".join(new_lines)
with open("apps/backend/src/main/resources/db/migration/V3__import_popular_chefs.sql", "w") as f:
    f.write(sql)
