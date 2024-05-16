from itertools import combinations

features = [
    {"folder_name": "inv", "name": "§l§eINVENTORY\n§r§fsync player inventory!"},
    {"folder_name": "hp", "name": "§l§cHEALTH\n§r§fsync player health!"},
    {"folder_name": "harvest", "name": "§l§6HARVEST\n§r§fquick harvest all da crop!"},
    {"folder_name": "light", "name": "§l§9DYNAMIC LIGHT\n§r§fhold torch is so bright"},
    {"folder_name": "sleep", "name": "§l§bSLEEP\n§r§fone player sleep is fine!"},
    {"folder_name": "sort", "name": "§l§6SORT\n§r§fsort chest with stick"}
]

def combine_features(features):
    combined = []
    for r in range(2, len(features) + 1):
        for combo in combinations(features, r):
            folder_name = "_".join([f['folder_name'] for f in combo])
            names = [f['name'] for f in combo]
            combined_name = " §f& ".join([name.split("\n")[0] for name in names])
            details = "\n".join(["\n".join(name.split("\n")[1:]) for name in names])
            combined.append({
                "folder_name": folder_name,
                "name": f"{combined_name}\n§r{details}",
                "memory_tier": 1
            })
    return combined

result = combine_features(features)

import json
print(json.dumps(result, indent=2, ensure_ascii=False))