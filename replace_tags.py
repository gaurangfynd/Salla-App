import sys
import re

file_path = "src/components/aiAgent/details/index.tsx"
try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
except Exception as e:
    print(f"Error reading file: {e}")
    sys.exit(1)

tag_map = {
    "s-page": "div",
    "s-box": "div",
    "s-stack": "div",
    "s-grid": "div",
    "s-grid-item": "div",
    "s-text": "p",
    "s-image": "img",
    "s-divider": "hr",
    "s-banner": "div",
    "s-button": "button",
    "s-icon": "span",
    "s-spinner": "div",
    "s-color-field": 'input type="color"',
    "s-select": "select",
    "s-option": "option",
    "s-badge": "span",
    "s-modal": "div",
    "s-text-area": "textarea",
    "s-paragraph": "p",
    "s-heading": "h3",
    "s-tooltip": "div",
    "s-text-field": 'input type="text"'
}

missing_tags = set()

def replace_tag(match):
    slash = match.group(1) or ""
    tag_name = match.group(2)
    if tag_name in tag_map:
        repl = tag_map[tag_name]
        if slash:
            repl = repl.split()[0]
            return f"</{repl}"
        else:
            return f"<{repl}"
    missing_tags.add(tag_name)
    return match.group(0)

pattern = re.compile(r'<(/)?(s-[a-zA-Z0-9-]+)(?=[\s>/>])')
new_content = pattern.sub(replace_tag, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

if missing_tags:
    print("Missed tags:", missing_tags)
else:
    print("All matched tags were replaced.")
