from pathlib import Path

css = Path("css/style.css")

text = css.read_text()

marker = "/* === THEO NAV FINAL FIX === */"

if marker not in text:
    text += f"""

{marker}
.bottom-nav {{
  position: fixed !important;
  left: 14px !important;
  right: 14px !important;
  bottom: 14px !important;
  top: auto !important;
  width: auto !important;
  max-width: none !important;
  margin: 0 !important;
  transform: none !important;
  box-sizing: border-box !important;
  display: grid !important;
  grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
  z-index: 99999 !important;
}}
"""

css.write_text(text)
print("NAV FIX APPLIED")
