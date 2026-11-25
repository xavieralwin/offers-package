import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Find how offers are filtered
lines = text.splitlines()
for i, line in enumerate(lines):
    if any(k in line for k in ['filter', 'validFrom', 'validTo', 'hidden', 'isLive', 'isUpcoming', 'isExpired']):
        print(f"Line {i+1}: {line.strip()[:100]}")
