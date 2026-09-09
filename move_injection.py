import re

with open("apps/backend/src/main/resources/db/migration/V3__import_popular_chefs.sql", "r") as f:
    lines = f.readlines()

new_lines = []
injected = False
for line in lines:
    if line.startswith("INSERT INTO foodme.\"order\"") and not injected:
        # replace the note with the prompt injection
        # id, number, status, address_id, receiver_name, receiver_phone_number, receiver_email, chef_id, note... wait, in V3 we don't insert note?
        # Let's check V3 schema usage.
        pass
