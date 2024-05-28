import os
from itertools import combinations

features = {
    "inv": "./inv.js",
    "hp": "./hp.js",
    "harvest": "./harvest.js",
    "light": "./light.js",
    # "sleep": "./sleep.js",
    "sort": "./sort.js",
    "durability": "./durability.js",
    "float": "./float.js"
}

base_dir = 'subpacks'
if not os.path.exists(base_dir):
    os.makedirs(base_dir)
    print(f"Created base directory: {base_dir}")

def create_combinations(features):
    for r in range(1, len(features) + 1):
        print(f"Generating combinations of length: {r}")
        for combo in combinations(features.keys(), r):
            folder_name = "_".join(combo)
            folder_path = os.path.join(base_dir, folder_name, 'scripts')
            os.makedirs(folder_path, exist_ok=True)
            print(f"Created directory: {folder_path}")

            src_file_path = os.path.join(folder_path, 'src.js')
            with open(src_file_path, 'w') as f:
                print(f"Writing to file: {src_file_path}")
                for feature in combo:
                    import_statement = f'import "{features[feature]}";\n'
                    f.write(import_statement)
                    print(f"  Added import: {import_statement.strip()}")
                f.write("import \"./actionbar.js\"")

create_combinations(features)

print("File structure and src.js files created successfully.")