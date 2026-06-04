import requests
from bs4 import BeautifulSoup
import json

API_URL = "https://tensura.fandom.com/api.php"

def test_parse(page_title):
    print(f"Parsing page: {page_title}")
    params = {
        "action": "parse",
        "page": page_title,
        "format": "json"
    }
    
    r = requests.get(API_URL, params=params)
    if r.status_code != 200:
        print("Failed to fetch page")
        return
        
    data = r.json()
    if "parse" not in data or "text" not in data["parse"]:
        print("Page data not found")
        return
        
    html_content = data["parse"]["text"]["*"]
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Let's extract the infobox if it exists
    infobox = {}
    ib_table = soup.find("aside", class_="portable-infobox")
    if ib_table:
        # Fandom uses portable infoboxes (aside tag)
        title_tag = ib_table.find("h2", class_="pi-title")
        if title_tag:
            infobox["title"] = title_tag.get_text(strip=True)
            
        for group in ib_table.find_all("div", class_="pi-item"):
            label_tag = group.find("h3", class_="pi-data-label")
            val_tag = group.find("div", class_="pi-data-value")
            if label_tag and val_tag:
                label = label_tag.get_text(strip=True)
                val = val_tag.get_text(strip=True)
                infobox[label] = val
                
    print("Infobox:", json.dumps(infobox, indent=2))
    
    # Let's extract heading text
    sections = {}
    current_section = "Introduction"
    sections[current_section] = []
    
    # Iterate through direct children of soup or mw-parser-output
    parser_output = soup.find("div", class_="mw-parser-output")
    if not parser_output:
        parser_output = soup
        
    for child in parser_output.children:
        if child.name in ["h2", "h3", "h4"]:
            # Strip out edit links
            headline = child.find("span", class_="mw-headline")
            if headline:
                current_section = headline.get_text(strip=True)
            else:
                current_section = child.get_text(strip=True)
            sections[current_section] = []
        elif child.name == "p":
            text = child.get_text(strip=True)
            if text:
                sections[current_section].append(text)
        elif child.name == "ul":
            # List items
            items = [li.get_text(strip=True) for li in child.find_all("li")]
            if items:
                sections[current_section].append(items)
                
    # Filter out empty sections
    sections = {k: v for k, v in sections.items() if v}
    print("Sections keys:", list(sections.keys()))
    print("Introduction sample:", sections.get("Introduction", [])[:2])

if __name__ == "__main__":
    test_parse("Beelzebuth")
