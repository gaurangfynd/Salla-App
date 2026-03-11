const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src/components/aiAgent/details/index.tsx");
let content = fs.readFileSync(filePath, "utf-8");

const tagMap = {
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
  "s-color-field": "input type=\"color\"",
  "s-select": "select",
  "s-option": "option",
  "s-badge": "span",
  "s-modal": "div",
  "s-text-area": "textarea",
  "s-paragraph": "p",
  "s-heading": "h3"
};

for (const [sTag, htmlTag] of Object.entries(tagMap)) {
  // Opening tag (could have attributes)
  const openRegex = new RegExp(`<${sTag}(\\s|>)`, "g");
  content = content.replace(openRegex, `<${htmlTag}$1`);

  // Closing tag
  const closeTag = htmlTag.split(' ')[0]; // for "input type=\"color\"", close is "input"
  const closeRegex = new RegExp(`</${sTag}>`, "g");
  content = content.replace(closeRegex, `</${closeTag}>`);
}

// Special handling for <hr></hr> and <img ...></img> if any became like that due to self-closing
// But JSX allows <hr /> which works nicely if it was <s-divider />
// If it was <s-divider></s-divider> it becomes <hr></hr> which is valid JSX.

fs.writeFileSync(filePath, content, "utf-8");
console.log("Done");
