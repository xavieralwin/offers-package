import re

with open('data/offers.js', 'r', encoding='utf-8') as f:
    text = f.read()

merchants = [
    'Opus Bar & Grill',
    'Il Cielo',
    'D9 Cakery',
    'voco Orchard'
]

for m in merchants:
    matches = re.findall(rf'\{{\s*"offerNumber":\s*(\d+).*?"merchantName":\s*"([^"]*{m}[^"]*)".*?"offerName":\s*"([^"]+)"', text, re.DOTALL)
    print(f"Merchant '{m}':")
    for o_num, m_name, o_name in matches:
        print(f"  Offer {o_num}: [{m_name}] - {o_name}")
