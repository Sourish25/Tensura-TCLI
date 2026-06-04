import requests
import json

API_URL = "https://tensura.fandom.com/wiki/api.php"

def get_subcats(cat_name):
    params = {
        "action": "query",
        "list": "categorymembers",
        "cmtitle": cat_name,
        "cmlimit": "max",
        "format": "json"
    }
    r = requests.get(API_URL, params=params)
    if r.status_code == 200:
        data = r.json()
        print(f"DEBUG {cat_name}: {data}")
        return [m["title"] for m in data.get("query", {}).get("categorymembers", [])]
    return []

def main():
    print("Subcategories of Category:Skills by type:")
    for sub in get_subcats("Category:Skills by type"):
        print(f"  - {sub}")
        
    print("\nSubcategories of Category:Skills by characteristic:")
    for sub in get_subcats("Category:Skills by characteristic"):
        print(f"  - {sub}")

if __name__ == "__main__":
    main()
