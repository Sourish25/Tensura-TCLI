import requests
from bs4 import BeautifulSoup
import json
import os
import time
import sys
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

API_URL = "https://tensura.fandom.com/api.php"

# Seed Categories
CATEGORIES = {
    "skills": [
        "Category:Common skills",
        "Category:Extra skills",
        "Category:Intrinsic skills",
        "Category:Other skills",
        "Category:Resist skills",
        "Category:Subskills",
        "Category:Ultimate skills",
        "Category:Unique skills",
        "Category:Game Original Skills"
    ],
    "magic": [
        "Category:Aspectual magic",
        "Category:Dark magic",
        "Category:Elemental magic",
        "Category:Game Original Magic",
        "Category:Holy magic",
        "Category:Illusion magic",
        "Category:Other magic",
        "Category:Physics magic",
        "Category:True Dragon magic"
    ],
    "species": [
        "Category:Species"
    ],
    "items": [
        "Category:Items",
        "Category:Equipment",
        "Category:Weapons",
        "Category:Metals",
        "Category:Game Original Items",
        "Category:Game Original Equipment"
    ]
}

# Global variables for thread safety
db = {}
state = {}
processed_counter = 0
total_pages = 0
lock = threading.Lock()
last_save_time = time.time()

def log(msg):
    sys.stdout.reconfigure(encoding='utf-8')
    print(msg)
    sys.stdout.flush()

def get_category_members_recursive(cat_name, visited=None):
    if visited is None:
        visited = set()
        
    if cat_name in visited:
        return []
    visited.add(cat_name)
    
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
        try:
            r = requests.get(API_URL, params=params, timeout=10)
            if r.status_code != 200:
                break
            data = r.json()
            members = data.get("query", {}).get("categorymembers", [])
            for m in members:
                if m["ns"] == 0:  # Main page namespace
                    pages.append(m["title"])
                elif m["ns"] == 14:  # Category namespace
                    subcats.append(m["title"])
                    
            if "continue" in data and "cmcontinue" in data["continue"]:
                params["cmcontinue"] = data["continue"]["cmcontinue"]
            else:
                break
        except Exception as e:
            log(f"Error fetching category {cat_name}: {e}")
            break
            
    # Recurse subcategories
    for subcat in subcats:
        pages.extend(get_category_members_recursive(subcat, visited))
        
    return list(set(pages))

def fetch_page_data(page_title):
    params = {
        "action": "parse",
        "page": page_title,
        "format": "json"
    }
    
    for attempt in range(3):
        try:
            # Short sleep before request to pace ourselves
            time.sleep(0.01)
            r = requests.get(API_URL, params=params, timeout=15)
            if r.status_code == 200:
                data = r.json()
                if "parse" in data:
                    return data["parse"]
            time.sleep(1)
        except Exception as e:
            time.sleep(2)
            
    return None

def parse_html_content(html_content, page_title):
    soup = BeautifulSoup(html_content, "html.parser")
    result = {
        "title": page_title,
        "infobox": {},
        "summary": "",
        "sections": {},
        "links": []
    }
    
    # Parse portable infobox
    ib_table = soup.find("aside", class_="portable-infobox")
    if ib_table:
        title_tag = ib_table.find("h2", class_="pi-title")
        if title_tag:
            result["infobox"]["title"] = title_tag.get_text(strip=True)
        else:
            result["infobox"]["title"] = page_title
            
        for group in ib_table.find_all("div", class_="pi-item"):
            label_tag = group.find("h3", class_="pi-data-label")
            val_tag = group.find("div", class_="pi-data-value")
            if label_tag and val_tag:
                label = label_tag.get_text(strip=True)
                val = val_tag.get_text(strip=True)
                result["infobox"][label] = val
                
    # Extract links
    for link in soup.find_all("a"):
        href = link.get("href")
        if href and href.startswith("/wiki/") and not ":" in href:
            linked_title = href.replace("/wiki/", "").replace("_", " ")
            import urllib.parse
            linked_title = urllib.parse.unquote(linked_title)
            if linked_title not in result["links"]:
                result["links"].append(linked_title)

    # Parse content sections
    parser_output = soup.find("div", class_="mw-parser-output")
    if not parser_output:
        parser_output = soup
        
    current_section = "Summary"
    result["sections"][current_section] = []
    
    for child in parser_output.children:
        if child.name == "aside" or (child.name == "div" and "portable-infobox" in child.get("class", [])):
            continue
            
        if child.name in ["h2", "h3", "h4"]:
            headline = child.find("span", class_="mw-headline")
            if headline:
                current_section = headline.get_text(strip=True)
            else:
                current_section = child.get_text(strip=True)
            
            if current_section.endswith("[edit]"):
                current_section = current_section[:-6]
                
            result["sections"][current_section] = []
        elif child.name == "p":
            text = child.get_text(strip=True)
            if text:
                result["sections"][current_section].append(text)
        elif child.name in ["ul", "ol"]:
            items = []
            for li in child.find_all("li"):
                text = li.get_text(strip=True)
                if text:
                    items.append(text)
            if items:
                result["sections"][current_section].append(items)
                
    # Extract Summary
    summary_paragraphs = result["sections"].get("Summary", [])
    if summary_paragraphs:
        result["summary"] = "\n".join([p if isinstance(p, str) else "\n".join(p) for p in summary_paragraphs])
        
    # Clean up empty sections
    result["sections"] = {k: v for k, v in result["sections"].items() if v}
    
    return result

def save_dbs_and_checkpoint():
    global last_save_time
    for g in CATEGORIES.keys():
        with open(f"data/{g}.json", "w", encoding="utf-8") as f:
            json.dump(db[g], f, indent=4)
    with open("scraper_data/crawler_state.json", "w", encoding="utf-8") as f:
        json.dump(state, f, indent=4)
    last_save_time = time.time()
    log(f"💾 Checkpoint saved. Progress: {processed_counter}/{total_pages}")

def process_page(group, page):
    global processed_counter, last_save_time
    
    # Pre-check before HTTP request to avoid redundant fetches
    with lock:
        if page in state["processed"] or page in state["failed"]:
            processed_counter += 1
            return
            
    parse_data = fetch_page_data(page)
    
    with lock:
        if parse_data:
            html_content = parse_data.get("text", {}).get("*", "")
            parsed = parse_html_content(html_content, page)
            db[group][page] = parsed
            state["processed"].append(page)
            log(f"[{group.upper()}] Scraped: {page} ({processed_counter + 1}/{total_pages})")
        else:
            state["failed"].append(page)
            log(f"❌ Failed: {page} ({processed_counter + 1}/{total_pages})")
            
        processed_counter += 1
        
        # Periodic saving (every 20 pages or every 15 seconds)
        if processed_counter % 20 == 0 or (time.time() - last_save_time) > 15:
            save_dbs_and_checkpoint()

def main():
    global db, state, processed_counter, total_pages
    os.makedirs("scraper_data", exist_ok=True)
    os.makedirs("data", exist_ok=True)
    
    todo_file = "scraper_data/todo_list.json"
    state_file = "scraper_data/crawler_state.json"
    
    # Load todo list
    if os.path.exists(todo_file):
        with open(todo_file, "r", encoding="utf-8") as f:
            todo = json.load(f)
        log("Loaded pre-existing todo list.")
    else:
        todo = {}
        log("Building todo lists by traversing categories...")
        for group, cats in CATEGORIES.items():
            todo[group] = []
            visited = set()
            for cat in cats:
                members = get_category_members_recursive(cat, visited)
                todo[group].extend(members)
            todo[group] = list(set(todo[group]))
            log(f"Group '{group}' unique page count: {len(todo[group])}")
            
        with open(todo_file, "w", encoding="utf-8") as f:
            json.dump(todo, f, indent=4)
        log("Saved todo lists.")
        
    # Load state/checkpoints
    if os.path.exists(state_file):
        with open(state_file, "r", encoding="utf-8") as f:
            state = json.load(f)
        log("Loaded current crawler progress from checkpoint.")
    else:
        state = {
            "processed": [],
            "failed": []
        }
        
    # Load existing scraped data
    for group in CATEGORIES.keys():
        file_path = f"data/{group}.json"
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                db[group] = json.load(f)
        else:
            db[group] = {}
            
    total_pages = sum(len(pages) for pages in todo.values())
    
    # Calculate what tasks we actually need to execute
    tasks = []
    for group, pages in todo.items():
        for page in pages:
            if page not in state["processed"] and page not in state["failed"]:
                tasks.append((group, page))
                
    processed_counter = total_pages - len(tasks)
    log(f"Total pages: {total_pages}. Already completed: {processed_counter}. Remaining to crawl: {len(tasks)}")
    
    if len(tasks) == 0:
        log("All pages already processed!")
        return
        
    # Run the worker threads concurrently
    # Fandom API is fast, 8 threads is a safe and high performance limit
    max_workers = 8
    log(f"Starting ThreadPoolExecutor with {max_workers} workers...")
    
    try:
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(process_page, group, page) for group, page in tasks]
            for future in as_completed(futures):
                # We handle exceptions inside the worker, but this captures any unexpected crashes
                try:
                    future.result()
                except Exception as e:
                    log(f"Thread execution error: {e}")
    except KeyboardInterrupt:
        log("\nCrawl interrupted by user. Saving progress...")
    finally:
        with lock:
            save_dbs_and_checkpoint()
        log(f"🏁 Scraping complete! Processed: {processed_counter}/{total_pages}. Failed: {len(state['failed'])}.")

if __name__ == "__main__":
    main()
