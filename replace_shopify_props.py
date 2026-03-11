import re
import sys

file_path = "src/components/aiAgent/details/index.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# ── Shopify gap → Tailwind ──
gap_map = {
    "small": "gap-2",
    "base": "gap-4",
    "large": "gap-6",
}

# ── Shopify direction → flex ──
direction_map = {
    "inline": "flex-row",
    "block": "flex-col",
}

# ── Shopify padding → Tailwind ──
padding_map = {
    "none": "p-0",
    "small": "p-2",
    "base": "p-4",
    "large": "p-6",
}

# ── Shopify background → Tailwind ──
background_map = {
    "base": "bg-white",
    "subdued": "bg-gray-50",
    "transparent": "bg-transparent",
}

# ── Shopify border → Tailwind ──
border_map = {
    "base": "border border-gray-200",
}

# ── Shopify borderRadius → Tailwind ──
border_radius_map = {
    "base": "rounded",
    "large": "rounded-lg",
    "none": "rounded-none",
    "large large none none": "rounded-t-lg",
    "none none large large": "rounded-b-lg",
}

# ── Shopify tone → Tailwind ──
tone_map = {
    "success": "text-green-600",
    "critical": "text-red-600",
    "info": "text-blue-600",
}

# ── Shopify variant (button) → Tailwind ──
variant_map = {
    "primary": "bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors",
    "secondary": "bg-gray-100 text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors",
    "tertiary": "bg-transparent text-gray-700 px-3 py-1 hover:bg-gray-100 rounded transition-colors",
}

# ── Shopify color → Tailwind ──
color_map = {
    "subdued": "text-gray-500",
    "base": "text-gray-900",
}

# ── justifyContent → Tailwind ──
justify_map = {
    "space-between": "justify-between",
    "center": "justify-center",
    "flex-start": "justify-start",
    "flex-end": "justify-end",
}

# ── alignItems → Tailwind ──
align_map = {
    "center": "items-center",
    "flex-start": "items-start",
    "flex-end": "items-end",
    "stretch": "items-stretch",
}


def collect_classes(attrs_str: str) -> tuple:
    """Parse known Shopify props from attr string and return (tailwind_classes, cleaned_attrs)."""
    classes = []
    cleaned = attrs_str

    # gap
    m = re.search(r'\bgap="([^"]*)"', cleaned)
    if m:
        tw = gap_map.get(m.group(1))
        if tw:
            classes.append(tw)
        cleaned = cleaned.replace(m.group(0), "")

    # direction
    m = re.search(r'\bdirection="([^"]*)"', cleaned)
    if m:
        tw = direction_map.get(m.group(1))
        if tw:
            classes.append("flex")
            classes.append(tw)
        cleaned = cleaned.replace(m.group(0), "")
    
    # If we have gap but no direction, add flex
    if any(c.startswith("gap-") for c in classes) and "flex" not in classes:
        classes.insert(0, "flex")
        classes.insert(1, "flex-col")

    # justifyContent
    m = re.search(r'\bjustifyContent="([^"]*)"', cleaned)
    if m:
        tw = justify_map.get(m.group(1))
        if tw:
            classes.append(tw)
            if "flex" not in classes:
                classes.insert(0, "flex")
        cleaned = cleaned.replace(m.group(0), "")

    # alignItems
    m = re.search(r'\balignItems="([^"]*)"', cleaned)
    if m:
        tw = align_map.get(m.group(1))
        if tw:
            classes.append(tw)
            if "flex" not in classes:
                classes.insert(0, "flex")
        cleaned = cleaned.replace(m.group(0), "")

    # background
    m = re.search(r'\bbackground="([^"]*)"', cleaned)
    if m:
        tw = background_map.get(m.group(1))
        if tw:
            classes.append(tw)
        cleaned = cleaned.replace(m.group(0), "")

    # padding
    m = re.search(r'\bpadding="([^"]*)"', cleaned)
    if m:
        val = m.group(1).strip()
        tw = padding_map.get(val)
        if tw:
            classes.append(tw)
        cleaned = cleaned.replace(m.group(0), "")

    # paddingBlockStart
    m = re.search(r'\bpaddingBlockStart="([^"]*)"', cleaned)
    if m:
        pbs_map = {"small": "pt-2", "base": "pt-4", "large": "pt-6"}
        tw = pbs_map.get(m.group(1))
        if tw:
            classes.append(tw)
        cleaned = cleaned.replace(m.group(0), "")

    # paddingBlockEnd
    m = re.search(r'\bpaddingBlockEnd="([^"]*)"', cleaned)
    if m:
        pbe_map = {"small": "pb-2", "base": "pb-4", "large": "pb-6"}
        tw = pbe_map.get(m.group(1))
        if tw:
            classes.append(tw)
        cleaned = cleaned.replace(m.group(0), "")

    # border
    m = re.search(r'\bborder="([^"]*)"', cleaned)
    if m:
        tw = border_map.get(m.group(1))
        if tw:
            classes.append(tw)
        cleaned = cleaned.replace(m.group(0), "")

    # borderRadius
    m = re.search(r'\bborderRadius="([^"]*)"', cleaned)
    if m:
        tw = border_radius_map.get(m.group(1))
        if tw:
            classes.append(tw)
        cleaned = cleaned.replace(m.group(0), "")

    # gridTemplateColumns → use grid + grid-cols
    m = re.search(r'\bgridTemplateColumns="([^"]*)"', cleaned)
    if m:
        # Remove flex if it was added by gap
        classes = [c for c in classes if c not in ("flex", "flex-col")]
        val = m.group(1)
        cols = val.strip().split()
        n = len(cols)
        classes.insert(0, "grid")
        classes.insert(1, f"grid-cols-{n}")
        cleaned = cleaned.replace(m.group(0), "")

    # color (on <p>, <span>)
    m = re.search(r'\bcolor="([^"]*)"', cleaned)
    if m:
        tw = color_map.get(m.group(1))
        if tw:
            classes.append(tw)
        cleaned = cleaned.replace(m.group(0), "")

    # tone (on <span>)
    m = re.search(r'\btone="([^"]*)"', cleaned)
    if m:
        tw = tone_map.get(m.group(1))
        if tw:
            classes.append(tw)
        cleaned = cleaned.replace(m.group(0), "")

    # variant (on <button>)
    m = re.search(r'\bvariant="([^"]*)"', cleaned)
    if m:
        tw = variant_map.get(m.group(1))
        if tw:
            classes.extend(tw.split())
        cleaned = cleaned.replace(m.group(0), "")

    # type="strong" on <p> → font-semibold
    m = re.search(r'\btype="strong"', cleaned)
    if m:
        classes.append("font-semibold")
        cleaned = cleaned.replace(m.group(0), "")

    # heading (on parent <div>)
    m = re.search(r'\bheading="([^"]*)"', cleaned)
    if m:
        cleaned = cleaned.replace(m.group(0), "")

    # inlineSize
    m = re.search(r'\binlineSize="([^"]*)"', cleaned)
    if m:
        cleaned = cleaned.replace(m.group(0), "")

    # slot
    m = re.search(r'\bslot="([^"]*)"', cleaned)
    if m:
        cleaned = cleaned.replace(m.group(0), "")

    # size (not on <input>)
    m = re.search(r'\bsize="([^"]*)"', cleaned)
    if m:
        # Only remove if not on select/input
        cleaned = cleaned.replace(m.group(0), "")

    # icon=
    m = re.search(r'\bicon="([^"]*)"', cleaned)
    if m:
        cleaned = cleaned.replace(m.group(0), "")

    # interestFor
    m = re.search(r'\binterestFor="([^"]*)"', cleaned)
    if m:
        cleaned = cleaned.replace(m.group(0), "")

    # loading= on button
    m = re.search(r'\bloading="([^"]*)"', cleaned)
    if m:
        classes.append("opacity-50 cursor-not-allowed")
        cleaned = cleaned.replace(m.group(0), "")

    # label= (not valid HTML on div/select, keep as data-label or remove)
    m = re.search(r'\blabel="([^"]*)"', cleaned)
    if m:
        cleaned = cleaned.replace(m.group(0), "")

    # error= (not valid HTML)
    m = re.search(r'\berror=\{[^}]*\}', cleaned)
    if m:
        cleaned = cleaned.replace(m.group(0), "")

    # details= on textarea
    m = re.search(r'\bdetails="([^"]*)"', cleaned)
    if m:
        cleaned = cleaned.replace(m.group(0), "")

    # readonly → readOnly (already valid JSX, leave alone)

    return classes, cleaned


def process_tag(match):
    full = match.group(0)
    tag_name = match.group(1)
    attrs = match.group(2)
    closing = match.group(3)

    classes, cleaned_attrs = collect_classes(attrs)

    if not classes:
        return full

    # Merge with existing className
    existing_cn = re.search(r'className="([^"]*)"', cleaned_attrs)
    if existing_cn:
        merged = existing_cn.group(1) + " " + " ".join(classes)
        cleaned_attrs = cleaned_attrs.replace(
            existing_cn.group(0), f'className="{merged}"'
        )
    else:
        cn_str = f'className="{" ".join(classes)}"'
        cleaned_attrs = " " + cn_str + cleaned_attrs

    # clean up extra whitespace
    cleaned_attrs = re.sub(r'\s+', ' ', cleaned_attrs).strip()
    if cleaned_attrs:
        cleaned_attrs = " " + cleaned_attrs

    return f"<{tag_name}{cleaned_attrs}{closing}"


# Match opening tags: <tagname attrs> or <tagname attrs />
# Be careful not to match inside comments or strings too aggressively
pattern = re.compile(
    r'<(div|button|span|p|h3|select|textarea|img|hr|input|aside)(\s[^>]*?)(/?>\s*)',
    re.DOTALL
)

new_content = pattern.sub(process_tag, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Done! Shopify props replaced with Tailwind CSS classes.")
