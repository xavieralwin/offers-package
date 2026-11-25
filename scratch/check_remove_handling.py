import json

with open(r'C:\Users\Alwin\.gemini\antigravity\brain\ed1fb7da-4001-4dd9-a34d-9401e352e200\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx in [531, 866]:
    print(f"\n--- Turn around index {idx} ---")
    for j in range(idx, min(idx + 15, len(lines))):
        d = json.loads(lines[j])
        if d.get('source') == 'MODEL' and d.get('type') == 'PLANNER_RESPONSE':
            for c in d.get('tool_calls', []):
                print(f"Tool call: {c.get('name')} {c.get('arguments', '')[:100]}")
        elif d.get('source') == 'MODEL' and 'content' in d:
            print(f"Content: {d.get('content')[:200]}")
