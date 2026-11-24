import json

with open(r'C:\Users\Alwin\.gemini\antigravity\brain\ed1fb7da-4001-4dd9-a34d-9401e352e200\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for j in range(866, min(880, len(lines))):
    d = json.loads(lines[j])
    if d.get('source') == 'MODEL' and 'content' in d and 'Deleted' in d.get('content', ''):
        print("Found:", d.get('content'))
    elif d.get('source') == 'MODEL' and d.get('type') == 'GENERIC':
        c = d.get('content', '')
        if 'removed' in c.lower() or 'deleted' in c.lower() or 'offer 477' in c.lower():
            print(f"Index {j}: {c[:300]}")
