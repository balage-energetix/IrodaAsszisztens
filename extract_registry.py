import os
import json
import glob
import re

# Configuration
SOURCE_DIR = 'nyilvantartas'
OUTPUT_FILE = 'js/registry_data.js'

def parse_attrs(attr_str):
    """Simple parser for HTML attributes"""
    if not attr_str: return {}
    attrs = {}
    pattern = r'([a-zA-Z0-9-]+)(?:\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]*)))?'
    for match in re.finditer(pattern, attr_str):
        key = match.group(1).lower()
        val = match.group(2) or match.group(3) or match.group(4) or ""
        attrs[key] = val
    return attrs

def extract_content_and_links(cell_html):
    """Extract text and generic links from cell content"""
    link_match = re.search(r'<a\s+(.*?)>(.*?)</a>', cell_html, re.IGNORECASE | re.DOTALL)
    clean_text = re.sub(r'<[^>]+>', '', cell_html).strip() 
    
    if link_match:
        attrs = parse_attrs(link_match.group(1))
        link_text = re.sub(r'<[^>]+>', '', link_match.group(2)).strip()
        return {
            "text": link_text or clean_text,
            "href": attrs.get('href', '#'),
            "isLink": True
        }
    return clean_text

def is_garbage_row(row_items):
    """Detect rows that are just 'A', 'B', 'C' column markers or numeric indices"""
    if not row_items or len(row_items) < 3:
        return False
    
    # Check for A, B, C... pattern
    is_abc = True
    for i, item in enumerate(row_items):
        txt = item['text'] if isinstance(item, dict) else item
        txt = str(txt).strip()
        
        expected_char = chr(65 + i) # A, B, C...
        
        # Allow empty or matches expected char
        if txt and txt != expected_char:
            is_abc = False
            break
            
    if is_abc: return True

    # Check for 1, 2, 3... pattern
    is_123 = True
    for i, item in enumerate(row_items):
        txt = item['text'] if isinstance(item, dict) else item
        txt = str(txt).strip()
        if txt and txt != str(i+1):
            is_123 = False
            break
            
    if is_123: return True
    
    return False

def extract_tables():
    registry_data = []
    files = glob.glob(os.path.join(SOURCE_DIR, '*.html'))
    
    for file_path in files:
        filename = os.path.basename(file_path)
        if filename == 'Megközelítés.html': continue
        print(f"Processing {filename}...")
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            file_data = {
                "filename": filename,
                "title": filename,
                "tables": []
            }

            title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
            if title_match: file_data["title"] = title_match.group(1).strip()

            # Find tables
            table_matches = re.finditer(r'<table[^>]*>(.*?)</table>', content, re.IGNORECASE | re.DOTALL)
            
            for table_match in table_matches:
                table_content = table_match.group(1)
                
                # Raw extraction first, cleaning later
                raw_rows = []
                
                # HEADERS from THEAD
                thead_match = re.search(r'<thead[^>]*>(.*?)</thead>', table_content, re.IGNORECASE | re.DOTALL)
                if thead_match:
                    header_rows = re.findall(r'<tr[^>]*>(.*?)</tr>', thead_match.group(1), re.IGNORECASE | re.DOTALL)
                    for hr in header_rows:
                        cells = re.findall(r'<(?:th|td)[^>]*>(.*?)</(?:th|td)>', hr, re.IGNORECASE | re.DOTALL)
                        raw_rows.append([extract_content_and_links(c) for c in cells])

                # BODY rows
                tbody_match = re.search(r'<tbody[^>]*>(.*?)</tbody>', table_content, re.IGNORECASE | re.DOTALL)
                rows_container = tbody_match.group(1) if tbody_match else table_content
                
                row_matches = re.finditer(r'<tr[^>]*>(.*?)</tr>', rows_container, re.IGNORECASE | re.DOTALL)
                
                for row_match in row_matches:
                    row_html = row_match.group(1)
                    cells = re.findall(r'<(?:td|th)[^>]*>(.*?)</(?:td|th)>', row_html, re.IGNORECASE | re.DOTALL)
                    
                    row_data = []
                    for cell_content in cells:
                        # We need to re-parse attributes for style if needed, but for now just content
                        # (To support style, we'd need the cell match to include tags)
                        # Let's do a bit redundant find to get attributes
                        pass 
                    
                    # Better cell extraction preserving attributes
                    current_row_cells = []
                    cell_iter = re.finditer(r'<(?:td|th)([^>]*)>(.*?)</(?:td|th)>', row_html, re.IGNORECASE | re.DOTALL)
                    
                    for cm in cell_iter:
                        attrs = parse_attrs(cm.group(1))
                        inner = cm.group(2)
                        processed = extract_content_and_links(inner)
                        
                        style = attrs.get('style', '')
                        bgcolor = attrs.get('bgcolor', '')
                        
                        if bgcolor or 'background' in style or 'color' in style:
                            if isinstance(processed, str):
                                processed = {"text": processed}
                            processed['style'] = style
                            processed['bgcolor'] = bgcolor
                            
                        current_row_cells.append(processed)
                    
                    if current_row_cells:
                        raw_rows.append(current_row_cells)

                # Now process the raw rows into headers and data
                if not raw_rows: continue

                # Filter Garbage Rows (A, B, C...)
                cleaned_rows = [r for r in raw_rows if not is_garbage_row(r)]
                
                if not cleaned_rows: continue

                # Assume first row is header
                final_headers = []
                final_rows = []
                
                # Safely convert complex objects to string for header (if needed)
                header_source = cleaned_rows[0]
                final_headers = []
                for h in header_source:
                    final_headers.append(h['text'] if isinstance(h, dict) else h)
                    
                final_rows = cleaned_rows[1:]
                
                file_data["tables"].append({
                    "headers": final_headers,
                    "rows": final_rows
                })

            if file_data["tables"]:
                registry_data.append(file_data)

        except Exception as e:
            print(f"Error processing {filename}: {e}")

    js_content = f"window.REGISTRY_DATA = {json.dumps(registry_data, indent=2)};"
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"Export complete: {OUTPUT_FILE}")

if __name__ == "__main__":
    extract_tables()
