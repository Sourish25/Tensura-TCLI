import requests
import json
import os

API_URL = "https://tensura.fandom.com/api.php"

def get_category_members(category_name):
    print(f"Fetching members for: {category_name}")
    params = {
        "action": "query",
        "list": "categorymembers",
        "cmtitle": category_name,
        "cmlimit": "max",
        "format": "json"
    }
    
    members = []
    while True:
        response = requests.get(API_URL, params=params)
        if response.status_code != 200:
            print(f"Error: status code {response.status_code}")
            break
            
        data = response.json()
        if "query" in data and "categorymembers" in data["query"]:
            members.extend(data["query"]["categorymembers"])
            
        if "continue" in data and "cmcontinue" in data["continue"]:
            params["cmcontinue"] = data["continue"]["cmcontinue"]
        else:
            break
            
    return members

def main():
    os.makedirs("scraper_data", exist_ok=True)
    
    categories = [
        "Category:Skills",
        "Category:Magic",
        "Category:Species"
    ]
    
    summary = {}
    for cat in categories:
        members = get_category_members(cat)
        summary[cat] = {
            "total_count": len(members),
            "subcategories": [m for m in members if m["ns"] == 14], # Namespace 14 is Category
            "pages": [m for m in members if m["ns"] == 0]          # Namespace 0 is Main page
        }
        print(f"Category {cat}: {len(members)} members total. Pages: {len(summary[cat]['pages'])}, Subcats: {len(summary[cat]['subcategories'])}")
        
    with open("scraper_data/explore_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=4)
    print("Saved explore summary to scraper_data/explore_summary.json")

if __name__ == "__main__":
    main()
