import requests

API_URL = "https://tensura.fandom.com/api.php"

def get_category_members_recursive(cat_name, visited=None):
    if visited is None:
        visited = set()
        
    if cat_name in visited:
        return []
    visited.add(cat_name)
    
    print(f"Counting members of: {cat_name}")
    params = {
        "action": "query",
        "list": "categorymembers",
        "cmtitle": cat_name,
        "cmlimit": "max",
        "format": "json"
    }
    
    pages = []
    subcats = []
    
    while True:
        r = requests.get(API_URL, params=params)
        if r.status_code != 200:
            break
        data = r.json()
        members = data.get("query", {}).get("categorymembers", [])
        for m in members:
            if m["ns"] == 0:  # Main namespace (pages)
                pages.append(m["title"])
            elif m["ns"] == 14:  # Category namespace
                subcats.append(m["title"])
                
        if "continue" in data and "cmcontinue" in data["continue"]:
            params["cmcontinue"] = data["continue"]["cmcontinue"]
        else:
            break
            
    # For subcategories, we recursively fetch page titles
    for subcat in subcats:
        pages.extend(get_category_members_recursive(subcat, visited))
        
    return list(set(pages))

def main():
    skill_categories = [
        "Category:Common skills",
        "Category:Extra skills",
        "Category:Intrinsic skills",
        "Category:Other skills",
        "Category:Resist skills",
        "Category:Subskills",
        "Category:Ultimate skills",
        "Category:Unique skills",
        "Category:Game Original Skills"
    ]
    
    magic_categories = [
        "Category:Aspectual magic",
        "Category:Dark magic",
        "Category:Elemental magic",
        "Category:Game Original Magic",
        "Category:Holy magic",
        "Category:Illusion magic",
        "Category:Other magic",
        "Category:Physics magic",
        "Category:True Dragon magic"
    ]
    
    species_categories = [
        "Category:Species"
    ]
    
    print("--- Counting Skills ---")
    all_skills = []
    visited_cats = set()
    for cat in skill_categories:
        all_skills.extend(get_category_members_recursive(cat, visited_cats))
    all_skills = list(set(all_skills))
    print(f"Total unique Skills: {len(all_skills)}")
    
    print("\n--- Counting Magic ---")
    all_magic = []
    visited_cats = set()
    for cat in magic_categories:
        all_magic.extend(get_category_members_recursive(cat, visited_cats))
    all_magic = list(set(all_magic))
    print(f"Total unique Magic: {len(all_magic)}")
    
    print("\n--- Counting Species ---")
    all_species = []
    visited_cats = set()
    for cat in species_categories:
        all_species.extend(get_category_members_recursive(cat, visited_cats))
    all_species = list(set(all_species))
    print(f"Total unique Species: {len(all_species)}")

if __name__ == "__main__":
    main()
