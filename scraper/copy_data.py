import shutil
import os

def main():
    src_dir = "data"
    dest_dir = "game/public/data"
    
    os.makedirs(dest_dir, exist_ok=True)
    
    files = ["skills.json", "magic.json", "species.json", "items.json"]
    for file in files:
        src = os.path.join(src_dir, file)
        dest = os.path.join(dest_dir, file)
        
        if os.path.exists(src):
            shutil.copy2(src, dest)
            print(f"Copied {file} to {dest_dir}/")
        else:
            print(f"Warning: {src} not found, skipping copy.")
            
if __name__ == "__main__":
    main()
