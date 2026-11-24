import json

with open(r'C:\Users\Alwin\.gemini\antigravity\brain\ed1fb7da-4001-4dd9-a34d-9401e352e200\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    data = json.loads(line)
    if data.get('source') == 'USER_EXPLICIT':
        content = data.get('content', '')
        if any(w in content.lower() for w in ['hide', 'remove', 'delete']):
            print(f"User line {i}: {content[:100]}...")
