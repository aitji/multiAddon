import json
from itertools import combinations

features = [
    {"folder_name": "inv", "name": "§l§eINVENTORY\n§r§fsync player inventory! (§9multiplayer§f)"},
    {"folder_name": "hp", "name": "§l§cHEALTH\n§r§fsync player health! (§9multiplayer§f)"},
    {"folder_name": "harvest", "name": "§l§6HARVEST\n§r§fquick harvest all da crop!"},
    {"folder_name": "light", "name": "§l§9DYNAMIC LIGHT\n§r§fhold torch is so bright"},
    # {"folder_name": "sleep", "name": "§l§bSLEEP\n§r§fone player sleep is fine! (§9multiplayer§f)"},
    {"folder_name": "sort", "name": "§l§6SORT\n§r§fsort chest with stick"},
    {"folder_name": "durability", "name": "§l§aDURABILITY\n§r§fdisplay item durability!"},
    {"folder_name": "float", "name": "§l§dFLOAT\n§r§fdisplay item nameTag on floor! (§cpreferment warning§f)"}
]

def combine_features(features):
    combined = []
    for feature in features:
        combined.append({
            "folder_name": feature['folder_name'],
            "name": feature['name'],
            "memory_tier": 1
        })
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

combined_features = combine_features(features)

manifest = {
  "format_version": 2,
  "header": {
    "description": "§fcreator§a: @aitji\n§7this addon support @stable(1.10.0)",
    "name": "§7Multi§f§lAddon!",
    "uuid": "c370b0a3-5b5d-46b7-9863-d0b326aaf4f8",
    "version": [1, 1, 4],
    "min_engine_version": [1, 19, 70]
  },
  "modules": [
    {
      "type": "data",
      "uuid": "95133aca-9b57-42ad-afd6-7f94bf30afcd",
      "version": [1, 0, 0]
    },
    {
      "type": "script",
      "uuid": "ebd5cbfa-1bf4-462c-bfd5-44bce4e79326",
      "version": [1, 0, 0],
      "entry": "scripts/src.js"
    }
  ],
  "subpacks": [
  ],
  "dependencies": [
    {
      "module_name": "@minecraft/server",
      "version": "1.10.0"
    }
  ]
}

manifest["subpacks"].extend(combined_features)

with open('manifest.json', 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print("manifest.json file has been created with the combined features, including standalone features.")
