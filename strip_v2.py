with open("apps/backend/src/main/resources/db/migration/V2__seed_data.sql", "r") as f:
    lines = f.readlines()

new_lines = []
skip = True # skip the first part (chefs)

for line in lines:
    if line.startswith("INSERT INTO foodme.dish_tag"):
        skip = False
    elif line.startswith("INSERT INTO foodme.chef_tag_order"):
        skip = True
    elif line.startswith("INSERT INTO foodme.admin"):
        skip = False
    elif line.startswith("INSERT INTO foodme.address"):
        skip = True
    elif line.startswith("SELECT setval"):
        skip = False

    if not skip:
        new_lines.append(line)

with open("apps/backend/src/main/resources/db/migration/V2__seed_data.sql", "w") as f:
    f.writelines(new_lines)
